import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, query, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface NewsletterHistory {
  id: string;
  subject: string;
  content: string;
  sent_at: Timestamp | Date;
  total_sent: number;
  total_failed: number;
  total_subscribers: number;
  status: string;
}

function getTimestamp(date: Timestamp | Date): number {
  if (date instanceof Timestamp) return date.toDate().getTime();
  if (date instanceof Date) return date.getTime();
  return 0;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Try with orderBy first
    try {
      const q = query(
        collection(db, "newsletter_history"),
        orderBy("sent_at", "desc")
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as NewsletterHistory[];

      return NextResponse.json({ success: true, history });
    } catch {
      // Fallback: fetch without ordering and sort client-side
      console.log("[Newsletter History] Index not found, fetching without orderBy");
      const snapshot = await getDocs(collection(db, "newsletter_history"));
      const history = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as NewsletterHistory[];

      // Sort client-side
      history.sort((a, b) => getTimestamp(b.sent_at) - getTimestamp(a.sent_at));

      return NextResponse.json({ success: true, history });
    }
  } catch (error) {
    console.error("Error fetching newsletter history:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Error fetching history", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, "newsletter_history", id));

    return NextResponse.json({ success: true, message: "Entry deleted" });
  } catch (error) {
    console.error("Error deleting newsletter history:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Error deleting entry", details: message },
      { status: 500 }
    );
  }
}
