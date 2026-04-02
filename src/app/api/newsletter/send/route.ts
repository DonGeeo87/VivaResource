import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Viva Resource <onboarding@resend.dev>";
const BATCH_SIZE = 50; // Resend limit per batch

interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { subject, content, html } = body;

    // Validate required fields
    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      );
    }

    // Fetch all active subscribers
    const q = query(
      collection(db, "newsletter_subscribers"),
      where("status", "==", "active"),
      orderBy("subscribed_at", "asc")
    );
    const snapshot = await getDocs(q);
    const subscribers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscriber[];

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers to send to" },
        { status: 400 }
      );
    }

    // Build HTML email using the same wrapper pattern
    const emailHtml = html || buildEmailHtml(subject, content);

    // Send in batches to avoid rate limits
    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      const sendPromises = batch.map(async (subscriber) => {
        try {
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [subscriber.email],
            subject,
            html: emailHtml,
          });

          if (error) {
            results.failed++;
            results.errors.push(`Failed to send to ${subscriber.email}: ${error.message}`);
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          const message = err instanceof Error ? err.message : "Unknown error";
          results.errors.push(`Error sending to ${subscriber.email}: ${message}`);
        }
      });

      await Promise.all(sendPromises);
    }

    // Save to newsletter history
    await addDoc(collection(db, "newsletter_history"), {
      subject,
      content,
      sent_at: Timestamp.now(),
      total_sent: results.success,
      total_failed: results.failed,
      total_subscribers: subscribers.length,
      status: results.failed === 0 ? "completed" : "completed_with_errors",
    });

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
