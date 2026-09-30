import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-db";
import { authPayload, authorize, isVolunteerScoped } from "@/lib/auth/guard";

/**
 * uid del voluntario cuando la request viene de un voluntario sobre su propia
 * colección (volunteer_tasks / volunteer_messages). En ese caso nunca se confía
 * en lo que mande el cliente: el filtro y el campo volunteerId se fuerzan acá.
 */
function scopedVolunteerId(request: NextRequest, collection: string): string | null {
  const payload = authPayload(request);
  return isVolunteerScoped(payload, collection) ? payload.uid : null;
}

// GET /api/db/[collection] — Listar documentos
// GET /api/db/[collection]/[id] — Obtener un documento
export async function GET(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const access = authorize(request, params.collection, "GET");
    if (!access.ok) return access.response;

    const volunteerId = scopedVolunteerId(request, params.collection);

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
      const scopedData = doc.data();
      if (volunteerId && scopedData?.volunteerId !== volunteerId) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      return NextResponse.json({ id: doc.id, ...scopedData });
    }

    // GET /api/db/[collection] — listar todos
    const wheresParam = searchParams.get("wheres");
    // Compatibilidad: antiguo whereField/whereValue
    const legacyField = searchParams.get("whereField");
    const legacyOp = searchParams.get("whereOp") || "==";
    const legacyValue = searchParams.get("whereValue");
    const orderByField = searchParams.get("orderBy");
    const orderDir = searchParams.get("orderDir") || "desc";
    const limitStr = searchParams.get("limit");

    let wheres: { field: string; op: string; value: unknown }[] = [];
    if (wheresParam) {
      try {
        wheres = JSON.parse(wheresParam);
      } catch { wheres = []; }
    } else if (legacyField && legacyValue) {
      wheres = [{ field: legacyField, op: legacyOp, value: legacyValue }];
    }

    if (volunteerId) {
      // Se descarta cualquier filtro que el cliente haya puesto sobre
      // volunteerId y se reemplaza por el uid del token: solo ve lo suyo.
      wheres = wheres.filter((w) => w.field !== "volunteerId");
      wheres.push({ field: "volunteerId", op: "==", value: volunteerId });
    }

    let snapshot;
    if (wheres.length > 0) {
      let q: any = db.collection(params.collection);
      for (const w of wheres) {
        q = q.where(w.field, w.op, w.value);
      }
      snapshot = await q
        .orderBy(orderByField || "created_at", orderDir === "asc" ? "asc" : "desc")
        .limit(limitStr ? parseInt(limitStr) : 1000)
        .get();
    } else {
      snapshot = await db.collection(params.collection)
        .orderBy(orderByField || "created_at", orderDir === "asc" ? "asc" : "desc")
        .limit(limitStr ? parseInt(limitStr) : 1000)
        .get();
    }

    const docs = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
    const access = authorize(request, params.collection, "POST");
    if (!access.ok) return access.response;

    const volunteerId = scopedVolunteerId(request, params.collection);

    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    if (volunteerId) body.volunteerId = volunteerId;
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
    const access = authorize(request, params.collection, "PUT");
    if (!access.ok) return access.response;

    const volunteerId = scopedVolunteerId(request, params.collection);

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

    if (volunteerId) {
      const existing = await db.collection(params.collection).doc(id).get();
      if (!existing.exists || existing.data()?.volunteerId !== volunteerId) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      data.volunteerId = volunteerId;
    }

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
    const access = authorize(request, params.collection, "DELETE");
    if (!access.ok) return access.response;

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
