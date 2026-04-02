import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface NewsletterHistory {
  id: string;
  subject: string;
  content: string;
  sent_at: { toDate: () => Date } | Date;
  total_sent: number;
  total_failed: number;
  total_subscribers: number;
  status: string;
}

export async function GET(): Promise<NextResponse> {
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
