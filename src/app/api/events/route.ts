import { db } from "@/lib/firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validación básica
    if (!body.title_en || !body.title_es) {
      return NextResponse.json(
        { error: "Títulos en inglés y español son requeridos" },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 });
    }

    // Preparar datos para Firestore
    const eventData = {
      title_en: body.title_en,
      title_es: body.title_es,
      slug: body.slug || "",
      description_en: body.description_en || "",
      description_es: body.description_es || "",
      date: new Date(body.date), // Firestore timestamp
      time: body.time || "",
      location: body.location || "",
      category: body.category || "community",
      registration_required: body.registration_required || false,
      status: body.status || "draft",
      image_url: body.image_url || "",
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, "events"), eventData);

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creando evento" },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    // Opcional: Listar eventos (implementar después si es necesario)
    return NextResponse.json({ message: "GET /api/events no implementado aún" });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching events" },
      { status: 500 }
    );
  }
}
