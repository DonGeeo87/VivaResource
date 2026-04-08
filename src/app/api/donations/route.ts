import { NextRequest, NextResponse } from "next/server";

// Marcar esta ruta como dinámica para evitar el error de renderizado estático
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Lazy import Firebase Admin SDK
    const { getFirestore } = await import("firebase-admin/firestore");
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const path = await import("path");

    const initFirebaseAdmin = async () => {
      if (getApps().length === 0) {
        const serviceAccountPath = path.join(
          process.cwd(),
          "vivaresource-firebase-adminsdk-fbsvc-1c15e4d2ee.json"
        );
        const credential = cert(serviceAccountPath);
        initializeApp({ credential });
      }
      return getFirestore();
    };

    const db = await initFirebaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");

    const snapshot = await db
      .collection("donations")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const donations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ donations, total: donations.length });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
