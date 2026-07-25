import { NextRequest, NextResponse } from "next/server";
import { blogTemplates } from "@/data/blog-templates";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { slug, language } = body;

    const template = blogTemplates.find((t) => t.slug === slug);
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${slug}` },
        { status: 404 }
      );
    }

    const db = await adminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    // Create EN post
    if (!language || language === "en") {
      const enSlug = `${template.slug}-en`;
      await db.collection("blog_posts").add({
        title: template.titleEn,
        slug: enSlug,
        excerpt: template.excerptEn,
        content: template.contentEn,
        category: template.category || "resources",
        featured_image: "",
        author: "Viva Resource",
        language: "en",
        published: true,
        status: "published",
        tags: template.tags,
        created_at: now,
        updated_at: now,
        published_at: now,
      });
    }

    // Create ES post
    if (!language || language === "es") {
      const esSlug = `${template.slug}-es`;
      await db.collection("blog_posts").add({
        title: template.titleEs,
        slug: esSlug,
        excerpt: template.excerptEs,
        content: template.contentEs,
        category: template.category || "resources",
        featured_image: "",
        author: "Viva Resource",
        language: "es",
        published: true,
        status: "published",
        tags: template.tags,
        created_at: now,
        updated_at: now,
        published_at: now,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Published "${template.titleEn}" in ${language || "both languages"}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error publishing blog from template:", error);
    return NextResponse.json(
      { error: "Error publishing blog post", details: message },
      { status: 500 }
    );
  }
}
