/**
 * Guard de autorización para las API routes de datos.
 *
 * Contexto: `/api/db/[collection]` era CRUD público sin ninguna validación —
 * cualquiera podía leer `admin_users` o borrar inscripciones con un curl, y el
 * `middleware.ts` excluye `/api` del matcher, así que no había nada tapando el
 * hueco. Ahora cada handler pasa por `authorize()`:
 *
 *   GET     → público SOLO en las colecciones que las páginas públicas leen
 *   POST    → público SOLO al crear desde un formulario público; resto editor+
 *   PUT     → editor+ (salvo las escrituras del portal del voluntario)
 *   DELETE  → admin
 *
 * El portal del voluntario entra con token propio (`type: "volunteer"`) y solo
 * sobre `volunteer_tasks` / `volunteer_messages`, donde además el route fuerza
 * el filtro `volunteerId == uid` para que un voluntario no vea datos de otro.
 */

import { NextResponse } from "next/server";
import { getTokenFromHeader, verifyToken, type JwtPayload } from "@/lib/auth/jwt";

const ROLE_RANK: Record<JwtPayload["role"], number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
};

/** Colecciones que las páginas públicas leen sin sesión. */
export const PUBLIC_READ_COLLECTIONS: ReadonlySet<string> = new Set([
  "events", // /events y el registro a eventos
  "forms", // /events/register y /forms/[id]
  "seo_settings", // SchemaMarkup (JSON-LD del sitio público)
  "site_images",
  "site_settings", // /get-help lee notify_on_help_request
]);

/** Colecciones que un formulario público puede CREAR sin sesión (solo POST). */
export const PUBLIC_CREATE_COLLECTIONS: ReadonlySet<string> = new Set([
  "event_registrations", // inscripción a un evento
  "form_submissions", // responder un formulario
  "help_requests", // /get-help
  "volunteer_registrations", // /get-involved
]);

/**
 * Colecciones del portal del voluntario: requieren token `type: "volunteer"` y
 * el route aplica el filtro de propiedad `volunteerId == uid`.
 */
export const VOLUNTEER_OWN_COLLECTIONS: ReadonlySet<string> = new Set([
  "volunteer_tasks",
  "volunteer_messages",
]);

/** ¿Esta request corresponde a un voluntario operando su propia colección? */
export function isVolunteerScoped(
  payload: JwtPayload | null,
  collection: string
): payload is JwtPayload {
  return payload?.type === "volunteer" && VOLUNTEER_OWN_COLLECTIONS.has(collection);
}

/** Payload del token, o null si no hay token válido. */
export function authPayload(request: Request): JwtPayload | null {
  const token = getTokenFromHeader(request);
  return token ? verifyToken(token) : null;
}

/**
 * Un token de voluntario (`type: "volunteer"`) nunca alcanza para operar sobre
 * datos de administración, aunque su `role` diga "viewer".
 */
function hasAdminRole(payload: JwtPayload | null, min: JwtPayload["role"]): boolean {
  if (!payload || payload.type !== "admin") return false;
  const rank = ROLE_RANK[payload.role];
  return typeof rank === "number" && rank >= ROLE_RANK[min];
}

export type Verdict = { ok: true } | { ok: false; response: NextResponse };

/**
 * Para endpoints que NO operan sobre una colección (envío de correo, subida de
 * imágenes, generación con IA, publicar un post desde plantilla): exige sesión
 * de staff. Antes estos endpoints estaban abiertos — `/api/email/send` era un
 * relay abierto (cualquiera mandaba correo a cualquier dirección como Viva) y
 * `v2/blog/create|update` dejaban crear y borrar posts sin sesión.
 */
export function authorizeStaff(
  request: Request,
  min: JwtPayload["role"] = "editor"
): Verdict {
  const payload = authPayload(request);
  if (hasAdminRole(payload, min)) return { ok: true };
  return deny(payload, "Permisos insuficientes");
}

function deny(payload: JwtPayload | null, insufficientMessage: string): Verdict {
  return {
    ok: false,
    response: NextResponse.json(
      { error: payload ? insufficientMessage : "No autorizado" },
      { status: payload ? 403 : 401 }
    ),
  };
}

/** Decide si la request puede tocar la colección con ese método. */
export function authorize(
  request: Request,
  collection: string,
  method: string
): Verdict {
  const payload = authPayload(request);

  switch (method) {
    case "GET":
      if (PUBLIC_READ_COLLECTIONS.has(collection)) return { ok: true };
      if (hasAdminRole(payload, "viewer")) return { ok: true };
      if (isVolunteerScoped(payload, collection)) return { ok: true };
      return deny(payload, "Permisos insuficientes");

    case "POST":
      if (PUBLIC_CREATE_COLLECTIONS.has(collection)) return { ok: true };
      if (hasAdminRole(payload, "editor")) return { ok: true };
      if (isVolunteerScoped(payload, collection)) return { ok: true };
      return deny(payload, "Permisos insuficientes");

    case "PUT":
      if (hasAdminRole(payload, "editor")) return { ok: true };
      if (isVolunteerScoped(payload, collection)) return { ok: true };
      return deny(payload, "Permisos insuficientes");

    case "DELETE":
      if (hasAdminRole(payload, "admin")) return { ok: true };
      return deny(payload, "Solo un administrador puede eliminar registros");

    default:
      return {
        ok: false,
        response: NextResponse.json({ error: "Método no permitido" }, { status: 405 }),
      };
  }
}
