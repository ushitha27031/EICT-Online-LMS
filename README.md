# EICT website

Upload **everything in this folder** to the root of your GitHub repository.
Not the folder itself — its contents.

```
index.html          sends visitors to EICT.html
EICT.html           the public home page
Class.html          the student portal (login, live class, recorded series)
Admin.html          your control room
firebase-config.js  your Firebase project keys
feedback/           the seven handwritten student comments
posts/              your marketing posters
FIREBASE-SETUP.md   database and security setup — read this
```

---

## The three pages

| Page | Who opens it | What it does |
|---|---|---|
| `EICT.html` | Anyone | Results, comments, batches, private-line booking |
| `Class.html` | Your students | Sign in, pick Live or Recorded, watch lessons |
| `Admin.html` | You only | Everything else |

Your addresses will be:

- `https://ushitha27031.github.io/EICT-Online-LMS/`
- `.../Class.html`
- `.../Admin.html`

---

## Where things live

Three separate places. Knowing which is which saves a lot of confusion.

**GitHub** holds the files. Change them by uploading through VS Code.

**Firebase console** holds the security rules. Typed there, published there, never in a file.

**The database** holds everything that changes — your content, student accounts, unlocked seasons, lesson videos. Written by `Admin.html`.

Rule of thumb: *if you downloaded it, it goes to GitHub. If you typed it into a screen, it's already where it needs to be.*

---

## Two Publish buttons

They save to different places and never overwrite each other.

- **Publish to website** — home page content: headline, results, batches, comments, posters, the pop-up.
- **Publish class portal** — the student side: Zoom link, schedule, fees, bank details, season price.

---

## Your daily routine

**A bank slip arrives on WhatsApp**
→ Admin → **Students** → find them → click the season number, or tick *Live class paid*. Their screen updates within a second.

**You post a pack of tutes**
→ Admin → **Students** → **Posted a pack** → type what you sent, the courier and the tracking number. It appears in their portal and WhatsApp opens with the message written for you.

**A new lesson is filmed**
→ Upload to YouTube as unlisted → Admin → **Lesson videos** → pick the season → paste the id → Save.

**Someone books a private slot**
→ Admin → **Requests** → message them → **Mark taken** → Publish.

---

## Before you go live

- [ ] Firestore rules pasted and published, with **your email** in place of `PUT-YOUR-EMAIL-HERE`
- [ ] Admin → Brand & access → **Owner email** set to the same address → Publish
- [ ] Admin → Class portal → **Zoom link** and **bank details** → Publish class portal
- [ ] Admin → Lesson videos → at least Season 1 filled in
- [ ] Admin → Results → **replace the sample student names** (they are still placeholders)
- [ ] Admin → Video & message → your YouTube intro video id
- [ ] Check the countdown dates against the real exam dates when announced

---

## If something breaks

**A page shows old content.** Hard refresh with `Ctrl+Shift+R`. GitHub also takes a minute to rebuild after an upload.

**"Could not publish: invalid-argument".** The record is too big. You have uploaded a photo through the admin — use a file in `feedback/` or `posts/` and type its name instead.

**"Could not publish: permission-denied".** The email in your Firestore rules does not match the one you signed in with. Check both, lowercase.

**A comment photo shows a dashed box.** The filename in the admin does not match the file in `feedback/`. They are case-sensitive.

**Nothing saves and the admin says "Local mode".** `firebase-config.js` is missing from the repo root, or sitting inside a folder.
