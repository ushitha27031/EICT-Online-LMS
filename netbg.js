/* ==========================================================================
   netbg.js — a living network behind the class, not a static wallpaper.

   Small nodes drift, lines connect the ones close enough to each other, and
   every so often a bright pulse travels along one connection, like a signal
   passing through a circuit. All of it drawn on a canvas: no images, no
   network requests once this ~4KB file has loaded, and the whole scene is a
   few dozen points and lines, which is nothing for even an old phone to draw
   every frame.

   Respects:
     - prefers-reduced-motion: one motionless frame, no animation loop at all.
     - a hidden tab: the loop stops, so a forgotten background tab does not
       quietly spend battery.
     - light/dark theme: colours are re-read the moment the theme changes.
   ========================================================================== */

(function () {
  const canvas = document.getElementById('netbg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;                      // some locked-down browsers disable canvas

  const prefersReduced =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let nodes = [];
  let pulses = [];
  let raf = null;

  const isLight = () => document.documentElement.dataset.theme === 'light';

  /* Same three colours the rest of the site already uses. */
  function palette() {
    return isLight()
      ? { a: '181,118,8', b: '14,122,75' }   // gold-dark, live-dark on paper
      : { a: '255,194,75', b: '53,224,143' };  // gold, live on navy
  }

  const LINK_DIST = 148;

  /* Roughly one node per 26,000 square pixels of screen, clamped so a phone
     stays light and an ultrawide monitor does not get hundreds of them. */
  function nodeCount() {
    return Math.max(16, Math.min(58, Math.round((W * H) / 26000)));
  }

  function makeNodes() {
    nodes = Array.from({ length: nodeCount() }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      r: 1.1 + Math.random() * 1.5,
      c: Math.random() < 0.8 ? 'a' : 'b'   // mostly gold, a few green
    }));
  }

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    makeNodes();
    pulses = [];
  }

  function links(draw) {
    const P = palette();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK_DIST) continue;
        const alpha = (1 - d / LINK_DIST) * 0.22;
        ctx.strokeStyle = `rgba(${P[a.c]},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        if (draw) draw(a, b, d);
      }
    }
  }

  function dots() {
    const P = palette();
    for (const p of nodes) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${P[p.c]},.8)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* Occasionally send a bright point travelling along a real connection —
     the moment that makes it read as a network rather than just stars. */
  function maybeSpawnPulse() {
    if (Math.random() > 0.018 || nodes.length < 2) return;
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    let best = null, bestD = LINK_DIST;
    for (const b of nodes) {
      if (b === a) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < bestD) { best = b; bestD = d; }
    }
    if (best) pulses.push({ a, b: best, t: 0 });
  }

  function drawPulses() {
    const P = palette();
    pulses = pulses.filter((pl) => {
      pl.t += 0.018;
      if (pl.t >= 1) return false;
      const x = pl.a.x + (pl.b.x - pl.a.x) * pl.t;
      const y = pl.a.y + (pl.b.y - pl.a.y) * pl.t;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${P[pl.a.c]},.95)`;
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const p of nodes) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
      if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;
    }
    links();
    dots();
    maybeSpawnPulse();
    drawPulses();
    raf = requestAnimationFrame(frame);
  }

  function staticFrame() {
    ctx.clearRect(0, 0, W, H);
    links();
    dots();
  }

  function start() {
    if (raf) return;
    if (prefersReduced) { staticFrame(); return; }
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  window.addEventListener('resize', () => {
    resize();
    prefersReduced ? staticFrame() : null;
  });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  // Repaint at once when the theme switches, so colours never lag behind.
  new MutationObserver(() => { if (prefersReduced) staticFrame(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  resize();
  start();
})();
