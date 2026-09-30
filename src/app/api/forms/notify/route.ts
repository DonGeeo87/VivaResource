import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/admin-db";
import { authPayload } from "@/lib/auth/guard";

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
    const { formId, formTitle, submissionId, submissionData } = body;

    if (!formId || !submissionData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get form details from Firestore via adminDb
    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const formDoc = await db.collection("forms").doc(formId).get();
    if (!formDoc.exists) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const formData = formDoc.data();

    // Build email content
    const formTitleText = formData?.title_en || formData?.title_es || "Form Submission";
    const submissionFields = Object.entries(submissionData)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const emailHtml = `
      <h2>New Form Submission: ${formTitleText}</h2>
      <p><strong>Form:</strong> ${formTitleText}</p>
      <p><strong>Submission ID:</strong> ${submissionId || "N/A"}</p>
      <hr/>
      <pre>${submissionFields}</pre>
    `;

    // Send email to all recipients
    // Los destinatarios NO se toman del cliente sin sesión de staff: el
    // formulario público dispara este endpoint, así que de forma anónima solo
    // puede ir al buzón de la organización (antes `recipientEmails` del body
    // permitía usar la cuenta de la fundación como relay).
    const staff = authPayload(request);
    const emails: string[] =
      staff?.type === "admin" && Array.isArray(body.recipientEmails)
        ? (body.recipientEmails as string[])
        : [process.env.EMAIL_USER as string];
    const mailPromises = emails.map((to: string) =>
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `New Form Submission: ${formTitleText}`,
        html: emailHtml,
      }).catch((err: Error) => console.error(`Failed to send email to ${to}:`, err))
    );

    await Promise.all(mailPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Forms Notify] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
