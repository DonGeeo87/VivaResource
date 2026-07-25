import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ posts: [] });
    }

    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "all";
    const category = searchParams.get("category") || "all";

    const snapshot = await db.collection("blog_posts").get();
    let posts = snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by status
    posts = posts.filter((p: Record<string, unknown>) => p.status === "published");

    // Filter by language
    if (lang !== "all") {
      posts = posts.filter((p: Record<string, unknown>) => p.language === lang);
    }

    // Filter by category
    if (category !== "all") {
      posts = posts.filter((p: Record<string, unknown>) => p.category === category);
    }

    // Sort by published_at descending
    posts.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const dateA = a.published_at ? new Date(a.published_at as string).getTime() : 0;
      const dateB = b.published_at ? new Date(b.published_at as string).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ posts: [], error: message });
  }
}
