import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "all";
    const category = searchParams.get("category") || "all";

    const posts = await getPosts({ lang, category });

    return NextResponse.json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[PG Blog List] Error:", message);
    return NextResponse.json({ posts: [], error: message }, { status: 500 });
  }
}
