import { NextRequest, NextResponse } from "next/server";
import { createPost } from "@/lib/db";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, category, featured_image, author, language, published, tags } = body;

    if (!title || !slug || !language) {
      return NextResponse.json(
        { error: "title, slug, and language are required" },
        { status: 400 }
      );
    }

    const post = await createPost({
      title,
      slug,
      excerpt: excerpt || "",
      content: content || "",
      category: category || "news",
      featured_image: featured_image || "",
      author: author || "Viva Resource",
      language,
      published: published || false,
      tags: tags || [],
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[PG Blog Create] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
