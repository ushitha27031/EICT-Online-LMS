/* ==========================================================================
   watch.js — proving an episode was actually watched.

   A "mark as watched" button proves nothing: a student taps it and moves on.
   This measures real playback instead, using the YouTube IFrame API, which
   reports the true position of the video second by second.

   Two conditions, both required:

     1. REACHED THE END — playback got to within five minutes of the finish.
        Sir's last few minutes are usually the summary, so anything short of
        that is not a finished episode.

     2. ACTUALLY WATCHED IT — at least 85% of the video up to that point was
        genuinely played. This is what stops the obvious trick of dragging the
        scrubber to the end. Time is recorded in ten-second buckets, and a
        bucket only counts if playback moved through it at a sensible speed
        while actually playing.

   Dragging forward skips buckets, so coverage stays low and the episode does
   not complete. Watching at 2x still counts — the buckets are still crossed —
   which is deliberate, because plenty of students revise at double speed and
   punishing them would be wrong.

   Progress is written to the student's own record so it survives closing the
   tab, and an episode reopens where it was left.
   ========================================================================== */

export const BUCKET = 10;                 // seconds per bucket
export const TAIL   = 5 * 60;             // must reach within this of the end
export const NEED   = 0.85;               // fraction of buckets required

let api = null;                           // promise for the YouTube API

/* Load the IFrame API once, and hand back the same promise after that. */
export function loadAPI() {
  if (api) return api;
  api = new Promise((ok, no) => {
    if (window.YT && window.YT.Player) return ok(window.YT);
    const t = setTimeout(() => no(new Error('YouTube did not load')), 12000);
    window.onYouTubeIframeAPIReady = () => { clearTimeout(t); ok(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { clearTimeout(t); no(new Error('YouTube could not be reached')); };
    document.head.append(s);
  });
  return api;
}

/* A record of one episode's progress. Kept small on purpose: it is written
   into the student's document, and a fat object there would be read on every
   single page load. */
export function blank() {
  return { seen: '', furthest: 0, dur: 0, done: false };
}

/* Buckets are held as a string of 0s and 1s — one character per ten seconds.
   A ninety minute video is 540 characters, which is nothing, and it stays
   readable in the Firebase console if you ever need to look. */
const getBit = (s, i) => s.charCodeAt(i) === 49;
function setBit(s, i) {
  if (i < 0) return s;
  if (s.length <= i) s = s.padEnd(i + 1, '0');
  if (getBit(s, i)) return s;
  return s.slice(0, i) + '1' + s.slice(i + 1);
}
const countBits = (s) => {
  let n = 0;
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) === 49) n++;
  return n;
};

/* How far through, and whether it counts as finished. */
export function assess(p) {
  const dur = p.dur || 0;
  if (!dur) return { pct: 0, done: false, reached: false, covered: 0, need: 0 };

  // The point playback has to reach: five minutes from the end, or 90% for a
  // video shorter than that.
  const target = dur > TAIL * 2 ? dur - TAIL : dur * 0.9;
  const need = Math.max(1, Math.floor((target / BUCKET) * NEED));
  const covered = countBits(p.seen || '');
  const reached = p.furthest >= target - BUCKET;

  return {
    pct: Math.min(100, Math.round((p.furthest / dur) * 100)),
    coveredPct: Math.min(100, Math.round((covered / Math.max(1, target / BUCKET)) * 100)),
    done: p.done || (reached && covered >= need),
    reached, covered, need,
    target
  };
}

/* Plain words for what is still missing, shown under the video. Vague
   messages here just make students think the site is broken. */
export function why(p) {
  const a = assess(p);
  if (a.done) return { ok: true, text: 'Watched' };
  if (!p.dur) return { ok: false, text: 'Starting…' };
  if (!a.reached) {
    const left = Math.max(0, Math.ceil((a.target - p.furthest) / 60));
    return { ok: false, text: `${left} more minute${left === 1 ? '' : 's'} to go` };
  }
  const short = Math.max(1, Math.ceil(((a.need - a.covered) * BUCKET) / 60));
  return { ok: false, text: `About ${short} minute${short === 1 ? '' : 's'} was skipped — go back over it` };
}

/**
 * Watch one player and keep a progress record up to date.
 *
 * @param {object}   player   a YT.Player
 * @param {object}   prog     the record to update, from blank() or storage
 * @param {function} onTick   called with (prog, assessment) about once a second
 * @returns {function} stop
 */
export function track(player, prog, onTick) {
  let last = null;
  let timer = null;

  const tick = () => {
    let t, d, state;
    try {
      t = player.getCurrentTime();
      d = player.getDuration();
      state = player.getPlayerState();
    } catch (_) { return; }

    if (d && d !== prog.dur) prog.dur = Math.round(d);

    // Only count time while it is really playing. Paused, buffering and
    // ended all report a position, and counting those would let a paused
    // tab quietly fill in the whole video.
    const playing = state === 1;

    if (playing && last !== null) {
      const step = t - last;
      // A sane step is forwards and not a jump. Anything bigger is a seek,
      // or a tab that was asleep; either way it fills no buckets.
      if (step > 0 && step < 3) {
        const from = Math.floor(last / BUCKET);
        const to   = Math.floor(t / BUCKET);
        for (let i = from; i <= to; i++) prog.seen = setBit(prog.seen || '', i);
      }
    }

    if (playing) prog.furthest = Math.max(prog.furthest || 0, Math.floor(t));
    last = playing ? t : null;

    const a = assess(prog);
    if (a.done && !prog.done) prog.done = true;
    onTick && onTick(prog, a);
  };

  timer = setInterval(tick, 1000);
  tick();

  return () => { clearInterval(timer); timer = null; };
}
