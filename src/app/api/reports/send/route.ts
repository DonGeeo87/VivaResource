import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDb, verifyIdToken } from "@/lib/admin-db";

// Force dynamic rendering - uses Firebase Admin SDK at runtime
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key_for_build");
const FROM_EMAIL = process.env.EMAIL_FROM || "Viva Resource <onboarding@resend.dev>";

function getReportEmails(settings: Record<string, unknown>): string[] {
  const reportEmails = settings.report_emails;
  if (typeof reportEmails === "string" && reportEmails.trim()) {
    return reportEmails.split(",").map((e) => e.trim()).filter(Boolean);
  }
  const fallback = process.env.NEWSLETTER_ADMIN_EMAILS;
  if (fallback) {
    return fallback.split(",").map((e) => e.trim()).filter(Boolean);
  }
  return ["vivaresourcefoundation@gmail.com"];
}

function getTimeWindowMs(frequency: string): number {
  switch (frequency) {
    case "daily":
      return 24 * 60 * 60 * 1000;
    case "weekly":
      return 7 * 24 * 60 * 60 * 1000;
    case "biweekly":
      return 14 * 24 * 60 * 60 * 1000;
    case "monthly":
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Auth: X-Report-Secret or Firebase admin token
    const reportSecret = request.headers.get("X-Report-Secret");
    let isAuthorized = false;

    if (reportSecret && reportSecret === process.env.REPORT_SECRET) {
      isAuthorized = true;
    } else {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const decoded = await verifyIdToken(token);
          const db = await adminDb();
          if (db) {
            const adminSnap = await db
              .collection("admin_users")
              .where("email", "==", decoded.email)
              .get();
            if (adminSnap.size > 0) {
              const role = adminSnap.docs[0].data()?.role;
              if (
                role === "admin" ||
                role === "editor" ||
                role === "viewer"
              ) {
                isAuthorized = true;
              }
            }
          }
        } catch {
          // token invalid
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      );
    }

    const db = await adminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Read settings
    const settingsSnapshot = await db.collection("site_settings").get();
    const settings: Record<string, unknown> = {};
    settingsSnapshot.forEach((doc) => {
      settings[doc.id] = doc.data().value;
    });

    const frequency = String(settings.report_frequency || "weekly");
    const reportEmails = getReportEmails(settings);
    if (reportEmails.length === 0) {
      return NextResponse.json(
        { error: "No report emails configured" },
        { status: 400 }
      );
    }

    const windowMs = getTimeWindowMs(frequency);
    const lastReportSent = parseDateValue(settings.last_report_sent_at);
    const startDate = lastReportSent ?? new Date(Date.now() - windowMs);
    const now = new Date();

    const results: Record<string, { count: number; items: Record<string, unknown>[] }> = {};

    // Query collections based on settings
    const includeForms = settings.report_include_forms === "true";
    const includeEvents = settings.report_include_events === "true";
    const includeHelp = settings.report_include_help === "true";
    const includeVolunteers = settings.report_include_volunteers === "true";

    if (includeForms) {
      try {
        const snapshot = await db
          .collection("form_submissions")
          .where("submittedAt", ">=", startDate)
          .get();
        results.forms = {
          count: snapshot.size,
          items: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.formName || data.formTitle || "Unknown form",
              email: data.email || "-",
              date: data.submittedAt
                ? parseDateValue(data.submittedAt)?.toLocaleString() || "-"
                : "-",
            };
          }),
        };
      } catch (err: unknown) {
        console.error("[Report] Error querying form_submissions:", err);
        results.forms = { count: 0, items: [] };
      }
    }

    if (includeEvents) {
      try {
        const snapshot = await db
          .collection("event_registrations")
          .where("created_at", ">=", startDate)
          .get();
        results.events = {
          count: snapshot.size,
          items: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.full_name || data.name || "-",
              email: data.email || "-",
              extra:
                data.event_name || data.eventName || "Unknown event",
              date: data.created_at
                ? parseDateValue(data.created_at)?.toLocaleString() || "-"
                : "-",
            };
          }),
        };
      } catch (err: unknown) {
        console.error("[Report] Error querying event_registrations:", err);
        results.events = { count: 0, items: [] };
      }
    }

    if (includeHelp) {
      try {
        const snapshot = await db
          .collection("help_requests")
          .where("createdAt", ">=", startDate)
          .get();
        results.help = {
          count: snapshot.size,
          items: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.fullName || "-",
              email: data.email || "-",
              extra: Array.isArray(data.assistanceTypes)
                ? data.assistanceTypes.join(", ")
                : "-",
              date: data.createdAt
                ? parseDateValue(data.createdAt)?.toLocaleString() || "-"
                : "-",
            };
          }),
        };
      } catch (err: unknown) {
        console.error("[Report] Error querying help_requests:", err);
        results.help = { count: 0, items: [] };
      }
    }

    if (includeVolunteers) {
      try {
        const snapshot = await db
          .collection("volunteer_registrations")
          .where("created_at", ">=", startDate)
          .get();
        results.volunteers = {
          count: snapshot.size,
          items: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name:
                `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
                "-",
              email: data.email || "-",
              extra: data.program || "-",
              date: data.created_at
                ? parseDateValue(data.created_at)?.toLocaleString() || "-"
                : "-",
            };
          }),
        };
      } catch (err: unknown) {
        console.error(
          "[Report] Error querying volunteer_registrations:",
          err
        );
        results.volunteers = { count: 0, items: [] };
      }
    }

    const totalItems =
      (results.forms?.count || 0) +
      (results.events?.count || 0) +
      (results.help?.count || 0) +
      (results.volunteers?.count || 0);

    const buildSection = (
      title: string,
      data: { count: number; items: Record<string, unknown>[] } | undefined
    ): string => {
      if (!data || data.count === 0) return "";
      const rows = data.items
        .map(
          (item) => `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.name || item.fullName || item.formName || item.eventName || "-"}</td>
          <td style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.email || "-"}</td>
          <td style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.extra || "-"}</td>
          <td style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.date || item.submittedAt || item.createdAt || "-"}</td>
        </tr>
      `
        )
        .join("");

      return `
        <h3 style="color: #025689; margin: 24px 0 8px 0; font-size: 18px;">${title} (${data.count})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #025689; color: white;">
              <th style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; font-size: 13px;">Name / Title</th>
              <th style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; font-size: 13px;">Email</th>
              <th style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; font-size: 13px;">Details</th>
              <th style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; font-size: 13px;">Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    };

    const html = `
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
                <tr>
                  <td style="background-color: #025689; padding: 24px 32px; text-align: center;">
                    <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 24px; font-weight: 800; color: #ffffff;">VIVA RESOURCE</span>
                    <p style="color: #b7f569; font-size: 14px; margin: 8px 0 0 0;">Activity Report</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="color: #025689; font-size: 22px; margin: 0 0 16px 0;">Activity Summary</h2>
                    <p style="color: #666; font-size: 14px; margin: 0 0 24px 0;">
                      Period: ${startDate.toLocaleDateString()} – ${now.toLocaleDateString()}<br>
                      Total new items: <strong>${totalItems}</strong>
                    </p>
                    ${buildSection("Form Submissions", results.forms)}
                    ${buildSection("Event Registrations", results.events)}
                    ${buildSection("Help Requests", results.help)}
                    ${buildSection("Volunteer Registrations", results.volunteers)}
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f3f3f3; padding: 24px 32px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Viva Resource</p>
                    <p style="margin: 0; color: #999; font-size: 12px;">Building a more resilient community together.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: reportEmails,
      subject: `Activity Report: ${startDate.toLocaleDateString()} – ${now.toLocaleDateString()}`,
      html,
    });
    if (error) throw new Error(error.message);

    // Update last_report_sent_at
    await db.collection("site_settings").doc("last_report_sent_at").set(
      {
        value: now.toISOString(),
        updated_at: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json(
      { success: true, totalItems },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error sending report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
