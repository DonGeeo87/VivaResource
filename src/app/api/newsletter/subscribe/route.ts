import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const q = query(
      collection(db, "newsletter_subscribers"),
      where("email", "==", email.toLowerCase().trim())
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: "Este email ya está suscrito" },
        { status: 409 }
      );
    }

    // Add to Firestore
    await addDoc(collection(db, "newsletter_subscribers"), {
      email: email.toLowerCase().trim(),
      name: name || "",
      subscribed_at: Timestamp.now(),
      status: "active",
      source: "website"
    });

    // Send confirmation email asynchronously (don't block the response)
    try {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/email/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter-confirmation",
          data: { email, name: name || undefined },
        }),
      }).catch((emailErr) => console.error("Failed to send newsletter confirmation:", emailErr));
    } catch (emailError) {
      // Silently fail - don't block the main operation
      console.error("Error triggering newsletter confirmation email:", emailError);
    }

    return NextResponse.json(
      { success: true, message: "Suscripción exitosa" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Error al suscribirse. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
