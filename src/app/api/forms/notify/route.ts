import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
      console.warn("[Forms Notify] Gmail SMTP credentials not configured");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const body = await request.json();
    const { formId, formTitle, formTitleEs, responses, email } = body;

    if (!formId || !formTitle) {
      return NextResponse.json(
        { error: "formId and formTitle are required" },
        { status: 400 }
      );
    }

    // Get notification settings from Firestore
    const notifySetting = await getDoc(doc(db, "site_settings", "notify_on_form_submission"));
    const emailsSetting = await getDoc(doc(db, "site_settings", "notification_emails"));

    const shouldNotify = notifySetting.exists() ? notifySetting.data().value === "true" : true;
    const notificationEmails = emailsSetting.exists()
      ? emailsSetting.data().value.split(",").map((e: string) => e.trim()).filter(Boolean)
      : [process.env.NEWSLETTER_ADMIN_EMAILS?.split(",")[0] || "vivaresourcefoundation@gmail.com"];

    if (!shouldNotify || notificationEmails.length === 0) {
      console.log("[Forms Notify] Notifications disabled or no emails configured");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const responsesRows = Object.entries(responses || {})
      .map(([label, value]) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
        return `<tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">${label}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${displayValue}</td>
        </tr>`;
      })
      .join("");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #025689;">New Form Submission</h2>
        <p style="color: #333; font-size: 16px;">
          <strong>${formTitle}</strong>${formTitleEs ? ` / ${formTitleEs}` : ""}
        </p>
        ${email ? `<p style="color: #666;">Respondent email: <a href="mailto:${email}">${email}</a></p>` : ""}
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${responsesRows}
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 14px;">
          This notification was sent from Viva Resource Foundation form system.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Viva Resource Foundation" <${process.env.EMAIL_USER}>`,
      to: notificationEmails.join(", "),
      subject: `New submission: ${formTitle}`,
      html: emailHtml,
      replyTo: email || undefined,
    });

    console.log("[Forms Notify] Notification sent to:", notificationEmails);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error sending form notification:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
