import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;
let _warned = false;

export function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    if (!_warned) {
      console.warn("[Nodemailer] EMAIL_USER or EMAIL_APP_PASSWORD not set — emails will fail silently");
      _warned = true;
    }
    // Dummy transporter that won't throw but logs
    _transporter = {
      sendMail: async () => {
        console.warn("[Nodemailer] Skipping email — credentials not configured");
        return { accepted: [], rejected: [], envelope: { from: "", to: [] } };
      },
    } as unknown as nodemailer.Transporter;
    return _transporter;
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return _transporter;
}

export function getAdminEmails(): string[] {
  const env = process.env.NEWSLETTER_ADMIN_EMAILS;
  if (env) {
    return env.split(",").map((e) => e.trim()).filter(Boolean);
  }
  return ["vivaresourcefoundation@gmail.com"];
}

export const FROM_NAME = "Viva Resource";
export const FROM_EMAIL = process.env.EMAIL_USER || "vivaresourcefoundation@gmail.com";