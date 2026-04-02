import { db } from "@/lib/firebase/config";
import { doc, updateDoc, deleteDoc, Timestamp, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const eventId = params.id;
    const body = await request.json();

    // Validación básica
    if (!body.title_en || !body.title_es) {
      return NextResponse.json(
        { error: "Títulos en inglés y español son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Preparar datos para actualizar
    const updateData = {
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
      updated_at: Timestamp.now(),
    };

    // Actualizar en Firestore
    await updateDoc(eventRef, updateData);

    return NextResponse.json({
      success: true,
      message: "Evento actualizado exitosamente",
      id: eventId,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando evento" },
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
    const eventId = params.id;

    // Verificar que el evento existe
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Eliminar de Firestore
    await deleteDoc(eventRef);

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

// Get single event (optional)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const eventId = params.id;
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: eventSnap.id,
      ...eventSnap.data(),
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching event" },
      { status: 500 }
    );
  }
}
