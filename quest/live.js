/* ============================================================
   EICT Island Quest — the live layer.

   Connects the Island Quest page to the class database
   (Firebase project in ../firebase-config.js):

     questWeeks/{wk}                the week: title, batches, open/close
                                    time, minutes, which media it has
     questWeeks/{wk}/attempts/{uid} a student's one counted attempt;
                                    answers save as they go, the clock
                                    is the server's own start time
     questSets/{wk}                 the 20 questions, no answers
                                    (readable once you have started)
     questKeys/{wk}                 the answers and explanations
                                    (readable once you have finished)
     questProfiles/{uid}            the nickname the Hall of Fame shows

   Answers are stored as the index of the option in the bank (0–4),
   so the shuffled order on screen never reaches the database and
   Sinhala / English give the same marks. The rules in
   firestore-rules.txt freeze an attempt when it is finished or its
   time is up, so a mark cannot be changed afterwards.
   ============================================================ */
const Q = window.EICTQuest, L = Q.live, S = L.state;
const $ = id => document.getElementById(id);
const OWNER = 'ushithasamudaya@gmail.com';
const MED = {Sinhala:'si', English:'en'}, MEDN = {si:'Sinhala', en:'English'};
const V = '11.0.2', G = 'https://www.gstatic.com/firebasejs/' + V + '/firebase-';

let FB = null, db = null, auth = null, U = null, ME = null, OWN = false, SKEW = 0;
let WK = [], ATT = {}, SETS = {}, KEYS = {}, NICKS = {};
const now = () => Date.now() + SKEW;
const ms = t => t && t.toMillis ? t.toMillis() : t instanceof Date ? t.getTime() : +t || 0;
const mins = w => +w.minutes || 40;
const num = w => WK.indexOf(w) + 1;
const note = t => { $('mapNotice').textContent = t; };
const img = p => /^(https?:|data:|\/)/.test(p) ? p : '../' + p;
const attRef = wk => FB.doc(db, 'questWeeks', wk, 'attempts', U.uid);
const profRef = () => FB.doc(db, 'questProfiles', U.uid);
const firstName = n => String(n || '').trim().split(/\s+/)[0].slice(0, 24);

/* no fake rows or demo unlocking, ever */
Q.disableDemo();
Q.setLeaderboard([]);

/* ---------- small helpers ---------- */
function seed(str) {                         /* string -> 32-bit seed */
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; };
}
function shuffle(k, key) {                   /* the same order every time for one student */
  const r = seed(key), p = [...Array(k).keys()];
  for (let i = k - 1; i > 0; i--) { const j = r() % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  return p;
}
function score(ans, key) {
  if (!key || !Array.isArray(ans)) return 0;
  return ans.reduce((n, a, i) => n + (a >= 0 && (a === key.ans[i] || (key.alt && (key.alt[i] || []).includes(a))) ? 1 : 0), 0);
}
const rewards = sc => ({stars: Math.round(sc / 4), coins: sc * 5, gems: sc > 15 ? 2 : 0});
function wkState(w) {
  const a = ATT[w.id], t = now();
  const open = t >= ms(w.openAt), closed = t > ms(w.closeAt);
  const over = !!a && (a.done || t > ms(a.startedAt) + mins(w) * 60000);
  return {a, open, closed, over, running: !!a && !over};
}
function pickMed(w) {
  const has = w.media || ['si', 'en'], m = MED[S.medium] || 'si';
  return has.includes(m) ? m : has[0];
}
function why(e) {
  const c = e && (e.code || e.message) || '';
  return /permission/i.test(c) ? 'The database said no. This week may not be open for your class yet.'
       : /unavailable|network|offline/i.test(c) ? 'No connection. Check your internet and try again.'
       : 'Something went wrong (' + c + '). Please try again.';
}
const fail = e => L.openModal('⚠️', 'Could not load', why(e), [{label: 'OK'}]);

/* ---------- sign in ---------- */
function showLogin(msg) {
  $('modalIcon').textContent = '🔐';
  $('modalTitle').textContent = 'Sign in to play';
  $('modalText').textContent = msg || 'Use the same email and password as your class page.';
  const f = document.createElement('form');
  f.className = 'login-form';
  f.innerHTML = '<input class="nickname" id="lgEm" type="email" autocomplete="username" placeholder="Email" aria-label="Email" required>'
    + '<input class="nickname" id="lgPw" type="password" autocomplete="current-password" placeholder="Password" aria-label="Password" required>'
    + '<button class="btn" type="submit">⚡ Sign in</button>'
    + '<button class="btn ghost small" type="button" id="lgForgot">Forgot password?</button>'
    + '<p class="notice" id="lgErr" role="alert"></p>';
  $('modalActions').replaceChildren(f);
  $('modalBack').classList.add('open');
  $('modalBack').setAttribute('aria-hidden', 'false');
  const err = t => { $('lgErr').textContent = t; };
  f.onsubmit = async e => {
    e.preventDefault();
    if (!FB) { err('Still connecting, one moment…'); return; }
    err('Checking…');
    try { await FB.signInWithEmailAndPassword(auth, $('lgEm').value.trim(), $('lgPw').value); }
    catch (x) {
      const c = x.code || '';
      err(/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c) ? 'Wrong email or password.'
        : /too-many-requests/.test(c) ? 'Too many tries. Wait a minute and try again.'
        : /network/.test(c) ? 'No connection. Check your internet.' : c || x.message);
    }
  };
  $('lgForgot').onclick = async () => {
    const em = $('lgEm').value.trim();
    if (!em) { err('Type your email above, then press this again.'); $('lgEm').focus(); return; }
    try { await FB.sendPasswordResetEmail(auth, em); err('A reset link was sent to ' + em + '.'); }
    catch (x) { err('Could not send the link: ' + (x.code || x.message)); }
  };
  setTimeout(() => $('lgEm')?.focus(), 50);
}

/* ---------- boot ---------- */
async function boot() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.projectId) { note('Cannot reach the class database.'); return; }
  try {
    const [A, F, Au] = await Promise.all([import(G + 'app.js'), import(G + 'firestore.js'), import(G + 'auth.js')]);
    const app = A.initializeApp(cfg);
    FB = {...F, ...Au};
    db = F.getFirestore(app);
    auth = Au.getAuth(app);
    try { await Au.setPersistence(auth, Au.browserLocalPersistence); } catch (e) {}
  } catch (e) { note('Cannot reach the class database. Check your internet and reload.'); return; }
  FB.onAuthStateChanged(auth, u => {
    U = u;
    if (!u) { note('Sign in to see your islands.'); showLogin(); return; }
    L.closeModal();
    start().catch(e => { note(why(e)); fail(e); });
  });
}

async function start() {
  note('Loading your islands…');
  OWN = U.email === OWNER;
  if (OWN) ME = {code: 'TEACHER', name: 'Teacher', batch: ''};
  else {
    const d = await FB.getDoc(FB.doc(db, 'students', U.uid));
    if (!d.exists()) { await FB.signOut(auth); showLogin('This account has no student record. Ask sir to add you.'); return; }
    ME = d.data();
  }
  let m = null;
  try { m = localStorage.getItem('eict-quest-medium'); } catch (e) {}
  const med = m === 'si' || m === 'en' ? m : /-SI$/i.test(ME.batch || '') ? 'si' : 'en';

  /* the profile: a nickname for the Hall of Fame. Writing it also tells
     us the server's clock, which the quiz timer runs on */
  let prof = null;
  try { const p = await FB.getDoc(profRef()); prof = p.exists() ? p.data() : null; } catch (e) {}
  const nick = prof && prof.nick || firstName(ME.name) || 'Explorer';
  try {
    const t0 = Date.now();
    await FB.setDoc(profRef(), {nick, code: String(ME.code || ''), medium: med, at: FB.serverTimestamp()});
    const t1 = Date.now();
    const p = await FB.getDoc(profRef());
    const at = ms(p.data().at);
    if (at) SKEW = at - (t0 + t1) / 2;
    if (Math.abs(SKEW) < 1500) SKEW = 0;
  } catch (e) {}
  NICKS[U.uid] = nick;
  Q.setProfile({nickname: nick, medium: MEDN[med]});

  await loadWeeks();
  loadBoard();
}

/* ---------- weeks ---------- */
async function loadWeeks(keep) {
  const snap = await FB.getDocs(FB.collection(db, 'questWeeks'));
  WK = snap.docs.map(d => ({id: d.id, ...d.data()}))
    .filter(w => OWN || (w.batches || []).includes(ME.batch))
    .sort((a, b) => ms(a.openAt) - ms(b.openAt) || String(a.id).localeCompare(b.id));
  if (!OWN) await Promise.all(WK.map(async w => {
    try { const a = await FB.getDoc(attRef(w.id)); if (a.exists()) ATT[w.id] = a.data(); } catch (e) {}
  }));
  paintWeeks(keep);
  totals();
}

function paintWeeks(keep) {
  if (!WK.length) {
    Q.setWeeks(Array.from({length: 6}, () => ({title: '', unlocked: false, completed: false})));
    note(OWN ? 'No weeks yet. Make one in the MCQ admin.' : 'No quests yet. Your first island opens soon!');
    return;
  }
  const sel = S.selected, chap = S.chapter;
  Q.setWeeks(WK.map(w => { const s = wkState(w); return {title: w.title || '', unlocked: OWN || s.open, completed: s.over}; }));
  let n = keep && sel <= WK.length ? sel : 0;
  if (!n) {
    const i = WK.findIndex(w => { const s = wkState(w); return s.open && !s.over && !s.closed; });
    n = i >= 0 ? i + 1 : Math.max(1, WK.filter(w => wkState(w).open).length);
  }
  S.selected = n;
  S.chapter = keep ? chap : Math.floor((n - 1) / 6);
  S.leaderWeek = n;
  L.renderMap();
}

const when = d => new Date(ms(d) - SKEW).toLocaleString('en-GB', {weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'});
S.onMap = () => {
  const w = WK[S.selected - 1];
  if (!w || !U) return;
  const s = wkState(w), n = S.selected;
  if (w.cover) $('selectedDesc').textContent = w.cover;
  if (OWN) { note('Teacher view: every island opens as a practice run. Nothing is saved.'); return; }
  if (!s.open) note('🔒 Opens ' + when(w.openAt));
  else if (s.running) { note('⏳ Your timer is running. Continue now!'); $('playSelected').textContent = '⏳ CONTINUE WEEK ' + n + ' QUEST'; }
  else if (s.over) { note('✓ Completed. See your result, review the answers or practice again.'); $('playSelected').textContent = '🏆 WEEK ' + n + ' RESULT'; }
  else if (s.closed) note('This week closed on ' + when(w.closeAt) + '. You can still practice (not ranked).');
  else note('Open until ' + when(w.closeAt) + ' · ' + mins(w) + ' minutes · your first attempt counts');
};

/* ---------- questions and answers ---------- */
async function loadSet(w) {
  if (SETS[w.id]) return SETS[w.id];
  const d = await FB.getDoc(FB.doc(db, 'questSets', w.id));
  if (!d.exists()) throw {code: 'not-found', message: 'questions missing'};
  return SETS[w.id] = d.data();
}
async function loadKey(w) {
  if (KEYS[w.id]) return KEYS[w.id];
  const d = await FB.getDoc(FB.doc(db, 'questKeys', w.id));
  if (!d.exists()) throw {code: 'not-found', message: 'answers missing'};
  return KEYS[w.id] = d.data();
}
function build(set, w, med) {
  const list = set[med] || set.si || set.en || [];
  return list.map((q, i) => {
    const k = q.opts.length;
    const perm = q.fixed ? [...Array(k).keys()] : shuffle(k, U.uid + '|' + w.id + '|' + i);
    return {perm, q: {id: q.id || 'q' + (i + 1), question: q.text, options: perm.map(j => q.opts[j]),
      extra: {ctx: q.ctx || null, img: q.img || null, code: q.code || null}}};
  });
}
const toShown = (orig, qs) => orig.map((o, i) => o == null || o < 0 ? null : qs[i].perm.indexOf(o));
const toOrig = (shown, perm) => shown.map((a, i) => a == null ? -1 : perm[i][a]);

S.renderExtra = (entry, idx) => {
  const x = entry.extra || {}, c = $('qCtx'), ex = $('qExtra'), wy = $('qWhy'), q = S.quiz;
  c.replaceChildren(); c.hidden = !x.ctx;
  if (x.ctx) {
    c.append(document.createTextNode(x.ctx.text || ''));
    if (x.ctx.code) { const p = document.createElement('pre'); p.textContent = x.ctx.code; c.append(p); }
    if (x.ctx.img) { const i = document.createElement('img'); i.src = img(x.ctx.img); i.alt = ''; c.append(i); }
  }
  ex.replaceChildren();
  if (x.img) { const i = document.createElement('img'); i.src = img(x.img); i.alt = 'Figure for this question'; ex.append(i); }
  if (x.code) { const p = document.createElement('pre'); p.textContent = x.code; ex.append(p); }
  const show = !!(q && q.review && q.key);
  wy.hidden = !show;
  if (show) {
    const letters = q.key[idx].map(i => String.fromCharCode(65 + i)).join(' / ');
    const mine = q.answers[idx];
    wy.textContent = (mine == null ? '⏭ Not answered. ' : q.key[idx].includes(mine) ? '✅ Correct! ' : '❌ Not quite. ')
      + 'Answer: ' + letters + (q.whys && q.whys[idx] ? '\n' + q.whys[idx] : '');
  }
};

/* ---------- starting a week ---------- */
S.liveStart = n => {
  if (!U) { showLogin(); return true; }
  const w = WK[n - 1];
  if (!w) { L.toast('This island is locked.'); return true; }
  const cur = S.quiz;
  if (cur && !cur.finished && !cur.review) {
    if (cur.live && cur.live.wk === w.id && !cur.practice) { L.currentPage('quiz'); L.renderQuiz(); return true; }
    if (!cur.practice) {
      L.openModal('⏳', 'Another quest is running', 'Finish Week ' + cur.week + ' first. Its timer keeps running.',
        [{label: 'Back to it', run: () => L.currentPage('quiz')}]);
      return true;
    }
  }
  const s = wkState(w);
  if (OWN) { practice(w).catch(fail); return true; }
  if (!s.open) { L.toast('This island opens ' + when(w.openAt) + '.'); return true; }
  if (s.running) { resume(w).catch(fail); return true; }
  if (s.over) { showResult(w).catch(fail); return true; }
  if (s.closed) {
    L.openModal('🧭', 'This week has closed', 'You can still practice these 20 questions.\nPractice runs are not saved or ranked.',
      [{label: 'Not now', ghost: true}, {label: 'Practice', run: () => practice(w).catch(fail)}]);
    return true;
  }
  const med = pickMed(w);
  L.openModal('⚡', 'Start Week ' + n + '?',
    '20 MCQs · ' + mins(w) + ' minutes · ' + MEDN[med] + ' medium.\n'
    + 'The timer starts now and keeps running even if you close the page. Only this first attempt counts.'
    + (med !== MED[S.medium] ? '\n(This week is in ' + MEDN[med] + ' only.)' : ''),
    [{label: 'Not yet', ghost: true}, {label: 'Start quest', run: () => begin(w).catch(fail)}]);
  return true;
};

async function begin(w) {
  L.toast('Starting your quest…');
  let err = null;
  try {
    await FB.setDoc(attRef(w.id), {uid: U.uid, code: String(ME.code || ''), medium: pickMed(w),
      startedAt: FB.serverTimestamp(), answers: Array(20).fill(-1), done: false});
  } catch (e) { err = e; }
  const a = await FB.getDoc(attRef(w.id));
  if (!a.exists()) {
    L.openModal('⚠️', 'Could not start', why(err) + '\nIf it should be open, ask sir to check the week’s time and class.', [{label: 'OK'}]);
    return;
  }
  ATT[w.id] = a.data();
  await resume(w);
}

async function resume(w) {
  const a = ATT[w.id], set = await loadSet(w);
  let med = pickMed(w);
  if (!set[med]) med = set[a.medium] ? a.medium : 'si';
  if (med !== a.medium) FB.updateDoc(attRef(w.id), {medium: med}).catch(() => {});
  const qs = build(set, w, med), lim = mins(w) * 60, t0 = ms(a.startedAt) - SKEW;
  L.beginQuiz({week: num(w), medium: MEDN[med], questions: qs.map(x => x.q), answers: toShown(a.answers, qs),
    startedAt: t0, endAt: t0 + lim * 1000, limit: lim,
    live: {wk: w.id, perm: qs.map(x => x.perm), saved: JSON.stringify(a.answers)}});
  L.toast('Good luck! Your answers save as you go.');
}

async function practice(w) {
  const set = await loadSet(w), key = await loadKey(w), med = set[pickMed(w)] ? pickMed(w) : 'si';
  const qs = build(set, w, med), lim = mins(w) * 60;
  L.beginQuiz({week: num(w), medium: MEDN[med], questions: qs.map(x => x.q), practice: true, limit: lim,
    live: {wk: w.id, perm: qs.map(x => x.perm), key}});
}

async function review(w, orig) {
  const set = await loadSet(w), key = await loadKey(w), med = set[pickMed(w)] ? pickMed(w) : 'si';
  const qs = build(set, w, med);
  L.beginQuiz({week: num(w), medium: MEDN[med], questions: qs.map(x => x.q), review: true,
    answers: toShown(orig, qs), whys: (key.why && (key.why[med] || key.why.si)) || null,
    key: key.ans.map((a, i) => [a, ...((key.alt && key.alt[i]) || [])].map(o => qs[i].perm.indexOf(o))),
    live: {wk: w.id, perm: qs.map(x => x.perm)}});
}

async function showResult(w) {
  const a = ATT[w.id], key = await loadKey(w), sc = score(a.answers, key), lim = mins(w) * 60;
  const used = a.done && a.finishedAt ? Math.round((ms(a.finishedAt) - ms(a.startedAt)) / 1000) : lim;
  S.result = {week: num(w), wk: w.id, orig: a.answers, answered: a.answers.filter(x => x >= 0).length,
    elapsedSeconds: Math.min(Math.max(used, 0), lim), expired: !a.done, practice: false,
    grade: {score: sc, maxScore: 20, source: 'verified', ...rewards(sc)}};
  S.leaderWeek = num(w);
  L.renderResult();
  L.currentPage('results');
}

/* answers save a moment after each click, and when the page is hidden */
let saveT = null;
async function flush(q) {
  const lv = q && q.live;
  if (!lv || q.practice || q.review || q.finished) return;
  const orig = toOrig(q.answers, lv.perm), j = JSON.stringify(orig);
  if (j === lv.saved) return;
  try { await FB.updateDoc(attRef(lv.wk), {answers: orig}); lv.saved = j; }
  catch (e) { L.toast(Date.now() > q.endAt ? 'Time is up.' : 'Answer not saved yet. Check your internet.'); }
}
S.onAnswer = q => { clearTimeout(saveT); saveT = setTimeout(() => flush(q), 600); };
addEventListener('pagehide', () => flush(S.quiz));
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(S.quiz); });

/* finishing: freeze the attempt, then mark it with the key */
Q.setSubmitHandler(async p => {
  const q = S.quiz, lv = q.live, w = WK.find(x => x.id === lv.wk);
  clearTimeout(saveT);
  const orig = toOrig(p.answers.map(a => a.selectedOptionIndex), lv.perm);
  if (q.practice) {
    lv.orig = orig;
    return {score: score(orig, lv.key || await loadKey(w)), stars: 0, coins: 0, gems: 0};
  }
  try { await FB.updateDoc(attRef(w.id), {answers: orig, done: true, finishedAt: FB.serverTimestamp()}); }
  catch (e) {
    /* past the grace time the attempt is already frozen: what was saved counts */
    const d = (await FB.getDoc(attRef(w.id))).data();
    if (!d || !(d.done || now() > ms(d.startedAt) + (mins(w) + 2) * 60000)) throw e;
  }
  ATT[w.id] = (await FB.getDoc(attRef(w.id))).data();
  lv.orig = ATT[w.id].answers;
  const sc = score(lv.orig, await loadKey(w));
  setTimeout(() => { paintWeeks(true); loadBoard(); }, 60);
  return {score: sc, ...rewards(sc)};
});

S.onResult = r => {
  const q = S.quiz;
  if (!r.wk && q && q.live) { r.wk = q.live.wk; r.orig = q.live.orig; }
  $('reviewBtn').hidden = !(r.wk && r.orig);
};
$('reviewBtn').onclick = () => { const r = S.result, w = r && WK.find(x => x.id === r.wk); if (w) review(w, r.orig).catch(fail); };
$('retry').onclick = () => { const r = S.result, w = r && WK.find(x => x.id === r.wk); if (!w) return; S.quiz = null; practice(w).catch(fail); };

/* ---------- totals and the Hall of Fame ---------- */
async function totals() {
  let st = 0, co = 0, ge = 0;
  for (const w of WK) {
    if (!wkState(w).over) continue;
    try { const r = rewards(score(ATT[w.id].answers, await loadKey(w))); st += r.stars; co += r.coins; ge += r.gems; } catch (e) {}
  }
  S.stars = st; S.coins = co; S.gems = ge;
  L.refreshStats();
  if (S.mode === 'progress') L.renderProgress();
}

async function loadBoard() {
  try {
    const s = await FB.getDocs(FB.collection(db, 'questProfiles'));
    s.forEach(d => { NICKS[d.id] = d.data().nick; });
  } catch (e) {}
  const rows = [];
  await Promise.all(WK.map(async w => {
    const s = wkState(w);
    if (!(OWN || s.closed || s.over)) return;
    try {
      const key = await loadKey(w), lim = mins(w) * 60;
      const snap = await FB.getDocs(FB.collection(db, 'questWeeks', w.id, 'attempts'));
      snap.forEach(d => {
        const a = d.data(), t0 = ms(a.startedAt);
        if (!(a.done || now() > t0 + lim * 1000)) return;
        const used = a.done && a.finishedAt ? (ms(a.finishedAt) - t0) / 1000 : lim;
        rows.push({nickname: (NICKS[d.id] || 'Explorer') + (d.id === U.uid ? ' (you)' : ''), week: num(w),
          score: score(a.answers, key), elapsedSeconds: Math.min(Math.max(0, Math.round(used)), lim)});
      });
    } catch (e) {}
  }));
  Q.setLeaderboard(rows);
}
S.boardEmpty = 'No results to show here yet. Finish the week’s quest to see its Hall of Fame!';

/* ---------- profile ---------- */
$('saveNickname').onclick = async () => {
  if (!U) { showLogin(); return; }
  const s = ($('nickname').value || '').trim().slice(0, 24) || 'Explorer';
  S.nickname = s; L.refreshStats(); L.renderProgress();
  try {
    await FB.setDoc(profRef(), {nick: s, code: String(ME.code || ''), medium: MED[S.medium] || 'si', at: FB.serverTimestamp()});
    NICKS[U.uid] = s;
    L.toast('Nickname saved!');
    loadBoard();
  } catch (e) { L.toast('Could not save. Check your internet.'); }
};
$('mediumSwitch').addEventListener('change', () => {
  const m = MED[S.medium];
  try { localStorage.setItem('eict-quest-medium', m); } catch (e) {}
  if (U && FB) FB.updateDoc(profRef(), {medium: m}).catch(() => {});
});

/* a week that opens or closes while the page is open */
setInterval(() => { if (U && WK.length && !(S.quiz && !S.quiz.finished)) { const before = JSON.stringify(WK.map(wkState).map(s => [s.open, s.closed])); if (before !== S._wkSig) { S._wkSig = before; paintWeeks(true); } } }, 30000);

boot();
