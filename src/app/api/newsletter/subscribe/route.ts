import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Check if email already exists (without orderBy to avoid index requirement)
    try {
      const q = query(
        collection(db, "newsletter_subscribers"),
        where("email", "==", trimmedEmail)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return NextResponse.json(
          { error: "Este email ya está suscrito" },
          { status: 409 }
        );
      }
    } catch (queryError) {
      console.error("Error checking existing subscription:", queryError);
      // If the index doesn't exist yet, proceed without checking duplicate
      // This handles the case of a fresh Firestore with no indexes
    }

    // Add to Firestore
    await addDoc(collection(db, "newsletter_subscribers"), {
      email: trimmedEmail,
      name: name || "",
      subscribed_at: serverTimestamp(),
      status: "active",
      source: "website"
    });

    // Send confirmation email asynchronously (don't block the response)
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      fetch(`${siteUrl}/api/email/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter-confirmation",
          data: { email: trimmedEmail, name: name || undefined },
        }),
      }).catch((emailErr) => console.error("Failed to send newsletter confirmation:", emailErr));
    } catch (emailError) {
      console.error("Error triggering newsletter confirmation email:", emailError);
    }

    return NextResponse.json(
      { success: true, message: "Suscripción exitosa" },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Error al suscribirse. Intenta nuevamente.", details: message },
      { status: 500 }
    );
  }
}
