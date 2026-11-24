/* ============================================================
   EICT Virtual Academy — the live lecture inside the classroom.

   Uses Zoom's official Meeting SDK for Web (Component View).
   The SDK's secret never comes to the browser: the class server
   (Google Apps Script, server/vclass.gs.txt) checks the student's
   sign-in and their invitation, then signs a short-lived ticket.

   Only one Zoom client ever exists on the page, so there is never
   a second video window or a second copy of the sound. The
   picture is always sized at 16 : 9 inside the board, so slides
   are never stretched or cut.

   If the embedded join is not possible (no SDK keys yet, the
   meeting's account doesn't allow it, an old phone) the student
   gets the normal "Open in Zoom" button instead.
   ============================================================ */
export const ZOOM_VER = '6.10.0';
const BASE = () => (window.VC_CDN && window.VC_CDN.zoom) || `https://cdn.jsdelivr.net/npm/@zoom/meetingsdk@${ZOOM_VER}/dist/`;

let client = null, loading = null, state = 'idle', root = null, lastSize = '', muted = true, listeners = new Set();
const emit = (s, extra) => { state = s; listeners.forEach(f => f(s, extra)); };
export const onZoom = f => { listeners.add(f); return () => listeners.delete(f); };
export const zoomState = () => state;

function script(src) {
  return new Promise((res, rej) => {
    if ([...document.scripts].some(s => s.src === src)) return res();
    const s = document.createElement('script'); s.src = src; s.async = false; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(s);
  });
}
async function loadSdk() {
  if (window.ZoomMtgEmbedded) return window.ZoomMtgEmbedded;
  if (!loading) loading = (async () => {
    const b = BASE();
    await script(b + 'lib/vendor/react.min.js');
    await script(b + 'lib/vendor/react-dom.min.js');
    await script(b + 'component-view.umd.min.js');
    const Z = window.ZoomMtgEmbedded || window['@zoom/meetingsdk'];
    if (!Z) throw new Error('Zoom SDK did not start');
    return Z.default || Z;
  })();
  return loading;
}

/* Can this browser run the embedded lecture at all? */
export function canEmbed() {
  try { return !!(window.WebAssembly && window.RTCPeerConnection && window.AudioContext); } catch (e) { return false; }
}

/* fit 16:9 inside a box — never stretch */
export function fit(w, h) {
  let vw = Math.floor(w), vh = Math.floor(vw * 9 / 16);
  if (vh > h) { vh = Math.floor(h); vw = Math.floor(vh * 16 / 9); }
  return { w: Math.max(160, vw), h: Math.max(90, vh) };
}

/* ticket: { signature, meetingNumber, password, obfToken? } from the class server */
export async function joinZoom(el, ticket, name) {
  if (client && (state === 'joined' || state === 'joining')) return client;
  root = el; emit('loading');
  const Z = await loadSdk();
  if (!client) client = Z.createClient();
  const r = el.getBoundingClientRect(), sz = fit(r.width, r.height);
  emit('joining');
  await client.init({
    zoomAppRoot: el,
    language: 'en-US',
    patchJsMedia: true,
    leaveOnPageUnload: true,
    customize: {
      video: { isResizable: false, popper: { disableDraggable: true }, viewSizes: { default: { width: sz.w, height: sz.h }, ribbon: { width: Math.min(300, sz.w), height: sz.h } } },
      meetingInfo: ['topic', 'host', 'participant'],
    },
  });
  try {
    await client.join({
      signature: ticket.signature,
      meetingNumber: String(ticket.meetingNumber),
      password: ticket.password || '',
      userName: name,
      ...(ticket.obfToken ? { obfToken: ticket.obfToken } : {}),
    });
  } catch (e) {
    emit('failed', e && (e.reason || e.message || e.type) || 'join failed');
    throw e;
  }
  lastSize = sz.w + 'x' + sz.h;
  try {
    client.on('connection-change', p => { if (p && /Closed|Fail/i.test(p.state)) emit('ended', p.state); });
    client.on('user-updated', () => { const me = client.getCurrentUser && client.getCurrentUser(); if (me) { muted = !!me.muted; emit('joined'); } });
  } catch (e) {}
  emit('joined');
  return client;
}

/* move/resize the picture when the board moves on screen (debounced by the caller) */
export function sizeZoom(w, h) {
  if (!client || state !== 'joined') return;
  const sz = fit(w, h), key = sz.w + 'x' + sz.h;
  if (key === lastSize) return;
  lastSize = key;
  try { client.updateVideoOptions({ viewSizes: { default: { width: sz.w, height: sz.h } } }); } catch (e) {}
}
export function isMuted() { return muted; }
export async function toggleMic() {
  if (!client || state !== 'joined') return null;
  try { await client.mute(!muted); muted = !muted; emit('joined'); } catch (e) {}
  return muted;
}
export async function leaveZoom() {
  if (!client) return;
  try { await client.leaveMeeting(); } catch (e) {}
  emit('idle');
}
