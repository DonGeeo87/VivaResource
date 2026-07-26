import { NextResponse } from "next/server";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, registrationId } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Create Firebase Auth account (temporal — will migrate to own auth)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`,
    });

    // Create volunteer user document in Firestore
    await setDoc(doc(db, "volunteer_users", userCredential.user.uid), {
      email,
      firstName,
      lastName,
      status: "active",
      registrationId: registrationId || null,
      joinedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      language: "en",
      notificationsEnabled: true,
      unreadMessages: 0,
      upcomingTasks: 0,
    });

    // Generate JWT
    const token = signToken({
      uid: userCredential.user.uid,
      email: userCredential.user.email || email,
      role: "viewer",
      type: "volunteer",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        firstName,
        lastName,
        status: "active",
      },
    });
  } catch (error: unknown) {
    console.error("Activation error:", error);
    const message = error instanceof Error ? error.message : "Error al crear cuenta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
