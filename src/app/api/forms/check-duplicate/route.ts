import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-db";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/forms/check-duplicate — { formId, email } → { duplicate: boolean }
 *
 * El formulario público valida envíos duplicados. Antes lo hacía leyendo la
 * colección completa `form_submissions` desde el navegador (con el CRUD abierto
 * de /api/db, eso exponía nombre y email de todos los envíos). Este endpoint
 * responde solo un booleano y está limitado por IP.
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
    const formId = body?.formId;
    const email = body?.email;

    if (typeof formId !== "string" || typeof email !== "string" || !formId || !email) {
      return NextResponse.json(
        { error: "formId y email requeridos" },
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

    const snapshot = await db
      .collection("form_submissions")
      .where("formId", "==", formId)
      .where("email", "==", email)
      .limit(1)
      .get();

    return NextResponse.json({ duplicate: snapshot.size > 0 });
  } catch (error) {
    console.error("[forms/check-duplicate] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
