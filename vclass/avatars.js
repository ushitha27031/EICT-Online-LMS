/* ============================================================
   EICT Virtual Academy — the twelve students' looks.
   Each look has a portrait (drawn in the same style as the EICT
   avatar set) and a matching 3D character built from the same
   numbers, so the face you pick is the one that walks in.
   Looks 1, 2, 3, 4 and 7 are the original EICT avatars.
   ============================================================ */

export const AVATARS = [
  { id: 'b1', g: 'boy',  label: 'Teal tee',        skin: '#d49b74', hair: 'short',  hc: '#302822', top: '#237f92', kind: 'tee',    legs: '#2d3a4a' },
  { id: 'b2', g: 'boy',  label: 'Purple tee',      skin: '#9c654a', hair: 'short',  hc: '#302822', top: '#735b9a', kind: 'tee',    legs: '#3a3a40' },
  { id: 'b3', g: 'boy',  label: 'Blue tee, specs', skin: '#f1bd92', hair: 'short',  hc: '#302822', top: '#385d9b', kind: 'tee',    legs: '#40362e', glasses: 1 },
  { id: 'b4', g: 'boy',  label: 'Rust tee',        skin: '#79503b', hair: 'short',  hc: '#302822', top: '#b86d43', kind: 'tee',    legs: '#283344' },
  { id: 'b5', g: 'boy',  label: 'Green hoodie',    skin: '#c68a62', hair: 'curly',  hc: '#231c18', top: '#4d7c4f', kind: 'hoodie', legs: '#2b2f36' },
  { id: 'b6', g: 'boy',  label: 'Grey polo',       skin: '#a8704f', hair: 'side',   hc: '#1f1a17', top: '#5c6670', kind: 'polo',   legs: '#1f2b3d' },
  { id: 'g1', g: 'girl', label: 'Rose top',        skin: '#d49b74', hair: 'long',   hc: '#302822', top: '#9a537a', kind: 'tee',    legs: '#2d3a4a' },
  { id: 'g2', g: 'girl', label: 'Mustard top',     skin: '#8d5a3f', hair: 'pony',   hc: '#211a16', top: '#c99a2e', kind: 'tee',    legs: '#34303a' },
  { id: 'g3', g: 'girl', label: 'Navy, specs',     skin: '#f0c09a', hair: 'bob',    hc: '#3a2a20', top: '#2f4a7a', kind: 'shirt',  legs: '#4a3f36', glasses: 1 },
  { id: 'g4', g: 'girl', label: 'Maroon, braid',   skin: '#b37650', hair: 'braid',  hc: '#1c1613', top: '#8a3b4a', kind: 'tee',    legs: '#283344' },
  { id: 'g5', g: 'girl', label: 'Mint cardigan',   skin: '#e0a880', hair: 'bun',    hc: '#2b211b', top: '#3f8f80', kind: 'hoodie', legs: '#33302d' },
  { id: 'g6', g: 'girl', label: 'Lavender, waves', skin: '#6e4632', hair: 'wavy',   hc: '#1a1411', top: '#7b6bb0', kind: 'shirt',  legs: '#2b2f36' },
];
/* sir's own character: only sir's account can be him */
export const TEACHER = { id: 't1', g: 'teacher', label: 'Sir', skin: '#c68a62', hair: 'side', hc: '#1f1a17', top: '#f3f5f8', kind: 'shirt', legs: '#2b2f36', glasses: 1, tie: '#12355b' };
export const byId = id => (id === 't1' ? TEACHER : AVATARS.find(a => a.id === id) || AVATARS[0]);

/* ---------------- portraits (SVG) ---------------- */
const FRONT = 'M51 53Q42 12 80 13Q115 12 111 49Q93 34 75 35Q64 47 51 53';
export function portrait(a) {
  const back = {
    long:  `<rect x="45" y="19" width="70" height="84" rx="30" fill="${a.hc}"/>`,
    wavy:  `<path d="M44 40Q40 70 46 96Q52 106 60 98Q66 108 74 100H86Q94 108 100 98Q108 106 114 96Q120 70 116 40Q112 16 80 16Q48 16 44 40Z" fill="${a.hc}"/>`,
    bob:   `<path d="M47 44Q46 16 80 15Q114 16 113 44V74Q113 82 104 82H56Q47 82 47 74Z" fill="${a.hc}"/>`,
    braid: `<rect x="49" y="20" width="62" height="58" rx="28" fill="${a.hc}"/><g fill="${a.hc}"><ellipse cx="107" cy="80" rx="7" ry="8"/><ellipse cx="108" cy="93" rx="6.5" ry="7.5"/><ellipse cx="109" cy="105" rx="6" ry="7"/></g><circle cx="109" cy="113" r="3" fill="#c0392b"/>`,
    pony:  `<path d="M106 30Q128 34 124 70Q122 86 114 92Q118 70 108 52Z" fill="${a.hc}"/>`,
    bun:   `<circle cx="80" cy="14" r="12" fill="${a.hc}"/>`,
  }[a.hair] || '';
  const front = {
    curly: `<g fill="${a.hc}"><path d="M51 53Q46 22 80 16Q114 22 109 50Q95 36 80 37Q64 38 51 53"/>${[[56,30],[64,22],[74,18],[86,18],[96,22],[104,30],[60,40],[100,40],[80,24]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7.5"/>`).join('')}</g>`,
    side:  `<path d="M51 54Q44 14 82 14Q116 16 110 50Q104 30 70 32Q58 40 51 54" fill="${a.hc}"/><path d="M70 32Q84 22 104 30" stroke="#00000022" stroke-width="2" fill="none"/>`,
    pony:  `<path d="M51 52Q44 14 80 14Q114 14 110 50Q98 30 80 30Q60 32 51 52" fill="${a.hc}"/>`,
    bun:   `<path d="M51 52Q44 16 80 18Q114 16 110 50Q98 30 80 30Q60 32 51 52" fill="${a.hc}"/>`,
    bob:   `<path d="M50 56Q44 16 80 16Q116 16 110 56Q104 30 80 31Q58 30 50 56" fill="${a.hc}"/>`,
    wavy:  `<path d="M51 56Q42 14 80 15Q118 14 109 56Q102 34 86 33Q70 40 51 56" fill="${a.hc}"/>`,
  }[a.hair] || `<path d="${FRONT}" fill="${a.hc}"/>`;
  const collar = a.kind === 'polo' || a.kind === 'shirt'
    ? `<path d="M68 86L80 98L92 86" stroke="#ffffff88" stroke-width="3" fill="none"/>`
    : a.kind === 'hoodie' ? `<path d="M62 86Q80 104 98 86" stroke="#00000030" stroke-width="5" fill="none"/><path d="M74 96v12M86 96v12" stroke="#ffffffaa" stroke-width="2"/>` : '';
  const tie = a.tie ? `<path d="M77 88h6l2 6-5 22-5-22z" fill="${a.tie}"/>` : '';
  const specs = a.glasses ? `<g fill="none" stroke="#29333d" stroke-width="2"><rect x="59" y="46" width="18" height="13" rx="5"/><rect x="83" y="46" width="18" height="13" rx="5"/><path d="M77 51h6"/></g>` : '';
  const lash = a.g === 'girl' ? `<path d="M64 48l3 2M96 48l-3 2" stroke="#25282b" stroke-width="1.5"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" role="img" aria-label="${a.label}"><rect width="160" height="120" rx="10" fill="#dce6eb"/><circle cx="80" cy="52" r="45" fill="#c4d6dd"/>${back}<path d="M25 120Q28 87 66 85H94Q132 87 135 120" fill="${a.top}"/>${collar}${tie}<rect x="69" y="71" width="22" height="23" rx="8" fill="${a.skin}"/><ellipse cx="80" cy="52" rx="28" ry="34" fill="${a.skin}"/>${front}<ellipse cx="69" cy="53" rx="3" ry="4" fill="#25282b"/><ellipse cx="91" cy="53" rx="3" ry="4" fill="#25282b"/>${lash}<path d="M75 69Q80 73 86 69" stroke="#7e4d43" stroke-width="2" fill="none"/>${specs}</svg>`;
}

/* ---------------- 3D characters ---------------- */
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
};

/* Built once per look and shared, so 40 students cost 12 sets of geometry. */
const GEO = new Map();
function geo(THREE, key, make) { if (!GEO.has(key)) GEO.set(key, make()); return GEO.get(key); }

export function buildCharacter(THREE, a) {
  const M = (c, r = 0.75, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: 0 }, extra || {}));
  const skin = M(a.skin, 0.6), top = M(a.top, 0.85), legs = M(a.legs, 0.9), hair = M(a.hc, 0.55),
        shoe = M('#e8e8e8', 0.6), sole = M('#3b3b3b', 0.8), dark = M('#1e2124', 0.3), lip = M(shade(a.skin, 0.72), 0.6);
  const cap = (r, l, s = 10) => geo(THREE, `cap${r}_${l}_${s}`, () => new THREE.CapsuleGeometry(r, l, 6, s));
  const sph = (r, w = 20, h = 16) => geo(THREE, `sph${r}_${w}`, () => new THREE.SphereGeometry(r, w, h));
  const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; return o; };

  const root = new THREE.Group();          // stands on the floor, faces +Z
  const hips = new THREE.Group(); hips.position.y = 0.86; root.add(hips);
  const girl = a.g === 'girl';

  /* torso */
  const chest = new THREE.Group(); hips.add(chest);
  const torso = mesh(cap(girl ? 0.155 : 0.17, 0.30, 14), top, 0, 0.27, 0); torso.scale.set(1, 1, 0.68); chest.add(torso);
  const pelvis = mesh(cap(0.155, 0.1, 14), legs, 0, 0.05, 0); pelvis.scale.set(1.06, 1, 0.74); hips.add(pelvis);
  if (a.kind === 'hoodie') { const hood = mesh(geo(THREE, 'hood', () => new THREE.TorusGeometry(0.11, 0.045, 8, 18)), top, 0, 0.53, -0.07); hood.rotation.x = 1.2; chest.add(hood); }
  if (a.kind === 'polo' || a.kind === 'shirt') {
    const col = mesh(geo(THREE, 'collar', () => new THREE.TorusGeometry(0.075, 0.018, 6, 16, Math.PI * 1.4)), M(a.kind === 'shirt' ? '#f1f1f1' : shade(a.top, 1.25), 0.8), 0, 0.555, 0.01);
    col.rotation.set(Math.PI / 2, 0, Math.PI * 0.8); chest.add(col);
  }

  if (a.tie) {
    const t = mesh(geo(THREE, 'tie', () => new THREE.BoxGeometry(0.05, 0.3, 0.012)), M(a.tie, 0.5), 0, 0.36, 0.118); t.rotation.x = -0.08; chest.add(t);
    const k = mesh(geo(THREE, 'knot', () => new THREE.BoxGeometry(0.045, 0.04, 0.02)), M(a.tie, 0.5), 0, 0.53, 0.11); chest.add(k);
  }
  if (a.g === 'teacher') root.scale.setScalar(1.07);

  /* neck + head */
  chest.add(mesh(geo(THREE, 'neck', () => new THREE.CylinderGeometry(0.05, 0.058, 0.12, 12)), skin, 0, 0.58, 0));
  const head = new THREE.Group(); head.position.set(0, 0.74, 0.01); chest.add(head);
  const skull = mesh(sph(0.125, 28, 22), skin); skull.scale.set(0.92, 1.1, 1); head.add(skull);
  const ears = [-1, 1].map(s => { const e = mesh(sph(0.03, 10, 8), skin, s * 0.112, 0, 0); e.scale.set(0.5, 1, 0.8); head.add(e); return e; });
  const eyeW = M('#ffffff', 0.3), eyes = [];
  for (const s of [-1, 1]) {
    const w = mesh(sph(0.021, 12, 10), eyeW, s * 0.043, 0.012, 0.103); w.scale.set(1, 1.15, 0.5); head.add(w);
    const p = mesh(sph(0.012, 10, 8), dark, s * 0.043, 0.01, 0.113); head.add(p); eyes.push(p);
    const brow = mesh(geo(THREE, 'brow', () => new THREE.CapsuleGeometry(0.006, 0.03, 2, 6)), hair, s * 0.045, 0.05, 0.108);
    brow.rotation.z = Math.PI / 2 + s * (girl ? 0.12 : 0.05); head.add(brow);
  }
  const nose = mesh(sph(0.016, 10, 8), M(shade(a.skin, 0.92), 0.6), 0, -0.025, 0.122); nose.scale.set(0.9, 1.2, 1); head.add(nose);
  const mouth = mesh(geo(THREE, 'mouth', () => new THREE.TorusGeometry(0.024, 0.0055, 6, 14, Math.PI)), lip, 0, -0.064, 0.108);
  mouth.rotation.set(0.25, 0, Math.PI); head.add(mouth);
  if (a.glasses) {
    const fr = M('#20262c', 0.35);
    for (const s of [-1, 1]) { const r = mesh(geo(THREE, 'lens', () => new THREE.TorusGeometry(0.03, 0.005, 6, 18)), fr, s * 0.043, 0.012, 0.126); head.add(r); }
    const br = mesh(geo(THREE, 'bridge', () => new THREE.BoxGeometry(0.03, 0.006, 0.006)), fr, 0, 0.016, 0.13); head.add(br);
  }
  addHair(THREE, head, a, hair, mesh, sph);

  /* arms: shoulder → elbow → hand */
  const arm = s => {
    const sh = new THREE.Group(); sh.position.set(s * (girl ? 0.2 : 0.215), 0.48, 0); chest.add(sh);
    const up = mesh(cap(0.047, 0.2), top, 0, -0.13, 0); sh.add(up);
    const el = new THREE.Group(); el.position.y = -0.27; sh.add(el);
    const fo = mesh(cap(0.04, 0.19), a.kind === 'hoodie' || a.kind === 'shirt' ? top : skin, 0, -0.12, 0); el.add(fo);
    const hand = mesh(sph(0.045, 12, 10), skin, 0, -0.27, 0); hand.scale.set(0.8, 1, 0.6); el.add(hand);
    sh.rotation.z = s * 0.07;
    return { sh, el };
  };
  const armL = arm(-1), armR = arm(1);

  /* legs: hip → knee → foot */
  const leg = s => {
    const hp = new THREE.Group(); hp.position.set(s * 0.085, 0, 0); hips.add(hp);
    hp.add(mesh(cap(0.07, 0.3), legs, 0, -0.21, 0));
    const kn = new THREE.Group(); kn.position.y = -0.42; hp.add(kn);
    kn.add(mesh(cap(0.058, 0.3), legs, 0, -0.2, 0));
    const ft = new THREE.Group(); ft.position.y = -0.41; kn.add(ft);
    const sh = mesh(geo(THREE, 'shoe', () => { const g = new THREE.CapsuleGeometry(0.052, 0.12, 4, 10); g.rotateX(Math.PI / 2); return g; }), shoe, 0, -0.005, 0.05);
    sh.scale.set(1, 0.72, 1); ft.add(sh);
    const so = mesh(geo(THREE, 'sole', () => new THREE.BoxGeometry(0.1, 0.02, 0.23)), sole, 0, -0.04, 0.05); ft.add(so);
    return { hp, kn, ft };
  };
  const legL = leg(-1), legR = leg(1);

  const parts = { hips, chest, head, armL, armR, legL, legR, eyes };
  const anim = makeAnimator(parts, root);
  root.userData.anim = anim;
  root.userData.head = head;
  return root;
}

function addHair(THREE, head, a, hairM, mesh, sph) {
  const capG = (k, r, ts, tl, ps = 0, pl = Math.PI * 2) => {
    const key = `hair_${k}`;
    return mesh(new THREE.SphereGeometry(r, 28, 18, ps, pl, ts, tl), hairM);
  };
  const H = a.hair;
  const top = capG(H, 0.134, 0, H === 'buzz' ? 1.1 : 1.35); top.scale.set(0.95, 1.12, 1.04); top.position.set(0, 0.012, -0.006);
  top.rotation.x = -0.32; head.add(top);
  /* the back of the head is hair for everybody */
  const back = capG(H + 'b', 0.132, 0.6, 1.5, Math.PI * 0.95, Math.PI * 1.1); back.scale.set(0.95, 1.1, 1.04); back.position.set(0, 0.0, -0.004); head.add(back);
  if (H === 'short' || H === 'side') {
    const fr = mesh(sph(0.06, 14, 10), hairM, H === 'side' ? -0.035 : 0.02, 0.105, 0.075); fr.scale.set(1.5, 0.5, 0.75); fr.rotation.z = H === 'side' ? 0.3 : -0.15; head.add(fr);
  }
  if (H === 'curly') {
    for (let i = 0; i < 16; i++) {
      const t = i / 16 * Math.PI * 2, r = 0.115;
      const c = mesh(sph(0.04, 10, 8), hairM, Math.cos(t) * r * 0.9, 0.085 + Math.sin(i * 1.7) * 0.02, Math.sin(t) * r * 0.85 - 0.01); head.add(c);
    }
    const tp = mesh(sph(0.07, 14, 10), hairM, 0, 0.13, 0); tp.scale.set(1.4, 0.7, 1.3); head.add(tp);
  }
  if (H === 'long' || H === 'wavy') {
    const curtain = mesh(new THREE.CylinderGeometry(0.135, H === 'wavy' ? 0.17 : 0.15, 0.36, 24, 1, true, Math.PI * 0.36, Math.PI * 1.28), hairM, 0, -0.14, -0.005);
    curtain.material = hairM.clone(); curtain.material.side = THREE.DoubleSide; head.add(curtain);
    if (H === 'wavy') for (let i = 0; i < 7; i++) { const t = Math.PI * (0.45 + i * 0.185); const w = mesh(sph(0.035, 8, 6), hairM, Math.sin(t) * 0.155, -0.3, Math.cos(t) * 0.15); head.add(w); }
  }
  if (H === 'bob') {
    const b = mesh(new THREE.CylinderGeometry(0.138, 0.15, 0.16, 24, 1, true, Math.PI * 0.33, Math.PI * 1.34), hairM, 0, -0.04, -0.005);
    b.material = hairM.clone(); b.material.side = THREE.DoubleSide; head.add(b);
    const fr = mesh(sph(0.07, 14, 10), hairM, 0, 0.1, 0.07); fr.scale.set(1.6, 0.45, 0.7); head.add(fr);
  }
  if (H === 'pony') {
    const tie = mesh(sph(0.035, 10, 8), hairM, 0, 0.05, -0.135); head.add(tie);
    const tail = mesh(new THREE.CapsuleGeometry(0.04, 0.2, 4, 10), hairM, 0, -0.07, -0.17); tail.rotation.x = 0.35; head.add(tail);
  }
  if (H === 'braid') {
    for (let i = 0; i < 6; i++) { const b = mesh(sph(0.036 - i * 0.002, 10, 8), hairM, 0, -0.02 - i * 0.055, -0.15 - Math.min(i, 2) * 0.01); b.scale.set(1, 1.2, 1); head.add(b); }
  }
  if (H === 'bun') { const b = mesh(sph(0.06, 14, 10), hairM, 0, 0.12, -0.09); head.add(b); }
}

/* ---------------- procedural animation ----------------
   states: idle, walk, sit — plus "hand up" and a quick "reach"
   (passing a chit or a pen). Poses blend, so sitting down and
   standing up are smooth rather than a snap. */
function makeAnimator(P, root) {
  const st = { mode: 'idle', w: { idle: 1, walk: 0, sit: 0 }, phase: Math.random() * 6, hand: 0, handOn: false, reach: 0, blink: 0, speed: 0 };
  const lerp = (a, b, t) => a + (b - a) * t;
  return {
    set(mode) { if (mode && st.w[mode] != null) st.mode = mode; },
    get mode() { return st.mode; },
    hand(on) { st.handOn = !!on; },
    reach() { st.reach = 1; },
    speed(v) { st.speed = v; },
    update(dt, t) {
      for (const k in st.w) st.w[k] = lerp(st.w[k], k === st.mode ? 1 : 0, Math.min(1, dt * 6));
      const W = st.w, sp = Math.max(0.6, Math.min(1.6, st.speed / 1.4 || 1));
      st.phase += dt * 7.5 * sp * (W.walk > 0.05 ? 1 : 0);
      const s = Math.sin(st.phase), c = Math.cos(st.phase);
      const br = Math.sin(t * 1.8) * 0.006;
      /* hips height: standing 0.86, seated 0.50 (chair seat 0.46) */
      P.hips.position.y = 0.86 * (W.idle + W.walk) + 0.5 * W.sit + Math.abs(c) * 0.025 * W.walk;
      P.hips.position.z = -0.06 * W.sit;
      P.chest.rotation.x = 0.05 * W.walk + 0.06 * W.sit;
      P.chest.position.y = br;
      P.chest.rotation.y = s * 0.06 * W.walk;
      /* legs */
      P.legL.hp.rotation.x = s * 0.55 * W.walk - 1.5 * W.sit;
      P.legR.hp.rotation.x = -s * 0.55 * W.walk - 1.5 * W.sit;
      P.legL.kn.rotation.x = Math.max(0, -c) * 0.9 * W.walk + 1.45 * W.sit;
      P.legR.kn.rotation.x = Math.max(0, c) * 0.9 * W.walk + 1.45 * W.sit;
      P.legL.ft.rotation.x = 0.05 * W.sit; P.legR.ft.rotation.x = 0.05 * W.sit;
      /* arms: swing when walking, forearms on the desk when sitting */
      P.armL.sh.rotation.x = -s * 0.45 * W.walk - 0.55 * W.sit;
      P.armL.el.rotation.x = -0.25 * W.walk - 0.9 * W.sit;
      st.hand = lerp(st.hand, st.handOn ? 1 : 0, Math.min(1, dt * 7));
      st.reach = Math.max(0, st.reach - dt * 1.6);
      const rch = Math.sin(Math.min(1, st.reach) * Math.PI);
      const baseR = s * 0.45 * W.walk - 0.55 * W.sit;
      P.armR.sh.rotation.x = lerp(lerp(baseR, -1.4, rch), -2.9 + Math.sin(t * 6) * 0.08, st.hand);
      P.armR.sh.rotation.z = lerp(0.07, 0.25, st.hand);
      P.armR.el.rotation.x = lerp(lerp(-0.25 * W.walk - 0.9 * W.sit, -0.2, rch), -0.15, st.hand);
      P.head.rotation.x = -0.04 * W.sit + Math.sin(t * 0.7) * 0.02;
      P.head.rotation.y = Math.sin(t * 0.45 + st.phase * 0.1) * 0.12 * (W.idle + W.sit);
      /* blink */
      st.blink -= dt; const bl = st.blink < 0.12 && st.blink > 0 ? 0.15 : 1;
      if (st.blink < 0) st.blink = 2.5 + Math.random() * 3;
      P.eyes.forEach(e => (e.scale.y = bl));
    },
  };
}
