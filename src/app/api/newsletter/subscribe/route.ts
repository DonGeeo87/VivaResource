import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-db";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, RATE_LIMITS.newsletter);
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: `Demasiados intentos. Intenta en ${rateCheck.retryAfter} segundos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Check if already subscribed
    const existing = await db.collection("newsletter_subscribers")
      .where("email", "==", email)
      .get();

    if (existing.size > 0) {
      return NextResponse.json(
        { error: "Ya estás suscrito" },
        { status: 409 }
      );
    }

    // Add subscriber
    await db.collection("newsletter_subscribers").add({
      email,
      name: name || "",
      subscribedAt: new Date().toISOString(),
      status: "active",
      language: "en",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Newsletter Subscribe] Error:", error);
    return NextResponse.json(
      { error: "Error al suscribir" },
      { status: 500 }
    );
  }
}
