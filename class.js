/* ==========================================================================
   EICT — my class

   The two things this file exists to get right:

   1. Nothing on screen until the account has been read and checked.
      The old page fabricated a profile when the Firestore read failed and
      called enter() anyway, which is why people were landing inside the
      class with no restrictions. Here a failed read signs you out and says
      so. The page starts as <body class="checking">, which hides the shell
      in CSS, and that class is only removed once a real, approved profile
      is in hand.

   2. A session lasts one day at most. Firebase would keep you signed in
      forever, so sign-in stamps the time and every load, every minute, and
      every return to the tab checks how old the stamp is.

   Both are conveniences. What actually stops a student reaching a season
   they have not paid for is firestore.rules, on Google's servers.
   ========================================================================== */

/* Shown in the corner of the sign-in card so you can tell at a glance which
   version a student is actually running. If this does not match what you just
   uploaded, their browser is still on a cached copy. */
const VERSION = '1.5.0';

const SESSION_MAX_MS = 24 * 60 * 60 * 1000;
const STAMP_AT  = 'eict.sessionAt';
const STAMP_UID = 'eict.sessionUid';

const FEE_LIVE   = 2000;   // rupees per month
const FEE_SEASON = 2500;   // rupees per season
const BATCH      = 'AL-27';
const BATCH_LABEL= 'Advanced Level 2027';
const SIR_WA     = '94719780807';

const UNITS = [
  'Concepts of Information and Communication Technology',
  'Evolution of Computers and Computer Systems',
  'Data Representation in Computers',
  'Fundamentals of Digital Circuits',
  'Operating Systems',
  'Data Communication and Computer Networks',
  'System Analysis and Design',
  'Database Management Systems',
  'Programming with Python',
  'Web Development',
  'Internet of Things',
  'ICT in Business',
  'New Trends and Future Directions of ICT'
];
const EP_COUNTS = [7, 6, 8, 7, 6, 9, 6, 8, 10, 7, 5, 5, 4];

const SEASONS = UNITS.map((title, i) => ({
  n: i + 1, title,
  episodes: Array.from({ length: EP_COUNTS[i] || 6 }, (_, e) => ({
    n: e + 1, title: `${title} — part ${e + 1}`, mins: 38 + ((e * 7 + i * 3) % 25)
  }))
}));

/* -------------------------------------------------------------- helpers */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const thisMonth = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; };
const monthName = (m) => {
  if (!m) return '—';
  const [y, mo] = m.split('-');
  return new Date(y, mo - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
};
const ago = (ts) => {
  if (!ts) return '';
  const t = ts.toDate ? ts.toDate() : new Date(ts);
  const s = (Date.now() - t) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s/60))} min ago`;
  if (s < 86400) return `${Math.floor(s/3600)} hours ago`;
  return t.toLocaleDateString('en', { day:'numeric', month:'short' });
};

/* ---------------------------------------------------------------- theme */
/* Saved on the device immediately so it survives a reload, and onto the
   account when signed in so it follows them to a phone. */
const THEME_KEY = 'eict.theme';

function applyTheme(t) {
  document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, t);
  const m = document.querySelector('meta[name=theme-color]');
  if (m) m.content = t === 'light' ? '#F4F1E8' : '#070B1C';
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const wants = saved || (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(wants);
}
initTheme();

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  if (!DEMO && ME && P) {
    P.theme = next;
    FB.updateDoc(FB.doc(FB.db, 'students', ME.uid), { theme: next }).catch(() => {});
  }
}

/* Safe writers. A page whose HTML is a version behind its JavaScript should
   degrade, not die: a missing element used to throw inside the sign-in
   callback, which left the button saying "Signing in…" forever with the real
   error swallowed as an unhandled rejection. */
const setTx = (sel, text) => { const el = $(sel); if (el) el.textContent = text; return el; };
const setHt = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; return el; };

function toast(msg, kind = 'ok') {
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3400);
}

function sheet(html) {
  $('#sheetBox').innerHTML = html;
  $('#sheet').hidden = false;
  document.body.classList.add('locked');
}
function closeSheet() { $('#sheet').hidden = true; document.body.classList.remove('locked'); }

/* ------------------------------------------------------------ app state */

let FB = null, DEMO = false;
let ME = null;              // firebase user
let P  = null;              // profile from students/{uid}
let ACCESS = new Set();     // months this account may join live
let PAYMENTS = [];
let curSeason = null, curEp = null, markTimer = null;
let filter = 'all', listMode = false;

/* While a registration is in flight this holds the promise for it.
   createUserWithEmailAndPassword signs the student in the instant the Auth
   account exists — before their students/{uid} document has been written.
   The auth guard below waits on this, otherwise it reads an account that is
   not there yet and throws the new student back out to the sign-in screen. */
let registering = null;

/* A button that says what it is doing. Registration writes an Auth account
   and then a document, which on a phone on mobile data is not instant. */
function busy(sel, on, label) {
  const b = $(sel);
  if (!b) return;
  b.disabled = on;
  b.classList.toggle('working', on);
  if (on) {
    b.dataset.was = b.innerHTML;
    b.innerHTML = `<span class="spin"></span>${label ? esc(label) : ''}`;
  } else if (b.dataset.was) {
    b.innerHTML = b.dataset.was;
    delete b.dataset.was;
  }
}

/* One shake on a message that the person needs to actually read. */
function shake(sel) {
  const el = $(sel);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;          // restart the animation
  el.classList.add('shake');
}

const unlocked  = () => (P?.unlocked || []).map(Number);

/* Paid for is not the same as open. A unit opens only when the paper for the
   previous one is in, and any term test due in between. GATE is filled by
   papers.js once it has loaded; before that, paid is the best we know. */
let GATE = null;
const isPaid    = (n) => unlocked().includes(Number(n));
const isOpen    = (n) => {
  if (!GATE) return isPaid(n);
  const st = GATE.unitState(Number(n), unlocked(), PAPERS);
  return st.open;
};
const blockOn   = (n) => GATE ? GATE.unitState(Number(n), unlocked(), PAPERS).blockedBy : null;
const watched   = () => new Set(P?.watched || []);
const hasMonth  = (m) => ACCESS.has(m);

/* --------------------------------------------------------- firebase boot */

async function bootFirebase() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.projectId || /PASTE|YOUR/i.test(cfg.projectId)) return null;
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
    const fs = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
    const au = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
    const app = initializeApp(cfg);
    return { db: fs.getFirestore(app), auth: au.getAuth(app), ...fs, ...au };
  } catch (e) {
    console.warn('[class] Firebase unavailable:', e.message);
    return null;
  }
}

/* ------------------------------------------------------------ demo mode */

function seedDemo() {
  P = {
    name: 'Sample Student', email: 'sample@eict.lk', whatsapp: '0771234567',
    school: 'Sample College', address: 'Colombo', batch: BATCH,
    role: 'student', status: 'active', studentNo: 'EICT-0007',
    unlocked: [1, 2, 3], watched: ['1-1','1-2','1-3','1-4','1-5','1-6','1-7','2-1','2-2','3-1'],
    at: new Date(Date.now() - 40 * 86400000)
  };
  ACCESS = new Set([thisMonth()]);
  PAPERS = {
    'unit-1': { key:'unit-1', kind:'unit', n:1, status:'accepted', marks:'72/100',
                feedback:'Good work. Watch the units in question 4.',
                driveId:'demo1', driveUrl:'#', at:new Date(Date.now()-9*86400000) }
  };
  SLOTS = [
    { id:'s1', term:1, kind:'mcq',   at:new Date(Date.now()+10*86400000).toISOString(), capacity:30, taken:11 },
    { id:'s2', term:1, kind:'essay', at:new Date(Date.now()+12*86400000).toISOString(), capacity:30, taken:4 },
    { id:'s3', term:1, kind:'mcq',   at:new Date(Date.now()+3*86400000).toISOString(),  capacity:30, taken:2 }
  ];
  PROG = {
    '1-1': { seen: '1'.repeat(240), furthest: 2400, dur: 2400, done: true },
    '2-1': { seen: '1'.repeat(120) + '0'.repeat(60), furthest: 1500, dur: 2200, done: false }
  };
  PAYMENTS = [
    { id:'d1', month:thisMonth(), amount:2000, status:'verified', purpose:'live',
      at:new Date(Date.now() - 6*86400000) },
    { id:'d2', month:'2026-06', amount:2500, status:'rejected', purpose:'season', season:4,
      note:'The amount on the slip is 250, not 2500. Please send the right slip.',
      at:new Date(Date.now() - 30*86400000) }
  ];
}

/* ============================================================== session */

const stamp = (uid) => {
  localStorage.setItem(STAMP_AT, String(Date.now()));
  localStorage.setItem(STAMP_UID, uid);
};
const clearStamp = () => { localStorage.removeItem(STAMP_AT); localStorage.removeItem(STAMP_UID); };

/* Put the clock down before the sign-in call, while the uid is still unknown.
   Firebase fires onAuthStateChanged the instant it accepts the password, and
   a listener that finds no stamp treats the session as already expired and
   signs the person straight back out. stamp() replaces this with the real
   uid a moment later. */
const stampPending = () => {
  localStorage.setItem(STAMP_AT, String(Date.now()));
  localStorage.setItem(STAMP_UID, '');
};

function remaining(uid) {
  const at = Number(localStorage.getItem(STAMP_AT) || 0);
  const who = localStorage.getItem(STAMP_UID);
  if (!at) return 0;
  if (uid && who && who !== uid) return 0;
  return Math.max(0, SESSION_MAX_MS - (Date.now() - at));
}
function leftText(ms) {
  if (ms <= 0) return 'ended';
  const h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000);
  return h ? `${h}h ${m}m left today` : `${m}m left today`;
}

async function signOutNow(reason) {
  clearStamp();
  sessionStorage.removeItem('eict.greeted');
  if (FB) { try { await FB.signOut(FB.auth); } catch(_) {} }
  if (reason) sessionStorage.setItem('eict.reason', reason);
  location.reload();
}

/* ============================================================== screens */

function showGate(msg, kind = 'bad') {
  busy('#doIn', false);
  busy('#doReg', false);
  hideIntro();
  document.body.classList.remove('checking');
  document.body.classList.add('blocked');
  $('#hold').hidden = true;
  $('#gate').hidden = false;
  const box = $('#gMsg');
  if (msg) { box.textContent = msg; box.dataset.kind = kind; }
  else box.removeAttribute('data-kind');
}

function showHold(kind) {
  busy('#doIn', false);
  hideIntro();
  document.body.classList.remove('checking');
  document.body.classList.add('blocked');
  $('#gate').hidden = true;
  $('#hold').hidden = false;
  const set = (icon, title, body) => {
    $('#holdIcon').textContent = icon;
    $('#holdTitle').textContent = title;
    $('#holdBody').textContent = body;
  };
  if (kind === 'pending') {
    set('…', 'Waiting for approval',
      'Sir has your registration and checks these by hand, usually within a day. ' +
      'Once it is approved your student number appears here and the class opens.');
  } else {
    set('!', 'This account is closed',
      'Your account is not active at the moment. Message sir on WhatsApp and he will sort it out.');
    $('#holdCheck').hidden = true;
  }
  $('#holdWa').href = `https://wa.me/${SIR_WA}?text=` +
    encodeURIComponent(`Hi sir, this is ${P?.name || ''}. About my class account.`);
}

/* ============================================================ live view */

function renderLive() {
  const m = thisMonth();
  const open = hasMonth(m);
  const L = (window.COURSE && window.COURSE.live) || {};
  const box = $('#liveBody');

  if (open) {
    box.innerHTML = `
      <div class="card">
        <div class="card__h">
          <div>
            <p class="eyebrow"><span class="tag tag--live">Open</span></p>
            <h2>${esc(L.title || 'Weekly Zoom class')}</h2>
            <p>You are in for ${monthName(m)}.</p>
          </div>
        </div>
        <dl class="kv" style="margin-bottom:20px">
          <dt>Day</dt><dd>${esc(L.day || 'Saturday')}</dd>
          <dt>Time</dt><dd>${esc(L.time || '3.00 – 5.30 PM')}</dd>
          <dt>Medium</dt><dd>${esc(L.medium || 'Sinhala / English')}</dd>
        </dl>
        ${LIVE_URL
          ? `<a class="btn btn--live btn--wide" href="${esc(LIVE_URL)}" target="_blank" rel="noopener">Join the class</a>`
          : `<div class="empty" style="padding:22px"><b>Link not posted yet</b>
             <p>Sir puts the link up shortly before the class starts. Check back then.</p></div>`}
        <p class="hint">The link is only sent to students who have paid for this month. Please don't pass it on.</p>
      </div>`;
    return;
  }

  box.innerHTML = `
    <div class="card">
      <div class="card__h">
        <div>
          <p class="eyebrow"><span class="tag tag--off">Closed for ${esc(monthName(m))}</span></p>
          <h2>${esc(L.title || 'Weekly Zoom class')}</h2>
          <p>Send this month's slip and the room opens as soon as sir checks it.</p>
        </div>
      </div>
      <dl class="kv" style="margin-bottom:18px">
        <dt>Day</dt><dd>${esc(L.day || 'Saturday')}</dd>
        <dt>Time</dt><dd>${esc(L.time || '3.00 – 5.30 PM')}</dd>
        <dt>Fee</dt><dd><b>Rs. ${FEE_LIVE.toLocaleString()}</b> per month</dd>
      </dl>
      <div class="bank">${esc(BANK_TEXT)}</div>
      <div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:18px">
        <button class="btn btn--gold" data-go-pay="live">Send this month's slip</button>
        <button class="btn" id="askFree">Ask for a free class</button>
      </div>
    </div>

    <div class="card">
      <div class="card__h"><div>
        <h2>What you get</h2>
        <p>Every month, for the whole batch.</p>
      </div></div>
      <ul style="margin:0;padding-left:20px;color:var(--dim);line-height:2">
        ${(L.bullets || [
          'Ask questions and get the answer in the room.',
          'Tutes, papers and short notes posted to your address.',
          'Monthly paper discussions with marked feedback.',
          'One free session before you decide.'
        ]).map(b => `<li>${esc(b)}</li>`).join('')}
      </ul>
    </div>`;

  $('#askFree')?.addEventListener('click', askFree);
}

let LIVE_URL = '', BANK_TEXT = 'Bank : Commercial Bank\nAccount : 0000 0000 0000\nName : S. Manurathna';

/* -------------------------------------------------------- free request */

function askFree() {
  const m = thisMonth();
  sheet(`
    <h3>Ask for a free class</h3>
    <p style="color:var(--dim);margin:0 0 18px">
      One session, so you can see how the class runs before paying.
      Sir replies on WhatsApp.</p>
    <div class="f">
      <label><span>Your student number</span>
        <input value="${esc(P.studentNo || '')}" readonly
          style="font-family:var(--m);letter-spacing:.1em;color:var(--gold)"></label>
      <label><span>Which month</span><input id="fMonth" type="month" value="${m}"></label>
      <label><span>Why you're asking</span>
        <textarea id="fWhy" placeholder="A line is enough."></textarea></label>
      <button class="btn btn--gold btn--wide" id="fSend">Send the request</button>
      <button class="btn btn--ghost btn--wide" data-close-sheet>Not now</button>
    </div>`);

  $('#fSend').onclick = async () => {
    const month = $('#fMonth').value || m;
    const reason = $('#fWhy').value.trim();
    $('#fSend').disabled = true;
    try {
      if (!DEMO) {
        await FB.addDoc(FB.collection(FB.db, 'freeRequests'), {
          uid: ME.uid, studentNo: P.studentNo, name: P.name || '',
          batch: P.batch || BATCH, month, reason,
          status: 'pending', at: FB.serverTimestamp()
        });
      }
      closeSheet();
      toast('Request sent. Sir will reply on WhatsApp.');
    } catch (err) {
      $('#fSend').disabled = false;
      toast(err.code === 'permission-denied'
        ? 'Only approved students can ask. Check with sir.'
        : 'Could not send. Try again.', 'bad');
    }
  };
}

/* ========================================================= recorded view */

function renderRec() {
  renderHero();
  renderSyllabus();
  renderResume();
  renderSeasons();
  renderEps();
}

/* ---- the syllabus bar ---- */

function seasonStats(s) {
  const W = watched();
  const done = s.episodes.filter(e => W.has(`${s.n}-${e.n}`)).length;
  return { done, total: s.episodes.length, pct: Math.round(done / s.episodes.length * 100) };
}

/* The ring, and the three numbers underneath it. Episodes and hours are what
   a student actually feels; percentage alone is abstract. */
function renderHero() {
  const open = SEASONS.filter(s => isOpen(s.n));
  const totalEps = open.reduce((a, s) => a + s.episodes.length, 0);
  const doneEps  = open.reduce((a, s) => a + seasonStats(s).done, 0);
  const units    = open.filter(s => seasonStats(s).pct === 100).length;

  let secs = 0;
  Object.values(PROG).forEach(p => { secs += Math.min(p.furthest || 0, p.dur || 0); });
  const hrs = secs / 3600;

  const pct = totalEps ? Math.round(doneEps / totalEps * 100) : 0;
  const C = 289;                                   // 2 * pi * 46
  const arc = $('#heroArc');
  if (arc) arc.style.strokeDashoffset = String(C - (C * pct / 100));
  setTx('#heroPct', pct + '%');
  setTx('#statEps', doneEps);
  setTx('#statHrs', hrs >= 10 ? Math.round(hrs) : hrs.toFixed(1));
  setTx('#statUnits', units);

  const first = (P.name || '').split(' ')[0] || 'there';
  if (!open.length) {
    setTx('#heroTitle', 'Nothing open yet');
    setTx('#heroSay', 'Send a slip for a unit and its episodes appear here.');
  } else if (pct === 100) {
    setTx('#heroTitle', 'Every unit finished');
    setTx('#heroSay', 'Go back over anything that felt shaky before the paper.');
  } else if (doneEps === 0) {
    setTx('#heroTitle', `Ready when you are, ${first}`);
    setTx('#heroSay', `${totalEps} episodes waiting across ${open.length} unit${open.length === 1 ? '' : 's'}.`);
  } else {
    setTx('#heroTitle', `Keep going, ${first}`);
    setTx('#heroSay', `${totalEps - doneEps} episode${totalEps - doneEps === 1 ? '' : 's'} left of the ${open.length} unit${open.length === 1 ? '' : 's'} open to you.`);
  }
}

function renderSyllabus() {
  const finished = SEASONS.filter(s => isOpen(s.n) && seasonStats(s).pct === 100).length;
  const openCount = unlocked().length;

  $('#sylN').innerHTML = `${finished}<small> / 13 units</small>`;

  const started = SEASONS.filter(s => isOpen(s.n) && seasonStats(s).done > 0).length;
  $('#sylSay').textContent = openCount === 0
    ? 'No units open yet. Send a slip for a season and it opens here.'
    : finished === 13
      ? 'Whole syllabus finished. Go back over the ones you found hard.'
      : `${openCount} unit${openCount === 1 ? '' : 's'} open to you, ${started} started, ${finished} finished.`;

  $('#sylStrip').innerHTML = SEASONS.map(s => {
    const open = isOpen(s.n);
    const { pct } = seasonStats(s);
    return `<button class="syl__seg" data-jump="${s.n}"
      data-open="${open ? 1 : 0}" data-done="${pct === 100 ? 1 : 0}"
      title="${esc(s.title)}${open ? ` — ${pct}% watched` : ' — locked'}">
      <i class="syl__fill" style="height:${open ? pct : 0}%"></i>
      <span>${pad(s.n)}</span>
    </button>`;
  }).join('');
}

/* ---- continue watching ---- */

/* What to offer next. Walks forward from the last thing watched, but never
   into a unit that is gated behind a paper — otherwise the button vanishes
   the moment a paper falls due, which reads as the site being broken. */
function lastWatched() {
  const list = P?.watched || [];

  // Anything part-watched in an open unit wins: they were mid-episode.
  const partial = Object.entries(PROG)
    .filter(([k, v]) => !v.done && v.furthest > 30 && v.dur)
    .sort((a, b) => (b[1].furthest || 0) - (a[1].furthest || 0))[0];
  if (partial) {
    const [sn, en] = partial[0].split('-').map(Number);
    const s = SEASONS.find(x => x.n === sn);
    const e = s?.episodes.find(x => x.n === en);
    if (s && e && isOpen(sn)) return { s, e, fresh: false, resume: true };
  }

  if (!list.length) {
    // Nothing watched yet: offer the first episode of the first open unit.
    const s = SEASONS.find(x => isOpen(x.n));
    return s ? { s, e: s.episodes[0], fresh: true } : null;
  }

  const key = list[list.length - 1];
  const [sn, en] = key.split('-').map(Number);
  const s = SEASONS.find(x => x.n === sn);
  if (!s) return null;

  if (isOpen(sn)) {
    const next = s.episodes.find(e => e.n === en + 1);
    if (next) return { s, e: next, fresh: true };
  }

  // Finished that unit. Find the next open one with something left in it.
  const onward = SEASONS.find(x => x.n > sn && isOpen(x.n) && seasonStats(x).done < x.episodes.length);
  if (onward) {
    const e = onward.episodes.find(ep => !watched().has(`${onward.n}-${ep.n}`)) || onward.episodes[0];
    return { s: onward, e, fresh: true };
  }

  if (isOpen(sn)) return { s, e: s.episodes.find(e => e.n === en), fresh: false };
  return null;
}

function renderResume() {
  const r = lastWatched();
  const btn = $('#resume');
  if (!r || !isOpen(r.s.n)) { btn.hidden = true; return; }
  btn.hidden = false;
  $('#resumeT').textContent = r.e.title;
  $('#resumeS').textContent =
    `${r.fresh ? 'Up next' : 'Watch again'} · Unit ${pad(r.s.n)} · ${r.e.mins} min`;
  btn.onclick = () => openEpisode(r.s.n, r.e.n);
}

/* ---- season grid ---- */

function renderSeasons() {
  const q = ($('#recQ').value || '').toLowerCase().trim();

  const list = SEASONS.filter(s => {
    const open = isOpen(s.n);
    const { done, total } = seasonStats(s);
    if (filter === 'open'   && !open) return false;
    if (filter === 'locked' && open) return false;
    if (filter === 'doing'  && (!open || done === 0 || done === total)) return false;
    if (filter === 'done'   && (!open || done !== total)) return false;
    if (!q) return true;
    return s.title.toLowerCase().includes(q) ||
           s.episodes.some(e => e.title.toLowerCase().includes(q));
  });

  $('#seasons').className = 'grid' + (listMode ? ' as-list' : '');

  if (!list.length) {
    $('#seasons').innerHTML = `<div class="empty" style="grid-column:1/-1">
      <b>Nothing matches</b><p>Try another word, or tap All to see every unit.</p></div>`;
    return;
  }

  const art = ART;   // captured once so a mid-render load doesn't half-apply

  $('#seasons').innerHTML = list.map(s => {
    const open = isOpen(s.n);
    const waiting = !open && isPaid(s.n);
    const done100 = seasonStats(s).pct === 100;
    const { done, total, pct } = seasonStats(s);

    return `<button class="sn-card ${open ? '' : 'locked'} ${waiting ? 'waiting' : ''} ${done100 ? 'done' : ''} ${curSeason === s.n ? 'on' : ''}"
      data-season="${s.n}">
      <span class="sn-card__thumb">
        <span class="sn-card__art" style="--fd:${(s.n % 5) * 0.5}s">${art ? art.svgFor(s.n) : ''}</span>
        <span class="sn-card__badge">${pad(s.n)}</span>
        ${!open && !waiting ? `<span class="sn-card__flag" title="Locked">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
        </span>` : ''}
        ${waiting ? `<span class="sn-card__flag" title="Waiting on a paper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
        </span>` : ''}
        ${done100 && open ? `<span class="sn-card__check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4"><path d="M20 6 9 17l-5-5"/></svg>
        </span>` : ''}
      </span>
      <span class="sn-card__body">
        <span class="sn-card__k">Unit</span>
        <span class="sn-card__t">${esc(s.title)}</span>
        <span class="sn-card__f">
          <span>${total} episodes</span>
          <span style="color:${open ? 'var(--dim)' : 'var(--gold)'}">
            ${open ? `${done}/${total}` : waiting ? 'paper due' : `Rs. ${FEE_SEASON.toLocaleString()}`}</span>
        </span>
        ${open ? `<span class="sn-card__bar"><i style="width:${pct}%"></i></span>` : ''}
      </span>
    </button>`;
  }).join('');

  if (!art) artLib();     // fires once; re-renders this list when it lands
}

/* ---- episode list ---- */

function renderEps() {
  const box = $('#eps');
  if (curSeason === null) {
    box.innerHTML = `<div class="empty"><b>Pick a unit</b>
      <p>Tap any unit above — or a segment on the bar — to see its episodes.</p></div>`;
    return;
  }
  const s = SEASONS.find(x => x.n === curSeason);
  if (!s) return;

  if (!isOpen(s.n)) {
    const b = blockOn(s.n);
    if (b) {
      // Paid for, but waiting on a paper. Say which one, and offer the way out.
      const what = b.kind === 'term'
        ? (GATE.TERMS.find(t => t.n === b.n) || {}).name
        : `the unit ${pad(b.n)} paper`;
      box.innerHTML = `<div class="shut">
        <p class="eyebrow" style="justify-content:center">Unit ${pad(s.n)} · waiting</p>
        <h3>${esc(s.title)}</h3>
        <p>You have paid for this unit. It opens as soon as ${esc(what)} is in —
           that is how the order is kept, so nothing is skipped.</p>
        <button class="btn btn--gold" data-submit="${b.kind}-${b.n}">
          Send ${b.kind === 'term' ? 'the term test paper' : 'that paper'}</button>
      </div>`;
      return;
    }
    box.innerHTML = `<div class="shut">
      <p class="eyebrow" style="justify-content:center">Unit ${pad(s.n)} · locked</p>
      <h3>${esc(s.title)}</h3>
      <p>${s.episodes.length} episodes. Pay for this unit and all of them open at once,
         and the tutes and papers for it are posted to you.</p>
      <div class="shut__price">Rs. ${FEE_SEASON.toLocaleString()}</div>
      <button class="btn btn--gold" data-go-pay="season" data-n="${s.n}">Send a slip for this unit</button>
    </div>`;
    return;
  }

  const W = watched();
  const { done, total } = seasonStats(s);
  box.innerHTML = `
    <div class="eps__h">
      <div>
        <p class="eyebrow" style="margin-bottom:2px">Unit ${pad(s.n)}</p>
        <h3>${esc(s.title)}</h3>
      </div>
      <span class="mono" style="font-size:12px;color:var(--dimmer)">${done} of ${total} watched</span>
    </div>
    ${s.episodes.map(e => {
      const k = `${s.n}-${e.n}`;
      const dn = W.has(k);
      const pr = PROG[k];
      const pct = dn ? 100 : (pr && pr.dur ? Math.min(99, Math.round(pr.furthest / pr.dur * 100)) : 0);
      return `<button class="ep ${dn ? 'done' : ''} ${pct && !dn ? 'part' : ''}" data-ep="${k}">
        <span class="ep__n">${pad(e.n)}</span>
        <span class="ep__t">
          <b>${esc(e.title)}</b>
          <small>${e.mins} min${dn ? ' · watched' : pct ? ` · ${pct}% done` : ''}</small>
          ${pct && !dn ? `<span class="ep__bar"><i style="width:${pct}%"></i></span>` : ''}
        </span>
        <span class="ep__tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>
      </button>`;
    }).join('')}`;
}

/* ---- player ---- */

/* Progress for every episode this student has opened, keyed "3-2".
   Loaded with the profile and written back as it changes. */
let PROG = {};
let W = null;              // the watch module, imported the first time it is needed
let ytPlayer = null, stopTrack = null, saveTimer = null;

const progOf = (k) => PROG[k] || (PROG[k] = { seen: '', furthest: 0, dur: 0, done: false });

/* Writing on every tick would be thousands of writes a lesson, so changes are
   held and flushed at most every fifteen seconds, plus once on closing. */
function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushProgress, 15000);
}

async function flushProgress() {
  clearTimeout(saveTimer);
  if (DEMO || !ME) return;
  try {
    await FB.updateDoc(FB.doc(FB.db, 'students', ME.uid), {
      progress: PROG,
      watched: Object.keys(PROG).filter(k => PROG[k].done)
    });
  } catch (err) {
    console.warn('[class] progress not saved', err.code || err.message);
  }
}
window.addEventListener('pagehide', flushProgress);

async function openEpisode(sn, en) {
  const s = SEASONS.find(x => x.n === sn);
  const ep = s?.episodes.find(e => e.n === en);
  if (!s || !ep) return;
  curEp = [sn, en];
  const key = `${sn}-${en}`;

  $('#plTitle').textContent = ep.title;
  $('#plSub').textContent = `Unit ${pad(sn)} · episode ${pad(en)}`;
  $('#stage').innerHTML = `<div class="stage__wait"><div class="spin"></div></div>`;
  $('#player').hidden = false;
  document.body.classList.add('locked');
  paintProgress(progOf(key));

  // The video id is fetched only now, and the rules decide whether this
  // account may have it. A locked unit simply returns nothing.
  let vid = null, mins = ep.mins;
  if (!DEMO) {
    try {
      const d = await FB.getDoc(FB.doc(FB.db, 'seasons', `${BATCH}-${sn}`));
      if (d.exists()) {
        const raw = (d.data().episodes || {})[String(en)];
        // Older seasons stored just the id as a string. Newer ones store
        // { v: id, m: minutes } so sir can correct the length per episode.
        if (typeof raw === 'string') vid = raw || null;
        else if (raw && typeof raw === 'object') { vid = raw.v || null; mins = raw.m || mins; }
      }
    } catch (err) {
      console.warn('[class] locked or unavailable:', err.code || err.message);
    }
  }

  $('#plSub').textContent = `Unit ${pad(sn)} · episode ${pad(en)} · ${mins} min`;

  if (!vid) {
    $('#stage').innerHTML = `<div class="empty" style="padding:30px">
      <b>${DEMO ? 'Sample mode' : 'No video here yet'}</b>
      <p>${DEMO ? 'Videos play once the class is connected to the database.'
                : 'This episode has not been linked yet. Tell sir on WhatsApp.'}</p></div>`;
    return;
  }

  try {
    W = W || await import('./watch.js?v=' + VERSION);
    const YT = await W.loadAPI();
    startPlayer(YT, vid, key, ep);
  } catch (err) {
    console.warn('[class] player failed, falling back', err.message);
    // Without the API there is no way to measure anything, so play it plainly
    // and let them mark it by hand rather than blocking the lesson.
    $('#stage').innerHTML =
      `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?rel=0&modestbranding=1&playsinline=1&autoplay=1"
        title="${esc(ep.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen></iframe>${markupWatermark()}`;
    placeWatermark();
    $('#plDone').disabled = false;
    $('#plDone').textContent = 'Mark as watched';
  }

  if (!DEMO) {
    FB.addDoc(FB.collection(FB.db, 'views'), {
      uid: ME.uid, name: P.name || '', studentNo: P.studentNo || '',
      ep: key, batch: BATCH, at: FB.serverTimestamp()
    }).catch(() => {});
  }
}

function markupWatermark() {
  return `<div class="mark" id="wm"></div>`;
}

/* Name across the picture, moved every so often. Not unbreakable, but it
   makes a re-shared recording traceable back to one account. */
function placeWatermark() {
  const wm = $('#wm');
  if (!wm) return;
  const tag = `${P.studentNo || ''} · ${P.name || ''}`;
  const place = () => {
    wm.textContent = tag;
    wm.style.left = (6 + Math.random() * 56) + '%';
    wm.style.top  = (8 + Math.random() * 74) + '%';
  };
  place();
  clearInterval(markTimer);
  markTimer = setInterval(place, 18000);
}

function startPlayer(YT, vid, key, ep) {
  const prog = progOf(key);
  $('#stage').innerHTML = `<div id="ytbox"></div>${markupWatermark()}`;
  placeWatermark();
  $('#stage').oncontextmenu = e => e.preventDefault();

  ytPlayer = new YT.Player('ytbox', {
    videoId: vid,
    playerVars: {
      rel: 0, modestbranding: 1, iv_load_policy: 3, playsinline: 1,
      autoplay: 1, cc_load_policy: 0
    },
    events: {
      onReady: (e) => {
        // Pick up where they stopped, but not so close to the end that they
        // land past the finish line.
        const d = e.target.getDuration();
        if (prog.furthest > 30 && prog.furthest < d - 20) {
          e.target.seekTo(prog.furthest, true);
          toast(`Carrying on from ${fmtClock(prog.furthest)}`);
        }
        e.target.playVideo();

        stopTrack && stopTrack();
        stopTrack = W.track(e.target, prog, (p, a) => {
          paintProgress(p);
          if (a.done && !p.savedDone) {
            p.savedDone = true;
            episodeFinished(key);
          } else queueSave();
        });
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) { flushProgress(); paintProgress(prog); }
      }
    }
  });
}

const fmtClock = (sec) => {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

/* The bar under the video. Two layers on purpose: the pale one is how far
   they have reached, the solid one is how much was really watched. Seeing
   them apart is what makes the rule obvious without explaining it. */
function paintProgress(p) {
  if (!W) { $('#plMeter').hidden = true; return; }
  const a = W.assess(p);
  $('#plMeter').hidden = false;
  $('#plReach').style.width = a.pct + '%';
  $('#plSeen').style.width = Math.min(a.pct, a.coveredPct) + '%';

  const r = W.why(p);
  $('#plState').textContent = r.text;
  $('#plState').dataset.ok = r.ok ? '1' : '0';

  const btn = $('#plDone');
  btn.disabled = !r.ok;
  btn.textContent = r.ok ? 'Finished — close' : 'Keep watching';
}

/* Shown the moment the tracker decides an episode is genuinely done. It is
   deliberately brief and does not block: they are mid-lesson. */
function celebrateEpisode(sn, en) {
  const s = SEASONS.find(x => x.n === sn);
  const st = s ? seasonStats(s) : null;
  const whole = st && st.done === st.total;

  const el = document.createElement('div');
  el.className = 'pop-done';
  el.innerHTML = whole
    ? `<b>Unit ${pad(sn)} complete</b><span>All ${st.total} episodes watched</span>`
    : `<b>Episode ${pad(en)} done</b><span>${st ? st.total - st.done : 0} left in this unit</span>`;
  document.body.append(el);
  setTimeout(() => el.remove(), 2200);
}

async function episodeFinished(key) {
  const [sn, en] = key.split('-').map(Number);
  if (!(P.watched || []).includes(key)) P.watched = [...(P.watched || []), key];
  await flushProgress();
  renderRec();
  celebrateEpisode(sn, en);
}

function closePlayer() {
  stopTrack && stopTrack(); stopTrack = null;
  try { ytPlayer && ytPlayer.destroy(); } catch (_) {}
  ytPlayer = null;
  flushProgress();
  $('#player').hidden = true;
  $('#stage').innerHTML = '';
  clearInterval(markTimer);
  document.body.classList.remove('locked');
  renderRec();
}

/* The button only closes now. Completion is decided by the tracker, never by
   pressing a button, which is the whole point. */
function doneButton() {
  if (!curEp) return closePlayer();
  closePlayer();
}

function stepEpisode(dir) {
  if (!curEp) return;
  const [sn, en] = curEp;
  const s = SEASONS.find(x => x.n === sn);
  const next = s.episodes.find(e => e.n === en + dir);
  if (next) return openEpisode(sn, next.n);
  const other = SEASONS.find(x => x.n === sn + dir && isOpen(x.n));
  if (other) {
    const e = dir > 0 ? other.episodes[0] : other.episodes[other.episodes.length - 1];
    curSeason = other.n; renderSeasons(); renderEps();
    return openEpisode(other.n, e.n);
  }
  toast(dir > 0 ? 'That was the last one open to you' : 'This is the first episode');
}


/* ========================================================== papers view
   Season papers come with the tute in the post. Term tests are booked ahead,
   because the paper has to reach the house first.
   ====================================================================== */

let PAPERS = {};        // "unit-3" / "term-1" -> submission
let SLOTS  = [];        // sittings offered by sir
let BOOKINGS = {};      // "term-1" -> booking
let PP = null;          // papers.js, loaded on first use

async function papersLib() {
  PP = PP || await import('./papers.js?v=' + VERSION);
  return PP;
}

/* Papers, sittings and bookings are extras: if the rules for them have not
   been published yet the class must still open. A student locked out of their
   recordings because a collection they have never used is missing would be a
   far worse fault than a Papers tab that is briefly empty. */
let PAPERS_OK = true;

async function loadPapers(uid) {
  const soft = (label) => (err) => {
    console.warn(`[class] ${label} unavailable:`, err.code || err.message);
    if (label === 'papers') PAPERS_OK = false;
    return null;
  };

  const [subs, slots, books] = await Promise.all([
    FB.getDocs(FB.query(FB.collection(FB.db, 'papers'), FB.where('uid', '==', uid))).catch(soft('papers')),
    FB.getDocs(FB.collection(FB.db, 'slots')).catch(soft('slots')),
    FB.getDocs(FB.query(FB.collection(FB.db, 'bookings'), FB.where('uid', '==', uid))).catch(soft('bookings'))
  ]);

  PAPERS = {}; subs && subs.forEach(d => { const v = d.data(); PAPERS[v.key] = { id: d.id, ...v }; });
  SLOTS = []; slots && slots.forEach(d => SLOTS.push({ id: d.id, ...d.data() }));
  BOOKINGS = {}; books && books.forEach(d => { const v = d.data(); BOOKINGS[`term-${v.term}`] = { id: d.id, ...v }; });
}

async function renderPapers() {
  let L;
  try { L = await papersLib(); }
  catch (err) { PAPERS_OK = false; L = null; }
  if (!L) {
    setHt('#papersBody', `<div class="card"><div class="empty">
      <b>Papers are not switched on yet</b>
      <p>Sir is still setting this part up. Your recordings are unaffected —
         check back in a day or two.</p></div></div>`);
    return;
  }
  const paid = unlocked().sort((a, b) => a - b);
  const box = $('#papersBody');

  if (!PAPERS_OK) {
    box.innerHTML = `<div class="card"><div class="empty">
      <b>Papers are not switched on yet</b>
      <p>Sir is still setting this part up. Your recordings are unaffected —
         check back in a day or two.</p></div></div>`;
    return;
  }

  if (!paid.length) {
    box.innerHTML = `<div class="card"><div class="empty">
      <b>No papers yet</b>
      <p>Papers arrive with the tutes once a unit is open. Send a slip for a
      unit and it starts here.</p></div></div>`;
    return;
  }

  const terms = L.visibleTerms(paid, PAPERS);
  const dueUnits = paid.filter(u => !L.isIn(PAPERS, 'unit', u));
  $('#paperDot').hidden = !dueUnits.length && !terms.some(t => t.ready && !t.done && t.blocking);

  box.innerHTML = `
    <div class="card">
      <div class="card__h">
        <div>
          <h2>Unit papers</h2>
          <p>Each unit's paper comes with its tute. Do it on paper, photograph
             or scan it, put it in your Drive, and give the link here. The next
             unit opens once it is in.</p>
        </div>
      </div>
      ${paid.map(u => unitPaperRow(L, u)).join('')}
    </div>

    ${terms.length ? `
      <div class="card">
        <div class="card__h">
          <div>
            <h2>Term tests</h2>
            <p>Six through the syllabus. Book a sitting at least a week ahead —
               the paper is posted to you.</p>
          </div>
        </div>
        ${terms.map(t => termRow(L, t)).join('')}
      </div>` : ''}`;
}

function paperStatusTag(p) {
  if (!p) return '<span class="tag tag--off">Not sent</span>';
  if (p.status === 'redo')     return '<span class="tag tag--bad">Do it again</span>';
  if (p.status === 'accepted') return `<span class="tag tag--live">Marked${p.marks != null ? ` · ${p.marks}` : ''}</span>`;
  return '<span class="tag tag--gold">With sir</span>';
}

function unitPaperRow(L, u) {
  const s = SEASONS.find(x => x.n === u);
  const p = PAPERS[`unit-${u}`];
  const st = L.unitState(u, unlocked(), PAPERS);
  return `
    <div class="paper-row">
      <div class="paper-row__n">${pad(u)}</div>
      <div class="paper-row__t">
        <b>${esc(s ? s.title : 'Unit ' + pad(u))}</b>
        <small>${p ? `Sent ${ago(p.at)}` : 'Comes with the tute for this unit'}</small>
        ${p && p.status === 'redo' && p.feedback
          ? `<span class="paper-row__note">${esc(p.feedback)}</span>` : ''}
        ${p && p.status === 'accepted' && p.feedback
          ? `<span class="paper-row__ok">${esc(p.feedback)}</span>` : ''}
      </div>
      ${paperStatusTag(p)}
      <button class="btn btn--sm ${p && p.status !== 'redo' ? '' : 'btn--gold'}"
        data-submit="unit-${u}">${p && p.status !== 'redo' ? 'Change' : 'Send paper'}</button>
    </div>`;
}

function termRow(L, t) {
  const p = t.paper;
  const b = BOOKINGS[`term-${t.n}`];
  const locked = !t.ready;

  return `
    <div class="paper-row ${locked ? 'is-locked' : ''}">
      <div class="paper-row__n">T${t.n}</div>
      <div class="paper-row__t">
        <b>${esc(t.name)}${t.blocking ? '' : ' <span class="tag tag--off" style="font-size:10.5px">optional</span>'}</b>
        <small>Units ${t.units.map(u => pad(u)).join(', ')}${
          locked ? ' · finish those unit papers first' : ''}</small>
        ${b ? `<span class="paper-row__ok">Sitting ${esc(fmtSlot(b))}</span>` : ''}
      </div>
      ${paperStatusTag(p)}
      ${locked ? ''
        : !b ? `<button class="btn btn--sm btn--gold" data-book="${t.n}">Choose a time</button>`
        : `<button class="btn btn--sm ${p && p.status !== 'redo' ? '' : 'btn--gold'}"
             data-submit="term-${t.n}">${p && p.status !== 'redo' ? 'Change' : 'Send paper'}</button>`}
    </div>`;
}

const fmtSlot = (b) => {
  const d = new Date(b.at);
  return `${d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}, ${
    d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })} · ${b.kindLabel || ''}`;
};

/* ------------------------------------------------------- booking a slot */

async function bookSheet(termN) {
  const L = await papersLib().catch(() => null);
  if (!L) return toast('Term tests are not ready yet', 'bad');
  const t = L.TERMS.find(x => x.n === termN);
  const free = L.bookableSlots(SLOTS.filter(s => Number(s.term) === termN));

  if (!free.length) {
    sheet(`<h3>${esc(t.name)}</h3>
      <p style="color:var(--dim);margin:0 0 18px">
        No sittings are open yet. Sir puts them up at least a week before, so
        the paper has time to reach you. Check back in a few days.</p>
      <button class="btn btn--wide" data-close-sheet>Close</button>`);
    return;
  }

  sheet(`
    <h3>${esc(t.name)} — choose a time</h3>
    <p style="color:var(--dim);margin:0 0 4px">
      Units ${t.units.map(u => pad(u)).join(', ')}.</p>
    <p style="color:var(--dim);margin:0 0 18px;font-size:13px">
      Everything here is at least a week away, because the paper goes to your
      house by post.</p>
    <div class="slots">
      ${free.map(s => {
        const d = new Date(s.at);
        const k = L.PAPER_KINDS[s.kind] || { label: s.kind, mins: 0 };
        return `<button class="slot" data-slot="${s.id}" data-term="${termN}">
          <span class="slot__day">
            <b>${d.toLocaleDateString('en', { day: 'numeric' })}</b>
            <small>${d.toLocaleDateString('en', { month: 'short' })}</small>
          </span>
          <span class="slot__t">
            <b>${d.toLocaleDateString('en', { weekday: 'long' })}, ${
              d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</b>
            <small>${esc(k.label)} · ${Math.round(k.mins / 60)} hours</small>
          </span>
          <span class="slot__left">${Math.max(0, (s.capacity || 0) - (s.taken || 0))} left</span>
        </button>`;
      }).join('')}
    </div>
    <button class="btn btn--ghost btn--wide" data-close-sheet style="margin-top:14px">Not now</button>`);
}

async function bookSlot(slotId, termN) {
  const L = await papersLib().catch(() => null);
  if (!L) return;
  const slot = SLOTS.find(s => s.id === slotId);
  if (!slot) return;
  const k = L.PAPER_KINDS[slot.kind] || { label: slot.kind };

  try {
    if (!DEMO) {
      await FB.setDoc(FB.doc(FB.db, 'bookings', `${ME.uid}_term-${termN}`), {
        uid: ME.uid, studentNo: P.studentNo || null, name: P.name || '',
        term: termN, slotId, at: slot.at, kind: slot.kind,
        address: P.address || '', bookedAt: FB.serverTimestamp()
      });
    }
    BOOKINGS[`term-${termN}`] = { term: termN, slotId, at: slot.at, kind: slot.kind, kindLabel: k.label };
    closeSheet();
    postingSheet(slot, k, termN);
    renderPapers();
  } catch (err) {
    toast(err.code === 'permission-denied'
      ? 'That sitting could not be booked. Refresh and try again.'
      : 'Could not book. Check your connection.', 'bad');
  }
}

/* The paper is now in the post, so say so with the parcel on its way. */
function postingSheet(slot, k, termN) {
  const d = new Date(slot.at);
  sheet(`
    <div style="text-align:center">
      <h3 style="margin-bottom:4px">Booked</h3>
      <p style="color:var(--dim);margin:0 0 16px">
        ${esc(d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' }))},
        ${esc(d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }))}<br>
        ${esc(k.label)} · ${Math.round(k.mins / 60)} hours</p>
      ${courierNote('Your paper is being posted',
        `The sealed paper for term test ${termN} goes out by courier to
         ${P.address ? P.address : 'your address'}. Open it only at the time
         you booked, and start the clock yourself.`)}
      <button class="btn btn--gold btn--wide" data-close-sheet>Got it</button>
    </div>`);
}


/* ------------------------------------------------- submitting a paper --
   The link is checked before it can be sent. The student sees the very
   preview sir will see; if it does not appear, the file is still private and
   the button stays off. This is what stops "I submitted it" / "I can't open
   it" arguments, which were most of the trouble on the old site.
   ---------------------------------------------------------------------- */

let ART = null, artRequested = false;
async function artLib() {
  if (ART) return ART;
  if (!artRequested) {
    artRequested = true;
    try { ART = await import('./season-art.js?v=' + VERSION); renderSeasons(); }
    catch (err) { console.warn('[class] season art unavailable:', err.message); }
  }
  return ART;
}

let checkSeq = 0;

async function submitSheet(key) {
  const L = await papersLib().catch(() => null);
  if (!L) return toast('Sending papers is not ready yet', 'bad');
  const isTerm = key.startsWith('term-');
  const n = Number(key.split('-')[1]);
  const title = isTerm
    ? (L.TERMS.find(t => t.n === n) || {}).name
    : `Unit ${pad(n)} paper`;
  const existing = PAPERS[key];

  sheet(`
    <h3>${esc(title)}</h3>
    <p style="color:var(--dim);margin:0 0 16px">
      Photograph or scan every page, put them in your Google Drive, and paste
      the link. One file is best — a PDF, or a document with all the pages.</p>

    <details class="how">
      <summary>How to share it so sir can open it</summary>
      <ol>
        <li>Open the file in Google Drive.</li>
        <li>Press <b>Share</b>, then <b>Change to anyone with the link</b>.</li>
        <li>Leave it on <b>Viewer</b>. Press <b>Copy link</b>.</li>
        <li>Paste it below. The check runs by itself.</li>
      </ol>
      <p>If you skip step 2 sir sees "You need access" and the paper does not
         count, even though you sent it.</p>
    </details>

    <div class="f" style="margin-top:16px">
      <label><span>Drive link</span>
        <input id="dLink" placeholder="https://drive.google.com/file/d/..."
          value="${esc(existing ? existing.driveUrl : '')}"></label>
    </div>

    <div class="check" id="dCheck" data-state="idle">
      <div class="check__row">
        <span class="check__icon" id="dIcon"></span>
        <span class="check__msg" id="dMsg">Paste the link and it is checked here</span>
      </div>
      <div class="check__preview" id="dPrev" hidden>
        <img id="dImg" alt="The first page, as sir will see it">
        <small>This is what sir sees. If it looks right, send it.</small>
      </div>
    </div>

    <button class="btn btn--gold btn--wide" id="dSend" disabled style="margin-top:14px">
      Send to sir</button>
    <button class="btn btn--ghost btn--wide" data-close-sheet style="margin-top:8px">Cancel</button>
  `);

  const input = $('#dLink');
  let found = null;

  const paint = (state, msg) => {
    $('#dCheck').dataset.state = state;
    $('#dMsg').innerHTML = msg;
    $('#dSend').disabled = state !== 'ok' && state !== 'warn';
  };

  const run = async () => {
    const seq = ++checkSeq;
    const raw = input.value.trim();
    found = null;
    $('#dPrev').hidden = true;

    if (!raw) return paint('idle', 'Paste the link and it is checked here');

    const parsed = L.parseDrive(raw);
    if (!parsed.ok) return paint('bad', esc(parsed.why));

    if (parsed.kind === 'folder') {
      found = parsed;
      return paint('warn',
        'That is a folder. It will work, but a single file is much easier to ' +
        'mark — and folders are where papers get lost. Make sure the folder ' +
        'itself is shared with anyone who has the link.');
    }

    paint('busy', 'Checking whether sir can open it…');
    const res = await L.checkAccess(parsed.id, parsed.kind);
    if (seq !== checkSeq) return;                 // they typed again meanwhile

    if (!res.open) {
      return paint('bad',
        'Sir cannot open this yet. In Drive press <b>Share</b> → ' +
        '<b>Change to anyone with the link</b>, then paste it again.');
    }

    found = parsed;
    $('#dImg').src = res.thumb;
    $('#dPrev').hidden = false;
    paint('ok', 'Sir can open this. Have a look at the preview, then send.');
  };

  let t = null;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 550); });
  if (input.value.trim()) run();

  $('#dSend').onclick = async () => {
    if (!found) return;

    // The same file sent for two different papers is nearly always a paste
    // mistake, and it used to be invisible to everyone.
    const clash = Object.entries(PAPERS)
      .find(([k, v]) => k !== key && v.driveId === found.id);
    if (clash && !confirm(
      `That is the same file you sent for ${clash[0].startsWith('term')
        ? 'a term test' : 'unit ' + pad(Number(clash[0].split('-')[1]))}. Send it anyway?`))
      return;

    busy('#dSend', true, 'Sending…');
    const rec = {
      uid: ME.uid, studentNo: P.studentNo || null, name: P.name || '',
      batch: P.batch || BATCH, key,
      kind: isTerm ? 'term' : 'unit', n,
      driveId: found.id, driveKind: found.kind,
      driveUrl: L.viewUrl(found.id, found.kind),
      status: 'submitted', feedback: '', marks: null
    };

    try {
      if (!DEMO) {
        await FB.setDoc(FB.doc(FB.db, 'papers', `${ME.uid}_${key}`),
          { ...rec, at: FB.serverTimestamp() });
      }
      PAPERS[key] = { ...rec, at: new Date() };
      closeSheet();
      sentSheet(title, isTerm, n);
      renderPapers();
      renderRec();
    } catch (err) {
      busy('#dSend', false);
      toast(err.code === 'permission-denied'
        ? 'That could not be sent. Refresh the page and try again.'
        : 'Could not send. Check your connection.', 'bad');
    }
  };
}

function sentSheet(title, isTerm, n) {
  const next = isTerm ? null : SEASONS.find(x => x.n === n + 1);
  const opensNext = next && isOpen(next.n);
  sheet(`
    <div style="text-align:center">
      <div class="tick-ring">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h3>Paper sent</h3>
      <p style="color:var(--dim);margin:0 0 6px">${esc(title)} is with sir.</p>
      <p style="color:var(--dim);margin:0 0 20px">
        ${opensNext
          ? `Unit ${pad(next.n)} is open for you now.`
          : 'He will mark it and write back here.'}</p>
      <button class="btn btn--gold btn--wide" data-close-sheet>Done</button>
    </div>`);
}

/* ========================================================= payments view */

let slipData = null;

function renderPayHistory() {
  const box = $('#payList');
  if (!PAYMENTS.length) {
    box.innerHTML = `<div class="empty"><b>Nothing sent yet</b>
      <p>Slips you send appear here with what sir decided.</p></div>`;
    $('#payDot').hidden = true;
    return;
  }
  $('#payDot').hidden = !PAYMENTS.some(p => p.status === 'rejected');

  box.innerHTML = PAYMENTS.map(p => {
    const what = p.purpose === 'season'
      ? `Unit ${pad(p.season || 0)} recordings`
      : `Live class · ${monthName(p.month)}`;
    const tag = p.status === 'verified' ? '<span class="tag tag--live">Approved</span>'
              : p.status === 'rejected' ? '<span class="tag tag--bad">Sent back</span>'
              : '<span class="tag tag--gold">With sir</span>';
    return `<div class="slip-row">
        <div class="slip-row__t">
          <b>${esc(what)}</b>
          <small>Rs. ${Number(p.amount||0).toLocaleString()} · ${ago(p.at)}</small>
        </div>${tag}
      </div>
      ${p.status === 'rejected' && p.note
        ? `<div class="slip-row__note">${esc(p.note)}</div>` : ''}`;
  }).join('');
}

function fillSeasonPicker() {
  $('#pSeason').innerHTML = SEASONS.map(s =>
    `<option value="${s.n}" ${isOpen(s.n) ? 'disabled' : ''}>
      Unit ${pad(s.n)} — ${esc(s.title)}${isOpen(s.n) ? ' (already open)' : ''}</option>`).join('');
}

function syncPayForm() {
  const forSeason = $('#pFor').value === 'season';
  // `hidden` alone loses to the stylesheet's display rule on .f label, so set
  // display directly as well. Otherwise the season picker stays on screen
  // during a live-class payment and can attach a unit to it by mistake.
  const show = (sel, on) => {
    const el = $(sel);
    if (!el) return;
    el.hidden = !on;
    el.style.display = on ? '' : 'none';
  };
  show('#pMonthWrap', !forSeason);
  show('#pSeasonWrap', forSeason);
  $('#pAmount').value = forSeason ? FEE_SEASON : FEE_LIVE;
}

async function sendSlip() {
  if (!slipData) return toast('Add a photo of the slip first', 'bad');
  const forSeason = $('#pFor').value === 'season';
  const month = forSeason ? thisMonth() : ($('#pMonth').value || thisMonth());
  const amount = Number($('#pAmount').value || 0);
  const season = forSeason ? Number($('#pSeason').value) : null;

  if (!amount) return toast('Fill in the amount', 'bad');

  busy('#pSend', true, 'Sending…');

  try {
    if (DEMO) {
      PAYMENTS.unshift({ id:'x'+Date.now(), month, amount, season,
        purpose: forSeason ? 'season' : 'live', status:'pending', at:new Date() });
    } else {
      const ref = await FB.addDoc(FB.collection(FB.db, 'payments'), {
        uid: ME.uid, studentNo: P.studentNo || null, name: P.name || '',
        batch: P.batch || BATCH,
        purpose: forSeason ? 'season' : 'live',
        season, month, amount,
        status: 'pending', hasSlip: true, at: FB.serverTimestamp()
      });
      try {
        await FB.setDoc(FB.doc(FB.db, 'slips', ref.id),
          { uid: ME.uid, data: slipData, at: FB.serverTimestamp() });
      } catch (err) {
        await FB.setDoc(FB.doc(FB.db, 'payments', ref.id), { hasSlip: false }, { merge: true });
        throw new Error('The payment was recorded but the photo did not go through. ' +
                        'Please send it to sir on WhatsApp.');
      }
      PAYMENTS.unshift({ id: ref.id, month, amount, season,
        purpose: forSeason ? 'season' : 'live', status: 'pending', at: new Date() });
    }

    slipData = null;
    resetDrop();
    renderPayHistory();
    busy('#pSend', false);
    slipSentPopup(forSeason, forSeason ? season : month);
    return;
  } catch (err) {
    toast(err.message || 'Could not send. Check your connection and try again.', 'bad');
  }
  busy('#pSend', false);
}

/* Sending money is the most anxious moment on the whole site, so it gets a
   real confirmation rather than a toast that slides away in three seconds. */
function slipSentPopup(forSeason, what) {
  sheet(`
    <div style="text-align:center">
      <div class="tick-ring">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h3>Slip sent to sir</h3>
      <p style="color:var(--dim);margin:0 0 6px">
        ${forSeason
          ? `For unit ${pad(Number(what))} recordings.`
          : `For the ${esc(monthName(what))} live class.`}</p>
      <p style="color:var(--dim);margin:0 0 20px">
        He checks slips by hand, usually within a day. It opens here by itself
        once he approves it — you do not need to send it again.</p>
      <button class="btn btn--gold btn--wide" data-close-sheet>Got it</button>
    </div>`);
}

function resetDrop() {
  $('#dropIn').innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
    <b>Add a photo of the slip</b>
    <small>Take it in good light so the amount is readable</small>`;
  $('#pFile').value = '';
}

async function pickSlip(file) {
  if (!file) return;
  $('#dropIn').innerHTML = `<div class="spin"></div><small style="display:block;margin-top:10px">Making it smaller…</small>`;
  try {
    const { compress, kb } = await import('./slip-upload.js');
    slipData = await compress(file);
    $('#dropIn').innerHTML = `<img src="${slipData}" alt="Your slip">
      <b>Ready to send</b><small>${kb(slipData)} KB · tap to choose a different photo</small>`;
  } catch (err) {
    slipData = null;
    resetDrop();
    toast(err.message || 'That photo could not be used.', 'bad');
  }
}

/* ============================================================ my details */

function renderMe() {
  $('#meName2').value  = P.name || '';
  $('#meWa').value     = P.whatsapp || '';
  $('#meSchool').value = P.school || '';
  $('#meAddr').value   = P.address || '';
  $('#meNo').textContent = P.studentNo || 'not issued';
  $('#acNo').textContent = P.studentNo || 'not issued';
  $('#acBatch').textContent = `${P.batch || BATCH} · ${BATCH_LABEL}`;
  $('#acMail').textContent = P.email || '';
  $('#acJoined').textContent = P.at
    ? (P.at.toDate ? P.at.toDate() : new Date(P.at)).toLocaleDateString('en', { day:'numeric', month:'long', year:'numeric' })
    : '—';
  $('#acSession').textContent = DEMO ? 'sample mode' : leftText(remaining(ME.uid));
}

async function saveMe() {
  const patch = {
    name: $('#meName2').value.trim(),
    whatsapp: $('#meWa').value.trim(),
    school: $('#meSchool').value.trim(),
    address: $('#meAddr').value.trim()
  };
  if (!patch.name) return toast('Your name cannot be empty', 'bad');
  $('#meSave').disabled = true;
  try {
    if (!DEMO) await FB.updateDoc(FB.doc(FB.db, 'students', ME.uid), patch);
    Object.assign(P, patch);
    paintTop();
    toast('Saved');
  } catch (err) {
    toast(err.code === 'permission-denied'
      ? 'That change is not allowed. Ask sir.'
      : 'Could not save. Try again.', 'bad');
  }
  $('#meSave').disabled = false;
}

/* ================================================================ shell */

function paintTop() {
  setTx('#myName', P.name || 'Student');
  setTx('#myLine', `${P.batch || BATCH} · ${P.school || BATCH_LABEL}`);
  setTx('#myNo', P.studentNo || '—');
  setTx('#avatar', (P.name || 'S').trim()[0].toUpperCase());
}

function switchTab(t) {
  ['live','rec','papers','pay','me'].forEach(k => { $('#v-' + k).hidden = k !== t; });
  $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  if (t === 'me') renderMe();
  if (t === 'rec') renderRec();
  if (t === 'papers') renderPapers();
  window.scrollTo({ top: 0 });
}

/* --------------------------------------------------------------- events */

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab],[data-season],[data-ep],[data-jump],[data-go-pay],[data-close-sheet],[data-filter],[data-submit],[data-book],[data-slot]');
  if (!t) return;
  const d = t.dataset;

  if (d.tab) return switchTab(d.tab);
  if ('closeSheet' in d) return closeSheet();

  if (d.filter) {
    filter = d.filter;
    $$('#recChips .chip').forEach(c => c.classList.toggle('on', c.dataset.filter === filter));
    return renderSeasons();
  }

  if (d.jump || d.season) {
    curSeason = Number(d.jump || d.season);
    renderSeasons(); renderEps();
    $('#eps').scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (d.ep) return openEpisode(...d.ep.split('-').map(Number));
  if (d.submit) { closeSheet(); return submitSheet(d.submit); }
  if (d.book) return bookSheet(Number(d.book));
  if (d.slot) return bookSlot(d.slot, Number(d.term));

  if (d.goPay) {
    switchTab('pay');
    $('#pFor').value = d.goPay;
    syncPayForm();
    if (d.goPay === 'season' && d.n) $('#pSeason').value = d.n;
    if (d.goPay === 'live') $('#pMonth').value = thisMonth();
    closeSheet();
    return;
  }
});

$('#recQ').addEventListener('input', renderSeasons);
$('#viewMode').addEventListener('click', () => {
  listMode = !listMode;
  $('#viewMode').textContent = listMode ? 'Cards' : 'List';
  renderSeasons();
});
$('#plClose').addEventListener('click', closePlayer);
$('#plDone').addEventListener('click', doneButton);
$('#plNext').addEventListener('click', () => stepEpisode(1));
$('#plPrev').addEventListener('click', () => stepEpisode(-1));
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#player').hidden) return closePlayer();
  if (!$('#sheet').hidden) return closeSheet();
});

$('#pFor').addEventListener('change', syncPayForm);
$('#pFile').addEventListener('change', e => pickSlip(e.target.files[0]));
$('#pSend').addEventListener('click', sendSlip);
$('#meSave').addEventListener('click', saveMe);
$('#themeBtn')?.addEventListener('click', toggleTheme);
$('#outBtn').addEventListener('click', () => signOutNow());
$('#acOut').addEventListener('click', () => signOutNow());
$('#holdOut').addEventListener('click', () => signOutNow());
$('#holdCheck').addEventListener('click', () => location.reload());

['dragover','dragleave','drop'].forEach(ev =>
  $('#drop').addEventListener(ev, (e) => {
    e.preventDefault();
    $('#drop').classList.toggle('over', ev === 'dragover');
    if (ev === 'drop') pickSlip(e.dataTransfer.files[0]);
  }));

/* ================================================================= boot */

const AUTH_MSG = {
  'auth/invalid-credential':'Wrong email or password.',
  'auth/wrong-password':'Wrong email or password.',
  'auth/user-not-found':'No account with that email. Register first.',
  'auth/email-already-in-use':'That email already has an account. Sign in instead.',
  'auth/weak-password':'Your password needs at least 6 characters.',
  'auth/invalid-email':'That email address does not look right.',
  'auth/network-request-failed':'No internet connection.',
  'auth/too-many-requests':'Too many tries. Wait a minute and try again.'
};

function wireGate() {
  const swap = (toReg) => {
    $('#paneIn').hidden = toReg;
    $('#paneReg').hidden = !toReg;
    $('#gMsg').removeAttribute('data-kind');
    $('#gMsg2').removeAttribute('data-kind');
  };
  $('#toReg').onclick = () => swap(true);
  $('#toIn').onclick  = () => swap(false);

  const say = (sel, text, kind) => {
    const el = $(sel);
    el.textContent = text;
    el.dataset.kind = kind;
  };

  /* ---------------------------------------------------------- sign in -- */

  $('#doIn').onclick = async () => {
    const em = $('#inEmail').value.trim().toLowerCase();
    const pw = $('#inPass').value;
    if (!em || !pw) return say('#gMsg', 'Fill in both boxes.', 'bad');

    $('#gMsg').removeAttribute('data-kind');
    busy('#doIn', true, 'Signing in…');

    // The stamp goes down BEFORE the sign-in call. The auth listener fires
    // the moment Firebase accepts the password, and if it finds no stamp it
    // treats the session as expired and throws the person straight back out.
    stampPending();

    try {
      await FB.setPersistence(FB.auth, FB.browserLocalPersistence);
      const c = await FB.signInWithEmailAndPassword(FB.auth, em, pw);
      stamp(c.user.uid);
      // The password was right, so the class is opening: start the intro now
      // and let it run while the account and progress load behind it.
      showIntro();
    } catch (e) {
      clearStamp();
      busy('#doIn', false);
      say('#gMsg', AUTH_MSG[e.code] || e.message || 'Could not sign in.', 'bad');
      shake('#gMsg');
    }
  };
  $('#inPass').addEventListener('keydown', e => { if (e.key === 'Enter') $('#doIn').click(); });

  /* ---------------------------------------------------- forgot password -- */

  $('#toReset').onclick = async () => {
    const em = $('#inEmail').value.trim();
    if (!em) return say('#gMsg', 'Type your email in the box above first.', 'info');
    try {
      await FB.sendPasswordResetEmail(FB.auth, em);
      say('#gMsg', 'Check your email for a link to set a new password.', 'ok');
    } catch (e) {
      say('#gMsg', AUTH_MSG[e.code] || e.message || 'Could not send the email.', 'bad');
    }
  };

  /* --------------------------------------------------------- register -- */

  $('#doReg').onclick = async () => {
    const v = (id) => $(id).value.trim();
    const pw = $('#rPass').value;

    if (!v('#rName') || !v('#rWa') || !v('#rEmail') || !pw)
      return say('#gMsg2', 'Name, WhatsApp, email and password are all needed.', 'bad');
    if (pw.length < 6)
      return say('#gMsg2', 'Your password needs at least 6 characters.', 'bad');

    $('#gMsg2').removeAttribute('data-kind');
    busy('#doReg', true, 'Sending…');
    stampPending();

    // Everything that must finish before the auth listener is allowed to look
    // at the account goes inside this one promise. Creating the login signs
    // the student in immediately, so without this the listener reads a
    // students/{uid} document that has not been written yet, finds nothing,
    // and bounces them back to the sign-in screen — which looks exactly like
    // "registration is not working".
    registering = (async () => {
      const cred = await FB.createUserWithEmailAndPassword(
        FB.auth, v('#rEmail').toLowerCase(), pw);

      try {
        // The shape here is fixed by firestore.rules: a new account is always
        // a pending student, with no number and nothing unlocked. It cannot
        // approve itself. `email` is taken from the token rather than the
        // form because Firebase lowercases it, and the rule compares the two.
        await FB.setDoc(FB.doc(FB.db, 'students', cred.user.uid), {
          role: 'student',
          status: 'pending',
          studentNo: null,
          name: v('#rName'),
          whatsapp: v('#rWa'),
          school: v('#rSchool'),
          address: v('#rAddr'),
          email: cred.user.email,
          batch: BATCH,
          track: null,
          unlocked: [],
          watched: [],
          paidLive: false,
          at: FB.serverTimestamp()
        });
      } catch (err) {
        // The login was created but the record was refused. Delete the login
        // again, or that email is taken forever with nothing attached to it
        // and the student can neither register nor sign in.
        try { await cred.user.delete(); } catch (_) {}
        throw err;
      }

      stamp(cred.user.uid);
      return cred.user;
    })();

    try {
      const user = await registering;
      P = {
        uid: user.uid, name: v('#rName'), whatsapp: v('#rWa'),
        school: v('#rSchool'), address: v('#rAddr'), email: user.email,
        batch: BATCH, role: 'student', status: 'pending', studentNo: null
      };
      busy('#doReg', false);
      hideIntro();
      registeredPopup(v('#rName'));
    } catch (e) {
      console.error('[class] registration failed', e);
      clearStamp();
      busy('#doReg', false);
      say('#gMsg2', regError(e), 'bad');
      shake('#gMsg2');
    } finally {
      registering = null;
    }
  };
}

/* These are the failures most likely to be hit on a real phone, so each one
   says what to actually do about it rather than printing a Firebase code. */
function regError(e) {
  const code = e.code || '';
  if (code === 'auth/operation-not-allowed')
    return 'Registration is switched off in Firebase. Sir needs to turn on ' +
           'Email/Password under Authentication → Sign-in method.';
  if (code === 'permission-denied' || code === 'PERMISSION_DENIED')
    return 'The class database refused the registration. Sir needs to publish ' +
           'the Firestore rules.';
  if (code === 'auth/email-already-in-use')
    return 'That email already has an account. Try signing in instead, or use ' +
           'Forgot your password.';
  if (code === 'unavailable')
    return 'No connection to the class database. Check your internet and try again.';
  return AUTH_MSG[code] || e.message || 'Something went wrong. Please try again.';
}

function registeredPopup(name) {
  sheet(`
    <div style="text-align:center">
      <div class="tick-ring">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h3>Registration sent</h3>
      <p style="color:var(--dim);margin:0 0 6px">
        Thank you, ${esc(String(name).split(' ')[0])}. Sir checks every
        registration by hand, usually within a day.</p>
      <p style="color:var(--dim);margin:0 0 20px">
        Your student number appears here as soon as it is approved, and the
        class opens with it.</p>
      <button class="btn btn--gold btn--wide" id="okReg">Got it</button>
    </div>`);
  $('#okReg').onclick = () => { closeSheet(); showHold('pending'); };
}

/* A login with no class record. This happens if a registration was cut off
   between creating the account and writing the document — a dropped
   connection at exactly the wrong moment. Rather than looping them back to
   the sign-in screen forever, let them finish the part that is missing. */
function finishRegistration(user) {
  busy('#doIn', false);
  hideIntro();
  document.body.classList.remove('checking');
  document.body.classList.add('blocked');
  $('#hold').hidden = true;
  $('#gate').hidden = false;
  $('#paneIn').hidden = true;
  $('#paneReg').hidden = false;
  $('#rEmail').value = user.email || '';
  $('#rEmail').readOnly = true;
  $('#rPass').closest('label').hidden = true;
  say2('Your login was made but your details did not save. Fill them in once ' +
       'more and it will be finished.');

  $('#doReg').onclick = async () => {
    const v = (id) => $(id).value.trim();
    if (!v('#rName') || !v('#rWa'))
      return say2('Name and WhatsApp are needed.', 'bad');

    busy('#doReg', true, 'Finishing…');
    try {
      await FB.setDoc(FB.doc(FB.db, 'students', user.uid), {
        role: 'student', status: 'pending', studentNo: null,
        name: v('#rName'), whatsapp: v('#rWa'), school: v('#rSchool'),
        address: v('#rAddr'), email: user.email,
        batch: BATCH, track: null, unlocked: [], watched: [], paidLive: false,
        at: FB.serverTimestamp()
      });
      stamp(user.uid);
      busy('#doReg', false);
      registeredPopup(v('#rName'));
    } catch (e) {
      busy('#doReg', false);
      say2(regError(e), 'bad');
    }
  };

  function say2(text, kind = 'info') {
    const el = $('#gMsg2');
    el.textContent = text;
    el.dataset.kind = kind;
  }
}

async function loadMine(uid) {
  const [acc, pay, live, pub] = await Promise.all([
    FB.getDocs(FB.query(FB.collection(FB.db, 'access'), FB.where('uid', '==', uid)))
      .catch(() => { throw new Error('access'); }),
    FB.getDocs(FB.query(FB.collection(FB.db, 'payments'), FB.where('uid', '==', uid)))
      .catch(() => { throw new Error('payments'); }),
    // The join link is readable only by an account that paid for this month,
    // so a permission error here is the normal answer for someone who has
    // not paid. It must not stop the rest of the page loading.
    FB.getDoc(FB.doc(FB.db, 'settings', 'live')).catch(() => null),
    FB.getDoc(FB.doc(FB.db, 'settings', 'public')).catch(() => null)
  ]);

  try {
    GATE = await papersLib();
    await loadPapers(uid);
    // If the papers collection cannot be read we do not know which papers are
    // in, so gating on it would lock students out of units they have paid for.
    // Falling back to "paid means open" is the safe way to be wrong.
    if (!PAPERS_OK) GATE = null;
  } catch (err) {
    console.warn('[class] papers layer unavailable:', err.code || err.message);
    PAPERS_OK = false;
    GATE = null;
  }
  ACCESS = new Set(); acc.forEach(d => ACCESS.add(d.data().month));
  PAYMENTS = []; pay.forEach(d => PAYMENTS.push({ id: d.id, ...d.data() }));
  PAYMENTS.sort((a, b) => (b.at?.seconds || 0) - (a.at?.seconds || 0));

  if (live && live.exists()) {
    const L = live.data();
    if (L.open && L.month === thisMonth()) LIVE_URL = L.url || '';
  }
  if (pub && pub.exists()) {
    const B = pub.data();
    if (B.bank) BANK_TEXT = B.bank;
    window.COURSE = Object.assign({}, window.COURSE,
      { live: Object.assign({}, window.COURSE?.live, B) });
  }
}

/* ---------------------------------------------------------------- intro
   Rules for when it plays:

     - Already signed in and the page loads  -> play it.
     - Credentials accepted just now         -> play it.
     - Landing on the sign-in screen         -> do not play it. Nobody wants
       a ceremony in front of an empty form, least of all somebody who just
       signed out and is trying to get back in.

   So the intro starts hidden. The auth check decides which way it goes, and
   because that check is fast the student sees either the form or the intro,
   never both.
   -------------------------------------------------------------------- */

let introFrom = 0;
let introPlaying = false;

function showIntro() {
  const el = $('#intro');
  if (!el || introPlaying) return;
  introPlaying = true;
  introFrom = Date.now();
  el.hidden = false;
  el.classList.remove('open', 'linked');
  document.body.classList.add('checking');

  // ones and zeroes drifting up out of the processor
  const bits = $('#introBits');
  if (bits) {
    bits.innerHTML = '';
    for (let i = 0; i < 14; i++) {
      const b = document.createElement('i');
      b.className = 'bit';
      b.textContent = Math.random() < .5 ? '0' : '1';
      b.style.left = Math.round(Math.random() * 92) + '%';
      b.style.animationDelay = (0.9 + Math.random() * 1.1).toFixed(2) + 's';
      bits.append(b);
    }
  }
  setTx('#introStatus', 'Connecting to class');
}

/* Nothing to celebrate — take it away at once, with no animation. */
function hideIntro() {
  const el = $('#intro');
  introPlaying = false;
  if (el) { el.hidden = true; el.classList.remove('open', 'linked'); }
  document.body.classList.remove('checking');
}

/* The link is made and the room opens. Held to a minimum so a fast
   connection still gets the whole sequence rather than a stutter. */
function openIntro(done) {
  const el = $('#intro');
  if (!el || el.hidden) { done && done(); return; }

  const MIN = 2150;                       // long enough for the board to draw
  const wait = Math.max(0, MIN - (Date.now() - introFrom));

  setTimeout(() => {
    el.classList.add('linked');
    setTx('#introStatus', 'Connected');

    setTimeout(() => {
      el.classList.add('open');           // panels part
      document.body.classList.remove('checking');
      document.body.classList.add('arriving');
      done && done();
      setTimeout(() => {
        el.hidden = true;
        el.classList.remove('open', 'linked');
        document.body.classList.remove('arriving');
        introPlaying = false;
      }, 1000);
    }, 420);
  }, wait);
}

/* Shown as the room opens, so the two read as one arrival. */
function welcomeCard() {
  const w = $('#welcome');
  if (!w) return;
  setTx('#wcName', (P.name || 'Student').split(' ')[0]);
  setTx('#wcNo', P.studentNo || '—');
  w.hidden = false;
  setTimeout(() => {
    w.style.transition = 'opacity .4s';
    w.style.opacity = '0';
    setTimeout(() => { w.hidden = true; w.style.opacity = ''; }, 420);
  }, 1750);
}


/* ------------------------------------------------- something opened up --
   Remember what was open last time, so a student who comes back after sir
   approved a slip is told, rather than having to notice for themselves.
   ---------------------------------------------------------------------- */

const SEEN_KEY = 'eict.seen';

function announceNew() {
  let seen;
  try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || 'null'); } catch (_) { seen = null; }

  const now = { months: [...ACCESS], units: unlocked() };
  localStorage.setItem(SEEN_KEY, JSON.stringify(now));

  if (!seen) return;                                   // first visit, nothing to compare
  const newMonths = now.months.filter(m => !(seen.months || []).includes(m));
  const newUnits  = now.units.filter(u => !(seen.units || []).includes(u));
  if (!newMonths.length && !newUnits.length) return;

  setTimeout(() => {
    if (newUnits.length) unitOpenedSheet(newUnits, newMonths);
    else monthOpenedSheet(newMonths);

    setTimeout(() => {
      newUnits.forEach(u => {
        const card = $(`.sn-card[data-season="${u}"]`);
        if (card) card.classList.add('just-opened');
      });
    }, 400);
  }, 900);
}

/* A seal giving way, not a tick. The unit number is behind a card that flips
   as the padlock springs and drops. Tutes are mentioned here because that is
   the moment a recordings student wonders what else they paid for. */
function unitOpenedSheet(units, months) {
  const first = units[0];
  const s = SEASONS.find(x => x.n === first);
  const sparks = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return `<i class="unlock__spark" style="--dx:${Math.round(Math.cos(a) * 78)}px;--dy:${Math.round(Math.sin(a) * 78)}px;animation-delay:${(.4 + i * .015).toFixed(2)}s"></i>`;
  }).join('');

  sheet(`
    <div style="text-align:center">
      <div class="unlock">
        ${sparks}
        <svg class="unlock__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/></svg>
        <div class="unlock__card">
          <div class="unlock__face unlock__front">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:34px;height:34px">
              <rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg>
          </div>
          <div class="unlock__face unlock__back">${pad(first)}</div>
        </div>
      </div>

      <h3>Unit ${pad(first)} is open</h3>
      <p style="color:var(--dim);margin:0 0 4px">${esc(s ? s.title : '')}</p>
      <p style="color:var(--dim);margin:0 0 18px">
        ${units.length > 1 ? `And ${units.length - 1} more unit${units.length > 2 ? 's' : ''}. ` : ''}
        ${s ? s.episodes.length : ''} episodes, ready to watch now.</p>

      ${courierNote()}

      ${months.length ? `<p style="color:var(--dim);font-size:13px;margin:0 0 16px">
        The ${esc(monthName(months[0]))} live class is open too.</p>` : ''}

      <button class="btn btn--gold btn--wide" data-close-sheet>Start watching</button>
    </div>`);
}

function monthOpenedSheet(months) {
  sheet(`
    <div style="text-align:center">
      <div class="tick-ring">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h3>You are in</h3>
      <p style="color:var(--dim);margin:0 0 20px">
        Sir has opened the ${esc(monthName(months[0]))} live class for you.
        The join link is on the Live class tab.</p>
      <button class="btn btn--gold btn--wide" data-close-sheet>Open it</button>
    </div>`);
}

/* Recordings students are paying partly for printed tutes and the unit's
   paper, so say so at the moment the payment is approved. */
function courierNote(title, body) {
  return `
    <div style="background:var(--sunk);border:1px dashed var(--wire-2);border-radius:var(--r);padding:4px 14px 14px;margin:0 0 18px">
      <div class="courier">
        <div class="courier__road"></div>
        <i class="courier__puff" style="left:22%"></i>
        <i class="courier__puff" style="left:38%;animation-delay:.5s"></i>
        <i class="courier__puff" style="left:56%;animation-delay:1s"></i>
        <svg class="courier__box" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z"/>
          <path d="M2 4h20v4H2zM12 4v16"/></svg>
        <svg class="courier__home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/></svg>
      </div>
      <b style="display:block;font-family:var(--d);font-size:14.5px;margin-bottom:3px">
        ${esc(title || 'Your tutes are on the way')}</b>
      <small style="color:var(--dim);font-size:12.5px;line-height:1.5;display:block">
        ${body ? esc(body) : `Printed tutes, past papers and this unit's paper go out by
        courier to ${P.address ? P.address : 'your address'}. Usually 3-5 days.`}
        ${P.address ? '' : ' Add your address under My details so sir knows where to send them.'}</small>
    </div>`;
}

function enter() {
  document.body.classList.remove('blocked');
  $('#gate').hidden = true;
  $('#hold').hidden = true;
  paintTop();
  fillSeasonPicker();
  $('#pMonth').value = thisMonth();
  syncPayForm();
  renderLive();
  renderRec();
  renderPayHistory();

  // Everything is drawn behind the intro; only now do the panels open.
  openIntro(() => { welcomeCard(); announceNew(); });

  if (DEMO) return;

  const tick = () => {
    const left = remaining(ME.uid);
    if (left <= 0) return signOutNow('Your day is up. Sign in again to carry on.');
    if (!$('#v-me').hidden) $('#acSession').textContent = leftText(left);
  };
  setInterval(tick, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tick();
  });
  window.addEventListener('focus', tick);
  window.addEventListener('storage', e => {
    if (e.key === STAMP_AT && e.newValue === null) location.reload();
  });
}

/* ================================================================= boot */

(async () => {
  FB = await bootFirebase();
  DEMO = !FB;
  $('#batchLabel').textContent = BATCH_LABEL;
  const vt = $('#verTag'); if (vt) vt.textContent = 'v' + VERSION;

  const carried = sessionStorage.getItem('eict.reason');
  sessionStorage.removeItem('eict.reason');

  // A stamp means a session is already live, so the page is about to open the
  // class rather than ask for a password: play the intro straight away
  // instead of waiting for Firebase, which would show a flash of nothing.
  if (!carried && localStorage.getItem(STAMP_AT)) {
    showIntro();
  } else {
    // No stamp means no session by our own rule, so the sign-in form can go
    // up at once rather than leaving a blank screen while Firebase answers.
    hideIntro();
    if (!DEMO) showGate(carried || null, carried ? 'info' : 'bad');
  }

  if (DEMO) {
    seedDemo();
    ME = { uid: 'demo' };
    showIntro();
    papersLib().then(L => { GATE = L; renderRec(); })
      .catch(err => { console.warn('[class] papers.js missing', err.message); PAPERS_OK = false; });
    enter();
    toast('Sample mode — not connected to the class database');
    return;
  }

  wireGate();

  FB.onAuthStateChanged(FB.auth, (user) => {
    handleAuth(user, carried).catch((err) => {
      // Anything unexpected lands here rather than vanishing as an unhandled
      // rejection with the sign-in button stuck on "Signing in...".
      console.error('[class] sign-in failed', err);
      busy('#doIn', false);
      busy('#doReg', false);
      showGate('Something went wrong opening your class: ' +
               (err.message || err.code || 'unknown') +
               '. Refresh the page and try again.');
    });
  });
})();

async function handleAuth(user, carried) {
    if (!user) { busy('#doIn', false); return showGate(carried || null, carried ? 'info' : 'bad'); }
    ME = user;

    // Wait for a registration that is still writing. Without this the read
    // below lands before the document exists.
    if (registering) {
      try { await registering; } catch (_) { return; }   // the form reports it
    }

    if (remaining(user.uid) <= 0) {
      clearStamp();
      await FB.signOut(FB.auth);
      return showGate('Your day is up. Sign in again to carry on.', 'info');
    }

    // Read the account before showing anything. A failed read signs out
    // rather than guessing a profile — that guess is what used to drop people
    // straight into the class with no restrictions.
    let snap;
    try {
      snap = await FB.getDoc(FB.doc(FB.db, 'students', user.uid));
    } catch (err) {
      console.error('[class] profile read failed', err);
      clearStamp();
      await FB.signOut(FB.auth);
      return showGate('We could not open your account. Try again in a moment.');
    }

    if (!snap.exists()) return finishRegistration(user);

    P = { uid: user.uid, ...snap.data() };
    PROG = P.progress || {};
    // A theme chosen on another device wins, unless this one has been set.
    if (P.theme && !localStorage.getItem(THEME_KEY)) applyTheme(P.theme);

    if (P.role === 'teacher') { location.href = 'Admin.html'; return; }
    if (P.status === 'pending') return showHold('pending');
    if (P.status !== 'active')  return showHold('blocked');

    try {
      await loadMine(user.uid);
    } catch (err) {
      console.error('[class] load failed', err);
      busy('#doIn', false);
      const which = ['access', 'payments'].includes(err.message) ? err.message : null;
      return showGate('Signed in, but your class could not load' +
        (which ? ` — the ${which} rules are refusing to be read` : '') +
        '. Tell sir the Firestore rules need publishing.');
    }
    busy('#doIn', false);
    enter();
}
