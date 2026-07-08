// Firebase Admin SDK - Reads credentials from environment variable (FIREBASE_ADMIN_KEY)
// Uses dynamic import() because Next.js standalone externalizes firebase-admin
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

async function initAdmin() {
  if (adminApp) return { adminApp, adminAuthInstance, adminDbInstance };

  console.log("[Admin SDK] Initializing...");

  try {
    let serviceAccount: { project_id: string; client_email: string; private_key: string } | null = null;

    if (process.env.FIREBASE_ADMIN_KEY) {
      console.log("[Admin SDK] Found FIREBASE_ADMIN_KEY env variable");
      try {
        const decoded = Buffer.from(
          process.env.FIREBASE_ADMIN_KEY,
          "base64"
        ).toString("utf8");
        serviceAccount = JSON.parse(decoded);
        console.log("[Admin SDK] Decoded FIREBASE_ADMIN_KEY successfully");
      } catch (e) {
        console.error("[Admin SDK] Failed to decode FIREBASE_ADMIN_KEY:", e);
      }
    }

    if (!serviceAccount) {
      console.error("[Admin SDK] No credentials found");
      return { adminApp: null, adminAuthInstance: null, adminDbInstance: null };
    }

    const { initializeApp, getApps, getApp, cert } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");
    const { getFirestore } = await import("firebase-admin/firestore");

    if (getApps().length > 0) {
      console.log("[Admin SDK] Using existing app");
      adminApp = getApp();
    } else {
      console.log("[Admin SDK] Creating new app");
      adminApp = initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
        projectId: serviceAccount.project_id,
      });
    }

    adminAuthInstance = getAuth(adminApp);
    adminDbInstance = getFirestore(adminApp);

    console.log("[Admin SDK] Initialized successfully");
  } catch (error) {
    console.error("[Admin SDK] Initialization error:", error);
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