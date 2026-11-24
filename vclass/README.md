# EICT Virtual Academy — the virtual classroom

**Students:** https://eictonline.com/vclass/  **Sir's desk:** https://eictonline.com/vclass/teacher.html

Students sign in with their usual EICT email and password. They pick one of 12 characters, type the name
classmates will see, and walk into a 3D classroom. They take a chair and watch the live lecture on the
smartboard. From their seat they can read the tute on their desk, pass sir a sealed chit, borrow a pen
from the student beside them and tap "I'm here".

---

## 1. What runs where

| Part | Technology | Why |
|---|---|---|
| Pages | Plain HTML + ES modules on **GitHub Pages** (this repo) | The whole EICT site already lives here. A merge to `main` is the deploy, served over HTTPS at eictonline.com. |
| Sign-in | **Firebase Auth** (existing student accounts) | The same accounts as the class pages. Nobody signs up again. |
| Student list | **Firestore** `students/{uid}` (existing) | Sir's desk reads batches and names from here. |
| Live room | **Firebase Realtime Database** `vc/{room}/…` | WebSocket real-time sync. The server itself frees a chair and logs the student out when their internet drops (`onDisconnect`). It is free on the Spark plan, which has no per-write cost and allows 100 connections at once. |
| Secrets | **Google Apps Script** web app (`server/vclass.gs.txt`) | Holds the Zoom SDK secret, meeting number and passcode, and the tute PDFs in sir's Drive. It checks each student's Firebase sign-in before answering. |
| 3D | **three.js 0.179.1** (pinned, jsDelivr) | Loaded only on laptops, desktops and tablets that switch the room on. Phones never download it. |
| Tute reader | **PDF.js 5.4.296** | Works on Android and iPhone. Pages are drawn in the browser. |
| Lecture | **Zoom Meeting SDK for Web 6.10.0**, Component View | The official SDK. The secret stays on the server. If the embedded join can't start, the student gets "Open in Zoom app". |

### Why not Next.js + Supabase

The brief preferred Next.js, Supabase and a Node server. That stack was not used, for three reasons:

- GitHub Pages cannot run a server.
- The students, their logins, batches, marks and every other page already live in Firebase.
- Moving to Supabase would mean a second login and a second copy of the student list.

So the classroom is built on the stack the site already has. The jobs a server would do are covered as follows:

- **Database rules** check every read and write: who is invited, one student per chair, private chits.
- **Apps Script** keeps the credentials.

## 2. Folder structure

```
vclass/
  index.html            student app (sign in → lobby → classroom)
  app.js                student app logic: device detection, seats, chits, pens, attendance, Zoom placement
  scene.js              the 3D classroom, characters' movement, camera (laptops/desktops/tablets only)
  avatars.js            the 12 characters: portraits (SVG) + matching 3D models + animation
  net.js                live classroom connection (Realtime Database)
  zoom.js               Zoom Meeting SDK embed (one client, 16:9, never stretched)
  tute.js               tute reader (cover → PDF pages, zoom, swipe)
  teacher.html/.js      sir's desk
  vclass.css            shared styles
  assets/logic-gate-cover.png   the Logic Gate tute cover
  database.rules.json   Realtime Database security rules  ← paste into Firebase
  server/vclass.gs.txt  Apps Script class server          ← paste into script.google.com
```

## 3. Set-up (one time)

### 3.1 Create the Realtime Database (2 min)
1. Open https://console.firebase.google.com and choose **eict-60955**.
2. Go to **Build → Realtime Database → Create database**.
3. For **Location**, choose **Singapore (asia-southeast1)**.
4. Choose **Start in locked mode**, then **Enable**.
5. If you chose another region, copy the database URL shown at the top. Paste it into `firebase-config.js` as `databaseURL`.

### 3.2 Publish the rules (the "migration")
1. Go to **Realtime Database → Rules**.
2. Select everything, paste the whole `vclass/database.rules.json`, and press **Publish**.

The Realtime Database has no tables to migrate. These rules are the schema: they define every path, its fields, their limits, and who may read or write them.

Firestore rules **do not change** for this feature.

### 3.3 Class server: Apps Script (10 min)
Follow the steps at the top of `server/vclass.gs.txt`. These **Script properties** play the part of an environment-variable template:

| Property | Value |
|---|---|
| `ZOOM_SDK_KEY` | Client ID of a Zoom **General app** with the Meeting SDK turned on |
| `ZOOM_SDK_SECRET` | Client Secret of that app |
| `MEETING_NUMBER` | `8651803410` (can be changed from sir's desk) |
| `MEETING_PASSCODE` | the meeting passcode, if it has one |
| `ZOOM_OAUTH` | `yes`, only if you need the OBF token (see 3.4) |
| `DB_URL` | optional; only if your database is not in Singapore |

Once it is deployed, paste the `/exec` URL into **Sir's desk → Zoom → Class server URL**, press **Save**, then **Test the server**.

### 3.4 Zoom (needs your Zoom account)
1. Go to https://marketplace.zoom.us and choose **Develop → Build App → General App**.
2. Turn on **Embed → Meeting SDK**.
3. Copy the Client ID and Client Secret into the Script properties.
4. **Important:** since 2 March 2026, Zoom only lets a Meeting SDK app join meetings **outside its own Zoom account** if it is authorised by an OBF token or a ZAK token.
   - The meeting `cuny.zoom.us/j/8651803410` belongs to a CUNY account. If the SDK app is created inside that same CUNY Zoom account, no extra step is needed.
   - If the app is in a different account, set `ZOOM_OAUTH=yes`. Add the redirect URL (the Apps Script `/exec` URL) and the `user:read:token` scope to the app. Then press **Sir's desk → Zoom → Connect Zoom** once, signed in as the meeting's host.
   - Zoom also requires the host (that OBF user) to be **in the meeting** before students can join through the SDK.
   - A university account's admins may block third-party apps. In that case, the "Open in Zoom app" button still works.

### 3.5 Tutes
Go to **Sir's desk → Lesson materials → Add a tute**. Choose the PDF, which is uploaded to your Drive folder "EICT Virtual Class Tutes", or paste a PDF web address. Press **Put on desk**.

The Logic Gate cover is already in the room. The PDF itself was not among the files attached, so it still needs to be uploaded.

## 4. Running a class
1. On **Sir's desk → Class**:
   1. Type the title and lesson.
   2. Tick the batches. You can also type individual student numbers.
   3. Press **Open classroom**. Students can now walk in and sit.
2. Start Zoom as usual. Then press **Start lecture**, and students can use **Join lecture**.
3. During the class:
   - **Announcement** shows on the board and to everyone.
   - **Ask everyone now** asks for "I'm here" taps.
   - **Chits** has the questions, with a sound and badge. Replies go only to that student.
   - **Students & seats** shows the live list and seat map. You can free a seat, lower a hand, or remove a student.
4. Press **End class**. Everyone is sent out, chairs are freed, and lent pens go back to their owners. Attendance stays under **Attendance**, which can be downloaded as CSV.

## 5. Devices

| Device | What they get |
|---|---|
| Phone (< 768 px, either orientation) | The board, full width. Seated automatically in the first free chair, front rows first. A dock with Lecture, Full screen, Tute, Ask sir, Pens, I'm here and Hand. **No 3D is downloaded.** Turning the phone sideways makes the board fill the screen. |
| Tablet | Starts on the board. **Classroom** switches on a lighter 3D room (no shadows, lower resolution). |
| Laptop / desktop | The full 3D classroom. Walk with W A S D or click the floor. Click a chair to sit. Drag to look around. V switches between first and third person. **Focus** shows the board alone and pauses the 3D. |

## 6. Privacy
- Classmates see only the **display name** each student chose, their character, seat and raised hand.
  - Real names, student numbers and batches are readable only by sir (`allow` is per-student; `players` holds no personal fields, and the rules refuse any extra field).
- Chits: only the sender and sir can read them (`chits/{uid}`). Classmates see only a folded paper moving and never the words. The rules refuse text in the animation event.
- Ages, phone numbers, addresses and emails are never written to the live room.
- Only invited students, while the room is open, can read anything in the room. "Remove" also blocks the student until sir lets them back in.

## 7. What is done, and what still needs you

**Built and tested here** (Firebase emulators + Chromium, emulating Pixel/iPhone 13/iPad/desktop):
- 59 security-rule tests pass, including:
  - two students clicking the same chair at the same instant: exactly one gets it
  - stale chairs can be reclaimed
  - private chits
  - pen lending only with the owner's yes
  - attendance writes
- The end-to-end run covers:
  - sign-in, the 12-character lobby, entering on desktop, phone and tablet
  - the phone auto-seating and never loading three.js
  - the landscape board staying 16:9
  - clicking a chair, walking to it and sitting
  - a taken chair being refused
  - a chit passing through the student in front and sir replying
  - borrowing and returning a pen
  - the attendance check and CSV table
  - the tute cover and PDF pages
  - announcements and a raised hand
  - a page reload getting the same chair back
  - closing the tab freeing the chair and recording leave time
  - removing a student
  - ending the class

**Needs your credentials or a real device:**
- **Embedded Zoom lecture.** The code calls the official SDK correctly, and the fallback was tested by forcing a failed join. Joining a real meeting can't be tested without your Zoom SDK keys, the OBF/host permission (3.4), and a live meeting. Test it once with a dummy meeting before a real class.
- **Apps Script server.** Written and checked by reading only, and not run against Google here. Use **Test the server** on the desk.
- **Real phones.** Tested in Chromium's iPhone/Android/iPad emulation only. Safari on iPhone has no full-screen for web pages, so the board fills the screen with CSS instead. Please try one Android phone, one iPhone and one iPad before the first class.
- **Character models** are built in code (stylized, matching the EICT avatar portraits), not photo-real GLB scans. Real GLB models could replace `buildCharacter` later.

## 8. Testing checklist (before the first real class)
- [ ] Realtime Database created; rules published (3.1, 3.2)
- [ ] Apps Script deployed; "Test the server" shows ✓ SDK keys and ✓ Meeting
- [ ] Logic Gates PDF added and "On the desk"
- [ ] Dummy class: open the classroom with your own test student account on a phone and on a laptop
- [ ] Phone: seated automatically, board visible, turning sideways fills the screen, tute opens
- [ ] Laptop: walk in, sit, first/third person, Focus mode
- [ ] Start lecture → Join lecture shows the Zoom picture on the board (or "Open in Zoom app" works)
- [ ] Mic button mutes/unmutes; only one Zoom audio plays
- [ ] Send a chit from the student; reply from the desk; the student sees it
- [ ] Ask for attendance; download the CSV
- [ ] End class; students return to the lobby
