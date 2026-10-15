/**
 * URL canonica del sitio.
 *
 * Vive en su propio modulo a proposito: `metadata.ts` importa `next/headers`
 * (solo sirve en servidor), asi que cualquier componente cliente que necesite
 * SITE_URL debe tomarlo de aqui y no de `metadata.ts`.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com"
).replace(/\/+$/, "");
