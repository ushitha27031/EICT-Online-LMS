/* ============================================================
   EICT Virtual Academy — the tute on your desk.
   Opens like a book: the cover first, then the PDF's pages.
   Works on phones (swipe, pinch-free zoom buttons, fits the
   width) and keeps the lecture running while you read.
   PDF.js draws the pages; nothing leaves the browser.
   ============================================================ */
const PDFJS_VER = '5.4.296';
const PDFJS = () => (window.VC_CDN && window.VC_CDN.pdfjs) || `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VER}/build/`;
let lib = null;
async function pdfjs() {
  if (lib) return lib;
  lib = await import(PDFJS() + 'pdf.min.mjs');
  lib.GlobalWorkerOptions.workerSrc = PDFJS() + 'pdf.worker.min.mjs';
  return lib;
}

/* panel: the drawer element; getBytes(tute) → Promise<ArrayBuffer|null> */
export function createReader(panel, getBytes) {
  panel.innerHTML = `
    <div class="rd-head">
      <button class="rd-x" data-rd="close" aria-label="Close tute">✕</button>
      <b class="rd-t">Tute</b>
      <span class="rd-pg" aria-live="polite"></span>
    </div>
    <div class="rd-body" tabindex="0">
      <div class="rd-book"><div class="rd-cover"><img alt=""><div class="rd-open">Tap to open</div></div></div>
      <div class="rd-pages" hidden></div>
      <p class="rd-msg" hidden></p>
    </div>
    <div class="rd-bar">
      <button data-rd="prev" aria-label="Previous page">‹</button>
      <button data-rd="out" aria-label="Zoom out">−</button>
      <button data-rd="fit">Fit</button>
      <button data-rd="in" aria-label="Zoom in">+</button>
      <button data-rd="next" aria-label="Next page">›</button>
    </div>`;
  const $ = s => panel.querySelector(s);
  let doc = null, page = 0, zoom = 1, tute = null, rendering = null, opened = false;

  async function draw() {
    const box = $('.rd-pages'), msg = $('.rd-msg');
    $('.rd-pg').textContent = doc ? `${page} / ${doc.numPages}` : page === 0 ? 'Cover' : '';
    if (!doc || page === 0) return;
    const my = {}; rendering = my;
    const p = await doc.getPage(page);
    if (rendering !== my) return;
    const avail = Math.max(240, $('.rd-body').clientWidth - 24);
    const base = p.getViewport({ scale: 1 }), scale = avail / base.width * zoom;
    const vp = p.getViewport({ scale }), dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const c = document.createElement('canvas');
    c.width = Math.floor(vp.width * dpr); c.height = Math.floor(vp.height * dpr);
    c.style.width = Math.floor(vp.width) + 'px'; c.style.height = Math.floor(vp.height) + 'px';
    await p.render({ canvasContext: c.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
    if (rendering !== my) return;
    box.replaceChildren(c); msg.hidden = true;
  }
  async function openBook() {
    if (opened) return; opened = true;
    $('.rd-cover').classList.add('flip');
    const msg = $('.rd-msg');
    msg.hidden = false; msg.textContent = 'Opening the tute…';
    try {
      const bytes = await getBytes(tute);
      if (!bytes) { msg.textContent = 'Sir has not put this tute\'s PDF online yet. The cover is all there is for now.'; opened = false; $('.rd-cover').classList.remove('flip'); return; }
      const L = await pdfjs();
      doc = await L.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false }).promise;
      setTimeout(() => { $('.rd-book').hidden = true; $('.rd-pages').hidden = false; page = 1; draw(); }, 420);
    } catch (e) {
      msg.textContent = 'Could not open the tute. Check your internet and try again.'; opened = false; $('.rd-cover').classList.remove('flip');
    }
  }
  function go(d) {
    if (!doc) { if (d > 0) openBook(); return; }
    const n = Math.max(1, Math.min(doc.numPages, page + d)); if (n === page) return; page = n; $('.rd-body').scrollTop = 0; draw();
  }
  panel.addEventListener('click', e => {
    const b = e.target.closest('[data-rd]'); if (e.target.closest('.rd-cover')) return openBook();
    if (!b) return;
    const k = b.dataset.rd;
    if (k === 'close') return api.close();
    if (k === 'prev') go(-1); if (k === 'next') go(1);
    if (k === 'in') { zoom = Math.min(3, zoom * 1.25); draw(); }
    if (k === 'out') { zoom = Math.max(0.5, zoom / 1.25); draw(); }
    if (k === 'fit') { zoom = 1; draw(); }
  });
  /* swipe left / right on a phone */
  let sx = null;
  $('.rd-body').addEventListener('touchstart', e => { sx = e.touches.length === 1 ? [e.touches[0].clientX, e.touches[0].clientY] : null; }, { passive: true });
  $('.rd-body').addEventListener('touchend', e => {
    if (!sx || zoom > 1.05) return; const t = e.changedTouches[0], dx = t.clientX - sx[0], dy = t.clientY - sx[1];
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1); sx = null;
  });
  panel.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'Escape') api.close(); });
  let ro = new ResizeObserver(() => { if (doc && page) draw(); }); ro.observe($('.rd-body'));

  const api = {
    open(t) {
      if (!tute || tute.id !== t.id) { tute = t; doc = null; page = 0; zoom = 1; opened = false; $('.rd-book').hidden = false; $('.rd-pages').hidden = true; $('.rd-pages').innerHTML = ''; $('.rd-cover').classList.remove('flip'); $('.rd-msg').hidden = true; }
      $('.rd-t').textContent = t.title || 'Tute'; $('.rd-cover img').src = t.cover || 'assets/logic-gate-cover.png';
      panel.classList.add('on'); panel.setAttribute('aria-hidden', 'false'); draw();
      setTimeout(() => $('.rd-body').focus({ preventScroll: true }), 50);
    },
    close() { panel.classList.remove('on'); panel.setAttribute('aria-hidden', 'true'); api.onclose && api.onclose(); },
    get isOpen() { return panel.classList.contains('on'); },
  };
  return api;
}
