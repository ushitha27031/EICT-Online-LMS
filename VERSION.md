# Version history

The number shows on all three pages — top bar of the class portal, beside the
size counter in the admin, bottom right of the home page. If it does not match
the file you just uploaded, you are looking at a cached copy: `Ctrl+Shift+R`.

To change it, edit one line near the top of each file:

```html
<meta name="version" content="1.5.0">
```

and the matching `v1.5.0` where it is displayed.

**How to count:** `1.5.0` is major.minor.patch.
Fixing a bug → `1.5.1`. Adding a feature → `1.6.0`. Rebuilding the whole thing → `2.0.0`.

---

**1.5.0** — Live class split into three tabs: Class, Payments, Recordings.
Version number added to every page.

**1.4.0** — Student numbers (EICT-0001). Delivery tracking with WhatsApp
notification. Add and remove students. Recordings of live classes. Zoom link
opened to everyone, tutes still require payment. Larger text in the admin.

**1.3.0** — Student portal: sign-up, Live or Recorded choice, 13 seasons of
episodes, locked seasons, protected video ids.

**1.2.0** — Firebase. Live publishing from the admin, real login, join requests
and slot holds saved.

**1.1.0** — Light and dark themes. Private-line booking. Admin dashboard.

**1.0.0** — Public dashboard: results, comments, batches, countdown.
