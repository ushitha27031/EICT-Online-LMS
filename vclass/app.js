/* ============================================================
   EICT Virtual Academy — the student app.
   sign in → pick a character + name → walk into class
   Phones get the board (no 3D is downloaded at all) and are
   seated automatically; laptops and desktops get the 3D room;
   tablets start on the board and can switch the room on.
   ============================================================ */
import { AVATARS, byId, portrait } from './avatars.js';
import { openNet, ITEMS } from './net.js';
import { canEmbed, joinZoom, sizeZoom, fit, onZoom, zoomState, toggleMic, isMuted, leaveZoom } from './zoom.js';
import { createReader } from './tute.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { const v = localStorage.getItem('vc.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
                set(k, v) { try { localStorage.setItem('vc.' + k, JSON.stringify(v)); } catch (e) {} } };
let tt; const toast = (t, k) => { const e = $('#toast'); e.textContent = t; e.className = 'toast on ' + (k || ''); clearTimeout(tt); tt = setTimeout(() => (e.className = 'toast ' + (k || '')), 3600); };
const show = id => ['#gate', '#lobby', '#room', '#boot'].forEach(s => ($(s).hidden = s !== id));
const ROOM_ID = (new URLSearchParams(location.search).get('room') || 'main').replace(/[^a-z0-9-]/g, '').slice(0, 24) || 'main';
const seatName = sid => { const m = /^r(\d)c(\d)$/.exec(sid || ''); return m ? `Row ${+m[1] + 1} · Seat ${+m[2] + 1}` : ''; };
/* the same seat order the 3D room uses, without loading three.js on a phone */
const COLX = [-4.65, -3.55, -0.55, 0.55, 3.55, 4.65], ROWZ = [-4.3, -2.7, -1.1, 0.5, 2.1];
const SEAT_IDS = []; ROWZ.forEach((z, r) => COLX.forEach((x, c) => SEAT_IDS.push(`r${r}c${c}`)));
const seatXZ = sid => { const m = /^r(\d)c(\d)$/.exec(sid); return m ? { x: COLX[+m[2]], z: ROWZ[+m[1]] + 0.56 } : { x: 0, z: 0 }; };
const SEAT_ORDER = [...SEAT_IDS].sort((a, b) => a[1] - b[1] || Math.abs(COLX[a[3]]) - Math.abs(COLX[b[3]]));

/* ---------- device ---------- */
const coarse = matchMedia('(pointer: coarse)').matches;
function deviceKind() {
  const small = Math.min(screen.width, screen.height);
  if (innerWidth < 768 || small < 600) return 'phone';
  if (coarse && Math.max(innerWidth, innerHeight) <= 1400) return 'tablet';
  return 'desk';
}

/* ---------- state ---------- */
let FB, auth, net, U = null, ALLOW = null, ST = {}, inRoom = false, DEV = 'desk', LAYOUT = 'board';
let room = null, roomLoading = null, preview = null, AV = store.get('av', 'b1'), NAME = '';
const PLAYERS = {}, SEATS = {}, ITEMSV = {}, CHITS = {};
const OWNER = 'ushithasamudaya@gmail.com';
let IS_T = false;                                   // sir's own account: walks in as the teacher, no seat, no invitation needed
const SIR_SPOT = { x: 2.3, z: -6.1, ry: 0 };        // beside the board, facing the class
const meProfile = () => ({ n: NAME, av: AV, ...(IS_T ? { spawn: SIR_SPOT } : {}) });
let mySeat = null, claiming = 0, ASKS = {}, handled = new Set(), hand = false, hereDone = {}, askSeen = store.get('askSeen', 0), reader = null;

/* =========================================================
   boot + sign in
   ========================================================= */
async function boot() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.projectId) { $('#boot').innerHTML = '<p class="err">Cannot reach the class.</p>'; return; }
  const G = 'https://www.gstatic.com/firebasejs/11.0.2/firebase-';
  try {
    const [A, Au] = await Promise.all([import(G + 'app.js'), import(G + 'auth.js')]);
    const app = A.initializeApp(cfg);
    FB = Au; auth = Au.getAuth(app);
    const emu = window.VC_EMU;
    if (emu && emu.auth) Au.connectAuthEmulator(auth, emu.auth, { disableWarnings: true });
    try { await Au.setPersistence(auth, Au.browserLocalPersistence); } catch (e) {}
    net = await openNet(app, { room: ROOM_ID, url: cfg.databaseURL || 'https://eict-60955-default-rtdb.asia-southeast1.firebasedatabase.app', emu: emu && emu.db });
  } catch (e) { $('#boot').innerHTML = '<p class="err">Cannot reach the class. Check your internet and reload.</p>'; return; }
  FB.onAuthStateChanged(auth, u => {
    if (u && U && u.uid === U.uid) return;
    U = u;
    if (!u) { show('#gate'); return; }
    startLobby();
  });
}
$('#gform').onsubmit = async e => {
  e.preventDefault(); const b = e.submitter || $('#gform button'); b.disabled = true; $('#gerr').textContent = '';
  try { await FB.signInWithEmailAndPassword(auth, $('#em').value.trim(), $('#pw').value); }
  catch (x) { $('#gerr').textContent = /invalid|wrong|not-found|credential/.test(x.code || '') ? 'Wrong email or password.' : 'Could not sign in. Check your internet.'; }
  b.disabled = false;
};
$('#signout').onclick = () => FB.signOut(auth).then(() => location.reload());

/* =========================================================
   lobby
   ========================================================= */
function startLobby() {
  show('#lobby'); DEV = deviceKind();
  IS_T = (U.email || '').toLowerCase() === OWNER;
  document.body.dataset.role = IS_T ? 'teacher' : 'student';
  if (IS_T) {
    AV = 't1'; ALLOW = { n: 'Sir', c: 'Sir' };
    NAME = store.get('tname', '') || 'Sir'; $('#dname').value = NAME;
    $('.pick').hidden = true; $('#enter').textContent = 'Go into the classroom';
    net.on('state', v => { ST = v || {}; lobbyStatus(); if (inRoom) applyState(); }, () => { ST = {}; lobbyStatus(); });
    if (DEV !== 'phone') import('./scene.js').then(m => { $('#pv').hidden = false; $('#pvImg').hidden = true; preview = m.createPreview($('#pv')); preview.show(byId(AV)); }).catch(() => {});
    pickAv(AV); lobbyStatus();
    return;
  }
  drawAvatars('all');
  net.on('allow/' + U.uid, v => {
    ALLOW = v;
    if (!NAME) { NAME = store.get('name', '') || (v && v.n ? String(v.n).split(/\s+/)[0] : ''); $('#dname').value = NAME; }
    if (!v && inRoom) { leaveRoom('Sir has closed your place in this class.'); }
    lobbyStatus();
  }, () => { ALLOW = null; lobbyStatus(); });
  net.on('state', v => { ST = v || {}; lobbyStatus(); if (inRoom) applyState(); }, () => { ST = {}; lobbyStatus(); });
  /* the live classroom can't be reached at all: say so instead of "Checking…" for ever */
  let seen = false;
  net.onConnected(c => { if (c) seen = true; });
  setTimeout(() => { if (!seen && !inRoom) { $('#lStatus').className = 'status closed'; $('#lStatus').lastElementChild.textContent = 'The virtual classroom is not ready yet';
    $('#lHint').textContent = 'Sir is still setting up the virtual classroom. Please use the normal Zoom link for today\'s class.'; } }, 10000);
  /* a little 3D turntable on laptops and tablets; just the portrait on phones */
  if (DEV !== 'phone') import('./scene.js').then(m => { $('#pv').hidden = false; $('#pvImg').hidden = true; preview = m.createPreview($('#pv')); preview.show(byId(AV)); }).catch(() => {});
  pickAv(AV);
}
function lobbyStatus() {
  const s = $('#lStatus'), ok = !!ALLOW, open = !!ST.open;
  if (IS_T) {
    s.className = 'status ' + (open ? (ST.live ? 'live' : 'open') : 'closed');
    s.lastElementChild.textContent = 'Teacher · ' + (open ? (ST.live ? 'class is live' : 'classroom open') : 'classroom closed — you can still go in');
    $('#lTitle').textContent = ST.title || 'Your classroom'; $('#lTopic').textContent = ST.topic || '';
    $('#enter').disabled = !$('#dname').value.trim(); $('#lHint').textContent = 'You stand at the front, beside the board. Students see you as "' + ($('#dname').value.trim() || 'Sir') + '".';
    return;
  }
  s.className = 'status ' + (ok && open ? (ST.live ? 'live' : 'open') : 'closed');
  s.lastElementChild.textContent = !ok ? 'You are not on today\'s class list' : !open ? 'The classroom is closed right now' : ST.live ? 'Class is live now' : 'The classroom is open';
  $('#lTitle').textContent = ST.title ? ST.title : 'Choose your character';
  $('#lTopic').textContent = ST.topic || '';
  const can = ok && open && $('#dname').value.trim().length >= 1;
  $('#enter').disabled = !can;
  $('#lHint').textContent = !ok ? 'Sir adds your batch when the class starts. This page updates by itself — no need to reload.'
    : !open ? 'Sir hasn\'t opened the classroom yet. Wait here; the button wakes up when it opens.' : '';
}
function drawAvatars(g) {
  $$('[data-g]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.g === g)));
  $('#avs').innerHTML = AVATARS.filter(a => g === 'all' || a.g === g).map(a =>
    `<button class="av${a.id === AV ? ' on' : ''}" role="radio" aria-checked="${a.id === AV}" data-av="${a.id}" title="${esc(a.label)}">${portrait(a)}<span>${esc(a.label)}</span></button>`).join('');
}
function pickAv(id) {
  AV = id; if (!IS_T) store.set('av', id);
  $$('.av').forEach(b => { b.classList.toggle('on', b.dataset.av === id); b.setAttribute('aria-checked', String(b.dataset.av === id)); });
  $('#pvImg').innerHTML = portrait(byId(id));
  if (preview) preview.show(byId(id));
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-av]'); if (a) pickAv(a.dataset.av);
  const g = e.target.closest('[data-g]'); if (g) drawAvatars(g.dataset.g);
});
$('#dname').addEventListener('input', lobbyStatus);
$('#enter').onclick = () => enterRoom();

/* =========================================================
   the room
   ========================================================= */
async function enterRoom() {
  NAME = $('#dname').value.trim().replace(/\s+/g, ' ').slice(0, 24); if (!NAME) return;
  store.set(IS_T ? 'tname' : 'name', NAME);
  $('#enter').disabled = true; $('#enter').textContent = 'Walking in…';
  DEV = deviceKind();
  LAYOUT = DEV === 'desk' ? 'room' : 'board';
  show('#room'); inRoom = true;
  document.body.dataset.dev = DEV;
  if (preview) { preview.dispose(); preview = null; }
  setupRoomListeners();
  try {
    if (LAYOUT === 'room') await loadRoom();
    await present(true);
  } catch (e) {
    console.error(e);
    toast('Could not join the classroom. Check your internet.', 'bad');
  }
  setLayout(LAYOUT);
  $('#modeSeg').hidden = DEV === 'phone';
  applyState();
  $('#enter').textContent = 'Walk into class';
}

/* in the room = a line in "players"; on a seat = a lock in "seats". Both vanish by themselves if the internet drops. */
let presentBusy = false;
async function present(first) {
  if (presentBusy || !inRoom) return; presentBusy = true;
  if (IS_T) {
    try {
      await net.enter(U.uid, { n: NAME, av: AV, dev: DEV === 'phone' ? 'm' : DEV === 'tablet' ? 't' : 'd', x: SIR_SPOT.x, z: SIR_SPOT.z, ry: SIR_SPOT.ry, teacher: true }, ST.session || '');
      if (room && !room.hasMe) room.setMe(U.uid, meProfile());
    } finally { presentBusy = false; }
    return;
  }
  try {
    const keep = mySeat || sessionStorage.getItem('vc.seat:' + ROOM_ID + ':' + (ST.session || ''));
    const pos = keep ? seatXZ(keep) : { x: 6.0, z: 6.6 };
    await net.enter(U.uid, { n: NAME, av: AV, dev: DEV === 'phone' ? 'm' : DEV === 'tablet' ? 't' : 'd', x: pos.x, z: pos.z, ry: Math.PI }, ST.session || '');
    let got = null;
    claiming++;
    try {
      if (keep) { try { got = await net.claimSeat(keep); } catch (e) { got = null; } }
      if (!got && (LAYOUT === 'board' || !room)) got = await net.autoSeat(SEAT_ORDER, taken);
    } finally { claiming--; }
    if (got) setMySeat(got, true);
    else if (keep) { setMySeat(null); if (room && room.mySeat) room.standUp(); toast('Someone took your chair while you were away — pick another.'); }
    if (room && !room.hasMe) {
      room.setMe(U.uid, meProfile(), got || undefined);
      if (!got) hint('Click a free chair to sit down. Walk with W A S D or click the floor; drag to look around.', 9000);
    }
    if (got) net.move({ ...seatXZ(got), ry: Math.PI, a: 'sit' });
  } finally { presentBusy = false; }
}
function setMySeat(sid, sat) {
  mySeat = sid;
  try { sessionStorage.setItem('vc.seat:' + ROOM_ID + ':' + (ST.session || ''), sid || ''); } catch (e) {}
  $('#mySeatChip').hidden = !sid; $('#mySeatChip').textContent = sid ? 'Your seat: ' + seatName(sid) : '';
  $('#standBtn').hidden = !(sid && LAYOUT === 'room');
  drawKit();
}
function taken(sid) {
  const s = SEATS[sid]; if (!s || s.u === U.uid) return false;
  const p = PLAYERS[s.u]; return !!(p && p.seat === sid);
}
function seatOf(uid) { const p = PLAYERS[uid]; return p && p.seat && SEATS[p.seat] && SEATS[p.seat].u === uid ? p.seat : null; }

async function loadRoom() {
  if (room) return room;
  if (!roomLoading) roomLoading = (async () => {
    const m = await import('./scene.js');
    room = await m.createClassroom($('#stage3d'), {
      quality: DEV === 'desk' ? 'high' : 'low',
      myUid: U.uid,
      onMove: st => net.move(st),
      onSeat: sid => chooseSeat(sid),
      onStand: () => standUp(),
      onTute: () => openTute(),
      onFrame: () => placeZoom(),
      onView: v => $('#viewBtn').classList.toggle('on', v === 'first'),
    });
    room.setOccupied(sid => taken(sid));
    for (const uid in PLAYERS) room.upsert(uid, PLAYERS[uid]);
    room.setBoard(boardData());
    paintItems();
    $('#viewBtn').hidden = false;
    return room;
  })();
  return roomLoading;
}
async function chooseSeat(sid) {
  if (IS_T) { toast('The chairs are for students — walk anywhere with W A S D or by clicking the floor.'); return; }
  if (mySeat === sid) return;
  if (taken(sid)) { toast('Someone is already sitting there.'); return; }
  claiming++;
  try { await net.claimSeat(sid); }
  catch (e) { toast('Someone just took that chair — pick another.'); return; }
  finally { claiming--; }
  setMySeat(sid);
  if (room) await room.goSit(sid);
  net.move({ ...seatXZ(sid), ry: Math.PI, a: 'sit' });
}
async function standUp() {
  if (!mySeat) return;
  claiming++; try { await net.releaseSeat(); } finally { claiming--; }
  setMySeat(null);
  if (room) room.standUp();
}

/* ---------- live data ---------- */
let listening = false;
function setupRoomListeners() {
  if (listening) return; listening = true;
  net.onChildren('players', {
    add: (k, v) => { PLAYERS[k] = v; if (room) room.upsert(k, v); people(); },
    change: (k, v) => { PLAYERS[k] = v; if (room) room.upsert(k, v); people(); },
    remove: k => { delete PLAYERS[k]; if (room) room.remove(k); people(); if (k === U.uid && inRoom && net.connected) setTimeout(() => { if (inRoom && !PLAYERS[U.uid]) present(); }, 1500); },
  }, () => {});
  net.on('seats', v => {
    Object.keys(SEATS).forEach(k => delete SEATS[k]); Object.assign(SEATS, v || {});
    if (mySeat && !claiming && (!SEATS[mySeat] || SEATS[mySeat].u !== U.uid) && net.connected && !presentBusy) {
      /* sir moved me, or freed my chair */
      net.seat = null; setMySeat(null); if (room) room.standUp(); toast('Your chair was freed by sir.');
      if (LAYOUT === 'board') { claiming++; net.autoSeat(SEAT_ORDER, taken).then(s => s && setMySeat(s)).finally(() => claiming--); }
    }
    paintItems();
  });
  net.on('items', v => { Object.keys(ITEMSV).forEach(k => delete ITEMSV[k]); Object.assign(ITEMSV, v || {}); paintItems(); drawKit(); });
  net.on('asks/' + U.uid, v => { ASKS = v || {}; askQueue(); });
  net.on('chits/' + U.uid, v => { Object.keys(CHITS).forEach(k => delete CHITS[k]); Object.assign(CHITS, v || {}); drawChits(); });
  net.onFx((k, f) => {
    if (f.k === 'chit' && room) room.playChit(f.path || []);
    if ((f.k === 'lend' || f.k === 'back') && room && f.from && f.to) room.playPass(f.from, f.to, f.item);
    if (f.k === 'no' && f.to === U.uid) toast(`They said no to lending their ${(ITEMS[f.item] || {}).name || 'item'}.`);
  });
  net.onConnected(c => {
    $('#netbar').hidden = c || !inRoom;
    if (c && inRoom && wasDown) present();
    if (!c) wasDown = true;
  });
}
let wasDown = false;

/* ---------- the class state from sir ---------- */
function boardData() { return { title: ST.title, topic: ST.topic, live: !!ST.live, announce: ST.announce && ST.announce.text, zoomOn: !!YT || zoomState() === 'joined' }; }
let lastAnn = 0, lastCheck = '';
function applyState() {
  if (!inRoom) return;
  if (!ST.open && !IS_T) { leaveRoom('Sir has closed the classroom. See you next class!'); return; }
  $('#tTitle').textContent = ST.title || 'Virtual class'; $('#bTitle').textContent = ST.title || 'A/L ICT'; $('#bTopic').textContent = ST.topic || '';
  $('#tLive').hidden = !ST.live; $('#liveDot').classList.toggle('on', !!ST.live);
  $('#wTitle').textContent = ST.live ? 'The lecture is live' : 'Class starts soon';
  $('#wSub').textContent = ST.live ? (ytMode() || (canEmbed() && ST.server && ST.embed !== false) ? 'Press "Join lecture" to watch it right here on the board.' : 'Press "Join lecture" to open it in Zoom.') : 'Take your seat. The lecture will appear on this board.';
  /* sir changed the stream, switched to Zoom, or paused the lecture */
  if (YT && (!ST.live || !ytMode())) stopYT();
  else if (YT && ytSrc(ST.yt) !== YT) showYT();
  const zo = $('#zoomOut'); zo.hidden = !ST.zoomUrl; if (ST.zoomUrl) zo.href = ST.zoomUrl;
  const an = ST.announce;
  $('#announce').hidden = !(an && an.text); if (an && an.text) $('#announce').textContent = an.text;
  if (an && an.at && an.at > lastAnn) { if (lastAnn) toast('Sir: ' + an.text); lastAnn = an.at; }
  const ck = ST.attendCheck;
  if (ck && ck.id && ck.id !== lastCheck && !(hereDone[ck.id])) {
    lastCheck = ck.id;
    if (Date.now() - (ck.at || 0) < 10 * 60000) ask('Attendance', 'Sir is marking attendance. Tap "I\'m here".', [['Later', 0], ["I'm here", 1]]).then(y => y && markHere());
  }
  $('#hereBtn').classList.toggle('pulse', !!(ck && ck.id && !hereDone[ck.id]));
  if (room) room.setBoard(boardData());
}

/* =========================================================
   layout: the 3D room or the board
   ========================================================= */
async function setLayout(l) {
  if (l === 'room' && DEV === 'phone') l = 'board';
  LAYOUT = l; document.body.dataset.layout = l;
  $$('[data-mode]').forEach(b => b.setAttribute('aria-selected', String((b.dataset.mode === 'room') === (l === 'room'))));
  if (l === 'room') {
    hint('Loading the classroom…', 3000);
    await loadRoom();
    if (!room.hasMe) room.setMe(U.uid, meProfile(), mySeat || undefined);
    room.resume();
  } else if (room) room.pause();
  $('#standBtn').hidden = !(mySeat && l === 'room');
  placeZoom(true);
}
$$('[data-mode]').forEach(b => b.onclick = () => setLayout(b.dataset.mode === 'room' ? 'room' : 'board'));
/* a laptop window squeezed under 768 px falls back to the board */
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (inRoom && LAYOUT === 'room' && innerWidth < 768) setLayout('board'); placeZoom(true); }, 150); });
addEventListener('orientationchange', () => setTimeout(() => placeZoom(true), 300));

/* the Zoom picture sits exactly on the board — in the 3D room, on the board view, or in a small corner window */
let zr = '', zt;
/* YouTube live on the board: no Zoom keys needed. One player only, in the same place the Zoom picture would be. */
let YT = '';
const ytSrc = y => !y ? '' : y.v ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(y.v)}?autoplay=1&playsinline=1&rel=0&modestbranding=1`
  : y.ch ? `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(y.ch)}&autoplay=1&playsinline=1` : '';
const ytMode = () => (ST.boardSrc || 'youtube') === 'youtube' && !!ST.yt;
function showYT() {
  const src = ytSrc(ST.yt); if (!src) return;
  if (YT !== src) {
    const f = document.createElement('iframe');
    f.src = src; f.title = 'Live lecture'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    $('#ytRoot').replaceChildren(f); YT = src;
  }
  $('#ytRoot').hidden = false; $('#zoomRoot').hidden = true;
  boardUi();
}
function stopYT() { if (!YT) return; YT = ''; $('#ytRoot').replaceChildren(); $('#ytRoot').hidden = true; $('#zoomRoot').hidden = false; boardUi(); }
const boardOn = () => !!YT || zoomState() === 'joined' || zoomState() === 'joining';
function boardUi() {
  const s = zoomState();
  $('.d-join span').textContent = YT || s === 'joined' ? 'On board' : s === 'joining' || s === 'loading' ? 'Joining…' : 'Lecture';
  $('#waiting').classList.toggle('behind', !!YT || s === 'joined');
  if (room) room.setBoard(boardData());
  placeZoom(true);
}

/* A 1280×720 picture mapped onto the board's four corners on screen (a perspective transform),
   recomputed every frame after the camera moves — so it is glued to the board, not floating over it.
   It sits *under* the 3D canvas, which is see-through only where the board is, so students sitting
   in front of the board are drawn in front of it. */
const PW = 1280, PH = 720;
function quadMatrix(q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;      // top-left, top-right, bottom-right, bottom-left
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let a, b, c, d, e, f, g, h;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) { a = x1 - x0; b = x3 - x0; c = x0; d = y1 - y0; e = y3 - y0; f = y0; g = 0; h = 0; }
  else {
    const det = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / det; h = (dx1 * dy3 - dx3 * dy1) / det;
    a = x1 - x0 + g * x1; b = x3 - x0 + h * x3; c = x0; d = y1 - y0 + g * y1; e = y3 - y0 + h * y3; f = y0;
  }
  const m = [a / PW, d / PW, 0, g / PW, b / PH, e / PH, 0, h / PH, 0, 0, 1, 0, c, f, 0, 1];
  return 'matrix3d(' + m.map(v => +v.toFixed(8)).join(',') + ')';
}
function placeZoom(force) {
  const host = $('#zoomHost'), on = boardOn(), pinned = LAYOUT === 'room' && !!room && !document.body.classList.contains('fs');
  if (room) room.setHole(on && pinned);
  if (!on) { host.hidden = true; return; }
  host.hidden = false;
  if (pinned) {
    host.classList.add('pinned');
    const q = room.boardQuad();
    if (!q) { host.style.visibility = 'hidden'; return; }              // the board is behind you: keep playing, show nothing
    host.style.visibility = '';
    const m = quadMatrix(q);
    if (m === zr && !force) return; zr = m;
    Object.assign(host.style, { left: '0px', top: '0px', width: PW + 'px', height: PH + 'px', transform: m });
    if (!YT && force) { clearTimeout(zt); zt = setTimeout(() => sizeZoom(PW, PH), 250); }
    return;
  }
  host.classList.remove('pinned'); host.style.transform = ''; host.style.visibility = '';
  let r = $('#boardSlot').getBoundingClientRect(); r = { x: r.left, y: r.top, w: r.width, h: r.height };
  const f = fit(r.w, r.h), x = Math.round(r.x + (r.w - f.w) / 2), y = Math.round(r.y + (r.h - f.h) / 2);
  const key = `${x},${y},${f.w},${f.h}`;
  if (key === zr && !force) return; zr = key;
  Object.assign(host.style, { left: x + 'px', top: y + 'px', width: f.w + 'px', height: f.h + 'px' });
  if (!YT) { clearTimeout(zt); zt = setTimeout(() => sizeZoom(f.w, f.h), 250); }
}
onZoom((s, why) => {
  $('#micBtn').hidden = s !== 'joined';
  $('#micBtn span').textContent = isMuted() ? 'Mic off' : 'Mic on';
  $('#micBtn').classList.toggle('on', !isMuted());
  $('.d-join span').textContent = s === 'joined' ? 'On board' : s === 'joining' || s === 'loading' ? 'Joining…' : 'Lecture';
  $('#waiting').classList.toggle('behind', s === 'joined');
  if (s === 'failed') { $('#wErr').textContent = 'The lecture could not open inside the board (' + why + '). Use "Open in Zoom app" instead.'; $('#zoomOut').hidden = !ST.zoomUrl; }
  if (room) room.setBoard(boardData());
  placeZoom(true);
});

/* =========================================================
   actions
   ========================================================= */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b || !inRoom) return;
  const a = b.dataset.act;
  if (a === 'join') joinLecture(b);
  if (a === 'mic') { const m = await toggleMic(); if (m != null) toast(m ? 'Your mic is off.' : 'Your mic is on — sir can hear you.'); }
  if (a === 'full') fullscreen();
  if (a === 'tute') openTute(true);
  if (a === 'ask') openDrawer('#pAsk');
  if (a === 'kit') { drawKit(); openDrawer('#pKit'); }
  if (a === 'people') { people(); openDrawer('#pPeople'); }
  if (a === 'here') markHere();
  if (a === 'hand') { hand = !hand; net.move({ hand }); if (room) room.setMyHand(hand); $('#handBtn').classList.toggle('on', hand); toast(hand ? 'Hand up — sir can see it.' : 'Hand down.'); }
  if (a === 'stand') standUp();
  if (a === 'view' && room) room.view();
  if (a === 'leave') leaveRoom();
});
document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeDrawers(); });
function openDrawer(id) { closeDrawers(id); const d = $(id); d.classList.add('on'); d.setAttribute('aria-hidden', 'false'); }
function closeDrawers(except) { $$('.drawer').forEach(d => { if ('#' + d.id === except) return; if (d.id === 'pTute' && reader) { if (reader.isOpen) reader.close(); return; } d.classList.remove('on'); d.setAttribute('aria-hidden', 'true'); }); }
addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawers(); });

async function joinLecture(btn) {
  if (!ST.live) { toast('The lecture hasn\'t started yet. Sir will start it soon.'); return; }
  if (ytMode()) { showYT(); if (LAYOUT === 'room' && room) { const br = room.boardRect(); if (!br.visible) room.view('first'); } return; }
  if (zoomState() === 'joined' || zoomState() === 'joining' || zoomState() === 'loading') { placeZoom(true); return; }
  const embed = ST.embed !== false && !!ST.server && canEmbed();
  if (!embed) { if (ST.zoomUrl) window.open(ST.zoomUrl, '_blank', 'noopener'); else toast('Sir hasn\'t added the Zoom link yet.'); return; }
  $('#wErr').textContent = '';
  try {
    const token = await U.getIdToken();
    const r = await fetch(ST.server, { method: 'POST', body: JSON.stringify({ action: 'ticket', token, room: ROOM_ID }) });
    const t = await r.json();
    if (!t.ok) throw new Error({ invite: 'you are not on today\'s list', closed: 'the class is not live', notset: 'sir hasn\'t finished the Zoom setup' }[t.error] || t.error);
    if (LAYOUT === 'room') { const br = room && room.boardRect(); if (!br || !br.visible) room && room.view('first'); }
    $('#zoomHost').hidden = false; placeZoom(true);
    await joinZoom($('#zoomRoot'), t, `${NAME} (${ALLOW && ALLOW.c ? ALLOW.c : 'EICT'})`);
  } catch (e) {
    $('#wErr').textContent = 'The lecture could not open on the board: ' + (e.message || e.reason || 'unknown') + '. Use "Open in Zoom app".';
    $('#zoomOut').hidden = !ST.zoomUrl;
    toast('Could not open the lecture here — use "Open in Zoom app".', 'bad');
    if (LAYOUT === 'room') setLayout('board');
  }
}
async function fullscreen() {
  const on = !document.body.classList.contains('fs');
  if (on) {
    if (LAYOUT === 'room') await setLayout('board');
    try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch (e) {}
    try { if (screen.orientation && screen.orientation.lock && DEV !== 'desk') await screen.orientation.lock('landscape'); } catch (e) {}
    document.body.classList.add('fs');
  } else exitFull();
  setTimeout(() => placeZoom(true), 200);
}
function exitFull() {
  document.body.classList.remove('fs');
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
  try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) {}
  setTimeout(() => placeZoom(true), 200);
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('fs')) exitFull(); });
document.addEventListener('dblclick', e => { if (e.target.closest('#boardSlot')) fullscreen(); });

async function markHere() {
  const ck = ST.attendCheck && ST.attendCheck.id ? ST.attendCheck.id : 'join';
  if (hereDone[ck]) { toast('Already marked — thank you!'); return; }
  try { await net.markHere(ck); hereDone[ck] = 1; toast('Marked present. Thank you!', 'ok'); }
  catch (e) { hereDone[ck] = 1; toast('Already marked — thank you!'); }
  $('#hereBtn').classList.remove('pulse'); $('#hereBtn').classList.add('on');
}

/* ---------- chits ---------- */
$('#chitQ').addEventListener('input', () => ($('#chitN').textContent = $('#chitQ').value.length + ' / 600'));
$('#chitSend').onclick = async () => {
  const q = $('#chitQ').value.trim(); if (!q) { $('#chitQ').focus(); return; }
  const b = $('#chitSend'); b.disabled = true;
  try {
    await net.sendChit(q, chitPath());
    $('#chitQ').value = ''; $('#chitN').textContent = '0 / 600';
    toast('Folded and passed forward. Only sir can read it.', 'ok');
    if (room && mySeat) room.playChit(chitPath());          // you see it at once, without waiting for the round trip
    if (DEV === 'phone' || LAYOUT === 'board') closeDrawers();
  } catch (e) { toast('Could not send the chit. Check your internet.', 'bad'); }
  b.disabled = false;
};
/* through the students sitting in front of me in my column, then to sir */
function chitPath() {
  if (!mySeat) return [];
  const r = +mySeat[1], c = mySeat[3], path = [mySeat];
  for (let i = r - 1; i >= 0; i--) { const sid = `r${i}c${c}`; if (SEATS[sid] && PLAYERS[SEATS[sid].u] && PLAYERS[SEATS[sid].u].seat === sid) path.push(sid); }
  return path;
}
function drawChits() {
  const l = Object.entries(CHITS).sort((a, b) => (b[1].at || 0) - (a[1].at || 0));
  const unread = l.filter(([, c]) => c.reply && (c.rAt || 0) > askSeen).length;
  $('#askBadge').hidden = !unread; $('#askBadge').textContent = unread;
  for (const [, c] of l) if (c.reply && (c.rAt || 0) > askSeen && $('#pAsk').classList.contains('on') === false && (c.rAt || 0) > (window._lastReplyToast || 0)) { window._lastReplyToast = c.rAt; toast('Sir answered your chit!', 'ok'); }
  $('#myChits').innerHTML = l.length ? l.map(([, c]) => `<div class="chit${c.reply ? ' answered' : ''}"><p class="q">${esc(c.q)}</p>${c.reply ? `<p class="a"><b>Sir:</b> ${esc(c.reply)}</p>` : '<p class="tiny muted">Waiting for sir…</p>'}</div>`).join('') : '<p class="muted small">None yet.</p>';
}
new MutationObserver(() => { if ($('#pAsk').classList.contains('on')) { const m = Math.max(0, ...Object.values(CHITS).map(c => c.rAt || 0)); if (m > askSeen) { askSeen = m; store.set('askSeen', m); drawChits(); } } })
  .observe($('#pAsk'), { attributes: true, attributeFilter: ['class'] });

/* ---------- stationery ---------- */
function paintItems() {
  if (!room) return;
  const map = {};
  for (const id in ITEMSV) { const it = ITEMSV[id]; const s = seatOf(it.h); if (s) (map[s] = map[s] || []).push(it.k); }
  room.setDeskItems(map);
}
let kitKey = '';
function drawKit() {
  if (!U) return;
  /* redraw only when something you can see changed — not every time someone takes a step */
  const key = JSON.stringify([mySeat, ITEMSV, Object.entries(PLAYERS).map(([u, p]) => [u, p.n, seatOf(u)])]);
  if (key === kitKey) return; kitKey = key;
  const mine = Object.entries(ITEMSV).filter(([, it]) => it.o === U.uid || it.h === U.uid);
  $('#myKit').innerHTML = mine.length ? mine.map(([id, it]) => {
    const I = ITEMS[it.k] || { name: it.k, icon: '' };
    const lent = it.o === U.uid && it.h !== U.uid, borrowed = it.o !== U.uid;
    const who = n => esc((PLAYERS[n] || {}).n || 'a classmate');
    return `<div class="kitem${lent ? ' away' : ''}"><span class="ki">${I.icon}</span><div><b>${I.name}</b><small>${lent ? 'Lent to ' + who(it.h) : borrowed ? 'Borrowed from ' + who(it.o) : 'Yours'}</small></div>${borrowed ? `<button class="btn sm" data-back="${esc(id)}">Give back</button>` : ''}</div>`;
  }).join('') : '<p class="muted small">Your kit appears when you sit down.</p>';
  /* classmates near me who have something I don't */
  const have = new Set(mine.filter(([, it]) => it.h === U.uid).map(([, it]) => it.k));
  const near = Object.entries(PLAYERS).filter(([uid, p]) => uid !== U.uid && seatOf(uid))
    .map(([uid, p]) => ({ uid, p, d: mySeat ? Math.abs(+p.seat[1] - +mySeat[1]) + Math.abs(+p.seat[3] - +mySeat[3]) : 9 })).sort((a, b) => a.d - b.d).slice(0, 8);
  $('#lenders').innerHTML = near.length ? near.map(({ uid, p }) => {
    const theirs = Object.values(ITEMSV).filter(it => it.o === uid && it.h === uid && !have.has(it.k));
    return `<div class="lender"><div><b>${esc(p.n)}</b><small>${seatName(p.seat)}</small></div><div class="chips">${theirs.length ? theirs.map(it => `<button class="btn sm" data-borrow="${esc(uid)}" data-k="${it.k}">${(ITEMS[it.k] || {}).icon} ${(ITEMS[it.k] || {}).name}</button>`).join('') : '<small class="muted">nothing spare</small>'}</div></div>`;
  }).join('') : '<p class="muted small">Nobody is sitting near you yet.</p>';
  const lentOut = mine.some(([, it]) => it.o !== U.uid);
  $('#kitBadge').hidden = !lentOut; $('#kitBadge').textContent = '•';
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-borrow]');
  if (b) {
    if (!mySeat) { toast('Sit down first.'); return; }
    b.disabled = true;
    try { await net.ask(b.dataset.borrow, b.dataset.k); toast('Asked. Waiting for them to say yes…'); } catch (x) { toast('Could not ask right now.', 'bad'); }
    setTimeout(() => (b.disabled = false), 4000);
  }
  const g = e.target.closest('[data-back]');
  if (g) {
    const it = ITEMSV[g.dataset.back]; if (!it) return;
    try { await net.giveBack(g.dataset.back, it, seatOf(it.o)); toast('Given back. Thanks!', 'ok'); if (room && mySeat && seatOf(it.o)) room.playPass(mySeat, seatOf(it.o), it.k); } catch (x) { toast('Could not give it back right now.', 'bad'); }
  }
});
let asking = false;
async function askQueue() {
  if (asking) return;
  const first = Object.entries(ASKS).filter(([id]) => !handled.has(id)).sort((a, b) => a[1].at - b[1].at)[0]; if (!first) return;
  const [id, a] = first; asking = true; handled.add(id);
  const I = ITEMS[a.k] || { name: a.k };
  const mine = ITEMSV[U.uid + '_' + a.k], free = mine && mine.h === U.uid;
  let yes = false;
  if (free) yes = await ask('Can I borrow it?', `${a.n} asks to borrow your ${I.name.toLowerCase()}.`, [['No, sorry', 0], ['Lend it', 1]]);
  try { await net.answer(id, a, !!yes && free, seatOf(a.f)); if (yes && room && mySeat && seatOf(a.f)) room.playPass(mySeat, seatOf(a.f), a.k); } catch (e) {}
  asking = false;
  setTimeout(askQueue, 300);
}

/* ---------- people ---------- */
let peopleKey = '';
function people() {
  const list = Object.entries(PLAYERS);
  const key = JSON.stringify(list.map(([u, p]) => [u, p.n, p.av, p.seat, p.hand, p.dev]));
  if (key === peopleKey) return; peopleKey = key;
  $('#tCount').textContent = list.length + ' in class';
  $('#peopleH').textContent = list.length + ' in class';
  $('#peopleList').innerHTML = list.sort((a, b) => String(a[1].seat || 'z').localeCompare(String(b[1].seat || 'z'))).map(([uid, p]) =>
    `<div class="person${uid === U.uid ? ' me' : ''}"><span class="pav">${portrait(byId(p.av))}</span><div><b>${esc(p.n)}${uid === U.uid ? ' (you)' : ''}</b><small>${p.seat ? seatName(p.seat) : 'walking around'}${p.dev === 'm' ? ' · phone' : ''}</small></div>${p.hand ? '<span class="hand-on">Hand up</span>' : ''}</div>`).join('');
  if ($('#pKit').classList.contains('on')) drawKit();
}

/* ---------- tutes ---------- */
const DEFAULT_TUTE = { id: 'logic-gates', title: 'Logic Gates — Complete Theory + Practice', cover: 'assets/logic-gate-cover.png' };
const tutes = () => { const t = ST.tutes ? Object.entries(ST.tutes).map(([id, v]) => ({ id, ...v })).sort((a, b) => (a.order || 0) - (b.order || 0)) : []; return t.length ? t : [DEFAULT_TUTE]; };
const BYTES = new Map();
async function tuteBytes(t) {
  if (BYTES.has(t.id)) return BYTES.get(t.id);
  let buf = null;
  if (t.url) { const r = await fetch(t.url); if (r.ok) buf = await r.arrayBuffer(); }
  else if (t.file && ST.server) {
    const r = await fetch(ST.server, { method: 'POST', body: JSON.stringify({ action: 'tute', token: await U.getIdToken(), room: ROOM_ID, id: t.file }) });
    const j = await r.json(); if (!j.ok) throw new Error(j.error);
    const bin = atob(j.data); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); buf = a.buffer;
  }
  if (buf) BYTES.set(t.id, buf);
  return buf;
}
function openTute(chooser) {
  const list = tutes();
  if (chooser && list.length > 1) {
    $('#tuteList').innerHTML = list.map(t => `<button class="tcard" data-tute="${esc(t.id)}"><img src="${esc(t.cover || DEFAULT_TUTE.cover)}" alt=""><b>${esc(t.title)}</b></button>`).join('');
    openDrawer('#pTutes'); return;
  }
  const t = list.find(x => x.id === ST.deskTute) || list[0];
  showTute(t);
}
function showTute(t) {
  if (!reader) { reader = createReader($('#pTute'), tuteBytes); reader.onclose = () => placeZoom(true); }
  closeDrawers('#pTute'); reader.open(t); setTimeout(() => placeZoom(true), 350);
}
document.addEventListener('click', e => { const t = e.target.closest('[data-tute]'); if (t) { const x = tutes().find(y => y.id === t.dataset.tute); if (x) showTute(x); } });

/* ---------- leaving ---------- */
async function leaveRoom(msg) {
  if (!inRoom) return; inRoom = false;
  await leaveZoom(); await net.leave(); mySeat = null;
  if (room) { room.dispose(); room = null; roomLoading = null; }
  closeDrawers(); exitFull();
  Object.keys(PLAYERS).forEach(k => delete PLAYERS[k]);
  location.hash = ''; if (msg) setTimeout(() => toast(msg), 200);
  /* the simplest clean slate: back to the lobby page */
  setTimeout(() => location.reload(), msg ? 2600 : 50);
}
addEventListener('pagehide', () => { if (inRoom) { try { net.leave(); } catch (e) {} } });

/* ---------- small helpers ---------- */
function hint(t, ms) { const h = $('#hint'); h.textContent = t; h.hidden = false; clearTimeout(h._t); h._t = setTimeout(() => (h.hidden = true), ms || 4000); }
function ask(title, body, buttons) {
  return new Promise(res => {
    $('#mT').textContent = title; $('#mB').textContent = body;
    $('#mA').innerHTML = buttons.map(([t, v], i) => `<button class="btn ${i === buttons.length - 1 ? 'primary' : 'ghost'}" data-v="${v}">${esc(t)}</button>`).join('');
    $('#modal').hidden = false; $('#mA').lastElementChild.focus();
    const done = v => { $('#modal').hidden = true; $('#mA').onclick = null; res(v); };
    $('#mA').onclick = e => { const b = e.target.closest('[data-v]'); if (b) done(+b.dataset.v); };
    setTimeout(() => { if (!$('#modal').hidden && $('#mT').textContent === title) done(0); }, 60000);
  });
}

/* test hook, only on the local test copy that talks to the emulators */
if (window.VC_EMU) window.__vc = { room: () => room, seat: () => mySeat, players: () => PLAYERS, layout: () => LAYOUT, choose: chooseSeat };

boot();
