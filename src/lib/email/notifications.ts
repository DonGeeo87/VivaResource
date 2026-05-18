import { Resend } from "resend";

let _resend: Resend | null = null;
let _noKeyLogged = false;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      if (!_noKeyLogged) {
        console.warn("[EMAIL] RESEND_API_KEY not set. Emails will fail.");
        _noKeyLogged = true;
      }
      _resend = {
        emails: {
          send: async () => ({
            data: null,
            error: new Error("RESEND_API_KEY not configured"),
          }),
        },
      } as unknown as Resend;
    } else {
      _resend = new Resend(key);
    }
  }
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "Viva Resource <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.com";

// Helper to get admin emails from env
function getAdminEmails(): string[] {
  const envEmails = process.env.NEWSLETTER_ADMIN_EMAILS;
  if (envEmails) {
    return envEmails.split(",").map((e) => e.trim()).filter(Boolean);
  }
  return ["vivaresourcefoundation@gmail.com"];
}

// Base HTML template wrapper
function emailWrapper(content: string): string {
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
                  <a href="${SITE_URL}" style="text-decoration: none;">
                    <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 24px; font-weight: 800; color: #ffffff;">VIVA RESOURCE</span>
                  </a>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f3f3f3; padding: 24px 32px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                    Viva Resource
                  </p>
                  <p style="margin: 0; color: #999; font-size: 12px;">
                    Building a more resilient community together.
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

async function sendEmail(params: { to: string | string[]; subject: string; html: string; replyTo?: string }): Promise<{ success: boolean; error?: string }> {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: emailWrapper(params.html),
    replyTo: params.replyTo,
  });
  if (error) {
    console.error("Resend error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Types for notification payloads
export interface EventRegistrationData {
  eventName: string;
  attendeeName: string;
  attendeeEmail: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  attendees: number;
}

export interface VolunteerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  program: string;
  skills?: string[];
  interests?: string[];
  availability?: string;
}

export interface FormSubmissionData {
  formName: string;
  submitterEmail?: string;
  submissionSummary: string;
}

export interface EventAdminNotificationData {
  eventName: string;
  attendeeName: string;
  attendeeEmail: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
}

/**
 * Send event registration confirmation email to the attendee
 */
export async function sendEventRegistrationConfirmation(
  data: EventRegistrationData
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      Registration Confirmed!
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Hi <strong>${data.attendeeName}</strong>,
    </p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Thank you for registering for <strong>${data.eventName}</strong>. We're excited to see you!
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f9f9f9; border-radius: 8px;">
      <tr>
        <td style="padding: 16px;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Event Details:</p>
          <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${data.eventName}</p>
          ${data.eventDate ? `<p style="margin: 4px 0 0 0; color: #555; font-size: 14px;">📅 ${data.eventDate}${data.eventTime ? ` at ${data.eventTime}` : ""}</p>` : ""}
          ${data.eventLocation ? `<p style="margin: 4px 0 0 0; color: #555; font-size: 14px;">📍 ${data.eventLocation}</p>` : ""}
          <p style="margin: 4px 0 0 0; color: #555; font-size: 14px;">👥 Attendees: ${data.attendees}</p>
        </td>
      </tr>
    </table>
    <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      If you have any questions, please contact us at <a href="mailto:events@vivaresource.com" style="color: #025689;">events@vivaresource.com</a>
    </p>
  `;
  return sendEmail({ to: data.attendeeEmail, subject: `Registration Confirmed: ${data.eventName}`, html });
}

/**
 * Send notification to admins about a new event registration
 */
export async function sendEventAdminNotification(
  data: EventAdminNotificationData
): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();

  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      New Event Registration
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      A new attendee has registered for an event:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9; width: 40%;">Event</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.eventName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Attendee</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.attendeeName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Email</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;"><a href="mailto:${data.attendeeEmail}" style="color: #025689;">${data.attendeeEmail}</a></td>
      </tr>
      ${data.eventDate ? `<tr><td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Date</td><td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.eventDate}</td></tr>` : ""}
      ${data.eventTime ? `<tr><td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Time</td><td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.eventTime}</td></tr>` : ""}
      ${data.eventLocation ? `<tr><td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Location</td><td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.eventLocation}</td></tr>` : ""}
    </table>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      View this registration in the admin panel to see all responses.
    </p>
  `;
  return sendEmail({ to: adminEmails, subject: `New Registration: ${data.eventName}`, html });
}

/**
 * Send notification to admin about new volunteer registration
 */
export async function sendNewVolunteerNotification(
  data: VolunteerRegistrationData
): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();
  const skillsList = data.skills?.join(", ") || "None specified";
  const interestsList = data.interests?.join(", ") || "None specified";

  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      New Volunteer Registration
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      A new volunteer has submitted their application:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9; width: 40%;">Name</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.firstName} ${data.lastName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Email</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;"><a href="mailto:${data.email}" style="color: #025689;">${data.email}</a></td>
      </tr>
      ${data.phone ? `<tr><td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Phone</td><td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.phone}</td></tr>` : ""}
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Program</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.program}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Skills</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${skillsList}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Interests</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${interestsList}</td>
      </tr>
      ${data.availability ? `<tr><td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Availability</td><td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.availability}</td></tr>` : ""}
    </table>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      View this registration in the admin panel to review and follow up.
    </p>
  `;
  return sendEmail({ to: adminEmails, subject: `New Volunteer: ${data.firstName} ${data.lastName}`, html });
}

/**
 * Send notification to admin about new form submission
 */
export async function sendFormSubmissionNotification(
  data: FormSubmissionData
): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();

  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      New Form Submission
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      A new response has been submitted for the form:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f9f9f9; border-radius: 8px;">
      <tr>
        <td style="padding: 16px;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Form Name:</p>
          <p style="margin: 0; color: #333; font-size: 18px; font-weight: 600;">${data.formName}</p>
          ${data.submitterEmail ? `<p style="margin: 8px 0 0 0; color: #555; font-size: 14px;">From: <a href="mailto:${data.submitterEmail}" style="color: #025689;">${data.submitterEmail}</a></p>` : ""}
        </td>
      </tr>
    </table>
    <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      ${data.submissionSummary}
    </p>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      View this submission in the admin panel to review the responses.
    </p>
  `;
  return sendEmail({ to: adminEmails, subject: `New Submission: ${data.formName}`, html });
}

/**
 * Send newsletter confirmation email to subscriber
 */
export async function sendNewsletterConfirmation(
  email: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  const displayName = name || "Subscriber";

  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      Welcome to Our Community!
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Hi <strong>${displayName}</strong>,
    </p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Thank you for subscribing to the Viva Resource newsletter! You'll now receive updates about our programs, events, and community impact.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f0f7ff; border-radius: 8px;">
      <tr>
        <td style="padding: 16px; text-align: center;">
          <p style="margin: 0; color: #025689; font-size: 16px; font-weight: 600;">
            Stay connected with us
          </p>
          <p style="margin: 8px 0 0 0; color: #555; font-size: 14px;">
            Visit <a href="${SITE_URL}" style="color: #025689; text-decoration: underline;">vivaresource.com</a> to learn more about our work.
          </p>
        </td>
      </tr>
    </table>
    <p style="color: #666; font-size: 12px; margin: 24px 0 0 0;">
      If you didn't sign up for this newsletter, you can safely ignore this email.
    </p>
  `;
  return sendEmail({ to: email, subject: "Welcome to Viva Resource Newsletter!", html });
}

/**
 * Send volunteer message notification (admin to volunteer)
 */
export interface VolunteerMessageData {
  volunteerEmail: string;
  volunteerName: string;
  subject: string;
  message: string;
}

export async function sendVolunteerMessageNotification(
  data: VolunteerMessageData
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      Message from Viva Resource
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Hi <strong>${data.volunteerName}</strong>,
    </p>
    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-line;">
        ${data.message}
      </p>
    </div>
    <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      You can view this message and any updates in your <a href="${SITE_URL}/volunteer-portal" style="color: #025689;">Volunteer Portal</a>.
    </p>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      If you have any questions, please contact us at <a href="mailto:contact@vivaresource.com" style="color: #025689;">contact@vivaresource.com</a>
    </p>
  `;
  return sendEmail({ to: data.volunteerEmail, subject: data.subject, html });
}

/**
 * Send volunteer status change notification (approved/rejected)
 */
export interface VolunteerStatusChangeData {
  volunteerEmail: string;
  volunteerName: string;
  status: "approved" | "rejected";
}

export async function sendVolunteerStatusChangeNotification(
  data: VolunteerStatusChangeData
): Promise<{ success: boolean; error?: string }> {
  const isApproved = data.status === "approved";
  const subject = isApproved
    ? "Welcome to the Viva Resource Team!"
    : "Your Volunteer Application Update";

  const html = isApproved
    ? `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      Welcome to the Team!
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Dear <strong>${data.volunteerName}</strong>,
    </p>
    <div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #4caf50;">
      <p style="color: #2e7d32; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
        ✅ Your volunteer application has been approved!
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
        We are excited to have you on our team. We will be in touch soon to coordinate next steps and assign your first tasks.
      </p>
    </div>
    <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      You can access your volunteer portal at <a href="${SITE_URL}/volunteer-portal" style="color: #025689;">vivaresource.com/volunteer-portal</a>
    </p>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      If you have any questions, please contact us at <a href="mailto:contact@vivaresource.com" style="color: #025689;">contact@vivaresource.com</a>
    </p>
  `
    : `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      Thank You for Your Interest
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Dear <strong>${data.volunteerName}</strong>,
    </p>
    <div style="background-color: #fff3e0; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #ff9800;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
        Thank you for your interest in volunteering with Viva Resource. After reviewing your application, we regret to inform you that we cannot accept your application at this time. This does not reflect negatively on you, and we encourage you to apply again in the future.
      </p>
    </div>
    <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      We appreciate your interest in our mission and wish you all the best.
    </p>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      If you have any questions, please contact us at <a href="mailto:contact@vivaresource.com" style="color: #025689;">contact@vivaresource.com</a>
    </p>
  `;
  return sendEmail({ to: data.volunteerEmail, subject, html });
}

/**
 * Send volunteer activation email with link to create account
 */
export interface VolunteerActivationData {
  volunteerEmail: string;
  volunteerName: string;
  activationUrl: string;
}

export async function sendVolunteerActivationNotification(
  data: VolunteerActivationData
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      Your Volunteer Application Was Approved!
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Dear <strong>${data.volunteerName}</strong>,
    </p>
    <div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #4caf50;">
      <p style="color: #2e7d32; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
        Welcome to the Viva Resource team!
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
        Your volunteer application has been approved. To access your volunteer portal and start receiving tasks and messages, please create your account password by clicking the button below:
      </p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.activationUrl}" style="display: inline-block; background-color: #025689; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Create Your Account
      </a>
    </div>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${data.activationUrl}" style="color: #025689; word-break: break-all;">${data.activationUrl}</a>
    </p>
  `;
  return sendEmail({ to: data.volunteerEmail, subject: "Your Volunteer Application Was Approved!", html });
}

export interface HelpRequestData {
  fullName: string;
  email: string;
  assistanceTypes: string[];
  contactMethod?: string;
  description?: string;
}

export interface VolunteerCertificateRequestData {
  volunteerName: string;
  volunteerEmail: string;
  purpose: string;
  recipientOrganization: string;
  additionalNotes?: string;
}

/**
 * Send notification to admins about new volunteer certificate request
 */
export async function sendVolunteerCertificateRequestNotification(
  data: VolunteerCertificateRequestData
): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();

  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      New Volunteer Certificate Request
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      A volunteer has requested a certificate:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9; width: 40%;">Volunteer Name</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.volunteerName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Email</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;"><a href="mailto:${data.volunteerEmail}" style="color: #025689;">${data.volunteerEmail}</a></td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Purpose</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.purpose}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Recipient Organization</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.recipientOrganization}</td>
      </tr>
      ${data.additionalNotes ? `<tr><td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Additional Notes</td><td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.additionalNotes}</td></tr>` : ""}
    </table>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      Review this request in the admin panel to approve or reject.
    </p>
  `;
  return sendEmail({ to: adminEmails, subject: `New Volunteer Certificate Request: ${data.volunteerName}`, html });
}

/**
 * Send volunteer certificate approved notification
 */
export async function sendVolunteerCertificateApprovedNotification(
  email: string,
  name: string,
  purpose: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      Your Certificate Request Was Approved
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Dear <strong>${name}</strong>,
    </p>
    <div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #4caf50;">
      <p style="color: #2e7d32; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
        ✅ Your certificate request has been approved!
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
        <strong>Purpose:</strong> ${purpose}
      </p>
    </div>
    <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      You can access your volunteer portal at <a href="${SITE_URL}/volunteer-portal" style="color: #025689;">vivaresource.com/volunteer-portal</a> to view more details.
    </p>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      If you have any questions, please contact us at <a href="mailto:contact@vivaresource.com" style="color: #025689;">contact@vivaresource.com</a>
    </p>
  `;
  return sendEmail({ to: email, subject: "Your Volunteer Certificate Request Was Approved", html });
}

/**
 * Send volunteer certificate rejected notification
 */
export async function sendVolunteerCertificateRejectedNotification(
  email: string,
  name: string,
  adminNote?: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      Your Certificate Request Update
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Dear <strong>${name}</strong>,
    </p>
    <div style="background-color: #fff3e0; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #ff9800;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
        After reviewing your certificate request, we regret to inform you that it could not be approved at this time.
      </p>
      ${adminNote ? `<p style="color: #666; font-size: 14px; margin: 12px 0 0 0;">
        <strong>Note from admin:</strong> ${adminNote}
      </p>` : ""}
    </div>
    <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      If you have any questions, please contact us at <a href="mailto:contact@vivaresource.com" style="color: #025689;">contact@vivaresource.com</a>
    </p>
  `;
  return sendEmail({ to: email, subject: "Your Volunteer Certificate Request Update", html });
}

/**
 * Send volunteer help request notification to admins
 */
export async function sendHelpRequestNotification(
  data: HelpRequestData
): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();
  const types = data.assistanceTypes.join(", ") || "Not specified";

  const html = `
    <h1 style="color: #025689; font-size: 24px; margin: 0 0 16px 0;">
      New Help Request
    </h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      A new help request has been submitted:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9; width: 40%;">Name</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.fullName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Email</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;"><a href="mailto:${data.email}" style="color: #025689;">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Assistance Types</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${types}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Preferred Contact</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.contactMethod || "-"}</td>
      </tr>
      ${data.description ? `<tr><td style="padding: 12px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f9f9f9;">Description</td><td style="padding: 12px 16px; border: 1px solid #e0e0e0;">${data.description.replace(/\n/g, "<br>")}</td></tr>` : ""}
    </table>
    <p style="color: #666; font-size: 14px; margin: 24px 0 0 0;">
      Please review this in the admin panel at your earliest convenience.
    </p>
  `;
  return sendEmail({ to: adminEmails, subject: `Help Request: ${data.fullName}`, html });
}
