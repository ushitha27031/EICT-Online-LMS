/* ==========================================================================
   papers.js — submitting answer papers, and deciding what stays locked.

   THE DRIVE PROBLEM
   -----------------
   Two things went wrong on the old site:

     1. Students pasted a link that only they can open. Sir clicks it and gets
        "You need access". The student is certain they submitted; sir sees
        nothing. Nobody is lying and everybody is annoyed.

     2. Sir made folders, and papers landed in the wrong ones.

   Both are fixed here, and the second one is fixed by removing it.

   No shared folders at all. The student keeps their own file in their own
   Drive and gives us the link; this site is the index. There is no wrong
   folder to put it in, because there are no folders.

   For access, the link is checked BEFORE it can be submitted. Google serves a
   thumbnail for any file that is readable without signing in:

        https://drive.google.com/thumbnail?id=FILE_ID

   If that image loads, anyone with the link can open the file — including
   sir. If it does not, the file is still private. So the student is shown the
   very picture sir will see. When it appears, the Submit button turns on.
   When it does not, they get told exactly which setting to change.

   This runs entirely in the browser. No API key, no server, nothing to pay
   for. It cannot be bluffed either: a private file simply has no thumbnail.

   THE UNLOCKING RULE
   ------------------
   Paying for three units at once does not open all three. Unit 2 opens when
   unit 1's paper is in, and so on. A term test blocks everything after it
   until BOTH its papers are in. Term tests only appear once a student has
   all the units that test covers, so somebody who bought two units never
   sees one they cannot sit.

   TERM TESTS ARE NOW A SCHEDULED EXAM, NOT JUST A PAPER
   -------------------------------------------------------
   Sir defines a term test — which units it covers, a booking window, and a
   timing structure (prep time, MCQ length, break, essay length, final
   upload time). A student picks one start time inside that window; every
   later marker — when MCQ ends, when the break ends, when the essay ends —
   is computed from that single choice and frozen onto their booking. If sir
   later edits the default timing for future bookings, nobody already
   scheduled is silently reshuffled.

   Only the first ten minutes (before MCQ starts) and the last ten minutes
   (after the essay ends) are free time. The thirty-minute gap in between
   has to cover both uploading the MCQ paper and getting ready for the
   essay — neither gets its own allowance, on purpose, matching how the
   exam is meant to run in one continuous 5 hour 50 minute sitting.
   ========================================================================== */

/* ====================================================== drive link ====== */

const ID = '[A-Za-z0-9_-]{10,}';

/**
 * Pull the file id out of whatever a student pastes. They paste all sorts:
 * the address bar, the share dialog, the mobile app, sometimes with the
 * usp=sharing tail, sometimes a Docs link.
 */
export function parseDrive(raw) {
  const url = String(raw || '').trim();
  if (!url) return { ok: false, why: 'Paste the link to your paper.' };

  if (!/^https?:\/\//i.test(url))
    return { ok: false, why: 'That does not look like a link. It should start with https://' };

  let host;
  try { host = new URL(url).hostname.replace(/^www\./, ''); }
  catch (_) { return { ok: false, why: 'That link could not be read. Copy it again from Drive.' }; }

  const googly = /(^|\.)(drive|docs)\.google\.com$/.test(host);
  if (!googly) {
    if (/photos\.app\.goo\.gl|photos\.google\.com/.test(host))
      return { ok: false, why: 'That is a Google Photos link. Upload the paper to Google Drive instead — Photos links cannot be opened by sir.' };
    return { ok: false, why: 'Only Google Drive links work here. Upload your paper to Drive and share the link.' };
  }

  // A folder. Allowed, but flagged, because a folder of loose photos is how
  // half of the old mess started.
  const folder = url.match(new RegExp(`/folders/(${ID})`));
  if (folder) return { ok: true, id: folder[1], kind: 'folder', url };

  const patterns = [
    new RegExp(`/file/d/(${ID})`),                  // drive.google.com/file/d/ID/view
    new RegExp(`/document/d/(${ID})`),              // docs
    new RegExp(`/presentation/d/(${ID})`),
    new RegExp(`/spreadsheets/d/(${ID})`),
    new RegExp(`[?&]id=(${ID})`),                   // open?id=ID
    new RegExp(`/d/(${ID})`)
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return { ok: true, id: m[1], kind: 'file', url };
  }

  return { ok: false, why: 'No file id in that link. Use Share → Copy link on the file itself.' };
}

/**
 * Can anyone with the link open this? Loads the Drive thumbnail; it only
 * exists for files that are readable without signing in.
 *
 * A folder has no thumbnail, so folders come back 'unknown' rather than
 * failing — we warn about those separately instead of blocking.
 */
export function checkAccess(id, kind = 'file', timeout = 9000) {
  if (kind === 'folder') return Promise.resolve({ open: null, thumb: null });

  return new Promise((resolve) => {
    const thumb = `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w480`;
    const img = new Image();
    let settled = false;

    const done = (open) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ open, thumb: open ? thumb : null });
    };

    const timer = setTimeout(() => done(false), timeout);
    img.onload  = () => done(img.naturalWidth > 1);
    img.onerror = () => done(false);
    img.referrerPolicy = 'no-referrer';
    img.src = thumb;
  });
}

/** A link that always opens for sir, whatever form the student pasted. */
export const viewUrl = (id, kind) => kind === 'folder'
  ? `https://drive.google.com/drive/folders/${id}`
  : `https://drive.google.com/file/d/${id}/view`;

/* ================================================================ keys === */

const unitKey = (n) => `unit-${n}`;
const termMcqKey   = (n) => `term-${n}-mcq`;
const termEssayKey = (n) => `term-${n}-essay`;

/** Has this paper been handed in and not sent back? */
export function isIn(papers, kind, n) {
  const p = papers[unitKey(n)];
  if (kind !== 'unit') return false;   // term-test completeness uses isTermDone, not this
  return !!p && p.status !== 'redo';
}

/** A term test needs both halves in, and neither sent back, to count as done. */
export function isTermDone(papers, n) {
  const mcq = papers[termMcqKey(n)];
  const essay = papers[termEssayKey(n)];
  return !!mcq && mcq.status !== 'redo' && !!essay && essay.status !== 'redo';
}

export { unitKey, termMcqKey, termEssayKey };

/* ============================================================ the gate === */

/** Which term test, if any, sits right after a given unit. */
export function termAfter(unit, termTests) {
  return (termTests || []).find(t => Math.max(...t.units) === unit) || null;
}

/**
 * Everything the recordings tab needs to know about one unit.
 *
 * paid      — it is in the student's unlocked list
 * open      — they can actually watch it now
 * blockedBy — what is in the way: a unit paper, or a term test
 */
export function unitState(unit, paidUnits, papers, termTests) {
  const paid = paidUnits.includes(unit);
  if (!paid) return { paid: false, open: false, blockedBy: null };

  const earlier = paidUnits.filter(u => u < unit).sort((a, b) => a - b);
  for (const u of earlier) {
    if (!isIn(papers, 'unit', u))
      return { paid: true, open: false, blockedBy: { kind: 'unit', n: u } };

    const t = termAfter(u, termTests);
    if (t && t.units.every(x => paidUnits.includes(x)) && !isTermDone(papers, t.n))
      return { paid: true, open: false, blockedBy: { kind: 'term', n: t.n } };
  }
  return { paid: true, open: true, blockedBy: null };
}

/**
 * The term tests this student should see. A term test only appears once every
 * unit it covers has been paid for, so somebody taking two units never has one
 * shown to them.
 */
export function visibleTerms(paidUnits, papers, termTests) {
  return (termTests || [])
    .filter(t => t.units.every(u => paidUnits.includes(u)))
    .map(t => {
      const watchedAll = t.units.every(u => isIn(papers, 'unit', u));
      const last = Math.max(...t.units);
      // If they own nothing past this test, it blocks nothing — so it is
      // offered rather than demanded. A student taking two units should not
      // be told they are stuck behind an exam they never signed up for.
      const blocking = paidUnits.some(u => u > last);
      return {
        ...t,
        ready: watchedAll,                 // all unit papers in, may book the sitting
        done: isTermDone(papers, t.n),
        blocking,
        mcqPaper: papers[termMcqKey(t.n)] || null,
        essayPaper: papers[termEssayKey(t.n)] || null
      };
    });
}

/* ===================================================== the scheduled exam */

/** Sane defaults matching a standard sitting — every field editable per test. */
export const DEFAULT_TIMING = {
  prepMins: 10,     // free time before MCQ starts — get ready, do not open yet
  mcqMins: 120,
  breakMins: 30,    // must cover BOTH uploading the MCQ and starting the essay
  essayMins: 180,
  finalMins: 10      // free time after the essay ends — scan and upload
};

/** The same physical-mail reasoning as everywhere else on the site: a
 * sitting has to be booked far enough ahead for the sealed paper to
 * actually arrive by post. */
export const MIN_NOTICE_DAYS = 7;

const MIN = 60000;
const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * Every phase boundary, computed once from a chosen start time. This is
 * frozen onto the booking at the moment it is made — sir editing a term
 * test's default timing afterward must never reshuffle a sitting someone
 * already has scheduled.
 */
export function computeSchedule(timing, startAtMs) {
  const t = { ...DEFAULT_TIMING, ...(timing || {}) };
  const mcqStart   = startAtMs;
  const prepStart  = mcqStart - t.prepMins * MIN;
  const mcqEnd     = mcqStart + t.mcqMins * MIN;
  const breakEnd   = mcqEnd + t.breakMins * MIN;    // essay starts here, no exceptions
  const essayStart = breakEnd;
  const essayEnd   = essayStart + t.essayMins * MIN;
  const finalEnd   = essayEnd + t.finalMins * MIN;
  return { prepStart, mcqStart, mcqEnd, breakEnd, essayStart, essayEnd, finalEnd };
}

/**
 * Is this a legal moment to start a sitting? Checks the booking window, the
 * allowed time of day (so a sitting cannot be started at 11pm and run past
 * midnight), and that there is enough notice for the paper to arrive.
 */
export function validateStart(termTest, startAtMs, now = Date.now()) {
  if (!startAtMs || Number.isNaN(startAtMs)) return { ok: false, why: 'Pick a date and time.' };

  const notice = startAtMs - now;
  if (notice < MIN_NOTICE_DAYS * 86400000)
    return { ok: false, why: `Needs at least ${MIN_NOTICE_DAYS} days' notice — the paper goes out by post.` };

  const dateStr = isoDate(startAtMs);
  if (termTest.bookFrom && dateStr < termTest.bookFrom)
    return { ok: false, why: `Sittings for this term test open from ${termTest.bookFrom}.` };
  if (termTest.bookTo && dateStr > termTest.bookTo)
    return { ok: false, why: `Sittings for this term test close after ${termTest.bookTo}.` };

  const d = new Date(startAtMs);
  const startMin = d.getHours() * 60 + d.getMinutes();
  const ds = termTest.dayStart || '07:00', de = termTest.dayEnd || '13:00';
  const [dsH, dsM] = ds.split(':').map(Number);
  const [deH, deM] = de.split(':').map(Number);
  if (startMin < dsH * 60 + dsM || startMin > deH * 60 + deM)
    return { ok: false, why: `Pick a start time between ${ds} and ${de}, so the sitting finishes the same day.` };

  return { ok: true };
}

/**
 * Which phase a sitting is in right now, in plain language, and what time
 * it next changes. This is the single source of truth the student-facing
 * timer reads from every second — nothing about "what to show" lives
 * anywhere else, so the phase logic cannot drift out of sync with itself.
 */
export function phaseNow(sched, now = Date.now()) {
  if (now < sched.prepStart)
    return { phase: 'ahead', label: 'Booked', next: sched.prepStart, urgent: false };
  if (now < sched.mcqStart)
    return { phase: 'prep', label: 'Get ready — do not open the envelope yet', next: sched.mcqStart, urgent: false };
  if (now < sched.mcqEnd)
    return { phase: 'mcq', label: 'MCQ paper', next: sched.mcqEnd, urgent: sched.mcqEnd - now < 10 * MIN };
  if (now < sched.breakEnd)
    return { phase: 'break', label: 'Upload the MCQ — essay starts automatically', next: sched.breakEnd, urgent: sched.breakEnd - now < 8 * MIN };
  if (now < sched.essayEnd)
    return { phase: 'essay', label: 'Structured and essay paper', next: sched.essayEnd, urgent: sched.essayEnd - now < 15 * MIN };
  if (now < sched.finalEnd)
    return { phase: 'final', label: 'Upload the essay now', next: sched.finalEnd, urgent: true };
  return { phase: 'over', label: 'This sitting has ended', next: null, urgent: false };
}

/** m:ss under an hour, h:mm:ss over it — always exact, never rounds up past zero. */
export function fmtCountdown(ms) {
  if (ms <= 0) return '0:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}
