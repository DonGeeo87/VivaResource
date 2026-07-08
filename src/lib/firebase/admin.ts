// Firebase Admin SDK - Reads credentials from environment variable (FIREBASE_ADMIN_KEY)
// Using require() to avoid Next.js standalone transforming it into a dynamic import
/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp, getApps, getApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
/* eslint-enable @typescript-eslint/no-require-imports */

let adminApp = null;
let adminAuthInstance = null;
let adminDbInstance = null;

function initAdmin() {
  if (adminApp) return { adminApp, adminAuthInstance, adminDbInstance };

  console.log("[Admin SDK] Initializing...");

  try {
    let serviceAccount = null;

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

export async function verifyIdToken(token) {
  const { adminAuthInstance } = initAdmin();
  if (!adminAuthInstance) {
    throw new Error("Firebase Admin SDK not configured");
  }
  return adminAuthInstance.verifyIdToken(token);
}

export async function adminDb() {
  const { adminDbInstance } = initAdmin();
  return adminDbInstance;
}