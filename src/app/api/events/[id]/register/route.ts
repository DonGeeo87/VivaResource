import { NextRequest, NextResponse } from "next/server";

// Usa la DB en runtime (no en build, donde no hay Postgres)
export const dynamic = "force-dynamic";

interface ScheduleDate {
  id: string;
  date?: string | Date;
  time?: string;
  capacity?: number | null;
}

/**
 * Cuenta las inscripciones activas de una fecha concreta.
 * Se cuenta, no se lleva un contador: un contador se desincroniza cuando alguien
 * cancela, un COUNT siempre refleja la realidad.
 */
async function countRegistrations(
  db: { collection: (n: string) => { where: (f: string, op: string, v: unknown) => { get: () => Promise<{ size: number; docs: Array<{ data: () => Record<string, unknown> }> }> } } },
  eventId: string,
  dateId?: string
): Promise<number> {
  const snap = await db.collection("event_registrations").where("event_id", "==", eventId).get();
  let n = 0;
  snap.docs.forEach((d) => {
    const data = d.data();
    // Las canceladas no ocupan cupo.
    if (data.status === "cancelled") return;
    // Si el evento tiene varias fechas, solo cuentan las de esa fecha.
    if (dateId && data.date_id && data.date_id !== dateId) return;
    n += 1;
  });
  return n;
}

/**
 * POST /api/events/[id]/register
 *
 * Alta publica de inscripcion. Valida el cupo en el SERVIDOR: hasta ahora
 * `maxParticipants` se guardaba pero nadie lo verificaba, asi que un taller de
 * 20 personas aceptaba inscripciones infinitas.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const eventId = params.id;

  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // 1. El evento debe existir y estar publicado
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }
    const event = eventDoc.data() as Record<string, unknown>;

    if (event.status !== "published") {
      return NextResponse.json(
        { error: "Este evento no está abierto para inscripciones" },
        { status: 403 }
      );
    }
    if (event.is_archived === true || event.is_finished === true) {
      return NextResponse.json(
        { error: "Este evento ya finalizó" },
        { status: 403 }
      );
    }

    // 2. Resolver la fecha elegida y su cupo
    const dates: ScheduleDate[] = Array.isArray(event.dates) ? (event.dates as ScheduleDate[]) : [];
    const dateId = typeof body.date_id === "string" ? body.date_id : "";
    const isMultiDate = dates.length > 0;

    let capacity: number | null = null;

    if (isMultiDate) {
      if (!dateId) {
        return NextResponse.json(
          { error: "Debes elegir a cuál fecha asistirás" },
          { status: 400 }
        );
      }
      if (dateId === "main") {
        capacity = (event.maxParticipants as number | null) ?? null;
      } else {
        const chosen = dates.find((d) => d.id === dateId);
        if (!chosen) {
          return NextResponse.json({ error: "Fecha no válida" }, { status: 400 });
        }
        // Cupo propio de la fecha; si no tiene, cae al cupo general del evento.
        capacity = chosen.capacity ?? ((event.maxParticipants as number | null) ?? null);

        // No se aceptan inscripciones a una fecha ya pasada.
        const when = chosen.date ? new Date(chosen.date as string).getTime() : NaN;
        if (!isNaN(when) && when < Date.now()) {
          return NextResponse.json(
            { error: "Esa fecha ya pasó. Elige otra." },
            { status: 400 }
          );
        }
      }
    } else {
      capacity = (event.maxParticipants as number | null) ?? null;
    }

    // 3. Verificar cupo ANTES de escribir (el chequeo es del servidor)
    if (capacity && capacity > 0) {
      const taken = await countRegistrations(
        db as unknown as Parameters<typeof countRegistrations>[0],
        eventId,
        isMultiDate ? dateId : undefined
      );
      if (taken >= capacity) {
        return NextResponse.json(
          {
            error: "El cupo para esta fecha está completo",
            code: "FULL",
            capacity,
            taken,
          },
          { status: 409 }
        );
      }
    }

    // 4. Crear la inscripcion
    const docRef = await db.collection("event_registrations").add({
      ...body,
      event_id: eventId,
      status: "registered",
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[events/register]", message);
    return NextResponse.json({ error: "No se pudo completar la inscripción" }, { status: 500 });
  }
}
