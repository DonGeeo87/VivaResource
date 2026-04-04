import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: ReturnType<typeof initializeApp> | null = null;
let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;

// Initialize Admin SDK lazily (only at runtime, not during build)
function getAdminApp() {
  if (adminApp) return adminApp;

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

  return adminApp;
}

function getAdminAuth() {
  if (adminAuth) return adminAuth;
  const app = getAdminApp();
  if (app) {
    adminAuth = getAuth(app);
  }
  return adminAuth;
}

function getAdminDb() {
  if (adminDb) return adminDb;
  const app = getAdminApp();
  if (app) {
    adminDb = getFirestore(app);
  }
  return adminDb;
}

// Export lazy getters instead of direct values
export { getAdminAuth as adminAuth, getAdminDb as adminDb };

// For backward compatibility, export verifyIdToken
export async function verifyIdToken(token: string) {
  const auth = getAdminAuth();
  if (!auth) {
    throw new Error("Firebase Admin SDK not configured. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.");
  }
  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    console.error("[Firebase Admin] Error verifying token:", error);
    throw new Error(`Invalid token: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
