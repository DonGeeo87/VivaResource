import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.org";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let allowIndexing = true;
  let noindexPaths: string[] = ["/admin/", "/api/", "/volunteer-portal/"];
  let customRules: string[] = [];

  try {
    const { adminDb } = await import("@/lib/admin-db");
    const db = await adminDb();
    if (db) {
      const snapshot = await db.collection("seo_settings").get();
      const settings: Record<string, string> = {};
      snapshot.forEach((doc: any) => {
        settings[doc.id] = doc.data().value as string;
      });

      if (settings.allow_indexing === "false") {
        allowIndexing = false;
      }

      if (settings.noindex_paths) {
        const extraPaths = settings.noindex_paths
          .split("\n")
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0);
        const defaultPaths = ["/admin/", "/api/", "/volunteer-portal/"];
        const allPaths = Array.from(new Set([...defaultPaths, ...extraPaths]));
        noindexPaths = allPaths;
      }

      if (settings.custom_robots_rules) {
        customRules = settings.custom_robots_rules
          .split("\n")
          .filter((line: string) => line.trim().length > 0);
      }
    }
  } catch {
    // Use defaults if Firestore fetch fails
  }

  if (!allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: noindexPaths,
    },
  ];

  for (const rule of customRules) {
    const trimmed = rule.trim();
    if (trimmed.startsWith("User-agent:")) {
      const ua = trimmed.split(":")[1].trim();
      if (ua && ua !== "*") {
        rules.push({
          userAgent: ua,
          disallow: "/",
        });
      }
    }
  }

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
