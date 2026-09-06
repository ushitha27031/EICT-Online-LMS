/* ============================================================
   EICT — the two settings the whole site reads from a file.

   Upload this to your repository next to EICT.html. Both blocks
   below are safe to be public: they identify your project and
   your alert topic, nothing more. What protects your data is
   the Firestore rules.
   ============================================================ */

window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBi5RuRaKiiu5vjF-12WZwgx5rBWJkvanM",
  authDomain:        "eict-60955.firebaseapp.com",
  projectId:         "eict-60955",
  storageBucket:     "eict-60955.firebasestorage.app",
  messagingSenderId: "418172511743",
  appId:             "1:418172511743:web:7cb9807ee881f68eb6b3ca"
};

/* Where a student's browser sends you an alert when they book an hour,
   cancel one, send a payment slip, or confirm a parcel arrived.
   This needs no publishing — it works the moment this file is uploaded. */
window.EICT_ALERTS = {
  ntfyTopic:     "eictonline",         // the topic that is proven to work on your phone
  web3formsKey:  "",                  // optional: key from web3forms.com, alerts to your Gmail
  telegramToken: "",                  // optional, only if you use Telegram
  telegramChatId:""
};
