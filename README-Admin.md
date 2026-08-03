# Teacher dashboard — setup

Replaces `Admin__1_.html` (the control room).

## Files

All of these sit in one folder, next to your `firebase-config.js`.

| File | What it does |
|---|---|
| `Admin.html` + `admin.css` + `admin.js` | the teacher dashboard |
| `Class.html` + `class.css` + `class.js` | the student page |
| `slip-upload.js` | shrinks a slip photo before sending it |
| `firestore.transitional.rules` | **publish this one first** |
| `firestore.rules` | the final lock, after the student page is swapped |
| `storage.rules` | not needed — for the day you move to the paid plan |

Follow `STEP-BY-STEP.md` in order.

Open `Admin.html` with no Firebase config and it runs on sample data, so you can
click through everything before touching the real class.

## Order of setup

**1. Publish the rules.** Firebase console → Firestore → Rules → paste
`firestore.rules` → Publish. Then Storage → Rules → paste `storage.rules`.
Do this first. Until it is done, anyone signed in can read every student
record and every season's video ids.

**2. Turn on Storage** if you have not already (Firebase console → Storage →
Get started). Slip uploads need it.

**3. Make your teacher account.** Firebase console → Authentication → Users →
Add user, with your email and a password. Copy the UID it gives you. Then
Firestore → `students` collection → add a document whose **ID is that UID**:

```
role       : "teacher"          (string)
name       : "Samudaya Manurathna"
email      : "your@email.com"
status     : "active"
```

The dashboard signs out any account whose `role` is not `teacher`.

**4. Create the counter.** Firestore → collection `counters` → document ID
`studentNo` → field `value` (number) = `0`. If you already have students you
have numbered by hand, set it past the highest one.

## Migrating the students you already have

Your current `students` documents have no `role`, `status` or `studentNo`, so
the new rules will lock them out. Run this once in the browser console **on a
page where you are signed in as the teacher**, with `firebase-config.js` loaded:

```js
const { getFirestore, collection, getDocs, doc, updateDoc, setDoc } =
  await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
const db = getFirestore();

const snap = await getDocs(collection(db, 'students'));
let n = 0;
for (const d of snap.docs) {
  const s = d.data();
  if (s.role === 'teacher') continue;            // never touch your own record
  n++;
  await updateDoc(doc(db, 'students', d.id), {
    role: 'student',
    status: s.status || 'active',                 // existing people stay in
    studentNo: s.studentNo || 'EICT-' + String(n).padStart(4, '0'),
    unlocked: s.unlocked || [],
    watched:  s.watched || [],
    paidLive: !!s.paidLive
  });
}
await setDoc(doc(db, 'counters', 'studentNo'), { value: n }, { merge: true });
console.log('migrated', n, 'students');
```

Check the numbers look right in the Students tab afterwards.

## How access actually works now

Three separate things, which is why nobody can talk their way past one of them:

**Registration** → a new sign-up writes itself into `students` as
`status: "pending"` with `studentNo: null`. The rules refuse any other shape,
so a student cannot register themselves as active or as a teacher. They see
nothing until you approve them, which issues the next number from `counters`.

**Live class** → a student uploads their slip; it lands in `payments` as
`pending`. When you approve it the dashboard writes `access/{uid}_{YYYY-MM}`.
The Zoom link lives in `settings/live`, and the rules only serve that document
to someone who holds an access doc for the matching month. A student who has
not paid cannot read the link even with devtools open.

**Recorded** → each season document is readable only if its number is in that
student's `unlocked` array. Previously any signed-in account could read the
whole `seasons` collection and take every video id at once.

**Free classes** → a request carries the student number, and the rules check it
matches the caller's own record, so nobody can request against someone else's
number. Approving writes the same `access` doc with `source: "free"`.

## Sessions

Sign-in stamps `eict.sessionAt` in localStorage. Every page load, every 30
seconds, and every time the tab regains focus, the age of that stamp is checked;
past 24 hours the account is signed out. The remaining time shows at the bottom
of the left rail. Signing out in one tab drops the others.

The dashboard also **never guesses a profile**. If the Firestore read fails it
signs you out and says so, rather than inventing an account and opening the
page — which is the bug that was in `Class.html`.

## Still to do

The student side (`Class.html`) has not been rewritten yet: slip upload, the
locked live tab, the profile page, and the rebuilt recorded library. The rules
above already assume those exist, so until then students will lose access to
seasons — publish the rules only when you are ready to swap both sides, or
keep a copy of your current rules to roll back to.
