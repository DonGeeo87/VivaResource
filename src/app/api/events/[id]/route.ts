import { NextRequest, NextResponse } from "next/server";
import { parseEventDateTime } from "@/lib/timezone";

// Force dynamic rendering - uses Firebase Admin SDK
export const dynamic = "force-dynamic";

// Helper para verificar autenticación del admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "No autorizado", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  try {
    const { verifyIdToken, adminDb } = await import("@/lib/firebase/admin");
    const decodedToken = await verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = await adminDb();
    if (!db) {
      return { error: "Database not configured", status: 500 };
    }

    const userDoc = await db.collection("admin_users").doc(uid).get();
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

// Update event
export async function PUT(
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
    const body = await request.json();

    // Validación básica
    if (!body.title_en || !body.title_es) {
      return NextResponse.json(
        { error: "Títulos en inglés y español son requeridos" },
        { status: 400 }
      );
    }

    // Validar fecha
    if (!body.date) {
      return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 });
    }

    // Get database instance
    const { adminDb } = await import("@/lib/firebase/admin");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Verificar que el evento existe usando Admin SDK
    const eventDoc = await db.collection("events").doc(eventId).get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Parsear fecha con zona horaria de Peyton, CO (Mountain Time)
    let parsedDate: Date;
    try {
      parsedDate = parseEventDateTime(body.date, body.time || "00:00");
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch {
      return NextResponse.json(
        { error: "Fecha inválida. Use formato YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    const updateData: Record<string, unknown> = {
      title_en: body.title_en,
      title_es: body.title_es,
      slug: body.slug || "",
      description_en: body.description_en || "",
      description_es: body.description_es || "",
      date: parsedDate,
      time: body.time || "",
      location: body.location || "",
      category: body.category || "community",
      registration_required: body.registration_required || false,
      status: body.status || "draft",
      updated_at: new Date(),
    };

    // Only update image_url if explicitly provided (even if empty)
    if ("image_url" in body) {
      updateData.image_url = body.image_url || "";
    }

    // Actualizar en Firestore usando Admin SDK
    await db.collection("events").doc(eventId).update(updateData);

    return NextResponse.json({
      success: true,
      message: "Evento actualizado exitosamente",
      id: eventId,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    const message = error instanceof Error ? error.message : "Error actualizando evento";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Delete event
export async function DELETE(
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

    // Get database instance
    const { adminDb } = await import("@/lib/firebase/admin");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Verificar que el evento existe usando Admin SDK
    const eventDoc = await db.collection("events").doc(eventId).get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Eliminar de Firestore usando Admin SDK
    await db.collection("events").doc(eventId).delete();

    return NextResponse.json({
      success: true,
      message: "Evento eliminado exitosamente",
      id: eventId,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error eliminando evento" },
      { status: 500 }
    );
  }
}

// Get single event
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

    // Get database instance
    const { adminDb } = await import("@/lib/firebase/admin");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const eventDoc = await db.collection("events").doc(eventId).get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: eventDoc.id,
      ...eventDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching event" },
      { status: 500 }
    );
  }
}
