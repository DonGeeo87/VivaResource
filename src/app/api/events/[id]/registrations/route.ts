import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, adminDb as getAdminDb } from "@/lib/firebase/admin";

// Helper para verificar autenticación del admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "No autorizado", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await adminDb.collection("admin_users").doc(uid).get();
    if (!userDoc.exists) {
      return { error: "No tienes acceso de administrador", status: 403 };
    }

    const userData = userDoc.data();
    if (!userData || !["admin", "editor"].includes(userData.role)) {
      return { error: "No tienes permisos suficientes", status: 403 };
    }

    return { uid, role: userData.role };
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

    // Obtener registros del evento
    const snapshot = await adminDb
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
