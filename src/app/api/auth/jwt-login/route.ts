import { NextResponse } from "next/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    // Validate against Firebase Auth (existing users)
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Check admin_users collection
    const userDoc = await getDoc(doc(db, "admin_users", result.user.uid));

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "No tienes acceso de administrador" },
        { status: 403 }
      );
    }

    const userData = userDoc.data();
    const role = userData.role || "viewer";

    // Generate JWT
    const token = signToken({
      uid: result.user.uid,
      email: result.user.email || email,
      role,
      type: "admin",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        role,
      },
    });
  } catch (error: unknown) {
    console.error("Login error:", error);

    const errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión";

    if (errorMessage.includes("auth/invalid-credential")) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
