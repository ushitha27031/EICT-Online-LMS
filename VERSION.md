# Version log

The version shows on screen: bottom of the sidebar in the dashboard, and on
the sign-in card of the student page.

**If the number on screen is older than the one you just uploaded, the browser
is showing you a cached copy.** Press Ctrl+Shift+R (Cmd+Shift+R on Mac), or
open a private window.

---

## How to release a change

Every time I send you updated files, do this:

1. Replace the files in GitHub as usual.
2. Open `Class.html` and `Admin.html` and find the lines near the top that
   look like this:

   ```html
   <link rel="stylesheet" href="class.css?v=1.1.0">
   <script type="module" src="class.js?v=1.1.0"></script>
   ```

3. Change **both** numbers to the new version.
4. Also change the `VERSION` line near the top of `class.js` and `admin.js`
   so the number on screen matches.

I will tell you the version number with each update, so it's just a
find-and-replace.

**Why this matters.** GitHub Pages tells browsers to keep CSS and JavaScript
for hours. Without the `?v=` marker, a student who visited yesterday keeps
running yesterday's code — the file on the server is new, but their browser
never asks for it. Changing the number makes it look like a different file, so
it gets fetched fresh. This is what made the animations appear missing in
v1.1.0: the code was live, but the old CSS was still cached.

Numbering: **1.2.0** for new features, **1.1.1** for fixes only.

---

## 1.4.0 — the sign-in hang, and signing on to the class

**Fixed: the sign-in button stuck on "Signing in…" with nothing happening.**
Two faults together. The busy state was only cleared when sign-in *failed*, so
any error after a correct password left the button spinning forever. And the
page wrote to elements like the welcome card and the progress ring without
checking they existed — so a `Class.html` even one version behind its
`class.js` threw inside the sign-in callback, where the error vanished as an
unhandled rejection and nobody saw it.

Now every one of those writes is safe, the whole sign-in path is wrapped so a
failure shows a real message naming the cause, and the button is released on
every route out. A mismatched pair of files degrades instead of dying.

**A new intro, and it plays at the right moments.**

Circuit traces draw inward from the edges of the board, contact points flare as
each one lands, a processor comes up and its pins connect, ones and zeroes
stream out of it, the status line goes from Connecting to Connected, and the
panels iris open onto the class. Every stage overlaps the next so it reads as
one continuous move rather than a list of effects.

When it plays:

- **Already signed in, page loads** — plays.
- **Credentials just accepted** — plays, starting the moment the password is
  accepted and running while the account loads behind it.
- **Landing on the sign-in form** — does not play. Nobody wants a ceremony in
  front of an empty form, least of all somebody who just signed out and is
  trying to get back in.

Because the sign-in form now appears immediately when there is no session,
instead of waiting for Firebase to answer, signing out and back in is quicker
than before even with the longer intro.

## 1.3.0 — answer papers, term tests, and a Drive link that actually works

**The Drive problem is fixed by removing the folders.** No shared folders at
all. The student keeps their paper in their own Drive and gives the link; this
site is the index. There is no wrong folder to put it in, because there are
no folders.

Access is checked before the paper can be sent. Google serves a thumbnail for
any file that is readable without signing in, so the site loads that thumbnail
and shows the student the exact preview sir will see. If it appears, sir can
open it and the Send button turns on. If it does not, the student is told to
press Share → Change to anyone with the link, and the button stays off. A
private file has no thumbnail, so this cannot be bluffed. It runs entirely in
the browser — no API key, nothing to pay for.

Also handled: Google Photos links, Dropbox links and plain text are each
rejected with a reason that says what to do instead; folder links are allowed
but warned about; and sending the same file for two different papers asks for
confirmation, since that is nearly always a paste mistake.

**Unit papers.** Every unit's paper comes with its tute in the post. The
student does it, photographs it, and gives the link. Unit 2 does not open until
unit 1's paper is in — so paying for three units at once still releases them
one at a time, in order. A paper sent back to redo locks the next unit again.

**Six term tests** across the thirteen units: 1–2, 3–4, 5–6, 7–8, 9–11, 12–13.
A term test appears only once a student has every unit it covers, so somebody
taking two units never sees one. If they own nothing past the test, it is
marked optional rather than blocking, because it stands in nobody's way.

**Booking a sitting.** Sir puts up sittings; students pick one. Only sittings
more than a week away can be chosen, since the sealed paper has to reach the
house first. MCQ is 2 hours, structured and essay is 3. Booking shows the
parcel-on-its-way note with the address it is going to.

**Teacher: Answer papers.** A queue of everything waiting, with the sidebar
count. Each row opens the file in a new tab. Marks and a note go back to the
student, or send it back to redo — which re-locks the next unit until they
resubmit. A submission that is a folder rather than one file is flagged.

**Teacher: term test sittings.** Add a date, time, which test, which paper and
how many students. See how many have booked each one.

**Also:** Continue watching now skips over units that are waiting on a paper,
instead of disappearing.

**Rules changed — you must republish.** Three new collections: `papers`,
`slots`, `bookings`.

## 1.2.0 — real watch tracking, themes, and a proper arrival

**Watching is now measured, not declared.** The "mark as watched" button is
gone. An episode completes only when playback genuinely reaches within five
minutes of the end AND at least 85% of the video up to that point was really
played. Time is recorded in ten-second buckets while the video is actually
playing, so dragging the scrubber to the end skips buckets and the episode
does not complete. Pausing on the last second does nothing either. Watching at
2x still counts, deliberately — plenty of students revise at double speed.

- Under the video, two bars: pale is how far playback reached, solid is how
  much was truly watched. Seeing them apart explains the rule without words.
- Plain language on what is missing: "6 more minutes to go", or "About 4
  minutes was skipped — go back over it".
- Episodes reopen where they were left, across devices.
- Part-watched episodes show a percentage and a bar in the list.
- Progress is saved at most every fifteen seconds, not every second, to stay
  well inside the free plan's write limit.

**Light and dark mode.** Toggle in the header. Saved on the device and to the
account, so it follows a student to their phone. Follows the phone's own
setting until they choose.

**Arriving at class.** The opening screen is now two doors parting with light
spilling through, then a card that stamps in with their name and student
number — like being handed your ID at the door. Shown once per sign-in.

**Unlocking a unit** is a seal breaking: a padlock springs open and drops away
as the unit number flips into view, with sparks. Replaces the plain tick.

**Tutes by courier.** When a recordings payment is approved, the popup shows a
parcel travelling to a house and says the printed tutes and papers are on the
way to their address, 3–5 days. If no address is saved it asks them to add one.

**Recordings hero.** A progress ring for the whole syllabus, plus the numbers
that actually motivate: episodes finished, hours watched, units cleared.

**Teacher: set the length of each video.** The season editor now takes minutes
per episode alongside the YouTube id, since lengths vary. Leave it blank to use
the suggested length. Old seasons keep working; they are upgraded as you save.

**Rules changed.** Students may now write `progress` and `theme` on their own
record. Both rule files updated — publish whichever one you are using.

## 1.1.1 — animations reach the browser

- Added `?v=` cache markers to every CSS and JS link. This is the actual fix
  for animations not appearing; the code was live but browsers kept the old
  stylesheet.
- Version number now shows on screen in both pages, so you can confirm what
  is actually running.
- Fixed the halo ring behind the green tick, which was positioned against the
  page instead of the tick and appeared in the wrong place.

## 1.1.0 — recordings payments, and motion

- **Fixed: a recordings payment opened a live month instead of the unit.**
  The student page sent the right information; the dashboard ignored it, so
  approving Rs. 2,500 for recordings gave live class access and no recordings.
- Slip cards now say what they are for, tagged Live class or Recordings, with
  the right expected amount for each.
- Approve button reads "Approve and open unit 05" for recordings.
- New filter to show only live or only recordings payments.
- Record a payment by hand can now do recordings as well as months.
- Loading splash on the student page.
- Spinner and progress bar on the register, sign-in and send-slip buttons.
- Green tick confirmation after registering and after sending a slip.
- Approved popup when a student returns and finds something has been opened
  for them, with the unit card pulsing green.
- All motion switches off for anyone with reduced motion enabled.

## 1.0.1 — registration fixes

- Fixed registration failing silently. The session clock was stamped after
  sign-in rather than before, so the auth check ran first, found no session,
  and signed the new student straight back out.
- Added the missing `slip-upload.js`, without which attaching a slip failed.
- Fixed the season picker showing during a live-class payment.
- Refresh button on the dashboard; it also refreshes when you return to the
  tab. New registrations arriving while it sat open were not appearing.

## 1.0.0 — first release

- Teacher dashboard replacing the control room.
- Registrations queue, automatic student numbers, payment slip inbox,
  free class requests, per-student season unlocking.
- Student page rebuilt: locked live tab, slip upload, profile editing,
  recordings library with the 13-unit syllabus bar.
- Firestore rules enforcing access on the server rather than in the browser.
- Slips stored in Firestore rather than Cloud Storage, to stay on the free plan.
