import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
      console.warn("[Email Send] Gmail SMTP credentials not configured");
      return NextResponse.json(
        { error: "Email service is not configured. Please contact the administrator." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      to,
      subject,
      message,
      replyTo,
      // Contact form fields
      name,
      email,
      phone,
    } = body;

    // Determine if this is a contact form submission
    const isContactForm = name && email && message;

    // Validate required fields
    if (isContactForm) {
      // Contact form validation
      if (!name || !email || !message) {
        return NextResponse.json(
          { error: "Nombre, correo y mensaje son requeridos" },
          { status: 400 }
        );
      }
    } else {
      // Original API validation
      if (!to || !subject || !message) {
        return NextResponse.json(
          { error: "Destinatario, asunto y mensaje son requeridos" },
          { status: 400 }
        );
      }
    }

    const fromEmail = process.env.EMAIL_USER || "vivaresourcefoundation@gmail.com";
    const adminEmail = process.env.NEWSLETTER_ADMIN_EMAILS?.split(",")[0] || "vivaresourcefoundation@gmail.com";

    // Build email content based on type
    let emailTo: string[];
    let emailSubject: string;
    let emailHtml: string;
    let emailReplyTo: string | undefined;

    if (isContactForm) {
      // Contact form email
      emailTo = [adminEmail];
      emailSubject = subject || `Contact Form: ${name}`;
      emailReplyTo = email;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #025689;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Name</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Email</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
            </tr>
            ${phone ? `<tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Phone</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
            </tr>` : ""}
          </table>
          <h3 style="color: #025689;">Message:</h3>
          <div style="color: #333; line-height: 1.6; padding: 15px; background: #f9f9f9; border-radius: 5px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">
            This message was sent from the Viva Resource Foundation contact form.
          </p>
        </div>
      `;
    } else {
      // Original API format
      emailTo = Array.isArray(to) ? to : [to];
      emailSubject = subject;
      emailReplyTo = replyTo;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #025689;">${subject}</h2>
          <div style="color: #333; line-height: 1.6;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">
            Este es un mensaje del sistema de Viva Resource Foundation.
          </p>
        </div>
      `;
    }

    // Send email
    await transporter.sendMail({
      from: `"Viva Resource Foundation" <${fromEmail}>`,
      to: emailTo,
      replyTo: emailReplyTo,
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Error interno al enviar email" },
      { status: 500 }
    );
  }
}
