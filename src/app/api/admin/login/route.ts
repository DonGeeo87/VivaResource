import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth/jwt";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    // Firebase Auth REST API
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    if (!authRes.ok) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const authData = await authRes.json();
    const uid = authData.localId;

    // Check admin_users via adminDb
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const userDoc = await db.collection("admin_users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "No tienes acceso de administrador" },
        { status: 403 }
      );
    }

    const userData = userDoc.data();
    const role = userData?.role || "viewer";

    const token = signToken({ uid, email: authData.email || email, role, type: "admin" });

    return NextResponse.json({
      success: true,
      token,
      user: { uid, email: authData.email, role },
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
