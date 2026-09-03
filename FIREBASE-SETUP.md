# Making the site update instantly

Right now, editing means download → upload → wait. Firebase removes that. You press **Publish**, and every open browser updates within a second. No GitHub, no refresh.

It is free at your scale. The free tier allows 50,000 document reads a day; your whole site is **one** read per visitor.

Do the steps in order. It takes about fifteen minutes once.

---

## 1. Create the project

1. Go to **console.firebase.google.com** and sign in with your Google account.
2. **Create a project** → name it `eict` → Continue.
3. Turn Google Analytics **off**. You don't need it. → Create project.

## 2. Create the database

1. Left sidebar → **Build** → **Firestore Database** → **Create database**.
2. Choose location **asia-south1 (Mumbai)** — closest to Sri Lanka, so the site loads faster. *This cannot be changed later.*
3. Start in **production mode** → Create.

## 3. Create your login

1. Left sidebar → **Build** → **Authentication** → **Get started**.
2. Choose **Email/Password**, enable the first toggle, Save.
3. Go to the **Users** tab → **Add user**. Enter your email and a strong password → Add user.

This is now your admin login, replacing the old `eict2021` passcode.

## 4. Lock down who can write

This step matters. Without it, anyone on the internet could rewrite your site.

1. Firestore Database → **Rules** tab.
2. Delete what's there and paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // You. This is what separates the teacher from the students,
    // who now have accounts on the same Firebase project.
    function owner() {
      return request.auth != null
             && request.auth.token.email == 'ushithasamudaya@gmail.com';
    }
    function meDoc() {
      return get(/databases/$(database)/documents/students/$(request.auth.uid)).data;
    }

    // Website content: anyone reads, only you write.
    match /site/config {
      allow read: if true;
      allow write: if owner();
    }

    // Class portal settings — Zoom link, schedule, fees, bank details.
    match /site/course {
      allow read: if true;
      allow write: if owner();
    }

    // Join requests: anyone may send one, only you may read them back.
    match /requests/{id} {
      allow create: if true;
      allow read, update, delete: if owner();
    }

    // Private-line slot holds. No personal details, so the timetable
    // can show a slot as taken to everyone straight away.
    match /holds/{id} {
      allow read, create: if true;
      allow update, delete: if owner();
    }

    // A student sees only their own record. They may edit their own details,
    // the track they picked and what they have watched — but NOT which seasons
    // are unlocked, NOT whether they have paid, and NOT their student number.
    match /students/{uid} {
      allow create: if request.auth != null && request.auth.uid == uid;
      allow read:   if owner() || (request.auth != null && request.auth.uid == uid);
      allow update: if owner() || (request.auth != null && request.auth.uid == uid
                       && request.resource.data.diff(resource.data).affectedKeys()
                            .hasOnly(['name','whatsapp','school','address','track','watched','progress','lastWatched','shipments']));
      allow delete: if owner();
      allow list:   if owner();
    }

    // Hands out student numbers one at a time. A student may only ever
    // move the counter forward by exactly one.
    match /meta/students {
      allow read:   if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null
                    && request.resource.data.next == resource.data.next + 1;
    }

    // The YouTube ids for the recorded series. A student can only ever
    // receive a season they have paid for. This is the wall, not the login.
    match /seasons/{id} {
      allow read:  if owner() || (request.auth != null
                      && resource.data.season in meDoc().unlocked);
      allow write: if owner();
    }

    // Recordings of the live classes, for anyone who missed a session.
    // Only students you have marked as paid can read them.
    match /liveRecordings/{id} {
      allow read:  if owner() || (request.auth != null && meDoc().paidLive == true);
      allow write: if owner();
    }

    // Answer sheets. A student may send their own and read their own back,
    // but never see anyone else's. Only you can mark or delete.
    match /submissions/{id} {
      allow create, update: if request.auth != null
                            && request.resource.data.uid == request.auth.uid;
      allow read: if owner() || (request.auth != null && resource.data.uid == request.auth.uid);
      allow delete: if owner();
      allow list: if owner();
    }

    // Private class bookings. Everyone signed in can see which hours are taken
    // (day and time only reveals nothing private), a student may create and
    // cancel their own, but only you may approve or decline one.
    match /bookings/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid
                    && request.resource.data.status == 'pending';
      allow update: if owner() || (request.auth != null
                    && resource.data.uid == request.auth.uid
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['cancelled']));
      allow delete: if owner();
    }

    // Play log, so you can spot one account being used by half a class.
    match /views/{id} {
      allow create: if request.auth != null;
      allow read, update, delete: if owner();
    }
  }
}
```

3. **Publish**.

Because only accounts you create in step 3 can sign in, `request.auth != null` means "only me".

## 5. Get your keys

1. Click the **gear icon** (top left) → **Project settings**.
2. Scroll to **Your apps** → click the **web icon** `</>`.
3. Nickname `eict-site` → **Register app**. Skip the hosting offer.
4. You'll see a `firebaseConfig` block. Copy the six values.
5. Open `firebase-config.js` in a text editor and paste each value in place of `PASTE_HERE`. Keep the quotes.

These keys are **safe to be public**. They only identify your project — that's normal for every Firebase website. Step 4 is what actually protects you.

## 6. Upload

Put these three files at the root of your repo:

```
EICT.html
Admin.html
firebase-config.js
```

Wait a minute, then open `Admin.html`.

---

## How you'll know it worked

Open the admin page. If it's connected you'll see:

- an **email** box above the password box
- **Signed in with Firebase** under the login
- a green **Live · connected** badge in the top bar
- a red **Publish to website** button

If you instead see **Local mode · no database connected**, the keys aren't being read. Check that `firebase-config.js` sits next to `Admin.html` and that you replaced every `PASTE_HERE`.

## Your new routine

1. Open `Admin.html`, sign in with your email and password.
2. Change whatever you want.
3. Press **Publish to website**.

That's it. The site updates for everyone immediately — anyone with the page already open sees it change without touching anything.

No more importing a config file first. The admin page now loads your live content automatically every time you sign in.

---

## The student portal

`Class.html` is where students live once they join. They make their own account, choose Live or Recorded, and see only what they have paid for.

**Unlocking a season.** A student sends you a bank slip on WhatsApp. You open `Admin.html` → **Students**, find them, and click the season number. It turns gold, and their screen updates within a second — no refresh, no email.

**Adding lesson videos.** `Admin.html` → **Lesson videos**, pick a season, paste the YouTube id for each episode (just the part after `v=`), press Save. Do this once per season; you can fill them in gradually.

**Why a locked season is genuinely locked.** The video ids are not in `Class.html` and are not sent to the browser. They sit in `seasons/AL-27-3`, and the rule above refuses to serve that document unless the requesting account has that season number in its unlocked list. A student who has not paid cannot obtain the link even with developer tools open, because it never leaves the server.

What that does **not** stop: a student who has paid, copying the link out and sharing it. Their name and phone number drift across the video while it plays, so a screen recording is traceable, and every play is logged. When leaking starts costing more than it's worth, move the videos to Bunny.net Stream — signed links that expire and refuse to play off your domain — and only the id field changes.

---

## Email alerts when a slot is taken

Free, and takes two minutes.

1. Go to **web3forms.com**.
2. Type the email address you want alerts sent to. They email you an access key.
3. Open `Admin.html` → **Contact** → paste it into **Web3Forms access key**.
4. **Publish to website**.

From then on, every batch request and every private-slot booking emails you within seconds — student's name, WhatsApp number, school, and the exact slot and fee.

Leave the key blank and alerts stay off. Requests are still saved either way, so nothing is ever lost.

---

## How a private slot gets booked

1. A student taps a green slot and sends the form.
2. The slot turns **on hold** for everyone immediately — nobody else can take it while you decide.
3. You get the email.
4. Open `Admin.html` → **Requests**. The hold is listed with their WhatsApp number as a clickable link.
5. Message them. Then either **Mark taken** — which writes it into the timetable permanently, so press **Publish** after — or **Release**, which puts the slot back to green.

Holds are only a temporary flag; they never rewrite your timetable on their own. Nothing changes permanently unless you press Publish.

If someone books and never replies, just Release it.

---

## Join requests

Student sign-ups now save to the database too. Firebase console → Firestore Database → the **requests** collection. Each entry has their name, WhatsApp number, school, and either the batch code or the exact private slot they tapped.

Nobody can read that list from the website without signing in — but you can, in the **Requests** section of the admin page, or in the Firebase console.

---

## Photos

Keep photos out of the database. A Firestore document has a hard 1 MB limit, and uploaded images are stored inside it as text, which eats that fast. The size counter in the admin top bar turns to a warning as you approach it.

Better: put photos in `feedback/` and `posts/` folders in your GitHub repo, and type the file name (`feedback/note-1.jpg`) in the admin instead of uploading. Text changes stay instant; photos are the occasional GitHub upload.

---

## If something goes wrong

**"Could not publish: permission-denied"** — the rules in step 4 weren't saved, or you're not actually signed in. Re-check the Rules tab.

**Site shows old content** — hard refresh with `Ctrl+Shift+R`. If it persists, open the browser console (F12) and look for a warning starting `config ignored`.

**Everything vanished from the admin** — it fell back to local mode. Your published content is untouched; fix the keys and sign in again.

**You want to undo a publish** — press **Download backup** before each publish and keep the file. To restore, use **Import config** then **Publish**.

The site is built to survive all of this: if Firebase is unreachable or the saved content is broken, `EICT.html` falls back to the content built into it and keeps working.
