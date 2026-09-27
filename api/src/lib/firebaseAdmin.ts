import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// On Firebase App Hosting / Cloud Run, applicationDefault() picks up the
// service account automatically — no key file needed. Locally, point
// GOOGLE_APPLICATION_CREDENTIALS at a service account JSON, or run against
// the emulators (FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST).
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const auth = getAuth();
export const db = getFirestore();
