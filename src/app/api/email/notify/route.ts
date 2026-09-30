import { NextRequest, NextResponse } from "next/server";
import {
  sendEventRegistrationConfirmation,
  sendNewVolunteerNotification,
  sendFormSubmissionNotification,
  sendNewsletterConfirmation,
  sendVolunteerMessageNotification,
  sendVolunteerStatusChangeNotification,
  sendVolunteerActivationNotification,
  sendHelpRequestNotification,
  sendVolunteerCertificateRequestNotification,
  sendVolunteerCertificateApprovedNotification,
  sendVolunteerCertificateRejectedNotification,
  sendEventAdminNotification,
  EventRegistrationData,
  EventAdminNotificationData,
  VolunteerRegistrationData,
  FormSubmissionData,
  VolunteerMessageData,
  VolunteerStatusChangeData,
  VolunteerActivationData,
  HelpRequestData,
  VolunteerCertificateRequestData,
} from "@/lib/email/notifications";

import { adminDb } from "@/lib/admin-db";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Lee un flag de `site_settings` ("true"/"false"). Se consulta directo contra
 * PostgreSQL: antes usaba db-client, que del lado servidor hace fetch a una URL
 * relativa y lanzaba excepción → la ruta devolvía 500 y el correo no salía.
 */
async function settingEnabled(key: string, fallback: boolean): Promise<boolean> {
  const db = await adminDb();
  const snap = await db.collection("site_settings").doc(key).get();
  return snap.exists ? snap.data()?.value === "true" : fallback;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting: 10 emails per 15 minutes per IP
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, RATE_LIMITS.email);
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: `Rate limited. Retry in ${rateCheck.retryAfter}s` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type and data are required" },
        { status: 400 }
      );
    }

    // Check notification settings for admin notifications
    let shouldNotify = true;
    if (type === "event-registration") {
      shouldNotify = await settingEnabled("notify_on_event_registration", true);
    } else if (type === "new-volunteer") {
      shouldNotify = await settingEnabled("notify_on_volunteer_signup", true);
    } else if (type === "form-submission") {
      shouldNotify = await settingEnabled("notify_on_form_submission", true);
    } else if (type === "help-request") {
      shouldNotify = await settingEnabled("notify_on_help_request", false);
    }

    if (!shouldNotify) {
      console.log(`[Notify API] ${type} notifications disabled`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    let result: { success: boolean; error?: string };

    switch (type) {
      case "event-registration":
        result = await sendEventRegistrationConfirmation(data as EventRegistrationData);
        break;

      case "new-volunteer":
        result = await sendNewVolunteerNotification(data as VolunteerRegistrationData);
        break;

      case "form-submission":
        result = await sendFormSubmissionNotification(data as FormSubmissionData);
        break;

      case "newsletter-confirmation":
        result = await sendNewsletterConfirmation(data.email, data.name);
        break;

      case "volunteer-message":
        result = await sendVolunteerMessageNotification(data as VolunteerMessageData);
        break;

      case "volunteer-status-change":
        result = await sendVolunteerStatusChangeNotification(data as VolunteerStatusChangeData);
        break;

      case "volunteer-activation":
        result = await sendVolunteerActivationNotification(data as VolunteerActivationData);
        break;

      case "help-request":
        result = await sendHelpRequestNotification(data as HelpRequestData);
        break;

      case "volunteer-certificate-request":
        result = await sendVolunteerCertificateRequestNotification(data as VolunteerCertificateRequestData);
        break;

      case "volunteer-certificate-approved":
        result = await sendVolunteerCertificateApprovedNotification(data.email, data.name, data.purpose);
        break;

      case "volunteer-certificate-rejected":
        result = await sendVolunteerCertificateRejectedNotification(data.email, data.name, data.adminNote);
        break;

      case "event-admin-notification":
        result = await sendEventAdminNotification(data as EventAdminNotificationData);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      console.error(`Failed to send ${type} notification:`, result.error);
      // Return 200 anyway to not block the main operation
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in notification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
