import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { adminDb } = await import("@/lib/firebase/admin");
    const db = await adminDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const doc = {
      interests: body.interests || [],
      interests_other: body.interests_other || "",
      barriers: body.barriers || [],
      barriers_other: body.barriers_other || "",
      channels: body.channels || [],
      preferred_time: body.preferred_time || "",
      needs_childcare: body.needs_childcare || "",
      contact_method: body.contact_method || "",
      contact_value: body.contact_value || "",
      wants_contact: body.wants_contact || false,
      comments: body.comments || "",
      submittedAt: new Date(),
      language: body.language || "en",
    };

    const ref = await db.collection("survey_responses").add(doc);

    return NextResponse.json(
      { success: true, id: ref.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Survey API] Error:", error);
    return NextResponse.json(
      { error: "Error al guardar la encuesta" },
      { status: 500 }
    );
  }
}