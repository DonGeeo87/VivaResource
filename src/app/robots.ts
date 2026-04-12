import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.org";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Try to read SEO settings from Firestore
  let allowIndexing = true;
  let noindexPaths: string[] = ["/admin/", "/api/", "/volunteer-portal/"];
  let customRules: string[] = [];

  try {
    const { getDocs, collection } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase/config");

    const snapshot = await getDocs(collection(db, "seo_settings"));
    const settings: Record<string, string> = {};
    snapshot.forEach((doc) => {
      settings[doc.id] = doc.data().value as string;
    });

    // Check global indexing toggle
    if (settings.allow_indexing === "false") {
      allowIndexing = false;
    }

    // Check custom noindex paths
    if (settings.noindex_paths) {
      const extraPaths = settings.noindex_paths
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      // Merge with defaults, avoid duplicates
      const defaultPaths = ["/admin/", "/api/", "/volunteer-portal/"];
      const allPaths = Array.from(new Set([...defaultPaths, ...extraPaths]));
      noindexPaths = allPaths;
    }

    // Check custom robots rules
    if (settings.custom_robots_rules) {
      customRules = settings.custom_robots_rules
        .split("\n")
        .filter((line) => line.trim().length > 0);
    }
  } catch {
    // Use defaults if Firestore fetch fails
  }

  // If global indexing is disabled, block everything
  if (!allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  // Build rules array for custom rules
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: noindexPaths,
    },
  ];

  // Add custom rules for specific bots (e.g., GPTBot, CCBot)
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
