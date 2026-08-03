/* ==========================================================================
   slip-upload.js — how a payment slip gets in without Cloud Storage.

   Cloud Storage needs the Blaze plan, so the picture is shrunk in the
   browser and written into Firestore as text.

   The sums, so you know the ceiling:
     Firestore document limit ...... 1 MiB
     a slip at 1000px / quality 0.55  60–130 KB
     base64 adds a third .......... 80–175 KB
     Spark storage quota ............ 1 GiB  ~= 8,000 slips

   Two rules keep it inside the quota:
     1. Shrink before uploading, never after. A raw phone photo is 3–6 MB
        and will be rejected outright.
     2. The picture goes in `slips/{paymentId}`, never inside the payment
        record. The teacher's list reads names and amounts only; a picture
        is fetched when someone actually looks at it.

   Usage:
     import { sendSlip } from '../Shared/slip-upload.js';
     await sendSlip({ db, uid, studentNo, name, month: '2026-08',
                      amount: 2000, file: input.files[0] });
   ========================================================================== */

import {
  collection, doc, addDoc, setDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

export const MAX_EDGE   = 1000;      // px on the longest side
export const TARGET_KB  = 180;       // give up below this quality
export const HARD_LIMIT = 900 * 1024;

/**
 * Shrink an image file to a base64 JPEG small enough for one Firestore doc.
 * Steps the quality down until it fits rather than guessing once.
 */
export async function compress(file, maxEdge = MAX_EDGE) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please choose a photo of the slip.');
  }

  const bitmap = await createImageBitmap(file).catch(async () => {
    // Safari fallback
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise((ok, no) => {
        img.onload = ok; img.onerror = () => no(new Error('That file could not be opened.'));
        img.src = url;
      });
      return img;
    } finally { URL.revokeObjectURL(url); }
  });

  const w = bitmap.width, h = bitmap.height;
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const cv = document.createElement('canvas');
  cv.width = Math.round(w * scale);
  cv.height = Math.round(h * scale);

  const cx = cv.getContext('2d');
  cx.fillStyle = '#fff';                 // JPEG has no transparency
  cx.fillRect(0, 0, cv.width, cv.height);
  cx.drawImage(bitmap, 0, 0, cv.width, cv.height);

  for (const q of [0.6, 0.5, 0.42, 0.34, 0.26]) {
    const out = cv.toDataURL('image/jpeg', q);
    if (out.length <= HARD_LIMIT) return out;
  }

  // Still too big: halve the dimensions and try the whole thing again.
  if (maxEdge > 480) return compress(file, Math.round(maxEdge * 0.7));
  throw new Error('That picture is too large. Try a tighter crop of just the slip.');
}

/**
 * Write the payment record and its picture. The record is written first, so
 * that if the picture fails the teacher still sees that money was claimed
 * and can ask for the slip over WhatsApp.
 */
export async function sendSlip({ db, uid, studentNo, name, month, amount, file }) {
  if (!month) throw new Error('Which month is this payment for?');

  const data = await compress(file);

  const ref = await addDoc(collection(db, 'payments'), {
    uid, studentNo: studentNo || null, name: name || '',
    month, amount: Number(amount) || 0,
    status: 'pending',
    hasSlip: true,
    at: serverTimestamp()
  });

  try {
    await setDoc(doc(db, 'slips', ref.id), { uid, data, at: serverTimestamp() });
  } catch (err) {
    // The record stands; only the picture is missing.
    await setDoc(doc(db, 'payments', ref.id), { hasSlip: false }, { merge: true });
    throw new Error('The payment was recorded but the picture did not go through. ' +
                    'Please send it to sir on WhatsApp.');
  }

  return ref.id;
}

/** Rough size of a data URL, for showing the student before they send. */
export const kb = (dataUrl) => Math.round((dataUrl.length * 3 / 4) / 1024);
