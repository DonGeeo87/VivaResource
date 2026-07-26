import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.org";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/get-help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/get-involved`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/donate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapData: MetadataRoute.Sitemap = [...staticRoutes];

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
    } catch { /* skip blog */ }

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
    } catch { /* skip events */ }

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
    } catch { /* skip forms */ }
  } catch {
    // If adminDb fails, return static routes only
  }

  return sitemapData;
}
