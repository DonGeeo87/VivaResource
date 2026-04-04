import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb as getAdminDb } from "@/lib/firebase/admin";

// Configurar transporte de Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn("[Summary Email] Gmail SMTP credentials not configured");
      return NextResponse.json(
        { success: false, error: "Gmail SMTP credentials not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: "type and id are required" },
        { status: 400 }
      );
    }

    // Get notification settings using Admin SDK
    const emailsDoc = await adminDb.collection("site_settings").doc("notification_emails").get();
    const notificationEmails = emailsDoc.exists
      ? (emailsDoc.data()?.value || "").split(",").map((e: string) => e.trim()).filter(Boolean)
      : [process.env.NEWSLETTER_ADMIN_EMAILS?.split(",")[0] || "vivaresourcefoundation@gmail.com"];

    if (notificationEmails.length === 0) {
      return NextResponse.json(
        { success: false, error: "No notification emails configured" },
        { status: 400 }
      );
    }

    let subject = "";
    let html = "";

    if (type === "event") {
      // Get event data using Admin SDK
      const eventDoc = await adminDb.collection("events").doc(id).get();
      if (!eventDoc.exists) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      const event = eventDoc.data() as Record<string, unknown>;
      const eventName = data?.language === "es" && event.title_es ? event.title_es : event.title_en;

      // Get registrations using Admin SDK
      const regSnapshot = await adminDb.collection("event_registrations").where("event_id", "==", id).get();
      const registrations = regSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, unknown>));

      subject = `Resumen de Registros: ${eventName} - ${registrations.length} inscritos`;

      const rows = registrations.map((reg: Record<string, unknown>, i: number) => `
        <tr style="${i % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
          <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${i + 1}</td>
          <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600;">${(reg.full_name || reg.name || '-') as string}</td>
          <td style="padding: 12px 16px; border: 1px solid #e0e0e0;"><a href="mailto:${reg.email || ''}" style="color: #025689;">${reg.email || '-'}</a></td>
          <td style="padding: 12px 16px; border: 1px solid #e0e0e0; text-align: center;">${(reg.attendees || 1) as number}</td>
          <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${reg.created_at ? new Date((reg.created_at as { toDate: () => Date }).toDate ? (reg.created_at as { toDate: () => Date }).toDate() : reg.created_at as string).toLocaleDateString() : '-'}</td>
        </tr>
      `).join("");

      const totalAttendees = registrations.reduce((sum: number, reg: Record<string, unknown>) => sum + ((reg.attendees as number) || 1), 0);

      html = `
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
                <table role="presentation" width="800" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #025689; padding: 24px 32px; text-align: center;">
                      <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 24px; font-weight: 800; color: #ffffff;">VIVA RESOURCE FOUNDATION</span>
                      <p style="color: #b7f569; font-size: 14px; margin: 8px 0 0 0;">Resumen de Registros</p>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="color: #025689; font-size: 24px; margin: 0 0 8px 0;">${eventName}</h2>

                      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f0f7ff; border-radius: 8px;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">Total de registros:</p>
                            <p style="margin: 0; color: #025689; font-size: 28px; font-weight: 800;">${registrations.length}</p>
                            <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">Total de asistentes (incluyendo acompañantes):</p>
                            <p style="margin: 0; color: #025689; font-size: 20px; font-weight: 600;">${totalAttendees}</p>
                          </td>
                        </tr>
                      </table>

                      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                        <thead>
                          <tr style="background-color: #025689; color: white;">
                            <th style="padding: 12px 16px; border: 1px solid #e0e0e0; text-align: left;">#</th>
                            <th style="padding: 12px 16px; border: 1px solid #e0e0e0; text-align: left;">Nombre</th>
                            <th style="padding: 12px 16px; border: 1px solid #e0e0e0; text-align: left;">Email</th>
                            <th style="padding: 12px 16px; border: 1px solid #e0e0e0; text-align: center;">Asistentes</th>
                            <th style="padding: 12px 16px; border: 1px solid #e0e0e0; text-align: left;">Fecha de registro</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${rows}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f3f3f3; padding: 24px 32px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Viva Resource Foundation</p>
                      <p style="margin: 0; color: #999; font-size: 12px;">Construyendo una comunidad más resiliente juntos.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else if (type === "form") {
      // Get form data using Admin SDK
      const formDoc = await adminDb.collection("forms").doc(id).get();
      if (!formDoc.exists) {
        return NextResponse.json({ error: "Form not found" }, { status: 404 });
      }

      const form = formDoc.data() as Record<string, unknown>;
      const formName = data?.language === "es" && form.titleEs ? form.titleEs : form.title;

      // Get submissions using Admin SDK
      const subSnapshot = await adminDb.collection("form_submissions").where("formId", "==", id).get();
      const submissions = subSnapshot.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

      subject = `Resumen de Respuestas: ${formName} - ${submissions.length} envíos`;

      // Get form fields for headers
      const fields = (form.fields || []) as Array<{ id: string; label: string; labelEs?: string }>;
      const headers = fields.map(f => data?.language === "es" && f.labelEs ? f.labelEs : f.label);

      const rows = submissions.map((sub: Record<string, unknown>, i: number) => {
        const responses = (sub.responses || {}) as Record<string, string | string[]>;
        const cells = fields.map(f => {
          const val = responses[f.id];
          return `<td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${Array.isArray(val) ? val.join(", ") : (val || '-')}</td>`;
        }).join("");

        return `
          <tr style="${i % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
            <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${i + 1}</td>
            <td style="padding: 12px 16px; border: 1px solid #e0e0e0;"><a href="mailto:${sub.email || ''}" style="color: #025689;">${sub.email || '-'}</a></td>
            ${cells}
            <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${sub.submittedAt ? new Date((sub.submittedAt as { toDate: () => Date }).toDate ? (sub.submittedAt as { toDate: () => Date }).toDate() : sub.submittedAt as string).toLocaleDateString() : '-'}</td>
          </tr>
        `;
      }).join("");

      html = `
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
                <table role="presentation" width="900" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #025689; padding: 24px 32px; text-align: center;">
                      <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 24px; font-weight: 800; color: #ffffff;">VIVA RESOURCE FOUNDATION</span>
                      <p style="color: #b7f569; font-size: 14px; margin: 8px 0 0 0;">Resumen de Respuestas</p>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="color: #025689; font-size: 24px; margin: 0 0 8px 0;">${formName}</h2>

                      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f0f7ff; border-radius: 8px;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">Total de envíos:</p>
                            <p style="margin: 0; color: #025689; font-size: 28px; font-weight: 800;">${submissions.length}</p>
                          </td>
                        </tr>
                      </table>

                      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 12px;">
                        <thead>
                          <tr style="background-color: #025689; color: white;">
                            <th style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: left;">#</th>
                            <th style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: left;">Email</th>
                            ${headers.map((h: string) => `<th style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: left;">${h}</th>`).join("")}
                            <th style="padding: 10px 8px; border: 1px solid #e0e0e0; text-align: left;">Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${rows}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f3f3f3; padding: 24px 32px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Viva Resource Foundation</p>
                      <p style="margin: 0; color: #999; font-size: 12px;">Construyendo una comunidad más resiliente juntos.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'event' or 'form'" }, { status: 400 });
    }

    const sendResult = await transporter.sendMail({
      from: `"Viva Resource Foundation" <${process.env.EMAIL_USER}>`,
      to: notificationEmails.join(", "),
      subject,
      html,
    });

    console.log("[Summary Email] Gmail SMTP response:", sendResult.messageId);
    console.log("[Summary Email] Sent to:", notificationEmails);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error sending summary email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
