import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ post: null, error: "slug required" }, { status: 400 });
    }

    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ post: null, error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[PG Blog Get] Error:", message);
    return NextResponse.json({ post: null, error: message }, { status: 500 });
  }
}
