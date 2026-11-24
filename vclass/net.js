/* ============================================================
   EICT Virtual Academy — the live classroom connection.

   Everything students share in real time lives in the Firebase
   Realtime Database under vc/{room}/ :
     state      the class: open / live, title, Zoom fallback link,
                tutes, announcement, attendance check  (sir writes)
     allow      who is invited today (sir writes; each student can
                read only their own line)
     players    who is in the room: display name, look, seat,
                position, animation, raised hand
     seats      one lock per chair — the database rules let only
                one student hold a chair at a time
     fx         short animations everybody sees (a chit going
                forward, a pen being passed) — never the words
     chits      the questions themselves: only that student and
                sir can read them
     items      pens, pencils… who owns each and who holds it now
     asks       "may I borrow your pen?" — waits for the owner's yes
     log, att   attendance (sir reads)
   When a student's connection drops, the server itself removes
   them from the room and frees their chair (onDisconnect).
   ============================================================ */

const G = 'https://www.gstatic.com/firebasejs/11.0.2/firebase-';

const ico = (d, c) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${c}" d="${d}"/></svg>`;
export const ITEMS = {
  pen:    { name: 'Blue pen',    icon: ico('M19.4 2.6a2 2 0 0 1 2.8 2.8L8.5 19.1 3 21l1.9-5.5z', '#3b82f6') },
  pencil: { name: 'Pencil',      icon: ico('M17 2l5 5L8 21H3v-5zM3 21l2-5 3 3z', '#f2c14e') },
  eraser: { name: 'Eraser',      icon: ico('M15.5 3 21 8.5 11.5 18H6.5L3 14.5z', '#f48fb1') },
  ruler:  { name: 'Ruler',       icon: ico('M2 16 16 2l6 6L8 22zm4.5-1.5 1.5 1.5 1-1-1.5-1.5zm3-3 1.5 1.5 1-1-1.5-1.5zm3-3 1.5 1.5 1-1-1.5-1.5z', '#7dd3fc') },
  marker: { name: 'Highlighter', icon: ico('M14 3l7 7-8 8H9v-4zM9 14v4l-3 3H3z', '#c6ff00') },
};

/* the same three stationery items for a student on every device */
export function kitFor(uid) {
  let h = 2166136261;
  for (const c of uid) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const all = Object.keys(ITEMS);
  const out = [];
  while (out.length < 3) { const k = all[h % all.length]; if (!out.includes(k)) out.push(k); h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0; }
  return out;
}

export async function openNet(app, { room = 'main', url, emu } = {}) {
  const R = await import(G + 'database.js');
  const db = R.getDatabase(app, url);
  if (emu) R.connectDatabaseEmulator(db, emu.host, emu.port);
  return new Net(R, db, room);
}

class Net {
  constructor(R, db, room) {
    this.R = R; this.db = db; this.room = room;
    this.uid = null; this.me = null; this.seat = null; this.sess = null;
    this.offset = 0; this.offs = []; this.connected = false;
    this._discSeat = null; this._logRef = null; this._last = 0; this._pending = null; this._timer = null;
    const off = R.onValue(R.ref(db, '.info/serverTimeOffset'), s => { this.offset = s.val() || 0; });
    this.offs.push(off);
  }
  ref(p) { return this.R.ref(this.db, `vc/${this.room}/${p}`); }
  now() { return Date.now() + this.offset; }
  get TS() { return this.R.serverTimestamp(); }

  /* ---------------- listening ---------------- */
  on(path, cb, err) {
    const off = this.R.onValue(this.ref(path), s => cb(s.val()), e => err && err(e));
    this.offs.push(off); return off;
  }
  /* child-level listeners so 40 students moving don't re-send the whole room */
  onChildren(path, { add, change, remove }, err) {
    const r = this.ref(path), R = this.R;
    const a = R.onChildAdded(r, s => add && add(s.key, s.val()), e => err && err(e));
    const c = R.onChildChanged(r, s => change && change(s.key, s.val()));
    const d = R.onChildRemoved(r, s => remove && remove(s.key, s.val()));
    this.offs.push(a, c, d);
  }
  onFx(cb) {
    const q = this.R.query(this.ref('fx'), this.R.orderByChild('at'), this.R.startAt(this.now() - 15000));
    const off = this.R.onChildAdded(q, s => { const v = s.val(); if (v && this.now() - (v.at || 0) < 20000) cb(s.key, v); });
    this.offs.push(off);
  }
  onConnected(cb) {
    const off = this.R.onValue(this.R.ref(this.db, '.info/connected'), s => { this.connected = !!s.val(); cb(this.connected); });
    this.offs.push(off);
  }

  /* ---------------- presence ---------------- */
  async enter(uid, profile, sess) {
    this.uid = uid; this.me = profile; this.sess = sess || null;
    const R = this.R, pRef = this.ref('players/' + uid);
    await R.onDisconnect(pRef).remove();
    const data = { n: profile.n, av: profile.av, dev: profile.dev, a: 'idle', t: this.TS,
                   x: +(profile.x || 0).toFixed(2), z: +(profile.z || 0).toFixed(2), ry: +(profile.ry || 0).toFixed(3) };
    await R.set(pRef, data);
    if (this.sess) {
      this._logRef = R.push(this.ref(`log/${this.sess}/${uid}`));
      await R.set(this._logRef, { in: this.TS, dev: profile.dev });
      await R.onDisconnect(this._logRef).update({ out: R.serverTimestamp() });   // after the line exists, so the rules accept it
    }
    await this.ensureKit();
  }
  async ensureKit() {
    const R = this.R, up = {};
    const have = (await R.get(this.R.query(this.ref('items'), R.orderByChild('o'), R.equalTo(this.uid)))).val() || {};
    for (const k of kitFor(this.uid)) { const id = this.uid + '_' + k; if (!have[id]) up['items/' + id] = { o: this.uid, h: this.uid, k }; }
    if (Object.keys(up).length) await R.update(this.ref(''), up);
  }
  async leave() {
    const R = this.R;
    try {
      if (this._logRef) { await R.update(this._logRef, { out: this.TS }); await R.onDisconnect(this._logRef).cancel(); }
      if (this.seat) await this.releaseSeat();
      if (this.uid) await R.remove(this.ref('players/' + this.uid));
    } catch (e) {}
    this._logRef = null;
  }
  stop() { this.offs.forEach(f => { try { f(); } catch (e) {} }); this.offs = []; }

  /* position: at most ~7 updates a second, and only when something changed */
  move(st) {
    this._pending = Object.assign(this._pending || {}, st);
    const gap = this.now() - this._last;
    if (gap >= 140) this._flush();
    else if (!this._timer) this._timer = setTimeout(() => this._flush(), 140 - gap);
  }
  _flush() {
    clearTimeout(this._timer); this._timer = null;
    if (!this._pending || !this.uid) return;
    const p = this._pending; this._pending = null; this._last = this.now();
    const up = { t: this.TS };
    if (p.x != null) up.x = +p.x.toFixed(2);
    if (p.z != null) up.z = +p.z.toFixed(2);
    if (p.ry != null) up.ry = +p.ry.toFixed(3);
    if (p.a) up.a = p.a;
    if (p.hand != null) up.hand = !!p.hand;
    this.R.update(this.ref('players/' + this.uid), up).catch(() => {});
  }

  /* ---------------- seats ---------------- */
  async claimSeat(sid) {
    const R = this.R, up = {};
    up['seats/' + sid] = { u: this.uid, at: this.TS };
    up['players/' + this.uid + '/seat'] = sid;
    if (this.seat && this.seat !== sid) up['seats/' + this.seat] = null;
    await R.update(this.ref(''), up);           // the rules refuse it if someone holds that chair
    if (this._discSeat) { try { await R.onDisconnect(this._discSeat).cancel(); } catch (e) {} }
    this._discSeat = this.ref('seats/' + sid);
    await R.onDisconnect(this._discSeat).remove();
    this.seat = sid;
    return sid;
  }
  async releaseSeat() {
    if (!this.seat) return;
    const R = this.R, sid = this.seat, disc = this._discSeat; this.seat = null; this._discSeat = null;
    /* free the chair first; only then stop the "free it if I vanish" safety net */
    await R.update(this.ref(''), { ['seats/' + sid]: null, ['players/' + this.uid + '/seat']: null }).catch(() => {});
    try { if (disc) await R.onDisconnect(disc).cancel(); } catch (e) {}
  }
  /* first free chair from the given order; two phones asking at once each get their own */
  async autoSeat(order, taken) {
    for (const sid of order) {
      if (taken(sid)) continue;
      try { return await this.claimSeat(sid); } catch (e) { /* someone was faster — next chair */ }
    }
    return null;
  }

  /* ---------------- chits, stationery, attendance ---------------- */
  async sendChit(q, path) {
    const R = this.R;
    const r = R.push(this.ref('chits/' + this.uid));
    await R.set(r, { q, at: this.TS, n: this.me.n, seat: this.seat || '', sess: this.sess || '' });
    await this.fx({ k: 'chit', path: path.slice(0, 12), from: this.seat || '' });
    return r.key;
  }
  fx(o) { return this.R.push(this.ref('fx'), Object.assign({ by: this.uid, at: this.TS }, o)); }
  ask(toUid, k) { return this.R.push(this.ref('asks/' + toUid), { f: this.uid, k, n: this.me.n, at: this.TS }); }
  async answer(id, a, yes, toSeat) {
    const R = this.R;
    if (yes) {
      await R.update(this.ref('items/' + this.uid + '_' + a.k), { h: a.f });
      await this.fx({ k: 'lend', item: a.k, from: this.seat || '', to: toSeat || '' });
    } else await this.fx({ k: 'no', item: a.k, to: a.f });
    await R.remove(this.ref(`asks/${this.uid}/${id}`));
  }
  async giveBack(itemId, it, ownerSeat) {
    await this.R.update(this.ref('items/' + itemId), { h: it.o });
    await this.fx({ k: 'back', item: it.k, from: this.seat || '', to: ownerSeat || '' });
  }
  markHere(check) { return this.R.set(this.ref(`att/${this.sess || 'none'}/${this.uid}/${check}`), this.TS); }
}
