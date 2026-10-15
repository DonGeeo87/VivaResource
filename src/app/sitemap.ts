import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com";

// Render at request time. Sin esto, Next prerenderiza el sitemap durante el
// build de Docker, donde no existe Postgres: el try/catch falla y la imagen
// queda con las 10 rutas estaticas horneadas, sin blog ni eventos.
export const dynamic = "force-dynamic";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/free-resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/get-help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/get-involved`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/donate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/locations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  // Paginas por ciudad: son busquedas locales ("recursos comunitarios Peyton").
  ...["peyton", "colorado-springs", "pueblo", "fountain", "monument"].map((slug) => ({
    url: `${siteUrl}/locations/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  })),
  { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
];

const esUrl = (url: string): string =>
  url === siteUrl ? `${siteUrl}/es` : `${url.replace(siteUrl, `${siteUrl}/es`)}`;

/**
 * Cada ruta publica se declara en ingles con `alternates.languages` apuntando a
 * su par en espanol (/es/*). Antes se duplicaban dos entradas sueltas y Google
 * tenia que adivinar que eran la misma pagina en otro idioma.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapData: MetadataRoute.Sitemap = staticRoutes.map((entry) => ({
    ...entry,
    alternates: {
      languages: {
        en: entry.url,
        es: esUrl(entry.url),
        "x-default": entry.url,
      },
    },
  }));

  try {
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (!db) return sitemapData;

    // Blog posts
    try {
      const blogSnapshot = await db.collection("blog_posts").where("status", "==", "published").get();
      blogSnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        const slug = data.slug || doc.id;
        sitemapData.push({
          url: `${siteUrl}/blog/${slug}`,
          lastModified: new Date(data.published_at || Date.now()),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      });
    } catch (e) { console.warn("[sitemap] blog_posts query failed:", e); }

    // Events
    try {
      const eventSnapshot = await db.collection("events").where("status", "==", "published").get();
      eventSnapshot.docs.forEach((doc: any) => {
        sitemapData.push({
          url: `${siteUrl}/events/register/${doc.id}`,
          lastModified: new Date(doc.data().date || Date.now()),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      });
    } catch (e) { console.warn("[sitemap] events query failed:", e); }

    // Forms
    try {
      const formSnapshot = await db.collection("forms").get();
      formSnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.status === "active" || data.isPublic) {
          sitemapData.push({
            url: `${siteUrl}/forms/${doc.id}`,
            lastModified: new Date(data.updated_at || Date.now()),
            changeFrequency: "monthly",
            priority: 0.5,
          });
        }
      });
    } catch (e) { console.warn("[sitemap] forms query failed:", e); }
  } catch {
    // If adminDb fails, return static routes only
  }

  return sitemapData;
}
