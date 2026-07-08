// Firebase Admin SDK - Reads credentials from environment variable (FIREBASE_ADMIN_KEY)
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let adminApp: ReturnType<typeof initializeApp> | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
}

function initAdmin() {
  if (adminApp) return { adminApp, adminAuthInstance, adminDbInstance };

  console.log("[Admin SDK] Initializing...");

  try {
    let serviceAccount: ServiceAccount | null = null;

    // 1. Try FIREBASE_ADMIN_KEY environment variable (base64 encoded JSON)
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

export async function verifyIdToken(token: string) {
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