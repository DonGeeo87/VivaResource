import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-db";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/volunteer/registration-status — { regId, token } →
 * { valid, email?, firstName?, lastName? }
 *
 * Lo usa /volunteer-portal/activate, que todavía no tiene sesión, para validar
 * su token de activación sin poder listar la colección `volunteer_registrations`
 * (que guarda nombre, email y teléfono de los postulantes). Devuelve solo los
 * tres campos que el formulario necesita y está limitado por IP.
 */
export async function POST(request: Request) {
  const { limited, retryAfter } = checkRateLimit(
    getClientIp(request),
    RATE_LIMITS.contact
  );
  if (limited) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta más tarde." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const regId = body?.regId;
    const token = body?.token;

    if (typeof regId !== "string" || typeof token !== "string" || !regId || !token) {
      return NextResponse.json(
        { error: "regId y token requeridos" },
        { status: 400 }
      );
    }

    const db = await adminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const doc = await db.collection("volunteer_registrations").doc(regId).get();
    const data = doc.exists ? doc.data() : null;

    if (!data || data.activation_token !== token || data.status !== "approved") {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      email: data.email || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
    });
  } catch (error) {
    console.error("[volunteer/registration-status] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
