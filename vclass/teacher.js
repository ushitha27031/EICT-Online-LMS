/* ============================================================
   EICT Virtual Academy — sir's desk.
   Open / start / end the class, who may come in, the seats,
   the chits, attendance, the tutes and the Zoom settings.
   Only sir's account can read or change any of this: the
   Realtime Database rules check the email on every request.
   ============================================================ */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let tt; const toast = (t, k) => { const e = $('#toast'); e.textContent = t; e.className = 'toast on ' + (k || ''); clearTimeout(tt); tt = setTimeout(() => (e.className = 'toast ' + (k || '')), 3400); };
const OWNER = 'ushithasamudaya@gmail.com';
const ROOM = (new URLSearchParams(location.search).get('room') || 'main').replace(/[^a-z0-9-]/g, '') || 'main';
const DEFAULT_ZOOM = 'https://cuny.zoom.us/j/8651803410';
const show = id => ['#gate', '#no', '#app', '#boot'].forEach(s => ($(s).hidden = s !== id));
const fmtT = t => t ? new Date(t).toLocaleTimeString('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit' }) : '—';
const seatName = sid => { const m = /^r(\d)c(\d)$/.exec(sid || ''); return m ? `R${+m[1] + 1}·S${+m[2] + 1}` : '—'; };

let FB, auth, F, fs, R, db, U;
let STUD = {}, ST = {}, ALLOW = {}, BLOCK = {}, PLAYERS = {}, SEATS = {}, CHITS = {}, LOG = {}, ATT = {};
const ref = p => R.ref(db, `vc/${ROOM}/${p}`);
const TS = () => R.serverTimestamp();

async function act(btn, fn, ok) {
  if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Please wait…'; }
  try { const r = await fn(); if (ok) toast(ok, 'ok'); return r; }
  catch (e) { console.error(e); toast(e.user ? e.message : 'That did not work: ' + (e.code || e.message), 'bad'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; } }
}
const stop = m => { const e = new Error(m); e.user = 1; throw e; };

async function boot() {
  const cfg = window.FIREBASE_CONFIG, G = 'https://www.gstatic.com/firebasejs/11.0.2/firebase-';
  const [A, Au, Fs, Db] = await Promise.all([import(G + 'app.js'), import(G + 'auth.js'), import(G + 'firestore.js'), import(G + 'database.js')]);
  const app = A.initializeApp(cfg);
  FB = Au; auth = Au.getAuth(app); F = Fs; fs = Fs.getFirestore(app); R = Db;
  db = Db.getDatabase(app, cfg.databaseURL || 'https://eict-60955-default-rtdb.asia-southeast1.firebasedatabase.app');
  const emu = window.VC_EMU;
  if (emu) { Au.connectAuthEmulator(auth, emu.auth, { disableWarnings: true }); Db.connectDatabaseEmulator(db, emu.db.host, emu.db.port); if (emu.fs) Fs.connectFirestoreEmulator(fs, emu.fs.host, emu.fs.port); }
  Au.onAuthStateChanged(auth, u => {
    U = u;
    if (!u) return show('#gate');
    if ((u.email || '').toLowerCase() !== OWNER) return show('#no');
    show('#app'); start();
  });
}
$('#gform').onsubmit = async e => { e.preventDefault(); $('#gerr').textContent = ''; try { await FB.signInWithEmailAndPassword(auth, $('#em').value.trim(), $('#pw').value); } catch (x) { $('#gerr').textContent = 'Wrong email or password.'; } };
$('#so').onclick = $('#so2').onclick = () => FB.signOut(auth);

/* ---------- tabs ---------- */
$$('[data-tab]').forEach(b => b.onclick = () => {
  $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  $$('[data-pane]').forEach(p => (p.hidden = p.dataset.pane !== b.dataset.tab));
  if (b.dataset.tab === 'att') drawAtt();
});

let started = false;
async function start() {
  if (started) return; started = true;
  try {
    const s = await F.getDocs(F.collection(fs, 'students'));
    s.forEach(d => { const v = d.data(); STUD[d.id] = { name: v.name || '', code: v.code || '', batch: v.batch || '' }; });
  } catch (e) { toast('Could not load the student list: ' + (e.code || e.message), 'bad'); }
  drawBatches();
  R.onValue(ref('state'), s => { ST = s.val() || {}; drawState(); });
  R.onValue(ref('allow'), s => { ALLOW = s.val() || {}; drawCount(); drawLive(); });
  R.onValue(ref('block'), s => { BLOCK = s.val() || {}; drawBlocked(); });
  R.onValue(ref('players'), s => { PLAYERS = s.val() || {}; drawLive(); });
  R.onValue(ref('seats'), s => { SEATS = s.val() || {}; drawLive(); });
  R.onValue(ref('chits'), s => { const v = s.val() || {}; newChits(v); CHITS = v; drawChits(); });
  R.onValue(ref('log'), s => { LOG = s.val() || {}; drawSessions(); });
  R.onValue(ref('att'), s => { ATT = s.val() || {}; drawSessions(); });
}

/* =========================================================
   class
   ========================================================= */
function drawBatches() {
  const count = {}; Object.values(STUD).forEach(s => { if (s.batch) count[s.batch] = (count[s.batch] || 0) + 1; });
  const keep = new Set(ST.batches || []);
  $('#cBatches').innerHTML = Object.keys(count).sort().map(b => `<label><input type="checkbox" value="${esc(b)}" ${keep.has(b) ? 'checked' : ''}> ${esc(b)} <small class="muted">(${count[b]})</small></label>`).join('') || '<span class="muted small">No students found.</span>';
  $('#cBatches').onchange = drawCount;
}
function wanted() {
  const bs = new Set($$('#cBatches input:checked').map(i => i.value));
  const extra = new Set($('#cExtra').value.split(/[\s,]+/).map(x => x.trim().toUpperCase()).filter(Boolean));
  const out = {};
  for (const [uid, s] of Object.entries(STUD)) {
    if (BLOCK[uid]) continue;
    if (bs.has(s.batch) || extra.has(String(s.code).toUpperCase())) out[uid] = { n: s.name.slice(0, 60) || 'Student', c: s.code, b: s.batch };
  }
  return { list: out, batches: [...bs], extra: [...extra] };
}
function drawCount() { const w = wanted(); $('#cCount').textContent = `${Object.keys(w.list).length} students will be let in.` + (ST.open ? ` (${Object.keys(ALLOW).length} on the list now)` : ''); }
let formFilled = false;
function drawState() {
  $('#stOpen').textContent = ST.open ? 'open' : 'closed'; $('#stOpen').className = 'pill ' + (ST.open ? '' : 'dim'); $('#stOpen').style.background = ST.open ? '#0f766e' : '';
  $('#stLive').hidden = !ST.live;
  if (!formFilled) {
    formFilled = true;
    $('#cTitle').value = ST.title || ''; $('#cTopic').value = ST.topic || ''; $('#cExtra').value = (ST.extra || []).join(', ');
    $('#zUrl').value = ST.zoomUrl || DEFAULT_ZOOM; $('#zEmbed').checked = ST.embed !== false; $('#zServer').value = ST.server || '';
    drawBatches();
  }
  $('#bOpen').textContent = ST.open ? 'Update class list & title' : 'Open classroom';
  $('#bLive').hidden = !!ST.live; $('#bPause').hidden = !ST.live;
  $('#aText').placeholder = ST.announce && ST.announce.text ? 'Now showing: ' + ST.announce.text : 'e.g. Open your tute at page 12';
  drawTutes(); drawCount();
}
$('#bOpen').onclick = e => act(e.target, async () => {
  const w = wanted();
  if (!Object.keys(w.list).length) stop('Tick at least one batch (or add student numbers).');
  const up = { title: $('#cTitle').value.trim(), topic: $('#cTopic').value.trim(), batches: w.batches, extra: w.extra, open: true };
  if (!ST.open || !ST.session) { up.session = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Colombo' }).slice(0, 16).replace(/[ :]/g, '-'); up.openedAt = TS(); }
  if (!ST.zoomUrl) up.zoomUrl = DEFAULT_ZOOM;
  await R.set(ref('allow'), w.list);
  await R.update(ref('state'), up);
}, ST.open ? 'Updated.' : 'The classroom is open.');
$('#bLive').onclick = e => act(e.target, async () => {
  if (!ST.open) stop('Open the classroom first.');
  await R.update(ref('state'), { live: true, liveAt: TS() });
}, 'Lecture started — students can join it now.');
$('#bPause').onclick = e => act(e.target, () => R.update(ref('state'), { live: false }), 'Lecture paused.');
$('#bEnd').onclick = e => act(e.target, async () => {
  if (!confirm('End the class? Everyone is sent out of the room.')) return;
  const up = { 'state/open': false, 'state/live': false, 'state/attendCheck': null, players: null, seats: null, fx: null, asks: null };
  /* lent pens go back to their owners */
  const it = (await R.get(ref('items'))).val() || {};
  for (const id in it) if (it[id].h !== it[id].o) up['items/' + id + '/h'] = it[id].o;
  await R.update(ref(''), up);
}, 'Class ended. Attendance is saved.');
$('#aSend').onclick = e => act(e.target, async () => { const t = $('#aText').value.trim(); if (!t) stop('Write the announcement first.'); await R.update(ref('state'), { announce: { text: t, at: TS() } }); $('#aText').value = ''; }, 'Sent to the class.');
$('#aClear').onclick = e => act(e.target, () => R.update(ref('state'), { announce: null }), 'Cleared.');
$('#bCheck').onclick = e => act(e.target, async () => { if (!ST.open) stop('Open the classroom first.'); await R.update(ref('state'), { attendCheck: { id: 'c' + Date.now(), at: TS() } }); }, 'Everyone has been asked.');
function drawBlocked() {
  const l = Object.entries(BLOCK);
  $('#blocked').innerHTML = l.length ? l.map(([uid, b]) => `<div class="row-end" style="margin:4px 0"><span>${esc((STUD[uid] || {}).name || b.n || uid)} <small class="muted">${esc((STUD[uid] || {}).code || '')}</small></span><button class="btn sm" data-unblock="${esc(uid)}">Let back in</button></div>`).join('') : 'Nobody.';
}

/* =========================================================
   students & seats
   ========================================================= */
const who = uid => STUD[uid] || ALLOW[uid] && { name: ALLOW[uid].n, code: ALLOW[uid].c, batch: ALLOW[uid].b } || { name: '?', code: '' };
function drawLive() {
  const ps = Object.entries(PLAYERS);
  $('#nIn').textContent = ps.length; $('#nSeat').textContent = ps.filter(([, p]) => p.seat).length;
  $('#nHand').textContent = ps.filter(([, p]) => p.hand).length; $('#nPhone').textContent = ps.filter(([, p]) => p.dev === 'm').length;
  const bySeat = {}; for (const [sid, s] of Object.entries(SEATS)) if (PLAYERS[s.u] && PLAYERS[s.u].seat === sid) bySeat[sid] = s.u;
  let h = '<div class="board">SMARTBOARD</div>';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
    const sid = `r${r}c${c}`, u = bySeat[sid];
    h += `<button class="s${u ? ' full' : ''}" ${u ? `data-free="${sid}"` : ''} title="${u ? 'Free this seat' : 'Empty'}"><span class="mono">${seatName(sid)}</span>${u ? `<b>${esc(who(u).name.split(' ')[0])}</b>${PLAYERS[u].hand ? '<span class="hand-on">Hand up</span>' : ''}` : '<span class="muted">—</span>'}</button>`;
  }
  $('#seatmap').innerHTML = h;
  $('#liveRows').innerHTML = ps.sort((a, b) => String(a[1].seat || 'z').localeCompare(String(b[1].seat || 'z'))).map(([uid, p]) => {
    const w = who(uid);
    return `<tr><td><b>${esc(w.name)}</b><br><small class="muted">${esc(w.code)} · shows as "${esc(p.n)}"</small>${p.hand ? '<br><span class="hand-on">Hand up</span>' : ''}</td><td>${seatName(p.seat)}</td><td>${{ m: 'Phone', t: 'Tablet', d: 'Computer' }[p.dev] || '—'}</td>
      <td><div class="btns" style="margin:0">${p.hand ? `<button class="btn sm" data-lower="${esc(uid)}">Lower hand</button>` : ''}<button class="btn sm danger" data-kick="${esc(uid)}">Remove</button></div></td></tr>`;
  }).join('') || '<tr><td colspan="4" class="muted">Nobody in the room yet.</td></tr>';
}
document.addEventListener('click', e => {
  const f = e.target.closest('[data-free]');
  if (f) { const sid = f.dataset.free, u = SEATS[sid] && SEATS[sid].u; act(null, () => R.update(ref(''), { ['seats/' + sid]: null, ...(u && PLAYERS[u] ? { ['players/' + u + '/seat']: null, ['players/' + u + '/a']: 'idle' } : {}) }), 'Seat freed.'); }
  const k = e.target.closest('[data-kick]');
  if (k) {
    const uid = k.dataset.kick, w = who(uid);
    if (!confirm(`Remove ${w.name} from this class? They cannot come back in until you let them.`)) return;
    const p = PLAYERS[uid] || {};
    act(null, () => R.update(ref(''), { ['allow/' + uid]: null, ['players/' + uid]: null, ...(p.seat ? { ['seats/' + p.seat]: null } : {}), ['block/' + uid]: { n: w.name || '', at: TS() } }), 'Removed.');
  }
  const l = e.target.closest('[data-lower]'); if (l) act(null, () => R.update(ref('players/' + l.dataset.lower), { hand: false }));
  const ub = e.target.closest('[data-unblock]'); if (ub) act(null, () => R.remove(ref('block/' + ub.dataset.unblock)), 'They can come in after you press "Update class list".');
});

/* =========================================================
   chits
   ========================================================= */
let CF = 'open', seenChits = null;
const flat = v => { const o = []; for (const uid in v) for (const id in v[uid]) o.push({ uid, id, ...v[uid][id] }); return o.sort((a, b) => (b.at || 0) - (a.at || 0)); };
function newChits(v) {
  const ids = new Set(flat(v).map(c => c.uid + '/' + c.id));
  if (seenChits) { const fresh = [...ids].filter(i => !seenChits.has(i)); if (fresh.length) alertNew(fresh.length, flat(v).find(c => fresh.includes(c.uid + '/' + c.id))); }
  seenChits = ids;
}
function alertNew(n, c) {
  toast(`New chit from ${who(c.uid).name}`, 'ok');
  try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(0.15, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.5); o.start(); o.stop(a.currentTime + 0.5); } catch (e) {}
  try { if (Notification.permission === 'granted' && document.hidden) new Notification('New chit', { body: `${who(c.uid).name}: ${String(c.q).slice(0, 100)}` }); } catch (e) {}
}
$('#notifyBtn').onclick = async () => { try { const p = await Notification.requestPermission(); toast(p === 'granted' ? 'Alerts on.' : 'Alerts are blocked in this browser.'); } catch (e) { toast('This browser has no alerts.'); } };
$$('[data-cf]').forEach(b => b.onclick = () => { CF = b.dataset.cf; $$('[data-cf]').forEach(x => x.setAttribute('aria-selected', String(x === b))); drawChits(); });
function drawChits() {
  const all = flat(CHITS), open = all.filter(c => !c.done);
  $('#chitBadge').hidden = !open.length; $('#chitBadge').textContent = open.length;
  document.title = (open.length ? `(${open.length}) ` : '') + 'Virtual Class Desk';
  const l = CF === 'open' ? open : CF === 'done' ? all.filter(c => c.done) : all;
  $('#inbox').innerHTML = l.length ? l.map(c => {
    const w = who(c.uid);
    return `<div class="chit${c.done ? ' answered' : ' new'}"><div class="who"><span><b>${esc(w.name)}</b> ${esc(w.code)} · ${seatName(c.seat)}</span><span>${fmtT(c.at)}</span></div>
      <p class="q">${esc(c.q)}</p>
      ${c.reply ? `<p class="a"><b>Your reply:</b> ${esc(c.reply)}</p>` : ''}
      <textarea data-reply-box="${esc(c.uid)}/${esc(c.id)}" maxlength="1000" placeholder="Reply — only ${esc(w.name.split(' ')[0] || 'they')} will see it">${c.reply ? esc(c.reply) : ''}</textarea>
      <div class="btns" style="margin:0"><button class="btn sm primary" data-reply="${esc(c.uid)}/${esc(c.id)}">${c.reply ? 'Update reply' : 'Send reply'}</button>${c.done ? '' : `<button class="btn sm" data-done="${esc(c.uid)}/${esc(c.id)}">Mark answered (in class)</button>`}</div></div>`;
  }).join('') : '<p class="muted">Nothing here.</p>';
}
document.addEventListener('click', e => {
  const r = e.target.closest('[data-reply]');
  if (r) { const k = r.dataset.reply, t = $(`[data-reply-box="${CSS.escape(k)}"]`).value.trim(); if (!t) return toast('Write the reply first.'); act(r, () => R.update(ref('chits/' + k), { reply: t, rAt: TS(), done: true }), 'Reply sent.'); }
  const d = e.target.closest('[data-done]'); if (d) act(d, () => R.update(ref('chits/' + d.dataset.done), { done: true }));
});

/* =========================================================
   attendance
   ========================================================= */
function drawSessions() {
  const s = [...new Set([...Object.keys(LOG), ...Object.keys(ATT)])].sort().reverse();
  const cur = $('#attSess').value;
  $('#attSess').innerHTML = s.map(x => `<option value="${esc(x)}">${esc(x.replace(/^(\d{4}-\d\d-\d\d)-(\d\d)-(\d\d)$/, '$1 $2:$3'))}${x === ST.session ? ' (now)' : ''}</option>`).join('') || '<option value="">No classes yet</option>';
  if (cur && s.includes(cur)) $('#attSess').value = cur;
  if (!$('[data-pane="att"]').hidden) drawAtt();
}
$('#attSess').onchange = drawAtt;
function attRows() {
  const sess = $('#attSess').value, lg = LOG[sess] || {}, at = ATT[sess] || {}, now = Date.now();
  return [...new Set([...Object.keys(lg), ...Object.keys(at)])].map(uid => {
    const ivs = Object.values(lg[uid] || {});
    const first = Math.min(...ivs.map(i => i.in || Infinity)), last = Math.max(...ivs.map(i => i.out || (ST.session === sess && PLAYERS[uid] ? now : i.in || 0)));
    const mins = Math.round(ivs.reduce((t, i) => t + Math.max(0, (i.out || (ST.session === sess && PLAYERS[uid] ? now : i.in)) - i.in), 0) / 60000);
    const w = who(uid);
    return { uid, code: w.code, name: w.name, batch: w.batch || '', first: isFinite(first) ? first : 0, last: last > 0 ? last : 0, mins, here: Object.keys(at[uid] || {}).length };
  }).sort((a, b) => String(a.code).localeCompare(String(b.code)));
}
function drawAtt() {
  const rows = attRows();
  $('#attRows').innerHTML = rows.map(r => `<tr><td class="mono">${esc(r.code)}</td><td>${esc(r.name)}</td><td>${esc(r.batch)}</td><td>${fmtT(r.first)}</td><td>${fmtT(r.last)}</td><td>${r.mins}</td><td>${r.here ? '<span class="ok">✓ ' + r.here + '</span>' : '<span class="muted">—</span>'}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">No one yet.</td></tr>';
}
$('#attCsv').onclick = () => {
  const rows = attRows(), q = v => `"${String(v).replace(/"/g, '""')}"`;
  const csv = ['Student number,Name,Batch,First in,Last out,Minutes,I\'m here taps', ...rows.map(r => [r.code, r.name, r.batch, fmtT(r.first), fmtT(r.last), r.mins, r.here].map(q).join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = `EICT attendance ${$('#attSess').value || 'class'}.csv`; a.click();
};

/* =========================================================
   lesson materials
   ========================================================= */
function drawTutes() {
  const l = Object.entries(ST.tutes || {}).sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
  $('#tuteRows').innerHTML = l.length ? l.map(([id, t]) => `<div class="tute-row"><img src="${esc(t.cover || 'assets/logic-gate-cover.png')}" alt=""><div><b>${esc(t.title)}</b><br><small class="muted">${t.file ? 'In your Drive' : t.url ? 'Web address' : 'Cover only'}${ST.deskTute === id ? ' · <span class="ok">On the desk</span>' : ''}</small></div>
    ${ST.deskTute === id ? '' : `<button class="btn sm" data-desk="${esc(id)}">Put on desk</button>`}<button class="btn sm danger" data-rmtute="${esc(id)}">Remove</button></div>`).join('')
    : '<p class="small muted">None yet. Until you add one, students see the Logic Gates cover with "PDF not online yet".</p>';
}
const b64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });
$('#tAdd').onclick = e => act(e.target, async () => {
  const title = $('#tTitle').value.trim(), f = $('#tFile').files[0], url = $('#tUrl').value.trim(), cover = $('#tCover').value.trim() || 'assets/logic-gate-cover.png';
  if (!title) stop('Give the tute a title.');
  if (!f && !url) stop('Choose a PDF file, or paste a PDF address.');
  const t = { title, cover, order: Object.keys(ST.tutes || {}).length + 1 };
  if (f) {
    if (!ST.server) stop('Set the class server URL in the Zoom tab first — tutes are kept in your Drive through it.');
    if (f.size > 40 * 1048576) stop('That PDF is over 40 MB. Compress it first.');
    $('#tMsg').textContent = 'Uploading to your Drive…';
    const r = await (await fetch(ST.server, { method: 'POST', body: JSON.stringify({ action: 'upload', token: await U.getIdToken(), name: title, data: await b64(f) }) })).json();
    if (!r.ok) stop('The class server said: ' + r.error);
    t.file = r.id;
  } else t.url = url;
  const id = R.push(ref('state/tutes')).key;
  await R.update(ref('state'), { ['tutes/' + id]: t, ...(ST.deskTute ? {} : { deskTute: id }) });
  $('#tTitle').value = $('#tUrl').value = ''; $('#tFile').value = ''; $('#tMsg').textContent = '';
}, 'Tute added — students can open it now.');
document.addEventListener('click', e => {
  const d = e.target.closest('[data-desk]'); if (d) act(d, () => R.update(ref('state'), { deskTute: d.dataset.desk }), 'Now on every desk.');
  const r = e.target.closest('[data-rmtute]'); if (r && confirm('Remove this tute from the class? (The file stays in your Drive.)')) act(r, () => R.update(ref('state'), { ['tutes/' + r.dataset.rmtute]: null, ...(ST.deskTute === r.dataset.rmtute ? { deskTute: null } : {}) }), 'Removed.');
});

/* =========================================================
   zoom
   ========================================================= */
$('#zSave').onclick = e => act(e.target, async () => {
  const url = $('#zUrl').value.trim(), server = $('#zServer').value.trim();
  if (url && !/^https:\/\/([a-z0-9-]+\.)*zoom\.us\//i.test(url)) stop('That does not look like a Zoom link.');
  if (server && !/^https:\/\/script\.google(usercontent)?\.com\//.test(server)) stop('The class server URL should start with https://script.google.com/');
  await R.update(ref('state'), { zoomUrl: url || null, server: server || null, embed: $('#zEmbed').checked });
}, 'Saved.');
async function post(action, extra) {
  if (!ST.server) stop('Save the class server URL first.');
  const r = await fetch(ST.server, { method: 'POST', body: JSON.stringify({ action, token: await U.getIdToken(), room: ROOM, ...(extra || {}) }) });
  return r.json();
}
$('#zTest').onclick = e => act(e.target, async () => {
  const s = await post('status'); if (!s.ok) stop('The server answered: ' + s.error);
  $('#zMsg').innerHTML = `<span class="${s.sdk ? 'ok' : 'bad'}">${s.sdk ? '✓' : '✗'} Zoom SDK keys</span> · <span class="${s.meeting ? 'ok' : 'bad'}">${s.meeting ? '✓ Meeting ' + esc(s.meeting) : '✗ No meeting number'}</span> · <span class="${s.hasPasscode ? 'ok' : 'muted'}">${s.hasPasscode ? '✓ passcode' : 'no passcode'}</span>${s.oauth ? ` · <span class="${s.obf ? 'ok' : 'bad'}">${s.obf ? '✓ Zoom connected' : '✗ Zoom not connected yet'}</span>` : ''}`;
  $('#zObf').hidden = !s.oauth;
}, 'The class server is working.');
$('#zMeet').onclick = e => act(e.target, async () => {
  const r = await post('meeting', { number: $('#zNum').value, passcode: $('#zPass').value });
  if (!r.ok) stop(r.error === 'number' ? 'A Zoom meeting number has 9 to 12 digits.' : 'The server answered: ' + r.error);
  $('#zPass').value = ''; $('#zMsg2').textContent = 'Saved on the server.';
}, 'Meeting saved on the server.');
$('#zConnect').onclick = e => act(e.target, async () => { const r = await post('zoomconnect'); if (!r.ok) stop(r.error); window.open(r.url, '_blank', 'noopener'); });

boot().catch(e => { $('#boot').innerHTML = '<p class="err">Cannot reach the class database: ' + esc(e.message) + '</p>'; });
