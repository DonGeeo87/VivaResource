import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { parseEventDateTime } from "@/lib/timezone";
import { verifyIdToken, adminDb } from "@/lib/firebase/admin";

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

    // Verificar que el usuario esté en admin_users (usando Admin SDK para bypass reglas)
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar autenticación
    const authResult = await verifyAdmin(request);
    if ("error" in authResult && "status" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    console.log("[API Events] Received body:", JSON.stringify(body, null, 2));

    // Validación
    if (!body.title_en || typeof body.title_en !== "string" || !body.title_en.trim()) {
      return NextResponse.json(
        { error: "Título en inglés es requerido" },
        { status: 400 }
      );
    }
    if (!body.title_es || typeof body.title_es !== "string" || !body.title_es.trim()) {
      return NextResponse.json(
        { error: "Título en español es requerido" },
        { status: 400 }
      );
    }

    if (!body.date || typeof body.date !== "string") {
      return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { error: "Fecha en formato inválido. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Parse date with Mountain Time (Peyton, Colorado)
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

    // Preparar datos para Firestore
    const eventData = {
      title_en: body.title_en.trim(),
      title_es: body.title_es.trim(),
      slug: body.slug?.trim() || "",
      description_en: body.description_en || "",
      description_es: body.description_es || "",
      date: parsedDate, // Stored as UTC timestamp representing Mountain Time
      time: body.time || "", // Store original time string for display
      location: body.location?.trim() || "",
      category: body.category || "community",
      registration_required: body.registration_required || false,
      status: body.status || "draft",
      image_url: body.image_url || "",
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    // Guardar en Firestore usando Admin SDK (bypass reglas de seguridad)
    const docRef = await adminDb.collection("events").add(eventData);

    return NextResponse.json(
      {
        success: true,
        message: "Evento creado exitosamente",
        id: docRef.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    const message = error instanceof Error ? error.message : "Error creando evento";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar autenticación
    const authResult = await verifyAdmin(request);
    if ("error" in authResult && "status" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Listar eventos usando Admin SDK
    const snapshot = await adminDb.collection("events").orderBy("date", "desc").get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching events" },
      { status: 500 }
    );
  }
}
