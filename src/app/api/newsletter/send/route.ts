import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import nodemailer from "nodemailer";

// Configurar transporte de Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.EMAIL_USER || "vivaresourcefoundation@gmail.com";

interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn("[Newsletter Send] Gmail SMTP credentials not configured");
      return NextResponse.json(
        { error: "Gmail SMTP credentials not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { subject, content, html, sendMode, selectedEmails } = body;

    // Validate required fields
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Fetch subscribers based on send mode
    let subscribers: Subscriber[] = [];

    if (sendMode === "selected" && Array.isArray(selectedEmails) && selectedEmails.length > 0) {
      // Filter by selected emails
      subscribers = selectedEmails.map(email => ({
        id: `selected-${email}`,
        email,
        name: "",
        status: "active",
      }));
    } else {
      // Fetch all active subscribers
      try {
        const q = query(
          collection(db, "newsletter_subscribers"),
          where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        subscribers = snapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.data().email,
          name: doc.data().name || "",
          status: doc.data().status || "active",
        })) as Subscriber[];
      } catch (queryError) {
        console.error("Error fetching subscribers for newsletter:", queryError);
        // Fallback: fetch all and filter client-side
        const snapshot = await getDocs(collection(db, "newsletter_subscribers"));
        subscribers = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Subscriber[];
        subscribers = subscribers.filter((s) => s.status === "active");
      }
    }

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers to send to" },
        { status: 400 }
      );
    }

    // Build HTML email
    const emailHtml = html || buildEmailHtml(subject, content);

    // Save to newsletter history BEFORE sending (so it exists even if send fails)
    let historyId: string | null = null;
    try {
      const historyRef = await addDoc(collection(db, "newsletter_history"), {
        subject: subject.trim(),
        content,
        sent_at: Timestamp.now(),
        total_sent: 0,
        total_failed: 0,
        total_subscribers: subscribers.length,
        status: "sending",
      });
      historyId = historyRef.id;
    } catch (historyError) {
      console.error("[Newsletter Send] Error saving preliminary history:", historyError);
    }

    // Send emails one by one with delay to avoid rate limiting (Gmail limit: 500/day)
    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const subscriber of subscribers) {
      try {
        await transporter.sendMail({
          from: `"Viva Resource Foundation" <${FROM_EMAIL}>`,
          to: subscriber.email,
          subject: subject.trim(),
          html: emailHtml,
        });

        results.success++;

        // Delay between sends to avoid rate limiting (500ms = ~2 emails/sec)
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        results.failed++;
        const message = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error sending to ${subscriber.email}: ${message}`);
        console.error(`Error sending newsletter to ${subscriber.email}:`, err);
      }
    }

    // Update history with final results
    if (historyId) {
      try {
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "newsletter_history", historyId), {
          total_sent: results.success,
          total_failed: results.failed,
          status: results.failed === 0 ? "completed" : "completed_with_errors",
        });
      } catch (updateError) {
        console.error("[Newsletter Send] Error updating history:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${results.success} subscribers (${results.failed} failed)`,
      stats: {
        total_subscribers: subscribers.length,
        sent: results.success,
        failed: results.failed,
      },
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Error sending newsletter", details: message },
      { status: 500 }
    );
  }
}

function buildEmailHtml(subject: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Public Sans', Arial, sans-serif; background-color: #f9f9f9;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #025689; padding: 24px 32px; text-align: center;">
                  <a href="https://vivaresource.org" style="text-decoration: none;">
                    <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 24px; font-weight: 800; color: #ffffff;">VIVA RESOURCE</span>
                  </a>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">${subject}</h1>
                  <div style="color: #333; font-size: 16px; line-height: 1.6;">${content}</div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f3f3f3; padding: 24px 32px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                    Viva Resource Foundation
                  </p>
                  <p style="margin: 0; color: #999; font-size: 12px;">
                    Building a more resilient community together.
                  </p>
                  <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">
                    <a href="https://vivaresource.org" style="color: #025689;">vivaresource.org</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
