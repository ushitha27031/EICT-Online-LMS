/* ============================================================
   EICT Virtual Academy — the 3D classroom (laptops, desktops,
   and tablets that ask for it). Phones never load this file.

   A sunlit room: three tall windows on the left with the sun
   casting the window frames across a plank floor, a wide
   smartboard at the front with the EICT Online sign above it,
   sir's desk with a small laptop, thirty oak desks in pairs with
   cushioned chairs, posters, plants, a bookshelf and a live clock.
   Desks and chairs are merged into a handful of meshes so the
   room draws quickly; every student is a separate character.
   ============================================================ */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildCharacter, byId } from './avatars.js';

export { THREE };

/* ---------------- the room's plan (metres) ---------------- */
const ROOM = { w: 14, d: 18, h: 3.4 };                 // x −7…7, z −9…9, board on the z = −9 wall
const COLS = [-4.65, -3.55, -0.55, 0.55, 3.55, 4.65];
const AISLE = [-6.0, -2.05, -2.05, 2.05, 2.05, 6.0];   // the aisle next to each column
const ROWS = [-4.3, -2.7, -1.1, 0.5, 2.1];             // desk centres
const CHAIR = 0.56;                                    // chair sits this far behind its desk
const BOARD = { x: 0, y: 1.78, z: -8.86, w: 4.8, h: 2.7 };
const DOOR = { x: 5.4, z: 8.3 }, SPAWN = { x: 6.0, z: 6.6 };
const BACKLANE = 3.55, FRONTLANE = -5.6;

export const SEATS = [];
ROWS.forEach((z, r) => COLS.forEach((x, c) => SEATS.push({ id: `r${r}c${c}`, row: r, col: c, x, z: z + CHAIR, deskZ: z, aisle: AISLE[c] })));
/* the order phones are seated in: front rows first, middle columns first */
export const SEAT_ORDER = [...SEATS].sort((a, b) => a.row - b.row || Math.abs(a.x) - Math.abs(b.x)).map(s => s.id);
const seatById = id => SEATS.find(s => s.id === id);

/* ---------------- canvas textures ---------------- */
function canvasTex(w, h, draw, opt = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = opt.aniso || 4;
  if (opt.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...opt.repeat); }
  t.userData.canvas = c;
  return t;
}
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

function woodPlanks(ctx, w, h) {
  const pw = w / 8, ph = h / 1.5;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) {
    const off = ((i * 37) % 5) / 5 * ph, x = i * pw, y = j * ph - off;
    const base = [150 + rnd() * 22, 104 + rnd() * 16, 68 + rnd() * 12];
    ctx.fillStyle = `rgb(${base.map(Math.round)})`; ctx.fillRect(x, y, pw, ph);
    for (let g = 0; g < 26; g++) {
      ctx.strokeStyle = `rgba(${rnd() < 0.5 ? '90,55,30' : '220,180,130'},${0.05 + rnd() * 0.1})`;
      ctx.lineWidth = 0.6 + rnd() * 1.6; ctx.beginPath();
      const gx = x + rnd() * pw; ctx.moveTo(gx, y);
      ctx.bezierCurveTo(gx + (rnd() - 0.5) * 18, y + ph * 0.33, gx + (rnd() - 0.5) * 18, y + ph * 0.66, gx + (rnd() - 0.5) * 10, y + ph);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(50,30,16,.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.75, y + 0.75, pw - 1.5, ph - 1.5);
  }
}
function oak(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#c99a66'); g.addColorStop(0.5, '#d6a874'); g.addColorStop(1, '#c4935f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = `rgba(${rnd() < 0.6 ? '120,78,40' : '240,205,160'},${0.06 + rnd() * 0.12})`;
    ctx.lineWidth = 0.5 + rnd() * 1.5; ctx.beginPath(); const y = rnd() * h; ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += w / 8) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 4 + (rnd() - 0.5) * 2);
    ctx.stroke();
  }
}
function plaster(ctx, w, h, base) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  ctx.putImageData(img, 0, 0);
}
function fabric(ctx, w, h, base) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) { ctx.fillStyle = `rgba(255,255,255,${0.02 + rnd() * 0.03})`; ctx.fillRect(0, y, w, 1); }
  for (let x = 0; x < w; x += 2) { ctx.fillStyle = `rgba(0,0,0,${0.02 + rnd() * 0.04})`; ctx.fillRect(x, 0, 1, h); }
}
function outside(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7fb6e6'); g.addColorStop(0.55, '#cfe6f5'); g.addColorStop(0.62, '#e9f1ea'); g.addColorStop(1, '#7aa564');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  for (let i = 0; i < 9; i++) { const x = rnd() * w, y = h * (0.1 + rnd() * 0.25); for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(x + k * 26, y + Math.sin(k) * 6, 40, 16, 0, 0, 7); ctx.fill(); } }
  ctx.fillStyle = '#8fb38a'; ctx.beginPath(); ctx.moveTo(0, h * 0.62);
  for (let x = 0; x <= w; x += 40) ctx.lineTo(x, h * (0.56 + Math.sin(x * 0.006) * 0.03 + Math.sin(x * 0.02) * 0.01)); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  for (let i = 0; i < 26; i++) {
    const x = rnd() * w, y = h * (0.6 + rnd() * 0.1), r = 26 + rnd() * 40;
    ctx.fillStyle = '#5b4632'; ctx.fillRect(x - 4, y, 8, r * 0.9);
    ctx.fillStyle = ['#3f7a3a', '#4f8b44', '#2f6a35', '#5c9a4d'][i % 4];
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + (rnd() - 0.5) * r * 0.8, y - r * 0.2 + (rnd() - 0.5) * r * 0.5, r * 0.55, 0, 7); ctx.fill(); }
  }
  /* a palm or two — this is Sri Lanka */
  for (const px of [w * 0.18, w * 0.74]) {
    ctx.strokeStyle = '#6b5236'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(px, h * 0.72); ctx.quadraticCurveTo(px + 20, h * 0.45, px + 8, h * 0.3); ctx.stroke();
    ctx.strokeStyle = '#3d7a3a'; ctx.lineWidth = 7;
    for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(px + 8, h * 0.3); ctx.quadraticCurveTo(px + 8 + Math.cos(t) * 60, h * 0.3 + Math.sin(t) * 30 - 20, px + 8 + Math.cos(t) * 110, h * 0.3 + Math.sin(t) * 40 + 30); ctx.stroke(); }
  }
}
function brandPoster(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0b1d3a'); g.addColorStop(1, '#0f4c81'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(80,200,255,.35)'; ctx.lineWidth = 3;
  for (let i = 0; i < 14; i++) { ctx.beginPath(); const y = 60 + i * 50; ctx.moveTo(0, y); ctx.lineTo(w * 0.3, y); ctx.lineTo(w * 0.36, y + 24); ctx.lineTo(w, y + 24); ctx.stroke(); }
  ctx.fillStyle = '#fff'; ctx.font = '700 150px "Chakra Petch", system-ui'; ctx.textAlign = 'center'; ctx.fillText('EICT', w / 2, h * 0.42);
  ctx.fillStyle = '#4fd1ff'; ctx.font = '600 64px "Chakra Petch", system-ui'; ctx.fillText('ONLINE', w / 2, h * 0.52);
  ctx.fillStyle = '#ffffffcc'; ctx.font = '500 38px "IBM Plex Sans", system-ui'; ctx.fillText('A/L ICT · Theory · Revision', w / 2, h * 0.66);
  ctx.fillText('Learn it. Build it. Pass it.', w / 2, h * 0.73);
}
function gatePoster(ctx, w, h) {
  ctx.fillStyle = '#f8f5ee'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#12355b'; ctx.fillRect(0, 0, w, 120);
  ctx.fillStyle = '#fff'; ctx.font = '700 64px "Chakra Petch", system-ui'; ctx.textAlign = 'center'; ctx.fillText('LOGIC GATES', w / 2, 82);
  const rows = [['A', 'B', 'AND', 'OR', 'NAND', 'XOR'], [0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1], [1, 0, 0, 1, 1, 1], [1, 1, 1, 1, 0, 0]];
  const cw = (w - 80) / 6;
  rows.forEach((r, i) => r.forEach((v, j) => {
    const x = 40 + j * cw, y = 170 + i * 92;
    ctx.fillStyle = i === 0 ? '#dbe7f5' : (i % 2 ? '#fff' : '#f1f4f8'); ctx.fillRect(x, y, cw - 4, 86);
    ctx.fillStyle = i === 0 ? '#12355b' : (v === 1 ? '#0f766e' : '#7a8794'); ctx.font = `${i === 0 ? 700 : 600} ${i === 0 ? 36 : 48}px "IBM Plex Mono", monospace`;
    ctx.fillText(String(v), x + cw / 2 - 2, y + 58);
  }));
  ctx.fillStyle = '#12355b'; ctx.font = '500 34px "IBM Plex Sans", system-ui'; ctx.fillText('Y = A · B     Y = A + B     Y = A ⊕ B', w / 2, h - 60);
}
function quotePoster(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffcf5c'); g.addColorStop(1, '#ff8a4c'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2a1a0a'; ctx.textAlign = 'center'; ctx.font = '700 70px "Chakra Petch", system-ui';
  ['1  0  1  1', 'NEVER', 'STOP', 'LEARNING'].forEach((t, i) => ctx.fillText(t, w / 2, 170 + i * 120));
  ctx.font = '500 30px "IBM Plex Sans", system-ui'; ctx.fillText('— EICT Online', w / 2, h - 60);
}
function noticeBoard(ctx, w, h) {
  ctx.fillStyle = '#b98a5a'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 4000; i++) { ctx.fillStyle = `rgba(${rnd() < 0.5 ? '90,60,30' : '230,190,140'},.25)`; ctx.fillRect(rnd() * w, rnd() * h, 2, 2); }
  const notes = [['#fff59d', 'Checkpoint 01', 'Thu & Sat'], ['#b3e5fc', 'Power-Up', '5 MCQs / week'], ['#f8bbd0', 'Tute', 'Logic Gates'], ['#c8e6c9', 'Ask sir', 'send a chit'], ['#ffe0b2', 'Ranks', 'Recruit → Legend']];
  notes.forEach(([c, a, b], i) => {
    const x = 30 + (i % 3) * 200 + rnd() * 20, y = 30 + Math.floor(i / 3) * 190 + rnd() * 20;
    ctx.save(); ctx.translate(x + 80, y + 80); ctx.rotate((rnd() - 0.5) * 0.12);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-76, -72, 160, 160); ctx.fillStyle = c; ctx.fillRect(-80, -80, 160, 160);
    ctx.fillStyle = '#d32f2f'; ctx.beginPath(); ctx.arc(0, -66, 8, 0, 7); ctx.fill();
    ctx.fillStyle = '#263238'; ctx.textAlign = 'center'; ctx.font = '700 24px "IBM Plex Sans", system-ui'; ctx.fillText(a, 0, -10); ctx.font = '400 20px "IBM Plex Sans", system-ui'; ctx.fillText(b, 0, 24);
    ctx.restore();
  });
}

/* ---------------- the board's own screen ---------------- */
function drawBoard(ctx, w, h, s) {
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0a1630'); g.addColorStop(1, '#10284f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(79,209,255,.12)'; ctx.lineWidth = 2;
  for (let x = 0; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#4fd1ff'; ctx.font = '600 40px "Chakra Petch", system-ui'; ctx.fillText('EICT ONLINE · VIRTUAL ACADEMY', 80, 110);
  ctx.fillStyle = '#fff'; ctx.font = '700 104px "Chakra Petch", system-ui'; wrap(ctx, s.title || 'A/L ICT', 80, 260, w - 160, 112, 2);
  ctx.fillStyle = '#c8d6ee'; ctx.font = '500 50px "IBM Plex Sans", system-ui'; wrap(ctx, s.topic || '', 80, 440, w - 160, 62, 2);
  const live = s.live;
  ctx.fillStyle = live ? '#ff4a5e' : '#ffc24b'; ctx.beginPath(); ctx.arc(100, h - 150, 18, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '600 46px "IBM Plex Sans", system-ui';
  ctx.fillText(live ? (s.zoomOn ? 'LIVE — the lecture is on this board' : 'LIVE — press "Join lecture"') : 'Class starts soon — take a seat', 140, h - 134);
  if (s.announce) {
    ctx.fillStyle = 'rgba(255,194,75,.16)'; ctx.fillRect(60, h - 300, w - 120, 96);
    ctx.fillStyle = '#ffc24b'; ctx.font = '600 40px "IBM Plex Sans", system-ui'; wrap(ctx, 'Sir: ' + s.announce, 90, h - 240, w - 180, 46, 1);
  }
  ctx.textAlign = 'right'; ctx.fillStyle = '#8fa3c4'; ctx.font = '500 40px "IBM Plex Mono", monospace';
  ctx.fillText(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit' }), w - 80, 110);
}
function wrap(ctx, text, x, y, mw, lh, max) {
  const words = String(text).split(/\s+/); let line = '', n = 0;
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > mw && line) { ctx.fillText(line, x, y); y += lh; line = w; if (++n >= max) return; } else line = t;
  }
  if (line) ctx.fillText(line, x, y);
}

/* =====================================================================
   createClassroom
   ===================================================================== */
export async function createClassroom(host, opt = {}) {
  const hi = opt.quality !== 'low';
  const renderer = new THREE.WebGLRenderer({ antialias: hi, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor('#d9e4ec', 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, hi ? 2 : 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = hi; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const labels = new CSS2DRenderer(); labels.domElement.className = 'labels'; host.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.42;

  const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 80);
  camera.position.set(0, 2.4, 7.5);

  /* ---------- light ---------- */
  scene.add(new THREE.HemisphereLight('#eaf4ff', '#a3876a', 0.55));
  const sun = new THREE.DirectionalLight('#fff0d4', 3.2);
  sun.position.set(-15, 8.5, -3); sun.target.position.set(1, 0, 0.5);
  sun.castShadow = hi; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
  scene.add(sun, sun.target);
  const ceilingFill = new THREE.DirectionalLight('#f4f7ff', 0.65); ceilingFill.position.set(0.5, 10, 2); scene.add(ceilingFill);
  const boardGlow = new THREE.PointLight('#9ad8ff', 1.2, 7, 2); boardGlow.position.set(0, 1.9, -8.2); scene.add(boardGlow);

  /* ---------- materials ---------- */
  const T = {
    floor: canvasTex(1024, 1024, woodPlanks, { repeat: [9, 9], aniso: 8 }),
    oak: canvasTex(512, 256, oak, { repeat: [1, 1] }),
    wall: canvasTex(256, 256, (c, w, h) => plaster(c, w, h, '#efe9df'), { repeat: [6, 2] }),
    lowwall: canvasTex(512, 128, oak, { repeat: [8, 1] }),
    seat: canvasTex(128, 128, (c, w, h) => fabric(c, w, h, '#2f4d6b'), { repeat: [2, 2] }),
  };
  const MAT = {
    floor: new THREE.MeshStandardMaterial({ map: T.floor, roughness: 0.5, metalness: 0, envMapIntensity: 0.8 }),
    wall: new THREE.MeshStandardMaterial({ map: T.wall, roughness: 0.95 }),
    front: new THREE.MeshStandardMaterial({ color: '#e3ecf1', roughness: 0.92 }),
    ceil: new THREE.MeshStandardMaterial({ color: '#f6f6f3', roughness: 1 }),
    panel: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fffaf0', emissiveIntensity: 1.6, roughness: 0.4 }),
    wood: new THREE.MeshStandardMaterial({ map: T.oak, roughness: 0.48, metalness: 0 }),
    woodDark: new THREE.MeshStandardMaterial({ color: '#6d4a2f', roughness: 0.55 }),
    lowwall: new THREE.MeshStandardMaterial({ map: T.lowwall, color: '#b98a5f', roughness: 0.55 }),
    metal: new THREE.MeshStandardMaterial({ color: '#3a4048', roughness: 0.35, metalness: 0.75 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#c9d0d6', roughness: 0.2, metalness: 0.95 }),
    seat: new THREE.MeshStandardMaterial({ map: T.seat, roughness: 0.92 }),
    shell: new THREE.MeshStandardMaterial({ color: '#1f2f42', roughness: 0.5 }),
    frame: new THREE.MeshStandardMaterial({ color: '#f4f4f2', roughness: 0.45 }),
    glass: new THREE.MeshStandardMaterial({ color: '#dff1ff', transparent: true, opacity: 0.14, roughness: 0.05, metalness: 0.1, depthWrite: false }),
    bezel: new THREE.MeshStandardMaterial({ color: '#15181d', roughness: 0.3, metalness: 0.3 }),
    white: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 }),
    leaf: new THREE.MeshStandardMaterial({ color: '#3f7f3c', roughness: 0.6 }),
    pot: new THREE.MeshStandardMaterial({ color: '#e7e2da', roughness: 0.55 }),
  };

  /* ---------- shell: floor, walls with real window openings, ceiling ---------- */
  const { w: W, d: D, h: H } = ROOM;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), MAT.floor); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.name = 'floor'; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), MAT.ceil); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; scene.add(ceil);

  const WIN = [-5.0, -0.6, 3.8].map(z => ({ z, w: 2.9, y0: 0.95, y1: 2.85 }));
  {
    const s = new THREE.Shape(); s.moveTo(-D / 2, 0); s.lineTo(D / 2, 0); s.lineTo(D / 2, H); s.lineTo(-D / 2, H); s.lineTo(-D / 2, 0);
    for (const o of WIN) { const p = new THREE.Path(); p.moveTo(o.z - o.w / 2, o.y0); p.lineTo(o.z - o.w / 2, o.y1); p.lineTo(o.z + o.w / 2, o.y1); p.lineTo(o.z + o.w / 2, o.y0); p.lineTo(o.z - o.w / 2, o.y0); s.holes.push(p); }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false });
    const left = new THREE.Mesh(g, MAT.wall); left.rotation.y = Math.PI / 2; left.position.set(-W / 2 - 0.25, 0, 0); left.castShadow = true; left.receiveShadow = true;
    /* the extruded shape's x runs along −z after the turn, so flip it */
    left.scale.x = -1; scene.add(left);
    for (const o of WIN) {
      const fr = new THREE.Group(); fr.position.set(-W / 2 + 0.02, 0, o.z);
      const bar = (sx, sy, sz, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), MAT.frame); m.position.set(x, y, z); m.castShadow = true; fr.add(m); };
      bar(0.09, 0.07, o.w + 0.1, 0, o.y0, 0); bar(0.09, 0.07, o.w + 0.1, 0, o.y1, 0);
      bar(0.09, o.y1 - o.y0, 0.07, 0, (o.y0 + o.y1) / 2, -o.w / 2); bar(0.09, o.y1 - o.y0, 0.07, 0, (o.y0 + o.y1) / 2, o.w / 2);
      bar(0.07, o.y1 - o.y0, 0.05, 0, (o.y0 + o.y1) / 2, 0); bar(0.07, 0.05, o.w, 0, o.y0 + (o.y1 - o.y0) * 0.68, 0);
      const sill = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, o.w + 0.2), MAT.frame); sill.position.set(0.1, o.y0 - 0.03, 0); sill.receiveShadow = true; fr.add(sill);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.y1 - o.y0), MAT.glass); gl.rotation.y = Math.PI / 2; gl.position.set(-0.05, (o.y0 + o.y1) / 2, 0); fr.add(gl);
      /* blinds rolled up at the top */
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, o.w + 0.1, 16), MAT.white); roll.rotation.x = Math.PI / 2; roll.position.set(0.12, o.y1 + 0.12, 0); fr.add(roll);
      scene.add(fr);
    }
    const view = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), new THREE.MeshBasicMaterial({ map: canvasTex(2048, 720, outside), toneMapped: false }));
    view.rotation.y = Math.PI / 2; view.position.set(-W / 2 - 7, 2.3, 0); scene.add(view);
  }
  const wall = (w, x, z, ry, m) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, H), m || MAT.wall); g.position.set(x, H / 2, z); g.rotation.y = ry; g.receiveShadow = true; scene.add(g); return g; };
  wall(D, W / 2, 0, -Math.PI / 2); wall(W, 0, -D / 2, 0, MAT.front); wall(W, 0, D / 2, Math.PI);
  /* oak wainscot + skirting round the room */
  const trim = (len, x, z, ry) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(len, 0.9, 0.03), MAT.lowwall); p.position.set(x, 0.45, z); p.rotation.y = ry; p.receiveShadow = true; scene.add(p);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, 0.06), MAT.woodDark); cap.position.set(x, 0.92, z); cap.rotation.y = ry; scene.add(cap);
  };
  trim(D, W / 2 - 0.015, 0, Math.PI / 2); trim(W, 0, D / 2 - 0.015, 0);
  const sk = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, D), MAT.woodDark); sk.position.set(-W / 2 + 0.015, 0.06, 0); scene.add(sk);
  const sk2 = sk.clone(); sk2.scale.set(1, 1, W / D); sk2.rotation.y = Math.PI / 2; sk2.position.set(0, 0.06, -D / 2 + 0.015); scene.add(sk2);

  /* ceiling LED panels */
  for (const x of [-4.2, 0, 4.2]) for (const z of [-6, -2, 2, 6]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 1.2), MAT.panel); p.position.set(x, H - 0.02, z); scene.add(p);
    const f = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.025, 1.28), MAT.frame); f.position.set(x, H - 0.005, z); scene.add(f);
  }

  /* ---------- the smartboard ---------- */
  const boardTex = canvasTex(1600, 900, (c, w, h) => drawBoard(c, w, h, {}), { aniso: 8 });
  const boardMat = new THREE.MeshBasicMaterial({ map: boardTex, toneMapped: false });
  /* When the lecture is playing, the screen is drawn fully transparent (and still hides what is behind it).
     The video sits under the canvas in exactly that spot, so anyone sitting or standing in front of the
     board is drawn over it — just like a real classroom. */
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: false, blending: THREE.NoBlending, toneMapped: false });
  let boardScreen = null;
  {
    const g = new THREE.Group(); g.position.set(BOARD.x, BOARD.y, BOARD.z);
    const bz = new THREE.Mesh(new RoundedBoxGeometry(BOARD.w + 0.22, BOARD.h + 0.22, 0.09, 4, 0.04), MAT.bezel); bz.castShadow = true; g.add(bz);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(BOARD.w, BOARD.h), boardMat); scr.position.z = 0.047; g.add(scr); boardScreen = scr;
    const tray = new THREE.Mesh(new RoundedBoxGeometry(BOARD.w * 0.6, 0.05, 0.12, 2, 0.02), MAT.metal); tray.position.set(0, -BOARD.h / 2 - 0.17, 0.06); g.add(tray);
    for (const [x, c] of [[-0.4, '#1e88e5'], [-0.25, '#e53935'], [-0.1, '#43a047']]) { const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })); pen.rotation.z = Math.PI / 2; pen.position.set(x, -BOARD.h / 2 - 0.135, 0.07); g.add(pen); }
    const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 16), MAT.bezel); cam.rotation.x = Math.PI / 2; cam.position.set(0, BOARD.h / 2 + 0.07, 0.06); g.add(cam);
    scene.add(g);
    /* the sign above it */
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.42), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, map: canvasTex(1280, 168, (c, w, h) => {
      c.fillStyle = '#12355b'; c.font = '700 110px "Chakra Petch", system-ui'; c.textAlign = 'center'; c.fillText('EICT', w * 0.33, 125);
      c.fillStyle = '#0ea5e9'; c.fillText('ONLINE', w * 0.68, 125);
    }) }));
    sign.position.set(0, BOARD.y + BOARD.h / 2 + 0.38, -D / 2 + 0.02); scene.add(sign);
    /* speakers either side */
    for (const sx of [-1, 1]) { const sp = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.42, 0.18, 3, 0.03), MAT.bezel); sp.position.set(sx * (BOARD.w / 2 + 0.55), 2.65, -D / 2 + 0.12); sp.castShadow = true; scene.add(sp); }
  }
  /* the board's four corners in the world (for laying the live lecture over it) */
  const boardCorners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => new THREE.Vector3(BOARD.x + sx * BOARD.w / 2, BOARD.y + sy * BOARD.h / 2, BOARD.z + 0.05));

  /* ---------- desks & chairs, merged ---------- */
  const buckets = new Map();
  const put = (mat, g, m) => { const gg = g.clone().applyMatrix4(m); const ng = gg.index ? gg.toNonIndexed() : gg; if (!buckets.has(mat)) buckets.set(mat, []); buckets.get(mat).push(ng); };
  const M4 = (x, y, z, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1));
  const G = {
    top: new RoundedBoxGeometry(1.0, 0.04, 0.56, 3, 0.014),
    leg: new THREE.CylinderGeometry(0.016, 0.016, 0.72, 10),
    rail: new THREE.CylinderGeometry(0.012, 0.012, 0.9, 8),
    shelf: new THREE.BoxGeometry(0.9, 0.015, 0.36),
    cushion: new RoundedBoxGeometry(0.46, 0.06, 0.44, 3, 0.025),
    seatShell: new RoundedBoxGeometry(0.47, 0.025, 0.45, 2, 0.01),
    cleg: new THREE.CylinderGeometry(0.013, 0.011, 0.44, 8),
    back: (() => { const s = new THREE.Shape(); const r0 = 0.62, r1 = 0.65, a = 0.4; s.absarc(0, 0, r1, -a, a, false); s.absarc(0, 0, r0, a, -a, true);
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 18 }); g.rotateX(-Math.PI / 2); g.rotateY(-Math.PI / 2); g.translate(0, 0, -0.63); return g; })(),
    backPad: (() => { const s = new THREE.Shape(); const r0 = 0.6, r1 = 0.625, a = 0.35; s.absarc(0, 0, r1, -a, a, false); s.absarc(0, 0, r0, a, -a, true);
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: false, curveSegments: 16 }); g.rotateX(-Math.PI / 2); g.rotateY(-Math.PI / 2); g.translate(0, 0.03, -0.63); return g; })(),
  };
  const furniture = [];                                    // what you actually see — clicking it picks that desk's chair
  for (const s of SEATS) {
    const dz = s.deskZ, x = s.x;
    put(MAT.wood, G.top, M4(x, 0.74, dz));
    for (const lx of [-0.45, 0.45]) for (const lz of [-0.23, 0.23]) put(MAT.metal, G.leg, M4(x + lx, 0.36, dz + lz));
    put(MAT.metal, G.rail, M4(x, 0.12, dz, 0, 0, Math.PI / 2));
    put(MAT.woodDark, G.shelf, M4(x, 0.6, dz - 0.04));
    /* chair */
    const cz = s.z;
    put(MAT.shell, G.seatShell, M4(x, 0.43, cz));
    put(MAT.seat, G.cushion, M4(x, 0.47, cz));
    for (const lx of [-0.2, 0.2]) for (const lz of [-0.18, 0.18]) put(MAT.chrome, G.cleg, M4(x + lx, 0.22, cz + lz, lz * 0.3, 0, -lx * 0.2));
    put(MAT.shell, G.back, M4(x, 0.62, cz + 0.17));
    put(MAT.seat, G.backPad, M4(x, 0.62, cz + 0.17));
    for (const lx of [-0.2, 0.2]) put(MAT.chrome, G.cleg, M4(x + lx, 0.62, cz + 0.2, -0.12, 0, 0).multiply(new THREE.Matrix4().makeScale(1, 0.55, 1)));
  }
  for (const [mat, list] of buckets) { const m = new THREE.Mesh(mergeGeometries(list), mat); m.castShadow = hi; m.receiveShadow = true; scene.add(m); furniture.push(m); }

  /* ---------- tutes on every desk ---------- */
  const coverTex = await new Promise(res => new THREE.TextureLoader().load(opt.cover || 'assets/logic-gate-cover.png', t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, null, () => res(null)));
  const paper = new THREE.MeshStandardMaterial({ color: '#f5f3ee', roughness: 0.9 });
  const coverMat = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.55 });
  const tuteG = new THREE.BoxGeometry(0.21, 0.01, 0.297);
  const tutes = new THREE.InstancedMesh(tuteG, [paper, paper, coverMat, paper, paper, paper], SEATS.length);
  SEATS.forEach((s, i) => tutes.setMatrixAt(i, M4(s.x + 0.24, 0.766, s.deskZ + 0.02, 0, (rnd() - 0.5) * 0.25, 0)));
  tutes.castShadow = hi; tutes.receiveShadow = true; tutes.name = 'tutes'; scene.add(tutes);

  /* ---------- sir's desk + laptop ---------- */
  const lapTex = canvasTex(512, 320, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0a1630'); g.addColorStop(1, '#174a7c'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#4fd1ff'; c.font = '700 54px "Chakra Petch", system-ui'; c.fillText('EICT', 40, 120); c.fillStyle = '#fff'; c.font = '500 26px "IBM Plex Sans", system-ui'; c.fillText('Logic Gates — slides', 40, 170); c.fillStyle = '#ff4a5e'; c.beginPath(); c.arc(52, 240, 10, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillText('Zoom · sharing screen', 72, 249); });
  const lapScreen = new THREE.MeshBasicMaterial({ map: lapTex, toneMapped: false });
  {
    const g = new THREE.Group(); g.position.set(3.9, 0, -6.9); g.rotation.y = -0.35;
    const top = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.06, 0.8, 3, 0.02), MAT.wood); top.position.y = 0.76; top.castShadow = top.receiveShadow = true; g.add(top);
    for (const sx of [-0.85, 0.85]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.73, 0.74), MAT.woodDark); side.position.set(sx, 0.365, 0); side.castShadow = true; g.add(side); }
    const modesty = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.5, 0.03), MAT.woodDark); modesty.position.set(0, 0.45, 0.33); g.add(modesty);
    const drawers = new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.6, 0.66, 2, 0.01), MAT.wood); drawers.position.set(-0.58, 0.4, -0.02); g.add(drawers);
    /* laptop */
    const lap = new THREE.Group(); lap.position.set(0.1, 0.79, 0.05); lap.rotation.y = Math.PI; g.add(lap);
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.018, 0.25, 2, 0.006), MAT.chrome); lap.add(base);
    const lid = new THREE.Group(); lid.position.set(0, 0.009, -0.125); lid.rotation.x = -1.85 + Math.PI / 2; lap.add(lid);
    const shell = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.24, 0.012, 2, 0.005), MAT.chrome); shell.position.y = 0.12; lid.add(shell);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.205), lapScreen); scr.position.set(0, 0.12, 0.007); lid.add(scr);
    /* mug, books, a small plant */
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 18), new THREE.MeshStandardMaterial({ color: '#0ea5e9', roughness: 0.3 })); mug.position.set(0.55, 0.84, -0.1); mug.castShadow = true; g.add(mug);
    ['#b23a48', '#2f6690', '#3a7d44'].forEach((c, i) => { const b = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.04, 0.32, 2, 0.006), new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })); b.position.set(-0.55, 0.81 + i * 0.042, -0.1); b.rotation.y = (i - 1) * 0.12; b.castShadow = true; g.add(b); });
    const chair = new THREE.Group(); chair.position.set(0, 0, -0.75); g.add(chair);
    const cs = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.09, 0.52, 3, 0.03), MAT.shell); cs.position.y = 0.5; chair.add(cs);
    const cb = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.62, 0.08, 3, 0.03), MAT.shell); cb.position.set(0, 0.88, -0.25); cb.rotation.x = -0.1; chair.add(cb);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 10), MAT.chrome); post.position.y = 0.26; chair.add(post);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const sp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.04), MAT.chrome); sp.position.set(Math.cos(a) * 0.15, 0.05, Math.sin(a) * 0.15); sp.rotation.y = -a; chair.add(sp); }
    scene.add(g);
  }
  const TEACHER_TRAY = new THREE.Vector3(3.4, 0.86, -6.6);

  /* ---------- decoration ---------- */
  const poster = (tex, w, h, x, y, z, ry) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
    const f = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.03), MAT.woodDark); g.add(f);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })); p.position.z = 0.017; g.add(p);
    scene.add(g);
  };
  poster(canvasTex(700, 1000, brandPoster), 1.05, 1.5, W / 2 - 0.03, 1.85, -5.2, -Math.PI / 2);
  poster(canvasTex(800, 760, gatePoster), 1.4, 1.33, W / 2 - 0.03, 1.85, -2.6, -Math.PI / 2);
  poster(canvasTex(640, 860, noticeBoard), 2.2, 1.25, W / 2 - 0.03, 1.75, 0.9, -Math.PI / 2);
  poster(canvasTex(600, 780, quotePoster), 0.9, 1.17, W / 2 - 0.03, 1.85, 3.9, -Math.PI / 2);
  poster(canvasTex(700, 1000, brandPoster), 0.85, 1.2, -3.2, 1.9, D / 2 - 0.03, Math.PI);

  /* bookshelf at the back */
  {
    const g = new THREE.Group(); g.position.set(-1.0, 0, D / 2 - 0.25);
    const body = new THREE.Mesh(new RoundedBoxGeometry(2.4, 1.9, 0.38, 2, 0.02), MAT.wood); body.position.y = 0.95; body.castShadow = true; g.add(body);
    const cols = ['#b23a48', '#2f6690', '#3a7d44', '#f2a541', '#6c4f9c', '#e0e0e0', '#264653', '#e76f51'];
    for (let r = 0; r < 4; r++) {
      const sh = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.025, 0.34), MAT.woodDark); sh.position.set(0, 0.2 + r * 0.45, -0.03); g.add(sh);
      let x = -1.1;
      while (x < 1.05) {
        const bw = 0.04 + rnd() * 0.05, bh = 0.26 + rnd() * 0.12;
        if (rnd() < 0.12) { x += 0.12; continue; }
        const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.24), new THREE.MeshStandardMaterial({ color: cols[Math.floor(rnd() * cols.length)], roughness: 0.75 }));
        b.position.set(x + bw / 2, 0.215 + r * 0.45 + bh / 2, -0.04); b.rotation.z = rnd() < 0.08 ? 0.15 : 0; g.add(b); x += bw + 0.006;
      }
    }
    g.rotation.y = Math.PI; scene.add(g);
  }
  /* door */
  {
    const g = new THREE.Group(); g.position.set(DOOR.x, 0, D / 2 - 0.04);
    const f = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.08), MAT.frame); f.position.y = 1.15; g.add(f);
    const d = new THREE.Mesh(new RoundedBoxGeometry(1.05, 2.18, 0.06, 2, 0.01), MAT.wood); d.position.set(0, 1.1, -0.02); g.add(d);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 10), MAT.chrome); h.rotation.z = Math.PI / 2; h.position.set(-0.38, 1.05, -0.07); g.add(h);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.6), MAT.glass); win.position.set(0, 1.55, -0.055); win.rotation.y = Math.PI; g.add(win);
    scene.add(g);
  }
  /* clock — shows Sri Lanka time */
  const clockTex = canvasTex(256, 256, () => {});
  const drawClock = () => {
    const c = clockTex.userData.canvas.getContext('2d'), w = 256;
    c.clearRect(0, 0, w, w); c.fillStyle = '#fff'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill();
    c.strokeStyle = '#222'; c.lineWidth = 8; c.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.lineWidth = i % 3 ? 3 : 7; c.beginPath(); c.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); c.lineTo(128 + Math.sin(a) * 112, 128 - Math.cos(a) * 112); c.stroke(); }
    const t = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
    const hand = (a, l, wd, col) => { c.strokeStyle = col; c.lineWidth = wd; c.lineCap = 'round'; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.sin(a) * l, 128 - Math.cos(a) * l); c.stroke(); };
    hand((t.getHours() % 12 + t.getMinutes() / 60) / 12 * Math.PI * 2, 58, 9, '#222');
    hand(t.getMinutes() / 60 * Math.PI * 2, 86, 6, '#222');
    c.fillStyle = '#0ea5e9'; c.font = '700 22px "Chakra Petch", system-ui'; c.textAlign = 'center'; c.fillText('EICT', 128, 180);
    clockTex.needsUpdate = true;
  };
  drawClock();
  { const ck = new THREE.Mesh(new THREE.CircleGeometry(0.28, 40), new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.4 })); ck.position.set(2.4, 2.7, D / 2 - 0.03); ck.rotation.y = Math.PI; scene.add(ck);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.022, 10, 40), MAT.metal); rim.position.copy(ck.position); scene.add(rim); }
  /* air conditioner */
  { const ac = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.32, 0.24, 3, 0.06), MAT.frame); ac.position.set(W / 2 - 0.14, 2.95, 5.8); ac.rotation.y = -Math.PI / 2; scene.add(ac);
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.02), MAT.metal); vent.position.set(W / 2 - 0.27, 2.82, 5.8); vent.rotation.y = -Math.PI / 2; scene.add(vent); }
  /* plants */
  const plant = (x, z, s = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
    const pts = [[0, 0], [0.16, 0], [0.2, 0.04], [0.22, 0.42], [0.24, 0.45], [0.2, 0.45]].map(([a, b]) => new THREE.Vector2(a, b));
    const pot = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), MAT.pot); pot.castShadow = true; g.add(pot);
    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), new THREE.MeshStandardMaterial({ color: '#3b2a1e' })); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.43; g.add(soil);
    const lg = new THREE.SphereGeometry(0.1, 10, 8); lg.scale(0.35, 1, 0.12); lg.translate(0, 0.1, 0);
    const leaves = new THREE.InstancedMesh(lg, MAT.leaf, 34);
    for (let i = 0; i < 34; i++) {
      const a = i * 2.4, up = 0.45 + (i / 34) * 0.75, lean = 0.5 + rnd() * 0.6;
      leaves.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * 0.05, up, Math.sin(a) * 0.05), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(a) * lean, -a, Math.cos(a) * lean)), new THREE.Vector3(1.6, 2.6, 1.6)));
    }
    leaves.castShadow = true; g.add(leaves); scene.add(g);
  };
  plant(-6.4, -8.2, 1.15); plant(6.4, -8.2, 1.0); plant(-6.4, 8.3, 1.1); plant(-2.6, 8.4, 0.9);

  /* ---------- floor marks that light up under a free chair you hover ---------- */
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.44, 40), new THREE.MeshBasicMaterial({ color: '#3fd99a', transparent: true, opacity: 0.85, toneMapped: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; ring.visible = false; scene.add(ring);
  const takenMark = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.44, 40), new THREE.MeshBasicMaterial({ color: '#ff4a5e', transparent: true, opacity: 0.7, toneMapped: false }));
  takenMark.rotation.x = -Math.PI / 2; takenMark.position.y = 0.01; takenMark.visible = false; scene.add(takenMark);

  /* ---------- obstacles for walking freely ---------- */
  const OB = [];
  for (const s of SEATS) OB.push({ x0: s.x - 0.52, x1: s.x + 0.52, z0: s.deskZ - 0.3, z1: s.deskZ + 0.3 });
  OB.push({ x0: 2.9, x1: 4.9, z0: -7.5, z1: -6.3 });                 // sir's desk
  OB.push({ x0: -2.3, x1: 0.3, z0: 8.5, z1: 9 });                    // bookshelf
  const collide = (p, r = 0.24) => {
    p.x = Math.max(-W / 2 + r, Math.min(W / 2 - r, p.x)); p.z = Math.max(-D / 2 + 1.1, Math.min(D / 2 - r, p.z));
    for (const b of OB) {
      const cx = Math.max(b.x0, Math.min(p.x, b.x1)), cz = Math.max(b.z0, Math.min(p.z, b.z1));
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < r * r) { const d = Math.sqrt(d2) || 1e-4; p.x = cx + dx / d * r; p.z = cz + dz / d * r; }
    }
  };

  /* =====================================================================
     people
     ===================================================================== */
  const people = new Map();            // uid → { obj, anim, label, target, seat, ... }
  let me = null;
  const tmpV = new THREE.Vector3();

  function makeLabel(name, mine, sir) {
    const d = document.createElement('div'); d.className = 'tag' + (mine ? ' me' : '') + (sir ? ' sir' : '');
    d.innerHTML = `<span class="hand" hidden><svg viewBox="0 0 24 24"><path d="M12 2a1.5 1.5 0 0 1 1.5 1.5V11h.5V4.5a1.5 1.5 0 0 1 3 0V12h.5V7.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1a7 7 0 0 1-6.2-3.8L3.3 13a1.5 1.5 0 0 1 2.6-1.5L8 14V4.5a1.5 1.5 0 0 1 3 0V11h.5V3.5A1.5 1.5 0 0 1 12 2z"/></svg></span><b></b>`;
    d.querySelector('b').textContent = name;
    const o = new CSS2DObject(d); o.position.set(0, 0.32, 0);
    return o;
  }
  function addPerson(uid, p, mine) {
    if (people.has(uid)) return people.get(uid);
    const a = byId(p.av), obj = buildCharacter(THREE, a);
    obj.position.set(p.x || DOOR.x, 0, p.z || DOOR.z); obj.rotation.y = p.ry != null ? p.ry : Math.PI;
    scene.add(obj);
    const label = makeLabel(p.n || 'Student', mine, p.av === 't1');
    obj.userData.head.add(label);
    const P = { uid, obj, anim: obj.userData.anim, label, av: p.av, target: new THREE.Vector3(obj.position.x, 0, obj.position.z), ry: obj.rotation.y, seat: null, path: [], mine: !!mine, speed: 0, data: p };
    people.set(uid, P);
    return P;
  }
  function setName(P, n) { P.label.element.querySelector('b').textContent = n; }
  function setHand(P, on) { P.anim.hand(on); P.label.element.querySelector('.hand').hidden = !on; }
  function placeSeated(P, sid) {
    const s = seatById(sid); if (!s) return;
    P.seat = sid; P.path = [];
    P.obj.position.set(s.x, 0, s.z); P.target.set(s.x, 0, s.z); P.ry = Math.PI; P.obj.rotation.y = Math.PI;
    P.anim.set('sit');
  }

  /* remote students: smooth towards their last reported spot */
  function upsert(uid, p) {
    if ((me && uid === me.uid) || uid === opt.myUid) return;      // never draw yourself twice
    if (!p) return;
    let P = people.get(uid);
    if (!P) P = addPerson(uid, p, false);
    else if (P.av !== p.av) { removePerson(uid); P = addPerson(uid, p, false); }
    P.data = p; setName(P, p.n || 'Student'); setHand(P, !!p.hand);
    if (p.seat && p.a === 'sit') { if (P.seat !== p.seat || P.anim.mode !== 'sit') placeSeatedSoft(P, p.seat); }
    else {
      P.seat = null;
      if (p.x != null) P.target.set(p.x, 0, p.z);
      if (p.ry != null) P.ry = p.ry;
      P.anim.set(p.a === 'walk' ? 'walk' : 'idle');
    }
    refreshMarks();
  }
  function placeSeatedSoft(P, sid) {
    const s = seatById(sid); if (!s) return;
    P.seat = sid; P.target.set(s.x, 0, s.z); P.ry = Math.PI; P.anim.set('sit');
    if (P.obj.position.distanceTo(P.target) > 2.5) P.obj.position.copy(P.target);
  }
  function removePerson(uid) {
    const P = people.get(uid); if (!P) return;
    P.label.removeFromParent(); P.label.element.remove();
    scene.remove(P.obj); people.delete(uid); refreshMarks();
  }

  /* the student at this computer */
  function setMe(uid, p, seat) {
    if (people.has(uid) && !people.get(uid).mine) removePerson(uid);
    const sp = p.spawn || { x: SPAWN.x, z: SPAWN.z, ry: Math.PI };
    me = addPerson(uid, { ...p, x: sp.x, z: sp.z, ry: sp.ry }, true);
    me.uid = uid; me.ry = sp.ry;
    if (seat) { placeSeated(me, seat); view('first', true); }
    else if (p.spawn) { view('third', true); emit(); }          // sir: already at the front, facing the class
    else { view('third', true); walkTo([new THREE.Vector3(SPAWN.x, 0, BACKLANE + 0.4)]); }
    return me;
  }

  /* walking: a list of points along the aisles, then sit */
  let onArrive = null;
  function walkTo(pts, then) {
    if (!me) return;
    if (me.seat) { me.seat = null; }
    me.path = pts.map(p => p.clone()); onArrive = then || null;
    me.anim.set('walk'); emit();
  }
  function routeToSeat(sid) {
    const s = seatById(sid), p = me.obj.position, pts = [];
    const lanes = [-6.0, -2.05, 2.05, 6.0];
    const nearA = lanes.reduce((b, a) => Math.abs(a - p.x) < Math.abs(b - p.x) ? a : b, lanes[0]);
    const inRows = p.z > FRONTLANE + 0.3 && p.z < BACKLANE - 0.2;
    if (inRows) {
      pts.push(new THREE.Vector3(nearA, 0, p.z));
      if (Math.abs(nearA - s.aisle) > 0.1) { pts.push(new THREE.Vector3(nearA, 0, BACKLANE)); pts.push(new THREE.Vector3(s.aisle, 0, BACKLANE)); }
    } else {
      pts.push(new THREE.Vector3(s.aisle, 0, p.z < 0 ? FRONTLANE : BACKLANE));
    }
    pts.push(new THREE.Vector3(s.aisle, 0, s.z)); pts.push(new THREE.Vector3(s.x, 0, s.z));
    return pts;
  }
  function goSit(sid) {
    return new Promise(res => {
      if (me.seat) standUp();
      walkTo(routeToSeat(sid), () => { placeSeated(me, sid); emit(); view('first'); res(); });
    });
  }
  function sitNow(sid) { placeSeated(me, sid); emit(); view('first'); }
  function standUp() {
    if (!me || !me.seat) return;
    const s = seatById(me.seat); me.seat = null;
    me.obj.position.set(s.aisle, 0, s.z); me.target.copy(me.obj.position);
    me.anim.set('idle'); me.ry = s.aisle < s.x ? -Math.PI / 2 : Math.PI / 2;
    if (camMode === 'first') view('third'); emit();
  }

  /* ---------- camera: third person, first person, seated ---------- */
  let camMode = 'third', yaw = Math.PI, pitch = 0.26, dist = 3.8;
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  function view(mode, snap) {
    camMode = mode || (camMode === 'first' ? 'third' : 'first');
    if (me) me.obj.visible = true;
    if (camMode === 'first') { pitch = me && me.seat ? -0.06 : 0; yaw = me ? me.obj.rotation.y : Math.PI; }
    else { pitch = 0.26; yaw = me ? me.obj.rotation.y : Math.PI; }
    if (snap) camSnap = true;
    opt.onView && opt.onView(camMode);
    return camMode;
  }
  let camSnap = true;
  function updateCamera(dt) {
    if (!me) return;
    const p = me.obj.position;
    const seated = me.anim.mode === 'sit';
    let pos, look;
    if (camMode === 'first') {
      const eye = seated ? 1.2 : 1.58;
      pos = tmpV.set(p.x, eye, p.z).addScaledVector(new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), 0.12).clone();
      look = pos.clone().add(new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)));
    } else {
      const tgt = new THREE.Vector3(p.x, seated ? 1.05 : 1.35, p.z);
      const back = new THREE.Vector3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
      /* shorten the arm rather than squash the camera into a wall */
      let k = dist;
      const lim = (v, d, lo, hi) => { if (d > 1e-4 && tgt[v] + d * k > hi) k = (hi - tgt[v]) / d; if (d < -1e-4 && tgt[v] + d * k < lo) k = (lo - tgt[v]) / d; };
      lim('x', back.x, -ROOM.w / 2 + 0.25, ROOM.w / 2 - 0.25); lim('z', back.z, -ROOM.d / 2 + 0.3, ROOM.d / 2 - 0.25); lim('y', back.y, 0.4, ROOM.h - 0.25);
      pos = tgt.clone().addScaledVector(back, Math.max(0.8, k));
      look = tgt;
    }
    const k = camSnap ? 1 : 1 - Math.pow(0.0015, dt);
    camPos.lerp(pos, k); camLook.lerp(look, k); camSnap = false;
    camera.position.copy(camPos); camera.lookAt(camLook);
    /* in first person, hide your own head so it doesn't fill the screen */
    const fp = camMode === 'first' && camPos.distanceTo(pos) < 0.4;
    me.obj.visible = !fp; me.label.visible = !fp;
  }

  /* ---------- input ---------- */
  const keys = new Set();
  const el = renderer.domElement; el.tabIndex = 0; el.style.touchAction = 'none';
  const onKey = e => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.type === 'keydown') {
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { keys.add(k); e.preventDefault(); if (me && me.seat) { opt.onStand && opt.onStand(); } }
      if (k === 'v') view();
    } else keys.delete(k);
  };
  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null, hoverSeat = null;
  const pick = (cx, cy) => {
    const r = el.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects([tutes, ...furniture, floor], false)[0];
    if (!hit) return null;
    if (hit.object === tutes) return { kind: 'tute', seat: SEATS[hit.instanceId].id };
    if (hit.object !== floor) {
      const p = hit.point, s = SEATS.find(s => Math.abs(p.x - s.x) < 0.56 && p.z > s.deskZ - 0.32 && p.z < s.deskZ + 0.9);
      return s ? { kind: 'seat', seat: s.id } : null;
    }
    /* the floor right under a chair counts as the chair */
    const p = hit.point, s = SEATS.find(s => Math.abs(p.x - s.x) < 0.3 && Math.abs(p.z - s.z) < 0.28);
    return s ? { kind: 'seat', seat: s.id } : { kind: 'floor', point: p };
  };
  el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, yaw, pitch, id: e.pointerId, moved: false }; el.setPointerCapture(e.pointerId); el.focus({ preventScroll: true }); });
  el.addEventListener('pointermove', e => {
    if (down) {
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) down.moved = true;
      if (down.moved) {
        yaw = down.yaw - dx * 0.005; pitch = Math.max(-0.7, Math.min(camMode === 'first' ? 0.7 : 1.1, down.pitch + dy * (camMode === 'first' ? -0.004 : 0.004)));
        /* sitting at a desk you can glance left and right, not spin round — the board stays in front of you */
        if (me && me.seat && camMode === 'first') { yaw = Math.max(Math.PI - 0.65, Math.min(Math.PI + 0.65, yaw)); pitch = Math.max(-0.45, Math.min(0.35, pitch)); }
      }
      return;
    }
    if (e.pointerType !== 'mouse') return;
    const h = pick(e.clientX, e.clientY);
    hoverSeat = h && h.kind === 'seat' ? h.seat : null;
    el.style.cursor = h && (h.kind === 'tute' || h.kind === 'seat') ? 'pointer' : 'default';
    refreshMarks();
  });
  el.addEventListener('pointerup', e => {
    const d = down; down = null; if (!d || d.moved) return;
    const h = pick(e.clientX, e.clientY); if (!h) return;
    if (h.kind === 'tute') opt.onTute && opt.onTute(h.seat);
    else if (h.kind === 'seat') opt.onSeat && opt.onSeat(h.seat);
    else if (h.kind === 'floor' && me) { if (me.seat) opt.onStand && opt.onStand(); else walkTo([h.point.setY(0)]); }
  });
  el.addEventListener('wheel', e => { if (camMode === 'third') { dist = Math.max(1.6, Math.min(7, dist + e.deltaY * 0.003)); e.preventDefault(); } }, { passive: false });

  let occupied = () => false;
  function refreshMarks() {
    ring.visible = takenMark.visible = false;
    if (!hoverSeat) return;
    const s = seatById(hoverSeat), busy = occupied(hoverSeat);
    const m = busy ? takenMark : ring; m.visible = true; m.position.set(s.x, 0.01, s.z);
  }

  /* ---------- stationery on desks ---------- */
  const itemGeo = {
    pen: new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), pencil: new THREE.CylinderGeometry(0.0065, 0.0065, 0.17, 6),
    eraser: new RoundedBoxGeometry(0.05, 0.015, 0.025, 2, 0.004), ruler: new THREE.BoxGeometry(0.3, 0.003, 0.03), marker: new THREE.CylinderGeometry(0.01, 0.01, 0.12, 10),
  };
  const itemMat = { pen: new THREE.MeshStandardMaterial({ color: '#1e5bd8', roughness: 0.35 }), pencil: new THREE.MeshStandardMaterial({ color: '#f2c14e', roughness: 0.6 }),
    eraser: new THREE.MeshStandardMaterial({ color: '#f48fb1', roughness: 0.8 }), ruler: new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.8, roughness: 0.2 }), marker: new THREE.MeshStandardMaterial({ color: '#c6ff00', roughness: 0.4 }) };
  const deskItems = new Map();
  const itemMesh = k => { const m = new THREE.Mesh(itemGeo[k], itemMat[k]); if (k !== 'eraser' && k !== 'ruler') m.rotation.z = Math.PI / 2; m.castShadow = true; return m; };
  function setDeskItems(map) {           // seatId → ['pen','pencil',…]
    for (const [sid, g] of deskItems) { if (!map[sid]) { scene.remove(g); deskItems.delete(sid); } }
    for (const sid in map) {
      const s = seatById(sid); if (!s) continue;
      let g = deskItems.get(sid); if (g) scene.remove(g);
      g = new THREE.Group(); g.position.set(s.x - 0.22, 0.765, s.deskZ - 0.02);
      map[sid].forEach((k, i) => { const m = itemMesh(k); m.position.set((i % 2) * 0.12 - 0.05, 0.007, Math.floor(i / 2) * 0.06 - 0.08 + i * 0.03); if (k === 'ruler') m.position.x = -0.02; g.add(m); });
      scene.add(g); deskItems.set(sid, g);
    }
  }

  /* ---------- flying things: a chit, a pen ---------- */
  const flights = [];
  const chitGeo = (() => { const g = new THREE.BufferGeometry(); const v = [-0.05, 0, -0.035, 0, 0.012, -0.035, 0, 0.012, 0.035, -0.05, 0, -0.035, 0, 0.012, 0.035, -0.05, 0, 0.035, 0, 0.012, -0.035, 0.05, 0, -0.035, 0.05, 0, 0.035, 0, 0.012, -0.035, 0.05, 0, 0.035, 0, 0.012, 0.035];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g; })();
  const chitMat = new THREE.MeshStandardMaterial({ color: '#fffbe8', roughness: 0.8, side: THREE.DoubleSide });
  const deskTop = sid => { const s = seatById(sid); return s ? new THREE.Vector3(s.x, 0.8, s.deskZ) : null; };
  function fly(obj, pts, hop, done, reachers) {
    scene.add(obj); flights.push({ obj, pts, i: 0, t: 0, hop, done, reachers: reachers || [] });
  }
  function personAt(sid) { for (const P of people.values()) if (P.seat === sid) return P; return null; }
  /* a sealed chit goes forward desk by desk through the students in front, then onto sir's desk */
  function playChit(path) {
    const pts = path.map(deskTop).filter(Boolean); if (!pts.length) return;
    pts.push(TEACHER_TRAY.clone());
    const m = new THREE.Mesh(chitGeo, chitMat); m.castShadow = true; m.position.copy(pts[0]);
    fly(m, pts, 0.55, () => setTimeout(() => scene.remove(m), 2500), path.map(personAt));
  }
  function playPass(fromSid, toSid, k) {
    const a = deskTop(fromSid), b = deskTop(toSid); if (!a || !b) return;
    const m = itemMesh(k || 'pen'); m.position.copy(a);
    fly(m, [a, b], 0.9, () => scene.remove(m), [personAt(fromSid), personAt(toSid)]);
  }
  function stepFlights(dt) {
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i]; f.t += dt / f.hop;
      if (f.i === 0 && f.t < 0.05 && f.reachers[0]) f.reachers[0].anim.reach();
      if (f.t >= 1) { f.i++; f.t = 0; if (f.reachers[f.i]) f.reachers[f.i].anim.reach(); }
      if (f.i >= f.pts.length - 1) { f.obj.position.copy(f.pts[f.pts.length - 1]); flights.splice(i, 1); f.done && f.done(); continue; }
      const a = f.pts[f.i], b = f.pts[f.i + 1], t = f.t;
      f.obj.position.lerpVectors(a, b, t); f.obj.position.y += Math.sin(t * Math.PI) * (0.25 + a.distanceTo(b) * 0.08);
      f.obj.rotation.y += dt * 6;
    }
  }

  /* ---------- the board ---------- */
  let boardState = {};
  function setBoard(s) { boardState = Object.assign({}, boardState, s); const c = boardTex.userData.canvas; drawBoard(c.getContext('2d'), c.width, c.height, boardState); boardTex.needsUpdate = true; }
  setBoard({});
  /* where the board is on screen, for laying the live Zoom picture exactly over it */
  function boardQuad() {
    const r = el.getBoundingClientRect(), pts = [];
    for (const i of [3, 2, 1, 0]) {                               // top-left, top-right, bottom-right, bottom-left
      const v = boardCorners[i].clone().project(camera);
      if (v.z > 1 || v.z < -1) return null;                       // part of the board is behind you
      pts.push([(v.x + 1) / 2 * r.width + r.left, (1 - v.y) / 2 * r.height + r.top]);
    }
    return pts;
  }
  function setHole(on) { if (boardScreen) boardScreen.material = on ? holeMat : boardMat; }
  function boardRect() {
    const r = el.getBoundingClientRect(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, ok = true;
    for (const c of boardCorners) { const v = c.clone().project(camera); if (v.z > 1 || v.z < -1) ok = false; const x = (v.x + 1) / 2 * r.width + r.left, y = (1 - v.y) / 2 * r.height + r.top; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
    const facing = -fwd.z;                                         // 1 = looking straight at the board
    const vis = ok && facing > 0.55 && x1 > r.left && x0 < r.right && y1 > r.top && y0 < r.bottom;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, visible: vis, facing };
  }

  /* ---------- frame loop ---------- */
  const clock = new THREE.Clock(); let running = true, lastEmit = 0, lastMinute = -1;
  const fwd = new THREE.Vector3();
  function emit() {
    if (!me || !opt.onMove) return;
    const p = me.obj.position;
    opt.onMove({ x: p.x, z: p.z, ry: me.obj.rotation.y, a: me.anim.mode === 'sit' ? 'sit' : me.path.length || keys.size ? 'walk' : 'idle' });
  }
  function loop() {
    const raw = clock.getDelta(), dt = Math.min(0.1, raw), mdt = Math.min(0.5, raw), t = clock.elapsedTime;   /* moving uses real time, so a slow computer still arrives on time */
    /* me */
    if (me) {
      let moving = false;
      if (keys.size && !me.seat) {
        me.path = []; onArrive = null;
        const f = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
        const s = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
        if (f || s) {
          fwd.set(Math.sin(yaw), 0, Math.cos(yaw));
          const dir = new THREE.Vector3(fwd.x * f - fwd.z * s, 0, fwd.z * f + fwd.x * s).normalize();
          me.obj.position.addScaledVector(dir, 1.9 * mdt); collide(me.obj.position);
          me.ry = Math.atan2(dir.x, dir.z); moving = true;
        }
      } else if (me.path.length) {
        const tg = me.path[0], p = me.obj.position;
        const dx = tg.x - p.x, dz = tg.z - p.z, d = Math.hypot(dx, dz);
        if (d < 0.06) { me.path.shift(); if (!me.path.length) { const cb = onArrive; onArrive = null; me.anim.set('idle'); emit(); cb && cb(); } }
        else { const st = Math.min(d, 1.9 * mdt); p.x += dx / d * st; p.z += dz / d * st; me.ry = Math.atan2(dx, dz); moving = true; }
      }
      if (moving) { me.anim.set('walk'); me.anim.speed(1.9); }
      else if (me.anim.mode === 'walk' && !me.path.length) { me.anim.set('idle'); emit(); }
      let dr = me.ry - me.obj.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); me.obj.rotation.y += dr * Math.min(1, dt * 10);
      if (moving && t - lastEmit > 0.14) { lastEmit = t; emit(); }
      if (camMode === 'third' && moving && !down) { let dy = me.obj.rotation.y - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); yaw += dy * Math.min(1, dt * 1.5); }
    }
    /* everyone else */
    for (const P of people.values()) {
      if (!P.mine) {
        const p = P.obj.position, d = p.distanceTo(P.target);
        if (d > 0.01) { p.lerp(P.target, Math.min(1, dt * 6)); P.anim.speed(d * 6); }
        let dr = P.ry - P.obj.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); P.obj.rotation.y += dr * Math.min(1, dt * 8);
      }
      P.anim.update(dt, t);
    }
    stepFlights(dt);
    updateCamera(dt);
    const mi = new Date().getMinutes(); if (mi !== lastMinute) { lastMinute = mi; drawClock(); setBoard({}); }
    renderer.render(scene, camera); labels.render(scene, camera);
    opt.onFrame && opt.onFrame();
  }
  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h); labels.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();
  renderer.setAnimationLoop(loop);

  return {
    seats: SEATS, order: SEAT_ORDER,
    setMe, upsert, remove: removePerson, goSit, sitNow, standUp, walkTo,
    get mySeat() { return me && me.seat; },
    get hasMe() { return !!me; },
    get walking() { return !!(me && me.path.length); },
    get state() { return me && { pos: me.obj.position.toArray().map(v => +v.toFixed(2)), path: me.path.map(p => [+p.x.toFixed(2), +p.z.toFixed(2)]), seat: me.seat, mode: me.anim.mode }; },
    /* where a chair is on screen (for tests and on-screen hints) */
    screenOf(sid) { const s = seatById(sid); if (!s) return null; const v = new THREE.Vector3(s.x, 0.5, s.z).project(camera), r = el.getBoundingClientRect(); const x = (v.x + 1) / 2 * r.width + r.left, y = (1 - v.y) / 2 * r.height + r.top, h = v.z < 1 && pick(x, y); return { x, y, on: v.z < 1, clear: !!(h && h.seat === sid) }; },
    setMyHand(on) { if (me) setHand(me, on); },
    setOccupied(fn) { occupied = fn; refreshMarks(); },
    setBoard, boardRect, boardQuad, setHole, playChit, playPass, setDeskItems, view,
    get viewMode() { return camMode; },
    pause() { running = false; renderer.setAnimationLoop(null); },
    resume() { if (!running) { running = true; clock.getDelta(); renderer.setAnimationLoop(loop); } },
    dispose() { renderer.setAnimationLoop(null); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); renderer.dispose(); host.innerHTML = ''; },
  };
}

/* the turntable in the lobby: shows the look you picked */
export function createPreview(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
  scene.add(new THREE.HemisphereLight('#ffffff', '#8a7a6a', 0.9));
  const key = new THREE.DirectionalLight('#fff3e0', 2.2); key.position.set(2, 3, 3); scene.add(key);
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 20); cam.position.set(0, 1.05, 4.7); cam.lookAt(0, 0.88, 0);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.05, 48), new THREE.MeshStandardMaterial({ color: '#203454', roughness: 0.5 })); disc.position.y = -0.025; scene.add(disc);
  let ch = null, raf = 0; const clock = new THREE.Clock();
  const size = () => { const w = canvas.clientWidth || 200, h = canvas.clientHeight || 260; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(canvas); size();
  const tick = () => { const dt = clock.getDelta(), t = clock.elapsedTime; if (ch) { ch.rotation.y = Math.sin(t * 0.6) * 0.7; ch.userData.anim.update(dt, t); } renderer.render(scene, cam); raf = requestAnimationFrame(tick); };
  tick();
  return {
    show(a) { if (ch) scene.remove(ch); ch = buildCharacter(THREE, a); scene.add(ch); },
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
