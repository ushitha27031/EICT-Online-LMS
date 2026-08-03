/* ==========================================================================
   EICT — teacher dashboard

   Runs against Firebase when firebase-config.js is filled in, and against
   sample data when it is not, so you can click through the whole thing
   before touching your real class.

   Every access decision made here is also enforced in firestore.rules.
   This file is the convenient way to do it; the rules are what make it true.
   ========================================================================== */

/* ------------------------------------------------------------- constants */

/* Shown in the sidebar. If this does not match what you just uploaded, your
   browser is still running a cached copy — hard refresh with Ctrl+Shift+R. */
const VERSION = '1.4.0';

const SESSION_MAX_MS = 24 * 60 * 60 * 1000;   // one day, hard cap
const STAMP_AT  = 'eict.sessionAt';
const STAMP_UID = 'eict.sessionUid';
const SN_PREFIX = 'EICT';
const FEE_LIVE   = 2000;   // rupees per month
const FEE_SEASON = 2500;   // rupees per unit of recordings
const BATCH     = 'AL-27';

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
  n: i + 1,
  title,
  episodes: Array.from({ length: EP_COUNTS[i] || 6 }, (_, e) => ({
    n: e + 1,
    title: `${title} — part ${e + 1}`,
    mins: 38 + ((e * 7 + i * 3) % 25)
  }))
}));

/* ------------------------------------------------------------- shortcuts */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = (n, w = 2) => String(n).padStart(w, '0');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const monthName = (m) => {
  if (!m) return '—';
  const [y, mo] = m.split('-');
  return new Date(y, mo - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
};
const ago = (ts) => {
  if (!ts) return '—';
  const t = ts.toDate ? ts.toDate() : new Date(ts);
  const s = (Date.now() - t.getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return t.toLocaleDateString('en', { day: 'numeric', month: 'short' });
};

function toast(msg, kind = 'ok') {
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s, transform .25s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(() => el.remove(), 260);
  }, 3200);
}

/* ============================================================== the store
   One object with the same shape whether we are on Firebase or sample data,
   so nothing below this line has to care which.
   ====================================================================== */

let FB = null;      // firebase handles, or null in demo mode
let DEMO = false;

const DB = {
  students: [],
  payments: [],
  freeReqs: [],
  access: [],      // ids shaped uid_YYYY-MM
  seasons: {},     // { '1': { '1': 'ytid', ... } }
  live: { url: '', month: thisMonth(), open: false, day: 'Saturday',
          time: '3.00 – 5.30 PM', fee: 'Rs. 2000 per month', bank: '' },
  counter: 0,
  activity: []
};

/* Slip images, keyed by payment id, fetched one at a time and kept in memory
   for the rest of the session. They live in their own `slips` collection so
   that opening the Payments tab reads only names and amounts — pulling every
   image on every page load would eat the daily read quota for no reason. */
const SLIPS = {};

async function loadSlip(payId) {
  if (payId in SLIPS) return SLIPS[payId];
  if (DEMO) return (SLIPS[payId] = null);
  try {
    const d = await FB.getDoc(FB.doc(FB.db, 'slips', payId));
    SLIPS[payId] = d.exists() ? (d.data().data || null) : null;
  } catch (err) {
    console.warn('[admin] slip read failed', payId, err.code || err.message);
    SLIPS[payId] = null;
  }
  return SLIPS[payId];
}

async function dropSlipImage(payId) {
  if (!DEMO) await FB.deleteDoc(FB.doc(FB.db, 'slips', payId));
  delete SLIPS[payId];
  const p = DB.payments.find(x => x.id === payId);
  if (p) p.hasSlip = false;
  if (!DEMO) await FB.updateDoc(FB.doc(FB.db, 'payments', payId), { hasSlip: false });
  toast('Slip picture deleted, record kept');
  renderPayments();
}

async function bootFirebase() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.projectId || /PASTE|YOUR/i.test(cfg.projectId)) return null;
  try {
    const { initializeApp } =
      await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
    const fs =
      await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
    const au =
      await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
    const app = initializeApp(cfg);
    return {
      db: fs.getFirestore(app),
      auth: au.getAuth(app),
      ...fs, ...au
    };
  } catch (e) {
    console.warn('[admin] Firebase unavailable:', e.message);
    return null;
  }
}

/* ---------------------------------------------------------- sample data */

/* A stand-in deposit slip so the sample data looks like the real thing. */
const demoSlip = (name, amt, month) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" width="430" height="580" font-family="monospace">
<rect width="430" height="580" fill="#fdfcf7"/>
<rect x="0" y="0" width="430" height="66" fill="#0d4f8b"/>
<text x="22" y="41" fill="#fff" font-size="19" font-weight="bold">COMMERCIAL BANK</text>
<text x="22" y="104" font-size="12" fill="#666">CREDIT / DEPOSIT ADVICE</text>
<line x1="22" y1="118" x2="408" y2="118" stroke="#ccc"/>
<text x="22" y="152" font-size="12" fill="#666">ACCOUNT</text>
<text x="22" y="174" font-size="16">0000 0000 0000</text>
<text x="22" y="212" font-size="12" fill="#666">NAME</text>
<text x="22" y="234" font-size="16">S. MANURATHNA</text>
<text x="22" y="272" font-size="12" fill="#666">DEPOSITED BY</text>
<text x="22" y="294" font-size="16">${name}</text>
<text x="22" y="332" font-size="12" fill="#666">REFERENCE</text>
<text x="22" y="354" font-size="14">ICT ${month}</text>
<line x1="22" y1="392" x2="408" y2="392" stroke="#ccc"/>
<text x="22" y="424" font-size="12" fill="#666">AMOUNT (LKR)</text>
<text x="22" y="462" font-size="34" font-weight="bold">${Number(amt).toLocaleString()}.00</text>
<rect x="22" y="496" width="386" height="56" fill="none" stroke="#0d4f8b" stroke-dasharray="4 3"/>
<text x="34" y="530" font-size="13" fill="#0d4f8b">CASH DEPOSIT — MACHINE VALIDATED</text>
</svg>`);

function seedDemo() {
  const now = Date.now();
  const mk = (i, o) => ({
    id: 'demo' + i,
    name: o.name, email: o.email, whatsapp: o.wa, school: o.school,
    batch: BATCH, role: 'student',
    status: o.status, studentNo: o.sn || null,
    track: o.track || null, paidLive: !!o.paid,
    unlocked: o.unlocked || [], watched: o.watched || [],
    at: new Date(now - (o.days || 1) * 86400000)
  });

  DB.students = [
    mk(1, { name: 'Nimesha Perera', email: 'nimesha@example.com', wa: '0771234567',
            school: 'Visakha Vidyalaya', status: 'active', sn: 'EICT-0001',
            track: 'live', paid: true, unlocked: [1, 2, 3], watched: ['1-1','1-2','2-1'], days: 40 }),
    mk(2, { name: 'Kasun Bandara', email: 'kasun@example.com', wa: '0712223344',
            school: 'Ananda College', status: 'active', sn: 'EICT-0002',
            track: 'rec', unlocked: [1], watched: ['1-1'], days: 30 }),
    mk(3, { name: 'Hiruni Silva', email: 'hiruni@example.com', wa: '0765556677',
            school: 'Devi Balika', status: 'active', sn: 'EICT-0003',
            track: 'live', paid: true, unlocked: [], days: 18 }),
    mk(4, { name: 'Tharindu Jayasuriya', email: 'tharindu@example.com', wa: '0778889900',
            school: 'Nalanda College', status: 'pending', days: 2 }),
    mk(5, { name: 'Sanduni Fernando', email: 'sanduni@example.com', wa: '0701112233',
            school: 'Musaeus College', status: 'pending', days: 1 }),
    mk(6, { name: 'Ruwan Dissanayake', email: 'ruwan@example.com', wa: '0723334455',
            school: 'Royal College', status: 'suspended', sn: 'EICT-0004', days: 90 })
  ];
  DB.counter = 4;

  DB.payments = [
    { id: 'p1', uid: 'demo3', studentNo: 'EICT-0003', name: 'Hiruni Silva',
      month: thisMonth(), amount: 2000, status: 'pending',
      hasSlip: true, at: new Date(now - 3600000), note: '' },
    { id: 'p2', uid: 'demo2', studentNo: 'EICT-0002', name: 'Kasun Bandara',
      month: thisMonth(), amount: 2500, status: 'pending',
      hasSlip: true, at: new Date(now - 7200000), note: '' },
    { id: 'p3', uid: 'demo1', studentNo: 'EICT-0001', name: 'Nimesha Perera',
      month: thisMonth(), amount: 2000, status: 'verified',
      hasSlip: true, at: new Date(now - 5 * 86400000), note: '' }
  ];
  SLIPS.p1 = demoSlip('HIRUNI SILVA', 2000, monthName(thisMonth()));
  SLIPS.p2 = demoSlip('KASUN BANDARA', 2500, monthName(thisMonth()));
  SLIPS.p3 = demoSlip('NIMESHA PERERA', 2000, monthName(thisMonth()));

  DB.freeReqs = [
    { id: 'f1', uid: 'demo2', studentNo: 'EICT-0002', name: 'Kasun Bandara',
      month: thisMonth(), status: 'pending', at: new Date(now - 40 * 60000),
      reason: 'Want to try one class before paying for the month.' }
  ];

  DB.access = [`demo1_${thisMonth()}`];
  DB.seasons = { 1: { 1: 'dQw4w9WgXcQ', 2: 'dQw4w9WgXcQ', 3: 'dQw4w9WgXcQ' }, 2: { 1: 'dQw4w9WgXcQ' } };
  DB.live.url = 'https://zoom.us/j/00000000000';
  DB.live.bank = 'Bank : Commercial Bank\nAccount : 0000 0000 0000\nName : S. Manurathna';
}

/* ------------------------------------------------------------ data reads */

async function loadAll() {
  if (DEMO) return;
  const f = FB;
  const [stu, pay, free, acc, live] = await Promise.all([
    f.getDocs(f.collection(f.db, 'students')),
    f.getDocs(f.query(f.collection(f.db, 'payments'), f.orderBy('at', 'desc'), f.limit(200))),
    f.getDocs(f.query(f.collection(f.db, 'freeRequests'), f.orderBy('at', 'desc'), f.limit(120))),
    f.getDocs(f.collection(f.db, 'access')),
    f.getDoc(f.doc(f.db, 'settings', 'live')).catch(() => null)
  ]);

  DB.students = []; stu.forEach(d => DB.students.push({ id: d.id, ...d.data() }));
  DB.payments = []; pay.forEach(d => DB.payments.push({ id: d.id, ...d.data() }));
  DB.freeReqs = []; free.forEach(d => DB.freeReqs.push({ id: d.id, ...d.data() }));
  DB.access   = []; acc.forEach(d => DB.access.push(d.id));
  if (live && live.exists()) DB.live = { ...DB.live, ...live.data() };

  const [paperDocs, slotDocs, bookDocs] = await Promise.all([
    f.getDocs(f.query(f.collection(f.db, 'papers'), f.orderBy('at', 'desc'), f.limit(300))).catch(() => null),
    f.getDocs(f.collection(f.db, 'slots')).catch(() => null),
    f.getDocs(f.collection(f.db, 'bookings')).catch(() => null)
  ]);
  PAPERS = []; paperDocs && paperDocs.forEach(d => PAPERS.push({ id: d.id, ...d.data() }));
  SLOTS = [];  slotDocs && slotDocs.forEach(d => SLOTS.push({ id: d.id, ...d.data() }));
  BOOKINGS = []; bookDocs && bookDocs.forEach(d => BOOKINGS.push({ id: d.id, ...d.data() }));

  const seasonDocs = await f.getDocs(f.collection(f.db, 'seasons'));
  DB.seasons = {};
  seasonDocs.forEach(d => { DB.seasons[d.data().season] = d.data().episodes || {}; });
}

/* ------------------------------------------------------------- mutations */

async function nextStudentNo() {
  if (DEMO) { DB.counter += 1; return `${SN_PREFIX}-${pad(DB.counter, 4)}`; }
  const f = FB;
  const n = await f.runTransaction(f.db, async (tx) => {
    const ref = f.doc(f.db, 'counters', 'studentNo');
    const snap = await tx.get(ref);
    const next = (snap.exists() ? (snap.data().value || 0) : 0) + 1;
    tx.set(ref, { value: next }, { merge: true });
    return next;
  });
  return `${SN_PREFIX}-${pad(n, 4)}`;
}

async function approveStudent(id) {
  const st = DB.students.find(s => s.id === id);
  if (!st) return;
  const sn = st.studentNo || await nextStudentNo();
  const patch = { status: 'active', studentNo: sn, approvedAt: new Date() };

  if (!DEMO) {
    await FB.updateDoc(FB.doc(FB.db, 'students', id),
      { ...patch, approvedAt: FB.serverTimestamp() });
  }
  Object.assign(st, patch);
  note(`${st.name} approved as ${sn}`);
  toast(`${st.name} is now ${sn}`);
  renderAll();
}

async function setStudentStatus(id, status) {
  const st = DB.students.find(s => s.id === id);
  if (!st) return;
  if (!DEMO) await FB.updateDoc(FB.doc(FB.db, 'students', id), { status });
  st.status = status;
  note(`${st.name} set to ${status}`);
  toast(`${st.name} set to ${status}`);
  renderAll();
}

async function grantMonth(uid, month, source) {
  const id = `${uid}_${month}`;
  if (!DEMO) {
    await FB.setDoc(FB.doc(FB.db, 'access', id), {
      uid, month, source,
      grantedAt: FB.serverTimestamp(),
      grantedBy: FB.auth.currentUser.uid
    });
    await FB.updateDoc(FB.doc(FB.db, 'students', uid), { paidLive: true });
  }
  if (!DB.access.includes(id)) DB.access.push(id);
  const st = DB.students.find(s => s.id === uid);
  if (st) st.paidLive = true;
}

async function revokeMonth(uid, month) {
  const id = `${uid}_${month}`;
  if (!DEMO) await FB.deleteDoc(FB.doc(FB.db, 'access', id));
  DB.access = DB.access.filter(a => a !== id);
}

/* What a slip is actually paying for. Older records were written before the
   purpose field existed, so an absent value means live class. */
const isSeasonPay = (p) => p.purpose === 'season' && p.season != null;

const payFor = (p) => isSeasonPay(p)
  ? `Unit ${pad(Number(p.season), 2)} recordings`
  : `Live class · ${monthName(p.month)}`;

async function reviewSlip(payId, decision, noteText) {
  const p = DB.payments.find(x => x.id === payId);
  if (!p) return;
  const patch = { status: decision, note: noteText || '', reviewedAt: new Date() };

  if (!DEMO) {
    await FB.updateDoc(FB.doc(FB.db, 'payments', payId), {
      ...patch, reviewedAt: FB.serverTimestamp(),
      reviewedBy: FB.auth.currentUser.uid
    });
  }
  Object.assign(p, patch);

  if (decision === 'verified') {
    if (isSeasonPay(p)) {
      // A recordings payment opens that unit, not a month of live class.
      await openSeasonFor(p.uid, Number(p.season));
      note(`${p.name} paid for unit ${pad(Number(p.season), 2)}`);
      toast(`Unit ${pad(Number(p.season), 2)} opened for ${p.name}`);
    } else {
      await grantMonth(p.uid, p.month, 'payment');
      note(`${p.name} paid for ${monthName(p.month)}`);
      toast(`Live class opened for ${p.name}`);
    }
  } else {
    if (isSeasonPay(p)) {
      await closeSeasonFor(p.uid, Number(p.season));
    } else {
      await revokeMonth(p.uid, p.month);
    }
    note(`Slip sent back to ${p.name}`);
    toast(`Sent back to ${p.name}`, 'bad');
  }
  renderAll();
}

/* Unlock one unit for one student. Kept separate from toggleSeason so that
   approving a slip twice cannot accidentally re-lock what it just opened. */
async function openSeasonFor(uid, n) {
  const st = DB.students.find(s => s.id === uid);
  if (!st) return;
  const list = (st.unlocked || []).map(Number);
  if (list.includes(n)) return;
  if (!DEMO) {
    await FB.updateDoc(FB.doc(FB.db, 'students', uid), { unlocked: FB.arrayUnion(n) });
  }
  st.unlocked = [...list, n];
}

async function closeSeasonFor(uid, n) {
  const st = DB.students.find(s => s.id === uid);
  if (!st) return;
  const list = (st.unlocked || []).map(Number);
  if (!list.includes(n)) return;
  if (!DEMO) {
    await FB.updateDoc(FB.doc(FB.db, 'students', uid), { unlocked: FB.arrayRemove(n) });
  }
  st.unlocked = list.filter(x => x !== n);
}

async function reviewFree(reqId, decision) {
  const r = DB.freeReqs.find(x => x.id === reqId);
  if (!r) return;
  const patch = { status: decision, reviewedAt: new Date() };
  if (!DEMO) {
    await FB.updateDoc(FB.doc(FB.db, 'freeRequests', reqId), {
      ...patch, reviewedAt: FB.serverTimestamp()
    });
  }
  Object.assign(r, patch);

  if (decision === 'approved') {
    await grantMonth(r.uid, r.month, 'free');
    note(`Free class given to ${r.name}`);
    toast(`Free class opened for ${r.name}`);
  } else {
    toast('Request declined', 'bad');
  }
  renderAll();
}

async function toggleSeason(uid, n) {
  const st = DB.students.find(s => s.id === uid);
  if (!st) return;
  const list = (st.unlocked || []).map(Number);
  const has = list.includes(n);
  if (!DEMO) {
    await FB.updateDoc(FB.doc(FB.db, 'students', uid), {
      unlocked: has ? FB.arrayRemove(n) : FB.arrayUnion(n)
    });
  }
  st.unlocked = has ? list.filter(x => x !== n) : [...list, n];
  toast(has ? `Season ${pad(n)} locked` : `Season ${pad(n)} opened`);
}

async function saveSeasonVideos(n, episodes) {
  if (!DEMO) {
    await FB.setDoc(FB.doc(FB.db, 'seasons', `${BATCH}-${n}`), {
      season: n, batch: BATCH, episodes, updated: FB.serverTimestamp()
    });
  }
  DB.seasons[n] = episodes;
  toast(`${Object.keys(episodes).length} videos saved to season ${pad(n)}`);
  renderRecorded();
}

async function saveLive(data) {
  if (!DEMO) {
    // Two documents on purpose. `live` holds the join link and is readable
    // only by students who paid for that month. `public` holds the bank
    // details and schedule, which every student needs to see BEFORE paying.
    await FB.setDoc(FB.doc(FB.db, 'settings', 'live'),
      { url: data.url, month: data.month, open: data.open, updated: FB.serverTimestamp() },
      { merge: true });
    await FB.setDoc(FB.doc(FB.db, 'settings', 'public'),
      { bank: data.bank, fee: data.fee, day: data.day, time: data.time,
        updated: FB.serverTimestamp() },
      { merge: true });
  }
  DB.live = { ...DB.live, ...data };
  toast('Live class saved');
  renderAll();
}

function note(text) {
  DB.activity.unshift({ text, at: new Date() });
  DB.activity = DB.activity.slice(0, 12);
}


/* ====================================================== answer papers ===
   Papers live in the students' own Drives; this is only the index. Every row
   opens the file in a new tab, so nothing has to be downloaded or filed.
   ====================================================================== */

let PAPERS = [], SLOTS = [], BOOKINGS = [];

const TERMS = [
  { n: 1, units: [1, 2],      name: 'Term test 1' },
  { n: 2, units: [3, 4],      name: 'Term test 2' },
  { n: 3, units: [5, 6],      name: 'Term test 3' },
  { n: 4, units: [7, 8],      name: 'Term test 4' },
  { n: 5, units: [9, 10, 11], name: 'Term test 5' },
  { n: 6, units: [12, 13],    name: 'Term test 6' }
];
const KINDS = { mcq: 'MCQ paper', essay: 'Structured and essay' };

const pendingPapers = () => PAPERS.filter(p => p.status === 'submitted');

function paperTitle(p) {
  return p.kind === 'term'
    ? (TERMS.find(t => t.n === p.n) || {}).name || `Term test ${p.n}`
    : `Unit ${pad(p.n)} paper`;
}

async function reviewPaper(id, decision, feedback, marks) {
  const p = PAPERS.find(x => x.id === id);
  if (!p) return;
  const patch = {
    status: decision, feedback: feedback || '', marks: marks || null,
    reviewedAt: new Date()
  };
  if (!DEMO) {
    await FB.updateDoc(FB.doc(FB.db, 'papers', id), {
      ...patch, reviewedAt: FB.serverTimestamp(), reviewedBy: FB.auth.currentUser.uid
    });
  }
  Object.assign(p, patch);
  note(decision === 'accepted'
    ? `Marked ${p.name}'s ${paperTitle(p).toLowerCase()}`
    : `Sent back ${p.name}'s ${paperTitle(p).toLowerCase()}`);
  toast(decision === 'accepted' ? 'Marked' : 'Sent back to the student',
        decision === 'accepted' ? 'ok' : 'bad');
  renderPapers();
  renderCounts();
}

function renderPapers() {
  const want = $('#paperSeen')?.value ?? 'submitted';
  const kind = $('#paperKind')?.value || '';
  const list = PAPERS.filter(p =>
    (!want || p.status === want) && (!kind || p.kind === kind));

  const box = $('#paperList');
  if (!list.length) {
    box.innerHTML = `<div class="empty">
      <b>${want === 'submitted' ? 'Nothing to mark' : 'Nothing here'}</b>
      <p>${want === 'submitted'
        ? 'Every paper has been marked or sent back.'
        : 'Change the filters above to see more.'}</p></div>`;
    return;
  }

  box.innerHTML = `<table class="table">
    <thead><tr><th>Student no</th><th>Name</th><th>Paper</th><th>Sent</th><th></th></tr></thead>
    <tbody>${list.map(p => `
      <tr>
        <td data-label="Student no">${snChip(p.studentNo)}</td>
        <td data-label="Name"><div class="who"><b>${esc(p.name)}</b>
          <small>${esc((studentOf(p.uid) || {}).school || '')}</small></div></td>
        <td data-label="Paper">
          ${esc(paperTitle(p))}
          ${p.driveKind === 'folder'
            ? '<br><small style="color:var(--warn)">a folder, not one file</small>' : ''}
        </td>
        <td data-label="Sent" class="num" style="color:var(--text-3)">${ago(p.at)}</td>
        <td class="actions">
          <a class="btn btn--sm" href="${esc(p.driveUrl)}" target="_blank" rel="noopener">Open</a>
          ${p.status === 'submitted'
            ? `<button class="btn btn--sm btn--ok" data-mark="${p.id}">Mark</button>`
            : p.status === 'accepted'
              ? `<span class="pill pill--ok">${esc(p.marks || 'Marked')}</span>`
              : '<span class="pill pill--bad">Sent back</span>'}
        </td>
      </tr>`).join('')}</tbody></table>`;
}

function markSheet(id) {
  const p = PAPERS.find(x => x.id === id);
  if (!p) return;
  openModal(`${paperTitle(p)} — ${p.name}`, `
    <p class="hint" style="margin:0 0 16px">
      Open the paper in the other tab, then put the marks in here. Sending it
      back locks the next unit again until they redo it.</p>
    <div class="form">
      <label><span>Marks</span>
        <input id="mkMarks" placeholder="72/100" value="${esc(p.marks || '')}"></label>
      <label><span>What to tell them</span>
        <textarea id="mkNote" placeholder="Good work. Look again at question 4.">${esc(p.feedback || '')}</textarea></label>
    </div>
  `, `
    <button class="btn btn--bad" data-redo="${p.id}">Send back to redo</button>
    <button class="btn btn--ok" data-accept="${p.id}">Save marks</button>
    <button class="btn" data-close>Cancel</button>`);
}

/* ------------------------------------------------------------ sittings */

function slotSheet() {
  const upcoming = SLOTS
    .slice()
    .sort((a, b) => new Date(a.at) - new Date(b.at));

  openModal('Term test sittings', `
    <p class="hint" style="margin:0 0 16px">
      Students can only pick a sitting that is more than a week away, because
      the paper goes to them by post. Put them up early.</p>

    <div class="form" style="background:#FBFAF7;border:1px solid var(--line-2);
         border-radius:8px;padding:14px;margin-bottom:18px">
      <div class="form__row">
        <label><span>Term test</span>
          <select id="slTerm">${TERMS.map(t =>
            `<option value="${t.n}">${t.name} — units ${t.units.map(u => pad(u)).join(', ')}</option>`).join('')}</select></label>
        <label><span>Paper</span>
          <select id="slKind">
            <option value="mcq">MCQ — 2 hours</option>
            <option value="essay">Structured and essay — 3 hours</option>
          </select></label>
      </div>
      <div class="form__row">
        <label><span>Date and time</span><input id="slAt" type="datetime-local"></label>
        <label><span>How many students</span><input id="slCap" type="number" value="30" min="1"></label>
      </div>
      <button class="btn btn--primary" data-add-slot="1" style="justify-self:start">Add this sitting</button>
    </div>

    ${upcoming.length ? `<table class="table" style="border:1px solid var(--line-2);border-radius:6px">
      <thead><tr><th>When</th><th>Test</th><th>Paper</th><th>Booked</th><th></th></tr></thead>
      <tbody>${upcoming.map(s => {
        const d = new Date(s.at);
        const past = d < new Date();
        return `<tr style="${past ? 'opacity:.5' : ''}">
          <td class="num">${d.toLocaleDateString('en', { day:'numeric', month:'short' })},
            ${d.toLocaleTimeString('en', { hour:'numeric', minute:'2-digit' })}</td>
          <td>T${s.term}</td>
          <td>${esc(KINDS[s.kind] || s.kind)}</td>
          <td class="num">${s.taken || 0} of ${s.capacity || 0}</td>
          <td class="right"><button class="btn btn--sm btn--bad" data-del-slot="${s.id}">Remove</button></td>
        </tr>`;
      }).join('')}</tbody></table>`
      : '<p style="color:var(--text-3);font-size:13px">No sittings yet.</p>'}
  `, '<button class="btn" data-close>Done</button>', true);
}

async function addSlot() {
  const at = $('#slAt').value;
  if (!at) return toast('Pick a date and time', 'bad');
  const rec = {
    term: Number($('#slTerm').value), kind: $('#slKind').value,
    at: new Date(at).toISOString(), capacity: Number($('#slCap').value || 30), taken: 0
  };
  if (!DEMO) {
    const ref = await FB.addDoc(FB.collection(FB.db, 'slots'), rec);
    rec.id = ref.id;
  } else rec.id = 's' + Date.now();
  SLOTS.push(rec);
  toast('Sitting added');
  slotSheet();
}

async function delSlot(id) {
  if (!DEMO) await FB.deleteDoc(FB.doc(FB.db, 'slots', id));
  SLOTS = SLOTS.filter(s => s.id !== id);
  toast('Sitting removed', 'bad');
  slotSheet();
}

/* ============================================================== rendering
   ====================================================================== */

const pendingRegs  = () => DB.students.filter(s => s.status === 'pending');
const pendingPays  = () => DB.payments.filter(p => p.status === 'pending');
const pendingFrees = () => DB.freeReqs.filter(f => f.status === 'pending');
const hasAccess    = (uid, m) => DB.access.includes(`${uid}_${m}`);
const studentOf    = (uid) => DB.students.find(s => s.id === uid);

const snChip = (sn, cls = '') =>
  sn ? `<span class="sn ${cls}">${esc(sn)}</span>`
     : `<span class="sn sn--muted">not issued</span>`;

const statusPill = (s) => ({
  active:    '<span class="pill pill--ok">Active</span>',
  pending:   '<span class="pill pill--warn">Waiting</span>',
  suspended: '<span class="pill pill--bad">Suspended</span>'
}[s] || `<span class="pill pill--neutral">${esc(s || '—')}</span>`);

function emptyState(title, body) {
  return `<div class="empty">
    <svg class="empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M20 6 9 17l-5-5"/></svg>
    <b>${esc(title)}</b><p>${esc(body)}</p></div>`;
}

function renderAll() {
  renderCounts();
  renderToday();
  renderRegs();
  renderStudents();
  renderPayments();
  renderFree();
  renderLive();
  renderRecorded();
  renderPapers();
}

/* ------------------------------------------------------------- counters */

function renderCounts() {
  const r = pendingRegs().length, p = pendingPays().length, f = pendingFrees().length;
  const put = (sel, n) => {
    const el = $(sel); if (!el) return;
    const was = el.textContent;
    el.textContent = n;
    el.dataset.zero = n ? '0' : '1';
    if (was !== String(n) && n) {
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 240);
    }
  };
  put('#cReg', r); put('#cPay', p); put('#cFree', f);
  put('#cPaper', pendingPapers().length);

  const q = (sel, n, card) => {
    const el = $(sel); if (el) el.textContent = n;
    const c = $(card); if (c) c.dataset.state = n ? 'due' : 'clear';
  };
  q('#qReg', r, '[data-view="registrations"].qcard');
  q('#qPay', p, '[data-view="payments"].qcard');
  q('#qFree', f, '[data-view="free"].qcard');
}

/* ---------------------------------------------------------------- today */

function renderToday() {
  const m = DB.live.month || thisMonth();
  $('#monthLabel').textContent = monthName(m);

  const active = DB.students.filter(s => s.status === 'active');
  const paid = active.filter(s => hasAccess(s.id, m));
  const owing = active.filter(s => s.track === 'live' && !hasAccess(s.id, m));

  $('#monthPill').outerHTML =
    `<span class="pill ${DB.live.open ? 'pill--ok' : 'pill--neutral'}" id="monthPill">
       ${DB.live.open ? 'Room open' : 'Room closed'}</span>`;

  $('#monthBody').innerHTML = `
    <dl class="kv" style="grid-template-columns:150px 1fr">
      <dt>Active students</dt><dd>${active.length}</dd>
      <dt>Paid this month</dt><dd>${paid.length}</dd>
      <dt>Live, not paid</dt>
      <dd>${owing.length ? `<span style="color:var(--warn);font-weight:600">${owing.length}</span>` : '0'}</dd>
      <dt>Zoom link</dt>
      <dd>${DB.live.url ? esc(DB.live.url.slice(0, 44)) + '…' : '<span style="color:var(--text-3)">not set yet</span>'}</dd>
    </dl>`;

  $('#activity').innerHTML = DB.activity.length
    ? `<table class="table"><tbody>${DB.activity.map(a => `
        <tr><td>${esc(a.text)}</td>
        <td class="right num" style="color:var(--text-3);font-size:12px">${ago(a.at)}</td></tr>`).join('')}
      </tbody></table>`
    : emptyState('Nothing yet', 'Approvals, slips and free passes will show up here as you work.');
}

/* -------------------------------------------------------- registrations */

function renderRegs() {
  const list = pendingRegs();
  const box = $('#regList');
  if (!list.length) {
    box.innerHTML = emptyState('All caught up', 'Every registration has been dealt with.');
    return;
  }
  box.innerHTML = `<table class="table">
    <thead><tr><th>Student</th><th>School</th><th>WhatsApp</th><th>Asked</th><th></th></tr></thead>
    <tbody>${list.map(s => `
      <tr>
        <td data-label="Student"><div class="who"><b>${esc(s.name)}</b><small>${esc(s.email || '')}</small></div></td>
        <td data-label="School">${esc(s.school || '—')}</td>
        <td data-label="WhatsApp"><a href="https://wa.me/${esc(String(s.whatsapp || '').replace(/\D/g, ''))}">${esc(s.whatsapp || '—')}</a></td>
        <td data-label="Asked" class="num" style="color:var(--text-3)">${ago(s.at)}</td>
        <td class="actions">
          <button class="btn btn--sm btn--ok" data-approve="${s.id}">Approve</button>
          <button class="btn btn--sm btn--bad" data-reject="${s.id}">Reject</button>
        </td>
      </tr>`).join('')}</tbody></table>`;
}

/* ------------------------------------------------------------- students */

function renderStudents() {
  const term = ($('#stuSearch')?.value || '').toLowerCase().trim();
  const st = $('#stuStatus')?.value || '';
  const tr = $('#stuTrack')?.value || '';

  const list = DB.students.filter(s => {
    if (st && s.status !== st) return false;
    if (tr && s.track !== tr) return false;
    if (!term) return true;
    return [s.name, s.studentNo, s.whatsapp, s.school, s.email]
      .some(v => String(v || '').toLowerCase().includes(term));
  });

  const box = $('#stuList');
  if (!list.length) {
    box.innerHTML = emptyState('No match', 'Try a different name, student number or school.');
    return;
  }

  const m = DB.live.month || thisMonth();
  box.innerHTML = `<table class="table">
    <thead><tr><th>Student no</th><th>Name</th><th>Batch</th><th>This month</th>
    <th>Seasons</th><th>Account</th><th></th></tr></thead>
    <tbody>${list.map(s => `
      <tr>
        <td data-label="Student no">${snChip(s.studentNo)}</td>
        <td data-label="Name"><div class="who"><b>${esc(s.name)}</b><small>${esc(s.school || s.email || '')}</small></div></td>
        <td data-label="Batch" class="num">${esc(s.batch || BATCH)}</td>
        <td data-label="This month">${hasAccess(s.id, m)
          ? '<span class="pill pill--ok">Live open</span>'
          : '<span class="pill pill--neutral">Not paid</span>'}</td>
        <td data-label="Seasons" class="num">${(s.unlocked || []).length} of 13</td>
        <td data-label="Account">${statusPill(s.status)}</td>
        <td class="actions"><button class="btn btn--sm" data-open="${s.id}">Open</button></td>
      </tr>`).join('')}</tbody></table>`;
}

/* ------------------------------------------------------------- payments */

function renderPayments() {
  const want = $('#paySeen')?.value ?? 'pending';
  const mo   = $('#payMonth')?.value || '';
  const kind = $('#payKind')?.value || '';
  const list = DB.payments.filter(p => {
    if (want && p.status !== want) return false;
    if (kind === 'season' && !isSeasonPay(p)) return false;
    if (kind === 'live' && isSeasonPay(p)) return false;
    // A recordings payment is not tied to a month, so the month filter must
    // not silently hide it.
    if (mo && !isSeasonPay(p) && p.month !== mo) return false;
    return true;
  });

  const box = $('#payList');
  if (!list.length) {
    box.innerHTML = emptyState(
      want === 'pending' ? 'No slips waiting' : 'Nothing here',
      want === 'pending' ? 'Every slip has been checked.' : 'Change the filters above to see more.');
    return;
  }

  box.innerHTML = list.map(p => {
    const st = studentOf(p.uid) || {};
    const season = isSeasonPay(p);
    const expected = season ? FEE_SEASON : FEE_LIVE;
    const mismatch = p.amount && p.amount !== expected;
    const already = season
      ? (st.unlocked || []).map(Number).includes(Number(p.season))
      : hasAccess(p.uid, p.month);

    return `<div class="slip" data-slip="${p.id}">
      <div class="slip__img" data-slipbox="${p.id}">
        ${p.hasSlip === false
          ? `<div class="empty"><b style="color:#fff">Entered by hand</b>
             <p style="color:var(--on-ink-2)">No picture — this one came in over WhatsApp.</p></div>`
          : `<div class="skeleton" style="width:70%;height:180px;opacity:.25"></div>`}
      </div>

      <div class="slip__side">
        <div class="slip__top">
          <div style="flex:1">
            <h3>${esc(p.name || st.name || 'Unknown student')}</h3>
            ${snChip(p.studentNo || st.studentNo)}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            ${p.status === 'pending'
              ? '<span class="pill pill--warn">Not checked</span>'
              : p.status === 'verified'
                ? '<span class="pill pill--ok">Approved</span>'
                : '<span class="pill pill--bad">Sent back</span>'}
            <span class="pill ${season ? 'pill--accent' : 'pill--neutral'}">
              ${season ? 'Recordings' : 'Live class'}</span>
          </div>
        </div>

        <dl class="kv">
          <dt>For</dt><dd>${esc(payFor(p))}</dd>
          <dt>Amount</dt><dd class="amount">Rs. ${Number(p.amount || 0).toLocaleString()}</dd>
          <dt>Sent</dt><dd>${ago(p.at)}</dd>
          <dt>WhatsApp</dt>
          <dd><a href="https://wa.me/${esc(String(st.whatsapp || '').replace(/\D/g, ''))}">${esc(st.whatsapp || '—')}</a></dd>
        </dl>

        ${mismatch ? `<div class="flag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
          <span>The fee is Rs. ${expected.toLocaleString()} but this slip says
          Rs. ${Number(p.amount).toLocaleString()}. Check before you approve.</span></div>` : ''}

        ${already && p.status === 'pending' ? `<div class="flag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
          <span>${esc(p.name)} already has ${esc(payFor(p))} open. This may be a second slip.</span></div>` : ''}

        ${p.status === 'pending' ? `
          <textarea class="slip__note" data-note="${p.id}"
            placeholder="Note back to the student — only needed if you send it back"></textarea>
          <div class="slip__act">
            <button class="btn btn--ok" data-verify="${p.id}">Approve and open ${season ? `unit ${pad(Number(p.season), 2)}` : monthName(p.month).split(' ')[0]}</button>
            <button class="btn btn--bad" data-reject-pay="${p.id}">Send back</button>
          </div>`
        : `<div class="slip__act">
            <span style="font-size:12.5px;color:var(--text-2);align-self:center;flex:1">
              ${esc(p.note || 'Checked ' + ago(p.reviewedAt))}</span>
            ${p.hasSlip === false ? '' :
              `<button class="btn btn--sm" data-drop-slip="${p.id}" style="flex:0 0 auto"
                 title="Frees up space. The payment record stays.">Delete picture</button>`}
            <button class="btn btn--sm" data-reopen="${p.id}" style="flex:0 0 auto">Change decision</button>
          </div>`}
      </div>
    </div>`;
  }).join('');

  hydrateSlips();
}

/* Fetch the pictures for the cards now on screen, one at a time, newest
   first. Anything scrolled far down waits until it is actually visible. */
function hydrateSlips() {
  const boxes = $$('[data-slipbox]');
  const fill = async (box) => {
    const id = box.dataset.slipbox;
    if (box.dataset.done) return;
    box.dataset.done = '1';
    const p = DB.payments.find(x => x.id === id);
    if (p && p.hasSlip === false) return;

    const src = await loadSlip(id);
    if (!src) {
      box.innerHTML = `<div class="empty"><b style="color:#fff">No picture</b>
        <p style="color:var(--on-ink-2)">Nothing was uploaded with this one.</p></div>`;
      return;
    }
    box.innerHTML = `<img src="${src}" alt="Payment slip" data-zoom="${id}">
      <button class="slip__zoom" data-zoom="${id}">View full size</button>`;
  };

  if (!('IntersectionObserver' in window)) { boxes.forEach(fill); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '300px' });
  boxes.forEach(b => io.observe(b));
}

async function addManualPayment(uid, month, amount, noteText, season) {
  const st = studentOf(uid);
  if (!st) return;
  const forSeason = season != null;
  const rec = {
    uid, studentNo: st.studentNo || null, name: st.name,
    purpose: forSeason ? 'season' : 'live',
    season: forSeason ? Number(season) : null,
    month, amount, status: 'verified', hasSlip: false,
    note: noteText || 'Entered by hand', at: new Date(), reviewedAt: new Date()
  };
  if (!DEMO) {
    const ref = await FB.addDoc(FB.collection(FB.db, 'payments'), {
      ...rec, at: FB.serverTimestamp(), reviewedAt: FB.serverTimestamp(),
      reviewedBy: FB.auth.currentUser.uid
    });
    rec.id = ref.id;
  } else {
    rec.id = 'm' + Date.now();
  }
  DB.payments.unshift(rec);

  if (forSeason) {
    await openSeasonFor(uid, Number(season));
    note(`${st.name} marked paid for unit ${pad(Number(season))}`);
    toast(`Unit ${pad(Number(season))} opened for ${st.name}`);
  } else {
    await grantMonth(uid, month, 'payment');
    note(`${st.name} marked paid for ${monthName(month)}`);
    toast(`Live class opened for ${st.name}`);
  }
  renderAll();
}

function manualPayModal() {
  const active = DB.students
    .filter(s => s.status === 'active')
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  openModal('Record a payment by hand', `
    <p class="hint" style="margin:0 0 18px">
      For slips that came over WhatsApp or cash paid in person. This opens the
      month straight away, with no picture attached.
    </p>
    <div class="form">
      <label><span>Student</span>
        <select id="mpStudent">
          <option value="">Choose…</option>
          ${active.map(s => `<option value="${s.id}">${esc(s.name)} — ${esc(s.studentNo || 'no number')}</option>`).join('')}
        </select>
      </label>
      <label><span>What for</span>
        <select id="mpKind">
          <option value="live">Live class — one month</option>
          <option value="season">Recordings — one unit</option>
        </select>
      </label>
      <div class="form__row">
        <label id="mpMonthWrap"><span>Month</span>
          <input id="mpMonth" type="month" value="${DB.live.month || thisMonth()}"></label>
        <label id="mpSeasonWrap" style="display:none"><span>Unit</span>
          <select id="mpSeason">
            ${SEASONS.map(x => `<option value="${x.n}">Unit ${pad(x.n)} — ${esc(x.title)}</option>`).join('')}
          </select></label>
        <label><span>Amount</span><input id="mpAmount" type="number" value="${FEE_LIVE}"></label>
      </div>
      <label><span>Note to yourself</span>
        <input id="mpNote" placeholder="Cash, paid at class">
      </label>
    </div>
  `, `<button class="btn" data-close>Cancel</button>
      <button class="btn btn--primary" data-save-manual="1">Record and open it</button>`);

  $('#mpKind').addEventListener('change', (e) => {
    const forSeason = e.target.value === 'season';
    $('#mpMonthWrap').style.display  = forSeason ? 'none' : '';
    $('#mpSeasonWrap').style.display = forSeason ? '' : 'none';
    $('#mpAmount').value = forSeason ? FEE_SEASON : FEE_LIVE;
  });
}

/* ------------------------------------------------------ free class asks */

function renderFree() {
  const list = DB.freeReqs;
  const box = $('#freeList');
  if (!list.length) {
    box.innerHTML = emptyState('No requests', 'Free class requests come in with a student number.');
    return;
  }
  box.innerHTML = `<table class="table">
    <thead><tr><th>Student no</th><th>Name</th><th>Month</th><th>Reason</th><th>Asked</th><th></th></tr></thead>
    <tbody>${list.map(r => {
      const st = studentOf(r.uid) || {};
      const known = !!st.id;
      return `<tr>
        <td data-label="Student no">${snChip(r.studentNo, known ? '' : 'sn--muted')}</td>
        <td data-label="Name"><div class="who"><b>${esc(r.name || st.name || '—')}</b>
          <small>${known ? esc(st.school || '') : 'no account with this number'}</small></div></td>
        <td data-label="Month">${monthName(r.month)}</td>
        <td data-label="Reason" style="max-width:280px;color:var(--text-2)">${esc(r.reason || '—')}</td>
        <td data-label="Asked" class="num" style="color:var(--text-3)">${ago(r.at)}</td>
        <td class="actions">${r.status === 'pending'
          ? `<button class="btn btn--sm btn--ok" data-free-ok="${r.id}" ${known ? '' : 'disabled'}>Give free class</button>
             <button class="btn btn--sm btn--bad" data-free-no="${r.id}">Decline</button>`
          : r.status === 'approved'
            ? '<span class="pill pill--ok">Given</span>'
            : '<span class="pill pill--bad">Declined</span>'}</td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

/* ----------------------------------------------------------------- live */

function renderLive() {
  const L = DB.live;
  const set = (sel, v) => { const el = $(sel); if (el && el !== document.activeElement) el.value = v ?? ''; };
  set('#liveUrl', L.url);
  set('#liveMonth', L.month || thisMonth());
  set('#liveDay', L.day);
  set('#liveTime', L.time);
  set('#liveFee', L.fee);
  set('#liveBank', L.bank);
  const open = $('#liveOpen');
  if (open) { open.checked = !!L.open; $('#liveOpenLbl').textContent = L.open ? 'Room open' : 'Room closed'; }

  const m = L.month || thisMonth();
  const who = DB.students.filter(s => s.status === 'active' && hasAccess(s.id, m));
  $('#liveWhoSub').textContent = `${who.length} student${who.length === 1 ? '' : 's'} for ${monthName(m)}`;

  $('#liveWho').innerHTML = who.length
    ? `<table class="table"><thead><tr><th>Student no</th><th>Name</th><th>How</th><th></th></tr></thead>
       <tbody>${who.map(s => {
         const src = DB.payments.find(p => p.uid === s.id && p.month === m && p.status === 'verified')
           ? 'Paid' : 'Free class';
         return `<tr>
           <td data-label="Student no">${snChip(s.studentNo)}</td>
           <td data-label="Name"><b>${esc(s.name)}</b></td>
           <td data-label="How"><span class="pill ${src === 'Paid' ? 'pill--ok' : 'pill--accent'}">${src}</span></td>
           <td class="actions"><button class="btn btn--sm btn--bad" data-revoke="${s.id}">Close</button></td>
         </tr>`;
       }).join('')}</tbody></table>`
    : emptyState('Nobody yet', 'Approve a payment slip and the student appears here.');
}

/* ------------------------------------------------------------- recorded */

function renderRecorded() {
  const term = ($('#recSearch')?.value || '').toLowerCase().trim();
  const filt = $('#recFilter')?.value || '';

  const list = SEASONS.filter(s => {
    const eps = DB.seasons[s.n] || {};
    const count = Object.keys(eps).length;
    if (filt === 'ready' && !count) return false;
    if (filt === 'empty' && count) return false;
    if (!term) return true;
    return s.title.toLowerCase().includes(term) ||
           s.episodes.some(e => e.title.toLowerCase().includes(term));
  });

  const box = $('#recLib');
  if (!list.length) {
    box.innerHTML = emptyState('No seasons match', 'Clear the search to see all thirteen.');
    return;
  }

  box.innerHTML = list.map(s => {
    const eps = DB.seasons[s.n] || {};
    const done = Object.values(eps).filter(x => epParts(x).v).length;
    const total = s.episodes.length;
    const ready = done === total;
    const openTo = DB.students.filter(st => (st.unlocked || []).map(Number).includes(s.n)).length;
    const mins = s.episodes.reduce((a, e) => a + e.mins, 0);

    return `<article class="rec">
      <div class="rec__thumb" style="background:linear-gradient(145deg,#212540,#333A5C)">
        <div class="rec__lock" style="background:${ready ? 'rgba(22,121,74,.9)' : 'rgba(166,91,0,.9)'}">
          ${ready
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>Complete'
            : `${done}/${total} added`}
        </div>
        <div class="rec__dur">${Math.round(mins / 60)}h ${mins % 60}m</div>
        <div style="position:absolute;inset:0;display:grid;place-items:center;
                    font-family:var(--f-display);font-size:44px;font-weight:600;color:rgba(255,255,255,.16)">
          ${pad(s.n)}
        </div>
      </div>

      <div class="rec__body">
        <div class="rec__eyebrow">Season ${pad(s.n)} · ${total} episodes</div>
        <h3>${esc(s.title)}</h3>
        <div class="rec__meta">
          <span class="pill ${openTo ? 'pill--accent' : 'pill--neutral'}">${openTo} student${openTo === 1 ? '' : 's'}</span>
          ${ready ? '' : '<span class="pill pill--warn">Videos missing</span>'}
        </div>
      </div>

      <div class="rec__foot">
        <button class="btn btn--sm" data-season-edit="${s.n}">Videos</button>
        <button class="btn btn--sm" data-season-open="${s.n}">Who can watch</button>
      </div>
    </article>`;
  }).join('');
}

/* ============================================================== modals */

function openModal(title, body, foot, wide) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = body;
  $('#modalFoot').innerHTML = foot || '<button class="btn" data-close>Close</button>';
  $('#modalBox').classList.toggle('modal__box--wide', !!wide);
  $('#modal').hidden = false;
}
const closeModal = () => { $('#modal').hidden = true; };

function studentModal(id) {
  const s = DB.students.find(x => x.id === id);
  if (!s) return;
  const m = DB.live.month || thisMonth();
  const un = (s.unlocked || []).map(Number);
  const pays = DB.payments.filter(p => p.uid === id);

  openModal(s.name, `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      ${snChip(s.studentNo, 'sn--lg')} ${statusPill(s.status)}
      ${hasAccess(s.id, m) ? '<span class="pill pill--ok">Live open</span>' : ''}
    </div>

    <dl class="kv" style="margin-bottom:22px">
      <dt>Email</dt><dd>${esc(s.email || '—')}</dd>
      <dt>WhatsApp</dt><dd><a href="https://wa.me/${esc(String(s.whatsapp || '').replace(/\D/g, ''))}">${esc(s.whatsapp || '—')}</a></dd>
      <dt>School</dt><dd>${esc(s.school || '—')}</dd>
      <dt>Address</dt><dd>${esc(s.address || '—')}</dd>
      <dt>Batch</dt><dd>${esc(s.batch || BATCH)}</dd>
      <dt>Track</dt><dd>${s.track === 'live' ? 'Live class' : s.track === 'rec' ? 'Recorded' : 'Not chosen'}</dd>
      <dt>Joined</dt><dd>${ago(s.at)}</dd>
      <dt>Watched</dt><dd>${(s.watched || []).length} episodes</dd>
    </dl>

    <div class="rec__eyebrow" style="margin-bottom:9px">Seasons this student can watch</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:22px">
      ${SEASONS.map(x => `<button class="btn btn--sm" data-toggle-season="${s.id}" data-n="${x.n}"
        style="${un.includes(x.n)
          ? 'background:var(--accent);border-color:var(--accent);color:#fff'
          : ''}" title="${esc(x.title)}">${pad(x.n)}</button>`).join('')}
    </div>

    <div class="rec__eyebrow" style="margin-bottom:9px">Payment history</div>
    ${pays.length ? `<table class="table" style="border:1px solid var(--line-2);border-radius:6px">
      <tbody>${pays.map(p => `<tr>
        <td>${monthName(p.month)}</td>
        <td class="num">Rs. ${Number(p.amount || 0).toLocaleString()}</td>
        <td class="right">${p.status === 'verified'
          ? '<span class="pill pill--ok">Approved</span>'
          : p.status === 'pending'
            ? '<span class="pill pill--warn">Waiting</span>'
            : '<span class="pill pill--bad">Sent back</span>'}</td>
      </tr>`).join('')}</tbody></table>`
      : '<p style="color:var(--text-3);font-size:13px;margin:0">No slips sent yet.</p>'}
  `, `
    ${s.status === 'pending' ? `<button class="btn btn--ok" data-approve="${s.id}">Approve</button>` : ''}
    ${s.status === 'active' ? `<button class="btn btn--bad" data-suspend="${s.id}">Suspend</button>` : ''}
    ${s.status === 'suspended' ? `<button class="btn btn--ok" data-unsuspend="${s.id}">Make active</button>` : ''}
    ${hasAccess(s.id, m)
      ? `<button class="btn" data-revoke="${s.id}">Close live class</button>`
      : `<button class="btn btn--primary" data-give="${s.id}">Open live class free</button>`}
    <button class="btn" data-close>Close</button>
  `);
}

/* A season's episodes may be stored either as a plain id string (the old
   format) or as { v: id, m: minutes }. Read both, always write the new one. */
function epParts(raw) {
  if (typeof raw === 'string') return { v: raw, m: '' };
  if (raw && typeof raw === 'object') return { v: raw.v || '', m: raw.m || '' };
  return { v: '', m: '' };
}

function seasonEditor(n) {
  const s = SEASONS.find(x => x.n === n);
  const have = DB.seasons[n] || {};
  openModal(`Season ${pad(n)} — ${s.title}`, `
    <p class="hint" style="margin:0 0 16px">
      Paste the YouTube id only, not the whole address. In
      <code style="font-family:var(--f-mono)">youtu.be/dQw4w9WgXcQ</code> the id is
      <code style="font-family:var(--f-mono)">dQw4w9WgXcQ</code>.
      The length is what students see in the list — leave it blank and the
      suggested length is used.
    </p>
    <table class="table" style="border:1px solid var(--line-2);border-radius:6px">
      <thead><tr>
        <th style="width:42px">Ep</th><th>Title</th>
        <th style="width:158px">YouTube id</th>
        <th style="width:78px">Minutes</th>
      </tr></thead>
      <tbody>${s.episodes.map(e => {
        const { v, m } = epParts(have[String(e.n)]);
        return `<tr>
          <td class="num" style="color:var(--accent)">${pad(e.n)}</td>
          <td style="font-size:13px">${esc(e.title)}</td>
          <td><input data-vid="${e.n}" value="${esc(v)}" placeholder="dQw4w9WgXcQ"
            style="width:100%;border:1px solid var(--line);border-radius:5px;padding:6px 8px;font-family:var(--f-mono);font-size:12px"></td>
          <td><input data-min="${e.n}" type="number" min="1" max="600"
            value="${esc(m)}" placeholder="${e.mins}"
            style="width:100%;border:1px solid var(--line);border-radius:5px;padding:6px 8px;font-family:var(--f-mono);font-size:12px"></td>
        </tr>`;
      }).join('')}</tbody>
    </table>
  `, `<button class="btn" data-close>Cancel</button>
      <button class="btn btn--primary" data-save-season="${n}">Save season ${pad(n)}</button>`, true);
}

function seasonAudience(n) {
  const s = SEASONS.find(x => x.n === n);
  const active = DB.students.filter(x => x.status === 'active');
  openModal(`Who can watch season ${pad(n)}`, `
    <p class="hint" style="margin:0 0 14px">${esc(s.title)}</p>
    <table class="table" style="border:1px solid var(--line-2);border-radius:6px">
      <tbody>${active.map(x => {
        const on = (x.unlocked || []).map(Number).includes(n);
        return `<tr>
          <td>${snChip(x.studentNo)}</td>
          <td><b>${esc(x.name)}</b></td>
          <td class="right"><label class="switch">
            <input type="checkbox" data-toggle-season="${x.id}" data-n="${n}" ${on ? 'checked' : ''}>
            <span class="switch__track"></span></label></td>
        </tr>`;
      }).join('')}</tbody>
    </table>
  `, '<button class="btn" data-close>Done</button>', true);
}

/* ============================================================= wiring */

function switchView(v) {
  $$('.view').forEach(x => x.hidden = true);
  const el = $('#v-' + v);
  if (el) el.hidden = false;
  $$('.navbtn').forEach(b => b.classList.toggle('is-active', b.dataset.view === v));
  const titles = {
    today: ['Today', ''],
    registrations: ['Registrations', 'approve to issue a student number'],
    students: ['Students', ''],
    payments: ['Payment slips', 'check the slip, then open the month'],
    free: ['Free class requests', 'asked for by student number'],
    papers: ['Answer papers', 'opens in the student\'s own Drive'],
    live: ['Live class', ''],
    recorded: ['Recorded library', '13 seasons']
  };
  $('#viewTitle').textContent = (titles[v] || ['—'])[0];
  $('#viewSub').textContent = (titles[v] || ['', ''])[1] || '';
  document.body.classList.remove('nav-open');
  window.scrollTo({ top: 0 });
}

document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-view],[data-approve],[data-reject],[data-open],[data-verify],' +
    '[data-reject-pay],[data-reopen],[data-free-ok],[data-free-no],[data-season-edit],' +
    '[data-season-open],[data-save-season],[data-zoom],[data-close],[data-suspend],' +
    '[data-unsuspend],[data-give],[data-revoke],[data-toggle-season],[data-drop-slip],' +
    '[data-manual-pay],[data-save-manual],[data-mark],[data-accept],[data-redo],' +
    '[data-add-slot],[data-del-slot]');
  if (!t) return;
  const d = t.dataset;

  if (d.view)     return switchView(d.view);
  if ('close' in d) return closeModal();

  if (d.approve)  { closeModal(); return approveStudent(d.approve); }
  if (d.reject)   { return setStudentStatus(d.reject, 'suspended'); }
  if (d.suspend)  { closeModal(); return setStudentStatus(d.suspend, 'suspended'); }
  if (d.unsuspend){ closeModal(); return setStudentStatus(d.unsuspend, 'active'); }
  if (d.open)     return studentModal(d.open);

  if (d.verify)   {
    const n = $(`[data-note="${d.verify}"]`)?.value || '';
    t.disabled = true;
    return reviewSlip(d.verify, 'verified', n);
  }
  if (d.rejectPay) {
    const n = $(`[data-note="${d.rejectPay}"]`)?.value || '';
    if (!n.trim() && !confirm('Send this slip back without a note?')) return;
    t.disabled = true;
    return reviewSlip(d.rejectPay, 'rejected', n);
  }
  if (d.reopen) {
    const p = DB.payments.find(x => x.id === d.reopen);
    if (p) { p.status = 'pending'; renderPayments(); }
    return;
  }

  if (d.mark)   return markSheet(d.mark);
  if (d.accept) { closeModal(); return reviewPaper(d.accept, 'accepted', $('#mkNote')?.value, $('#mkMarks')?.value); }
  if (d.redo)   {
    const fb = $('#mkNote')?.value.trim();
    if (!fb && !confirm('Send it back without telling them what to fix?')) return;
    closeModal(); return reviewPaper(d.redo, 'redo', fb, null);
  }
  if ('addSlot' in d) return addSlot();
  if (d.delSlot) return delSlot(d.delSlot);

  if (d.freeOk)   return reviewFree(d.freeOk, 'approved');
  if (d.freeNo)   return reviewFree(d.freeNo, 'declined');

  if (d.give)     {
    const m = DB.live.month || thisMonth();
    await grantMonth(d.give, m, 'free');
    closeModal(); toast('Live class opened'); return renderAll();
  }
  if (d.revoke)   {
    const m = DB.live.month || thisMonth();
    await revokeMonth(d.revoke, m);
    closeModal(); toast('Live class closed', 'bad'); return renderAll();
  }

  if (d.toggleSeason) {
    await toggleSeason(d.toggleSeason, Number(d.n));
    if (t.tagName === 'BUTTON') {
      const on = (studentOf(d.toggleSeason).unlocked || []).map(Number).includes(Number(d.n));
      t.style.cssText = on ? 'background:var(--accent);border-color:var(--accent);color:#fff' : '';
    }
    renderStudents(); renderRecorded();
    return;
  }

  if (d.seasonEdit) return seasonEditor(Number(d.seasonEdit));
  if (d.seasonOpen) return seasonAudience(Number(d.seasonOpen));
  if (d.saveSeason) {
    const eps = {};
    $$('[data-vid]').forEach(i => {
      const v = i.value.trim();
      if (!v) return;
      const mEl = $(`[data-min="${i.dataset.vid}"]`);
      const m = mEl ? Number(mEl.value) : 0;
      eps[i.dataset.vid] = m > 0 ? { v, m } : { v };
    });
    await saveSeasonVideos(Number(d.saveSeason), eps);
    return closeModal();
  }

  if (d.dropSlip) {
    if (!confirm('Delete the picture and keep the payment record?')) return;
    return dropSlipImage(d.dropSlip);
  }

  if (d.zoom) {
    const src = SLIPS[d.zoom];
    if (!src) return toast('That picture is not loaded', 'bad');
    return openModal('Payment slip',
      `<img class="modal__img" src="${src}" alt="Payment slip">`,
      '<button class="btn" data-close>Close</button>', true);
  }

  if ('manualPay' in d) return manualPayModal();

  if (d.saveManual) {
    const uid = $('#mpStudent').value;
    const forSeason = $('#mpKind').value === 'season';
    const month = forSeason ? thisMonth() : $('#mpMonth').value;
    const amount = Number($('#mpAmount').value || 0);
    const season = forSeason ? Number($('#mpSeason').value) : null;
    if (!uid) return toast('Pick a student', 'bad');
    if (!forSeason && !month) return toast('Pick a month', 'bad');
    t.disabled = true;
    await addManualPayment(uid, month, amount, $('#mpNote').value.trim(), season);
    return closeModal();
  }
});

$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

['#stuSearch', '#stuStatus', '#stuTrack'].forEach(s =>
  $(s)?.addEventListener('input', renderStudents));
['#paySeen', '#payMonth', '#payKind'].forEach(s =>
  $(s)?.addEventListener('input', renderPayments));
['#paperSeen', '#paperKind'].forEach(s =>
  $(s)?.addEventListener('input', renderPapers));
$('#slotBtn')?.addEventListener('click', slotSheet);
['#recSearch', '#recFilter'].forEach(s =>
  $(s)?.addEventListener('input', renderRecorded));

$('#menuBtn')?.addEventListener('click', () => document.body.classList.toggle('nav-open'));

$('#liveSave')?.addEventListener('click', () => saveLive({
  url:   $('#liveUrl').value.trim(),
  month: $('#liveMonth').value || thisMonth(),
  day:   $('#liveDay').value.trim(),
  time:  $('#liveTime').value.trim(),
  fee:   $('#liveFee').value.trim(),
  bank:  $('#liveBank').value,
  open:  $('#liveOpen').checked
}));
$('#liveOpen')?.addEventListener('change', (e) => {
  $('#liveOpenLbl').textContent = e.target.checked ? 'Room open' : 'Room closed';
});

/* ============================================================ session */

const stamp = (uid) => {
  localStorage.setItem(STAMP_AT, String(Date.now()));
  localStorage.setItem(STAMP_UID, uid);
};
const clearStamp = () => {
  localStorage.removeItem(STAMP_AT);
  localStorage.removeItem(STAMP_UID);
};
function remaining(uid) {
  const at = Number(localStorage.getItem(STAMP_AT) || 0);
  const who = localStorage.getItem(STAMP_UID);
  if (!at) return 0;
  if (uid && who && who !== uid) return 0;
  return Math.max(0, SESSION_MAX_MS - (Date.now() - at));
}
function fmtLeft(ms) {
  if (ms <= 0) return 'expired';
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return h ? `session ends in ${h}h ${m}m` : `session ends in ${m}m`;
}

function showGate(msg, kind = 'bad') {
  document.body.classList.remove('auth-pending');
  document.body.classList.add('auth-denied');
  $('#boot').style.display = 'none';
  $('#gate').hidden = false;
  const box = $('#gateMsg');
  if (msg) { box.textContent = msg; box.dataset.kind = kind; }
  else { box.removeAttribute('data-kind'); }
}

function enterApp(profile, uid) {
  document.body.classList.remove('auth-pending', 'auth-denied');
  $('#boot').style.display = 'none';
  $('#gate').hidden = true;
  $('#meName').textContent = profile.name || 'Teacher';
  $('#meMail').textContent = profile.email || '';
  $('#meAv').textContent = (profile.name || 'T').trim()[0].toUpperCase();

  const tick = () => {
    if (DEMO) { $('#meTimer').textContent = 'sample data'; return; }
    const left = remaining(uid);
    $('#meTimer').textContent = fmtLeft(left);
    if (left <= 0) doSignOut('Your session ended after 24 hours.');
  };
  tick();
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tick();
  });
  window.addEventListener('focus', tick);
  window.addEventListener('storage', (e) => {
    if (e.key === STAMP_AT && e.newValue === null) location.reload();
  });

  renderAll();
}

/* The dashboard reads everything once at sign-in. A registration or a slip
   that arrives while it is sitting open would otherwise never show up, which
   looks exactly like the student page failing to submit. This re-reads on
   demand, and whenever the tab is brought back to the front. */
let lastPull = Date.now();
let pulling = false;

async function refreshAll(quiet) {
  if (DEMO || pulling) return;
  pulling = true;
  const lbl = $('#refreshLbl');
  $('#refreshBtn')?.classList.add('spinning');
  if (lbl && !quiet) lbl.textContent = 'Checking…';
  try {
    await loadAll();
    lastPull = Date.now();
    renderAll();
    if (!quiet) {
      const waiting = pendingRegs().length + pendingPays().length + pendingFrees().length;
      toast(waiting ? `${waiting} thing${waiting === 1 ? '' : 's'} waiting for you` : 'Nothing new');
    }
  } catch (err) {
    console.error('[admin] refresh failed', err);
    if (!quiet) toast('Could not refresh: ' + (err.code || err.message), 'bad');
  }
  pulling = false;
  $('#refreshBtn')?.classList.remove('spinning');
  if (lbl) lbl.textContent = 'Refresh';
}

$('#refreshBtn')?.addEventListener('click', () => refreshAll(false));

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - lastPull > 30000) refreshAll(true);
});
setInterval(() => {
  if (document.visibilityState === 'visible') refreshAll(true);
}, 120000);

async function doSignOut(reason) {
  clearStamp();
  if (FB) { try { await FB.signOut(FB.auth); } catch (_) {} }
  sessionStorage.setItem('eict.reason', reason || '');
  location.reload();
}
$('#outBtn')?.addEventListener('click', () => doSignOut());

/* --------------------------------------------------------------- boot */

const AUTH_MSG = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/user-not-found': 'No account with that email.',
  'auth/invalid-email': 'That email address does not look right.',
  'auth/too-many-requests': 'Too many tries. Wait a minute and try again.',
  'auth/network-request-failed': 'No internet connection.'
};

(async () => {
  const vt = $('#verTag'); if (vt) vt.textContent = 'v' + VERSION;
  FB = await bootFirebase();
  DEMO = !FB;

  const carried = sessionStorage.getItem('eict.reason');
  sessionStorage.removeItem('eict.reason');

  if (DEMO) {
    seedDemo();
    $('#demobar').hidden = false;
    enterApp({ name: 'Sample teacher', email: 'sample@eict.lk' }, 'demo');
    return;
  }

  $('#gGo').addEventListener('click', async () => {
    const em = $('#gEmail').value.trim(), pw = $('#gPass').value;
    if (!em || !pw) return showGate('Fill in both boxes.');
    $('#gGo').disabled = true;
    try {
      await FB.setPersistence(FB.auth, FB.browserLocalPersistence);
      const cred = await FB.signInWithEmailAndPassword(FB.auth, em, pw);
      stamp(cred.user.uid);
    } catch (err) {
      showGate(AUTH_MSG[err.code] || err.message || 'Could not sign in.');
    }
    $('#gGo').disabled = false;
  });
  $('#gPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#gGo').click(); });

  FB.onAuthStateChanged(FB.auth, async (user) => {
    if (!user) return showGate(carried || null, carried ? 'info' : 'bad');

    // Hard 24 hour cap.
    if (remaining(user.uid) <= 0) {
      clearStamp();
      await FB.signOut(FB.auth);
      return showGate('Your session ended after 24 hours. Please sign in again.', 'info');
    }

    // Read the profile BEFORE showing anything. If this read fails we sign
    // out — we never guess a profile and let someone through, which is the
    // bug that was in Class.html.
    let snap;
    try {
      snap = await FB.getDoc(FB.doc(FB.db, 'students', user.uid));
    } catch (err) {
      console.error('[admin] profile read failed', err);
      clearStamp(); await FB.signOut(FB.auth);
      return showGate('Could not read your account. Check your Firestore rules.');
    }

    if (!snap.exists() || snap.data().role !== 'teacher') {
      clearStamp(); await FB.signOut(FB.auth);
      return showGate('This login is not a teacher account.');
    }

    const profile = snap.data();
    try {
      await loadAll();
    } catch (err) {
      console.error('[admin] load failed', err);
      return showGate('Signed in, but the class data could not be read: ' +
        (err.code || err.message) + '. Publish firestore.rules and try again.');
    }
    enterApp(profile, user.uid);
  });
})();
