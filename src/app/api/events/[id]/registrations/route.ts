import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering - uses Firebase Admin SDK at runtime
export const dynamic = "force-dynamic";

// Helper para verificar autenticación del admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "No autorizado", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  try {
    // El login emite un JWT local (jsonwebtoken). Validar con verifyToken, no con Firebase.
    const { verifyToken } = await import("@/lib/auth/jwt");
    const { adminDb } = await import("@/lib/admin-db");
    const payload = verifyToken(token);
    if (!payload) {
      return { error: "Token inválido", status: 401 };
    }
    const email = payload.email;

    const db = await adminDb();
    if (!db) {
      return { error: "Database not configured", status: 500 };
    }

    // Verificar que el usuario esté en admin_users por email (los uids migrados no coinciden con Firebase Auth)
    const adminSnap = await db.collection("admin_users").where("email", "==", email).get();
    if (adminSnap.size === 0) {
      return { error: "No tienes acceso de administrador", status: 403 };
    }

    const userData = adminSnap.docs[0].data();
    if (!userData || !["admin", "editor"].includes(userData.role)) {
      return { error: "No tienes permisos suficientes", status: 403 };
    }

    return { uid: payload.uid, email, role: userData.role };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { error: "Token inválido", status: 401 };
  }
}

// Get registrations for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Verificar autenticación
    const authResult = await verifyAdmin(request);
    if ("error" in authResult && "status" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const eventId = params.id;

    // Get adminDb lazily
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Obtener registros del evento
    const snapshot = await db
      .collection("event_registrations")
      .where("event_id", "==", eventId)
      .orderBy("created_at", "desc")
      .get();

    const registrations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      registrations,
      count: registrations.length,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching registrations" },
      { status: 500 }
    );
  }
}
