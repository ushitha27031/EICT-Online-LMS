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
   until that paper is in too. Term tests only appear once a student has all
   the units that test covers, so somebody who bought two units never sees one.
   ========================================================================== */

/* Which units each term test covers. Thirteen units, six tests. */
export const TERMS = [
  { n: 1, units: [1, 2],        name: 'Term test 1' },
  { n: 2, units: [3, 4],        name: 'Term test 2' },
  { n: 3, units: [5, 6],        name: 'Term test 3' },
  { n: 4, units: [7, 8],        name: 'Term test 4' },
  { n: 5, units: [9, 10, 11],   name: 'Term test 5' },
  { n: 6, units: [12, 13],      name: 'Term test 6' }
];

export const PAPER_KINDS = {
  mcq:   { label: 'MCQ paper',                mins: 120 },
  essay: { label: 'Structured and essay',     mins: 180 }
};

/** Slots must be booked this far ahead, because the paper goes by post. */
export const BOOK_AHEAD_DAYS = 7;

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

/* ====================================================== the gate ======== */

const key = (kind, n) => kind === 'term' ? `term-${n}` : `unit-${n}`;

/** Has this paper been handed in and not sent back? */
export function isIn(papers, kind, n) {
  const p = papers[key(kind, n)];
  return !!p && p.status !== 'redo';
}

/** Which term test, if any, sits between two units. */
export function termAfter(unit) {
  return TERMS.find(t => t.units[t.units.length - 1] === unit) || null;
}

/**
 * Everything the recordings tab needs to know about one unit.
 *
 * paid      — it is in the student's unlocked list
 * open      — they can actually watch it now
 * blockedBy — what is in the way: a unit paper, or a term test
 */
export function unitState(unit, paidUnits, papers) {
  const paid = paidUnits.includes(unit);
  if (!paid) return { paid: false, open: false, blockedBy: null };

  // Every earlier unit they have paid for must have its paper in.
  const earlier = paidUnits.filter(u => u < unit).sort((a, b) => a - b);
  for (const u of earlier) {
    if (!isIn(papers, 'unit', u))
      return { paid: true, open: false, blockedBy: { kind: 'unit', n: u } };

    // And any term test that falls due at that point.
    const t = termAfter(u);
    if (t && t.units.every(x => paidUnits.includes(x)) && !isIn(papers, 'term', t.n))
      return { paid: true, open: false, blockedBy: { kind: 'term', n: t.n } };
  }
  return { paid: true, open: true, blockedBy: null };
}

/**
 * The term tests this student should see. A term test only appears once every
 * unit it covers has been paid for, so somebody taking two units never has one
 * shown to them.
 */
export function visibleTerms(paidUnits, papers) {
  return TERMS
    .filter(t => t.units.every(u => paidUnits.includes(u)))
    .map(t => {
      const watchedAll = t.units.every(u => isIn(papers, 'unit', u));
      const last = t.units[t.units.length - 1];
      // If they own nothing past this test, it blocks nothing — so it is
      // offered rather than demanded. A student taking two units should not
      // be told they are stuck behind an exam they never signed up for.
      const blocking = paidUnits.some(u => u > last);
      return {
        ...t,
        ready: watchedAll,                 // all unit papers in, may sit the test
        done: isIn(papers, 'term', t.n),
        blocking,
        paper: papers[key('term', t.n)] || null
      };
    });
}

/** Slots a student may still choose: far enough ahead, and not full. */
export function bookableSlots(slots, now = Date.now()) {
  const earliest = now + BOOK_AHEAD_DAYS * 86400000;
  return slots
    .filter(s => new Date(s.at).getTime() >= earliest)
    .filter(s => (s.taken || 0) < (s.capacity || 999))
    .sort((a, b) => new Date(a.at) - new Date(b.at));
}

export { key as paperKey };
