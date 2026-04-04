import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Debug: verificar variables de entorno
console.log("[Firebase Admin] FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL?.substring(0, 20) + "...");
console.log("[Firebase Admin] FIREBASE_PRIVATE_KEY starts with:", process.env.FIREBASE_PRIVATE_KEY?.substring(0, 27) || "NOT SET");

let adminApp: ReturnType<typeof initializeApp>;

// Verificar si ya existe una app inicializada
if (getApps().length === 0) {
  // Verificar que las credenciales estén disponibles
  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("[Firebase Admin] ❌ Faltan credenciales de Firebase Admin SDK");
    throw new Error("Firebase Admin SDK credentials not configured");
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
  console.log("[Firebase Admin] ✅ App initialized successfully");
} else {
  adminApp = getApp();
  console.log("[Firebase Admin] Using existing app");
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

// Verificar token de ID de Firebase Auth
export async function verifyIdToken(token: string) {
  try {
    console.log("[Firebase Admin] Verifying token...");
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log("[Firebase Admin] ✅ Token verified for UID:", decodedToken.uid);
    return decodedToken;
  } catch (error) {
    console.error("[Firebase Admin] ❌ Error verifying token:", error);
    throw new Error(`Invalid token: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export { adminApp, adminAuth, adminDb };
