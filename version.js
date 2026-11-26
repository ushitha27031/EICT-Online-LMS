/* ============================================================
   EICT — one version number for the whole website.

   Every page shows it in a small badge in the corner. After an
   update is merged, open any page: if the badge shows the new
   number, the update is live. If your browser still has the old
   page, the badge turns gold — "New version — tap to refresh".

   Claude bumps V, DATE and NOTE with every update.
   ============================================================ */
(function () {
  var V = '5.1.0', DATE = '2026-11-26', NOTE = 'Version badge on every page; checkpoint exam days in the form; Thursday/Saturday sittings fix; virtual classroom board inside the 3D board, sir can walk in.';
  window.EICT_VERSION = V;
  var me = document.currentScript && document.currentScript.src;
  var day = new Date(DATE + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  function css() {
    var s = document.createElement('style');
    s.textContent =
      /* a small tab on the left edge, half-way down: clear of every page's top bar and bottom buttons */
      '.eict-ver{position:fixed;left:0;top:50%;transform-origin:0 0;transform:rotate(-90deg) translateX(-50%);z-index:2147483000;white-space:nowrap;' +
      'font:500 10.5px/1 "IBM Plex Mono",ui-monospace,monospace;padding:4px 8px;border-radius:0 0 8px 8px;border:1px solid rgba(150,170,220,.35);border-top:0;' +
      'background:rgba(11,16,32,.78);color:#c9d3e8;cursor:pointer;opacity:.7;-webkit-tap-highlight-color:transparent}' +
      '.eict-ver:hover{opacity:1}.eict-ver.new{background:#ffc24b;color:#201400;border-color:#ffc24b;opacity:1;font-weight:700;animation:eictv 1.4s infinite}' +
      '@keyframes eictv{50%{box-shadow:0 0 0 6px rgba(255,194,75,.25)}}' +
      '.eict-ver-pop{position:fixed;left:30px;top:50%;transform:translateY(-50%);z-index:2147483001;max-width:min(340px,calc(100vw - 16px));background:#141c33;color:#eaeef8;' +
      'border:1px solid rgba(150,170,220,.35);border-radius:14px;padding:12px 14px;font:14px/1.45 "IBM Plex Sans",system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.5)}' +
      '.eict-ver-pop b{font-family:"IBM Plex Mono",monospace}.eict-ver-pop small{color:#9aa6bf;display:block;margin-top:6px}' +
      '.eict-ver-pop button{margin-top:10px;font:600 13px system-ui;padding:7px 12px;border-radius:9px;border:0;background:#0ea5e9;color:#fff;cursor:pointer}' +
      '@media print{.eict-ver,.eict-ver-pop{display:none}}';
    document.head.appendChild(s);
  }
  var el, latest = null;
  function draw() {
    if (!el) return;
    if (latest && latest !== V) { el.className = 'eict-ver new'; el.textContent = 'New version v' + latest + ' — tap to refresh'; }
    else { el.className = 'eict-ver'; el.textContent = 'v' + V + ' · ' + day; }
  }
  /* fetch the page and its files past the browser's cache, then reload them */
  function refresh() {
    var urls = [location.href.split('#')[0], me];
    document.querySelectorAll('script[src],link[rel="stylesheet"][href]').forEach(function (x) { var u = x.src || x.href; if (u && u.indexOf(location.origin) === 0) urls.push(u); });
    if (el) el.textContent = 'Updating…';
    Promise.all(urls.map(function (u) { return fetch(u, { cache: 'reload' }).catch(function () {}); })).then(function () { location.reload(); });
  }
  function pop() {
    var old = document.querySelector('.eict-ver-pop'); if (old) { old.remove(); return; }
    var p = document.createElement('div'); p.className = 'eict-ver-pop'; p.setAttribute('role', 'dialog');
    var fresh = latest && latest !== V;
    p.innerHTML = '<div>This page: <b>v' + V + '</b> (' + day + ')</div>' +
      (fresh ? '<div style="color:#ffc24b;margin-top:4px">The website already has <b>v' + latest + '</b>.</div>' : latest ? '<div style="color:#3fd99a;margin-top:4px">✓ This is the latest version.</div>' : '') +
      '<small></small><button type="button">' + (fresh ? 'Refresh now' : 'Check again') + '</button>';
    p.querySelector('small').textContent = NOTE;
    p.querySelector('button').onclick = function () { if (fresh) refresh(); else check(true); };
    document.body.appendChild(p);
    setTimeout(function () { document.addEventListener('click', function f(e) { if (!p.contains(e.target) && e.target !== el) { p.remove(); document.removeEventListener('click', f); } }); }, 0);
  }
  /* ask the website (not the browser's cache) which version it has now */
  function check(show) {
    if (!me || !window.fetch) return;
    fetch(me.split('?')[0] + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      var m = /var V = '([^']+)'/.exec(t || ''); if (m) { latest = m[1]; draw(); if (show) { var o = document.querySelector('.eict-ver-pop'); if (o) o.remove(); pop(); } }
    }).catch(function () {});
  }
  function start() {
    css();
    el = document.createElement('button'); el.type = 'button'; el.setAttribute('aria-label', 'Website version');
    el.onclick = function () { if (latest && latest !== V) refresh(); else pop(); };
    document.body.appendChild(el); draw();
    document.querySelectorAll('[data-eict-ver]').forEach(function (x) { x.textContent = 'v' + V; });
    check(false); setInterval(check, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) check(false); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
