import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import path from "path";

function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountPath = path.join(
      process.cwd(),
      "vivaresource-firebase-adminsdk-fbsvc-1c15e4d2ee.json"
    );
    const credential = cert(serviceAccountPath);
    initializeApp({ credential });
  }
  return getFirestore();
}

export async function GET(request: NextRequest) {
  try {
    const db = initFirebaseAdmin();
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
