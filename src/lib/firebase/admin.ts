// Firebase Admin SDK - Fully dynamic imports
// No static imports to avoid Vercel build errors

import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

async function initAdmin() {
  if (adminApp) return { adminApp, adminAuthInstance, adminDbInstance };

  const { initializeApp, cert, getApps, getApp } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const { getFirestore } = await import("firebase-admin/firestore");

  if (getApps().length > 0) {
    adminApp = getApp();
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  if (adminApp) {
    adminAuthInstance = getAuth(adminApp);
    adminDbInstance = getFirestore(adminApp);
  }

  return { adminApp, adminAuthInstance, adminDbInstance };
}

export async function verifyIdToken(token: string) {
  const { adminAuthInstance } = await initAdmin();
  if (!adminAuthInstance) {
    throw new Error("Firebase Admin SDK not configured");
  }
  return adminAuthInstance.verifyIdToken(token);
}

export async function adminDb() {
  const { adminDbInstance } = await initAdmin();
  return adminDbInstance;
}
