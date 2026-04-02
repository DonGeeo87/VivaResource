import { NextResponse } from "next/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    
    const userDoc = await getDoc(doc(db, "admin_users", result.user.uid));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "No tienes acceso de administrador" },
        { status: 403 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        role: userData.role || "viewer",
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
