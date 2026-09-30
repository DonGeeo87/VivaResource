import { NextRequest, NextResponse } from "next/server";
import { authorizeStaff } from "@/lib/auth/guard";
import { updatePost, deletePost, getPostById } from "@/lib/db";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const access = authorizeStaff(request, "editor");
    if (!access.ok) return access.response;

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const post = await updatePost(id, data);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[PG Blog Update] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Borrar un post es destructivo: admin (igual que en /api/db).
    const access = authorizeStaff(request, "admin");
    if (!access.ok) return access.response;

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const deleted = await deletePost(id);
    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[PG Blog Delete] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
