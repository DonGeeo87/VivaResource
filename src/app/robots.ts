import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com";

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

  // Crawlers de motores de respuesta (AEO/GEO): se permite explicitamente que
  // indexen el contenido publico. No es una puerta abierta — heredan el mismo
  // disallow que el resto — pero deja constancia de la intencion.
  const AI_CRAWLERS = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "Google-Extended",
    "ClaudeBot",
    "anthropic-ai",
    "PerplexityBot",
    "CCBot",
    "Applebot-Extended",
    "Bytespider",
  ];

  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: noindexPaths,
    },
  ];

  const seenAgents = new Set<string>(["*"]);
  for (const bot of AI_CRAWLERS) {
    rules.push({ userAgent: bot, allow: "/", disallow: noindexPaths });
    seenAgents.add(bot);
  }

  for (const rule of customRules) {
    const trimmed = rule.trim();
    if (trimmed.startsWith("User-agent:")) {
      const ua = trimmed.split(":")[1].trim();
      if (ua && ua !== "*" && !seenAgents.has(ua)) {
        rules.push({
          userAgent: ua,
          disallow: "/",
        });
        seenAgents.add(ua);
      }
    }
  }

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
