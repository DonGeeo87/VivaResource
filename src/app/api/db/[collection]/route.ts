import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-db";

// GET /api/db/[collection] — Listar documentos
// GET /api/db/[collection]/[id] — Obtener un documento
export async function GET(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // GET /api/db/[collection]?id=xxx
      const doc = await db.collection(params.collection).doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    // GET /api/db/[collection] — listar todos
    const whereField = searchParams.get("whereField");
    const whereOp = searchParams.get("whereOp") || "==";
    const whereValue = searchParams.get("whereValue");
    const orderByField = searchParams.get("orderBy");
    const orderDir = searchParams.get("orderDir") || "desc";

    let snapshot;
    if (whereField && whereValue) {
      snapshot = await db.collection(params.collection)
        .where(whereField, whereOp, whereValue)
        .get();
    } else {
      snapshot = await db.collection(params.collection).get();
    }

    const docs = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Simple sort (Firestore ya ordena, pero por si acaso)
    if (orderByField) {
      docs.sort((a: any, b: any) => {
        const va = a[orderByField];
        const vb = b[orderByField];
        if (orderDir === "asc") return va > vb ? 1 : -1;
        return va < vb ? 1 : -1;
      });
    }

    return NextResponse.json(docs);
  } catch (error) {
    console.error(`[DB API] GET ${params.collection} error:`, error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/db/[collection] — Crear documento
export async function POST(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const docRef = await db.collection(params.collection).add(body);
    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (error) {
    console.error(`[DB API] POST ${params.collection} error:`, error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PUT /api/db/[collection] — Actualizar documento (requiere ?id=xxx en body o query)
export async function PUT(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const id = body.id || request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const { id: _, ...data } = body;
    await db.collection(params.collection).doc(id).set(data, { merge: true });
    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error(`[DB API] PUT ${params.collection} error:`, error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE /api/db/[collection] — Eliminar documento (requiere ?id=xxx)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await db.collection(params.collection).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DB API] DELETE ${params.collection} error:`, error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
