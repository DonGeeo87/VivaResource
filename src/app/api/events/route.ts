import { NextRequest, NextResponse } from "next/server";
import { parseEventDateTime } from "@/lib/timezone";
import { formTemplates } from "@/data/formTemplates";

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
    // El login emite un JWT local firmado con jsonwebtoken (ver src/lib/auth/jwt.ts).
    // Validar ese JWT con verifyToken, NO con verifyIdToken (que espera un ID token de Firebase).
    const { verifyToken } = await import("@/lib/auth/jwt");
    const { adminDb } = await import("@/lib/admin-db");
    const payload = verifyToken(token);
    if (!payload) {
      return { error: "Token inválido", status: 401 };
    }
    const email = payload.email;

    const db = await adminDb();
    if (!db) {
      console.error("[API Events] Database not configured");
    return { error: "Database not configured - check Vercel environment variables", status: 500 };
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
      formTemplate: body.formTemplate || "",
      formId: body.formId || "",
      maxParticipants: body.maxParticipants || null,
      generateQR: body.generateQR || false,
      showQROnPage: body.showQROnPage || false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Guardar en Firestore usando Admin SDK (bypass reglas de seguridad)
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    const docRef = await db.collection("events").add(eventData);

    // If a template was selected, create the form in Firestore automatically
    let createdFormId = null;
    if (body.formTemplate && body.formTemplate !== "") {
      try {
        const template = formTemplates[body.formTemplate as keyof typeof formTemplates];

        if (template) {
          // Use custom fields if they were edited inline, otherwise use template defaults
          let formFields = template.fields;
          if (body.customFormFields) {
            try {
              const parsed = JSON.parse(body.customFormFields);
              if (Array.isArray(parsed) && parsed.length > 0) {
                formFields = parsed;
              }
            } catch {
              console.log("[API Events] No custom fields provided, using template defaults");
            }
          }

          const formDocRef = await db.collection("forms").add({
            title: template.title,
            titleEs: template.titleEs,
            description: template.description,
            descriptionEs: template.descriptionEs,
            fields: formFields,
            status: "draft",
            published: false,
            shareMode: "event",
            linkedEventId: docRef.id,
            settings: template.settings || {
              allowMultipleSubmissions: true,
              showProgressBar: true,
              requireEmail: false,
            },
            thankYouMessage: template.thankYouMessage || "",
            thankYouMessageEs: template.thankYouMessageEs || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          createdFormId = formDocRef.id;
          await docRef.update({ formId: formDocRef.id });
          console.log("[API Events] Created form", formDocRef.id, "linked to event", docRef.id);
        }
      } catch (formError) {
        console.error("[API Events] Error creating form from template:", formError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Evento creado exitosamente",
        id: docRef.id,
        formId: createdFormId,
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
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    console.log("[API Events] Fetching events...");
    const snapshot = await db.collection("events").orderBy("date", "desc").get();
    console.log("[API Events] Found", snapshot.size, "events");

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
