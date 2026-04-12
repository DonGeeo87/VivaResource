import { NextRequest, NextResponse } from "next/server";
import {
  sendEventRegistrationConfirmation,
  sendNewVolunteerNotification,
  sendFormSubmissionNotification,
  sendNewsletterConfirmation,
  sendVolunteerMessageNotification,
  sendVolunteerStatusChangeNotification,
  EventRegistrationData,
  VolunteerRegistrationData,
  FormSubmissionData,
  VolunteerMessageData,
  VolunteerStatusChangeData,
} from "@/lib/email/notifications";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

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
      const setting = await getDoc(doc(db, "site_settings", "notify_on_event_registration"));
      shouldNotify = setting.exists() ? setting.data().value === "true" : true;
    } else if (type === "new-volunteer") {
      const setting = await getDoc(doc(db, "site_settings", "notify_on_volunteer_signup"));
      shouldNotify = setting.exists() ? setting.data().value === "true" : true;
    } else if (type === "form-submission") {
      const setting = await getDoc(doc(db, "site_settings", "notify_on_form_submission"));
      shouldNotify = setting.exists() ? setting.data().value === "true" : true;
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
  } catch (error) {
    console.error("Error in notification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
