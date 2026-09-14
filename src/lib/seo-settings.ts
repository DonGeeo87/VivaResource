/**
 * SEO settings reader.
 *
 * El panel /admin/seo escribe en la coleccion `seo_settings` (una fila por clave,
 * campo `value`). Antes nada leia esa coleccion: el admin guardaba titulos y
 * descripciones que el sitio ignoraba por completo. Este helper la conecta a la
 * metadata real del sitio.
 *
 * Nunca lanza: si la DB no responde (p. ej. durante el build de Docker, donde no
 * hay Postgres), devuelve {} y el caller usa sus valores por defecto.
 */

export interface SeoSettings {
  site_title?: string;
  site_description?: string;
  site_keywords?: string;
  canonical_url?: string;
  og_site_name?: string;
  og_default_image?: string;
  og_image_alt?: string;
  twitter_handle?: string;
  twitter_card_type?: string;
  google_verification_code?: string;
  bing_verification_code?: string;
  fb_app_id?: string;
}

export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) return {};

    const snapshot = await db.collection("seo_settings").get();
    const settings: Record<string, string> = {};
    snapshot.forEach((doc: { id: string; data: () => Record<string, unknown> }) => {
      const value = doc.data()?.value;
      if (typeof value === "string" && value.trim() !== "") {
        settings[doc.id] = value;
      }
    });
    return settings as SeoSettings;
  } catch {
    return {};
  }
}
