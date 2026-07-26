import { NextRequest, NextResponse } from "next/server";

// Marcar esta ruta como dinámica para evitar el error de renderizado estático
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");

    const snapshot = await db
      .collection("donations")
      .get();

    const donations = snapshot.docs.slice(0, limit).map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(donations);
  } catch (error) {
    console.error("[Donations API] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener donaciones" },
      { status: 500 }
    );
  }
}
