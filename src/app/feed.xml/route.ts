import { NextResponse } from "next/server";
import { getPosts, type BlogPost } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com";

// Render a request time: el feed necesita la DB, que no existe durante el build.
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<NextResponse> {
  let posts: BlogPost[] = [];
  try {
    posts = await getPosts({ limit: 30 });
  } catch (error) {
    console.warn("[feed] No se pudieron cargar los posts:", error);
    posts = [];
  }

  const items = posts
    .map((post) => {
      const isEs = post.language === "es";
      const url = `${siteUrl}${isEs ? "/es" : ""}/blog/${post.slug}`;
      const published = (post.published_at || post.created_at || new Date()).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${published}</pubDate>
      <category>${escapeXml(post.category || "Resources")}</category>
      <description>${escapeXml(post.excerpt || "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Viva Resource — Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Historias, recursos y novedades de Viva Resource para el Colorado rural.</description>
    <language>en-US</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
