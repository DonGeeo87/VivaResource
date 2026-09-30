import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/lib/admin-db";
import { authorize } from "@/lib/auth/guard";

interface NewsletterHistory {
  id: string;
  subject: string;
  content: string;
  sent_at: string | Date;
  total_sent: number;
  total_failed: number;
  total_subscribers: number;
  status: string;
}

/**
 * Antes estas dos funciones leían/escribían a través de `@/lib/db-client`, que
 * hace `fetch` a una URL relativa (`/api/db/...`). Del lado servidor eso no
 * existe (Node exige URL absoluta), así que la ruta devolvía 500 siempre. Ahora
 * hablan directo con PostgreSQL vía adminDb y exigen sesión de admin.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const access = authorize(request, "newsletter_history", "GET");
    if (!access.ok) return access.response;

    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const snapshot = await db
      .collection("newsletter_history")
      .orderBy("sent_at", "desc")
      .get();

    const history = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as NewsletterHistory[];

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("Error fetching newsletter history:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Error fetching history", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const access = authorize(request, "newsletter_history", "DELETE");
    if (!access.ok) return access.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    await db.collection("newsletter_history").doc(id).delete();

    return NextResponse.json({ success: true, message: "Entry deleted" });
  } catch (error) {
    console.error("Error deleting newsletter history:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Error deleting entry", details: message },
      { status: 500 }
    );
  }
}
