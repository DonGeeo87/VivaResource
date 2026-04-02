import { NextRequest, NextResponse } from "next/server";
import {
  sendEventRegistrationConfirmation,
  sendNewVolunteerNotification,
  sendFormSubmissionNotification,
  sendNewsletterConfirmation,
  EventRegistrationData,
  VolunteerRegistrationData,
  FormSubmissionData,
} from "@/lib/email/notifications";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type and data are required" },
        { status: 400 }
      );
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
