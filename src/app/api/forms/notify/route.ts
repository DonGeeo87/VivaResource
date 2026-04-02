import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!resendApiKey) {
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    const resend = new Resend(resendApiKey);
    const body = await request.json();
    const { formId, formTitle, formTitleEs, responses, email } = body;

    if (!formId || !formTitle) {
      return NextResponse.json(
        { error: "formId and formTitle are required" },
        { status: 400 }
      );
    }

    const adminEmail = process.env.NEWSLETTER_ADMIN_EMAILS?.split(",")[0] || "vivaresourcefoundation@gmail.com";

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

    await resend.emails.send({
      from: "Viva Resource <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New submission: ${formTitle}`,
      html: emailHtml,
      replyTo: email || undefined,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error sending form notification:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
