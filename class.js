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
  if (on) {
    b.dataset.was = b.innerHTML;
    b.innerHTML = `<span class="spin"></span>${label ? esc(label) : ''}`;
  } else if (b.dataset.was) {
    b.innerHTML = b.dataset.was;
    delete b.dataset.was;
  }
}

const unlocked  = () => (P?.unlocked || []).map(Number);
const isOpen    = (n) => unlocked().includes(Number(n));
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
  if (FB) { try { await FB.signOut(FB.auth); } catch(_) {} }
  if (reason) sessionStorage.setItem('eict.reason', reason);
  location.reload();
}

/* ============================================================== screens */

function showGate(msg, kind = 'bad') {
  document.body.classList.remove('checking');
  document.body.classList.add('blocked');
  $('#hold').hidden = true;
  $('#gate').hidden = false;
  const box = $('#gMsg');
  if (msg) { box.textContent = msg; box.dataset.kind = kind; }
  else box.removeAttribute('data-kind');
}

function showHold(kind) {
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

function lastWatched() {
  const list = P?.watched || [];
  if (!list.length) return null;
  const key = list[list.length - 1];
  const [sn, en] = key.split('-').map(Number);
  const s = SEASONS.find(x => x.n === sn);
  if (!s) return null;
  const next = s.episodes.find(e => e.n === en + 1);
  if (next) return { s, e: next, fresh: true };
  const nextSeason = SEASONS.find(x => x.n === sn + 1 && isOpen(x.n));
  if (nextSeason) return { s: nextSeason, e: nextSeason.episodes[0], fresh: true };
  return { s, e: s.episodes.find(e => e.n === en), fresh: false };
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

  $('#seasons').innerHTML = list.map(s => {
    const open = isOpen(s.n);
    const { done, total, pct } = seasonStats(s);
    return `<button class="sn-card ${open ? '' : 'locked'} ${pct === 100 ? 'done' : ''} ${curSeason === s.n ? 'on' : ''}"
      data-season="${s.n}">
      <span class="sn-card__n">${pad(s.n)}</span>
      <span class="sn-card__k">Unit</span>
      <span class="sn-card__t">${esc(s.title)}</span>
      <span class="sn-card__f">
        <span>${total} episodes</span>
        <span style="color:${open ? 'var(--dim)' : 'var(--gold)'}">
          ${open ? `${done}/${total}` : `Rs. ${FEE_SEASON.toLocaleString()}`}</span>
      </span>
      ${open ? `<span class="sn-card__bar"><i style="width:${pct}%"></i></span>` : ''}
    </button>`;
  }).join('');
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
      const dn = W.has(`${s.n}-${e.n}`);
      return `<button class="ep ${dn ? 'done' : ''}" data-ep="${s.n}-${e.n}">
        <span class="ep__n">${pad(e.n)}</span>
        <span class="ep__t"><b>${esc(e.title)}</b><small>${e.mins} min${dn ? ' · watched' : ''}</small></span>
        <span class="ep__tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>
      </button>`;
    }).join('')}`;
}

/* ---- player ---- */

async function openEpisode(sn, en) {
  const s = SEASONS.find(x => x.n === sn);
  const ep = s?.episodes.find(e => e.n === en);
  if (!s || !ep) return;
  curEp = [sn, en];

  $('#plTitle').textContent = ep.title;
  $('#plSub').textContent = `Unit ${pad(sn)} · episode ${pad(en)} · ${ep.mins} min`;
  $('#stage').innerHTML = `<div class="spin"></div>`;
  $('#player').hidden = false;
  document.body.classList.add('locked');

  // The video id is fetched only now, and the rules decide whether this
  // account may have it. A locked unit simply returns nothing.
  let vid = null;
  if (DEMO) {
    vid = null;
  } else {
    try {
      const d = await FB.getDoc(FB.doc(FB.db, 'seasons', `${BATCH}-${sn}`));
      if (d.exists()) vid = (d.data().episodes || {})[String(en)] || null;
    } catch (err) {
      console.warn('[class] locked or unavailable:', err.code || err.message);
    }
  }

  if (!vid) {
    $('#stage').innerHTML = `<div class="empty" style="padding:30px">
      <b>${DEMO ? 'Sample mode' : 'No video here yet'}</b>
      <p>${DEMO ? 'Videos play once the class is connected to the database.'
                : 'This episode has not been linked yet. Tell sir on WhatsApp.'}</p></div>`;
    return;
  }

  $('#stage').innerHTML =
    `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&autoplay=1"
      title="${esc(ep.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen></iframe><div class="mark" id="wm"></div>`;

  // Name across the picture, moved every so often. Not unbreakable, but it
  // makes a re-shared recording traceable.
  const wm = $('#wm');
  const tag = `${P.studentNo || ''} · ${P.name || ''}`;
  const place = () => {
    if (!wm) return;
    wm.textContent = tag;
    wm.style.left = (6 + Math.random() * 56) + '%';
    wm.style.top  = (8 + Math.random() * 74) + '%';
  };
  place();
  clearInterval(markTimer);
  markTimer = setInterval(place, 18000);

  $('#stage').oncontextmenu = e => e.preventDefault();

  if (!DEMO) {
    FB.addDoc(FB.collection(FB.db, 'views'), {
      uid: ME.uid, name: P.name || '', studentNo: P.studentNo || '',
      ep: `${sn}-${en}`, batch: BATCH, at: FB.serverTimestamp()
    }).catch(() => {});
  }
}

function closePlayer() {
  $('#player').hidden = true;
  $('#stage').innerHTML = '';
  clearInterval(markTimer);
  document.body.classList.remove('locked');
}

async function markWatched() {
  if (!curEp) return;
  const key = curEp.join('-');
  if ((P.watched || []).includes(key)) { closePlayer(); return; }
  P.watched = [...(P.watched || []), key];
  if (!DEMO) {
    try { await FB.updateDoc(FB.doc(FB.db, 'students', ME.uid), { watched: FB.arrayUnion(key) }); }
    catch (_) {}
  }
  renderRec();
  closePlayer();
  toast('Marked as watched');
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
  $('#pMonthWrap').hidden = forSeason;
  $('#pSeasonWrap').hidden = !forSeason;
  $('#pAmount').value = forSeason ? FEE_SEASON : FEE_LIVE;
}

async function sendSlip() {
  if (!slipData) return toast('Add a photo of the slip first', 'bad');
  const forSeason = $('#pFor').value === 'season';
  const month = forSeason ? thisMonth() : ($('#pMonth').value || thisMonth());
  const amount = Number($('#pAmount').value || 0);
  const season = forSeason ? Number($('#pSeason').value) : null;

  if (!amount) return toast('Fill in the amount', 'bad');

  const btn = $('#pSend');
  btn.disabled = true; btn.textContent = 'Sending…';

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
    toast('Sent. Sir will check it and open the class.');
  } catch (err) {
    toast(err.message || 'Could not send. Check your connection and try again.', 'bad');
  }
  btn.disabled = false; btn.textContent = 'Send to sir';
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
  $('#myName').textContent = P.name || 'Student';
  $('#myLine').textContent = `${P.batch || BATCH} · ${P.school || BATCH_LABEL}`;
  $('#myNo').textContent = P.studentNo || '—';
  $('#avatar').textContent = (P.name || 'S').trim()[0].toUpperCase();
}

function switchTab(t) {
  ['live','rec','pay','me'].forEach(k => { $('#v-' + k).hidden = k !== t; });
  $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  if (t === 'me') renderMe();
  if (t === 'rec') renderRec();
  window.scrollTo({ top: 0 });
}

/* --------------------------------------------------------------- events */

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab],[data-season],[data-ep],[data-jump],[data-go-pay],[data-close-sheet],[data-filter]');
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
$('#plDone').addEventListener('click', markWatched);
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
    } catch (e) {
      clearStamp();
      busy('#doIn', false);
      say('#gMsg', AUTH_MSG[e.code] || e.message || 'Could not sign in.', 'bad');
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
      registeredPopup(v('#rName'));
    } catch (e) {
      console.error('[class] registration failed', e);
      clearStamp();
      busy('#doReg', false);
      say('#gMsg2', regError(e), 'bad');
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
      <div class="hold__ring" style="border-color:var(--live);color:var(--live)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          style="width:26px;height:26px"><path d="M20 6 9 17l-5-5"/></svg>
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
    FB.getDocs(FB.query(FB.collection(FB.db, 'access'), FB.where('uid', '==', uid))),
    FB.getDocs(FB.query(FB.collection(FB.db, 'payments'), FB.where('uid', '==', uid))),
    // The join link is readable only by an account that paid for this month,
    // so a permission error here is the normal answer for someone who has
    // not paid. It must not stop the rest of the page loading.
    FB.getDoc(FB.doc(FB.db, 'settings', 'live')).catch(() => null),
    FB.getDoc(FB.doc(FB.db, 'settings', 'public')).catch(() => null)
  ]);

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

function enter() {
  document.body.classList.remove('checking', 'blocked');
  $('#gate').hidden = true;
  $('#hold').hidden = true;
  paintTop();
  fillSeasonPicker();
  $('#pMonth').value = thisMonth();
  syncPayForm();
  renderLive();
  renderRec();
  renderPayHistory();

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

  const carried = sessionStorage.getItem('eict.reason');
  sessionStorage.removeItem('eict.reason');

  if (DEMO) {
    seedDemo();
    ME = { uid: 'demo' };
    enter();
    toast('Sample mode — not connected to the class database');
    return;
  }

  wireGate();

  FB.onAuthStateChanged(FB.auth, async (user) => {
    if (!user) return showGate(carried || null, carried ? 'info' : 'bad');
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

    if (P.role === 'teacher') { location.href = 'Admin.html'; return; }
    if (P.status === 'pending') return showHold('pending');
    if (P.status !== 'active')  return showHold('blocked');

    try {
      await loadMine(user.uid);
    } catch (err) {
      console.error('[class] load failed', err);
      return showGate('Signed in, but your class could not load. Try again shortly.');
    }
    enter();
  });
})();
