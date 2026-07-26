import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth/jwt";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, registrationId } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Create Firebase Auth account via REST API
    const signupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    if (!signupRes.ok) {
      const err = await signupRes.json();
      return NextResponse.json(
        { error: err.error?.message || "Error al crear cuenta" },
        { status: 400 }
      );
    }

    const authData = await signupRes.json();
    const uid = authData.localId;

    // Create volunteer user document via adminDb
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    await db.collection("volunteer_users").doc(uid).set({
      email,
      firstName,
      lastName,
      status: "active",
      registrationId: registrationId || null,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      language: "en",
      notificationsEnabled: true,
      unreadMessages: 0,
      upcomingTasks: 0,
    });

    // Generate JWT
    const token = signToken({
      uid,
      email: authData.email || email,
      role: "viewer",
      type: "volunteer",
    });

    return NextResponse.json({
      success: true,
      token,
      user: { uid, email: authData.email, firstName, lastName, status: "active" },
    });
  } catch (error: unknown) {
    console.error("Activation error:", error);
    const message = error instanceof Error ? error.message : "Error al crear cuenta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
