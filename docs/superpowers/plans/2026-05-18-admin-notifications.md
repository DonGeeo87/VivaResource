# Admin Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Notify foundation directors when users register for events, and automate the weekly summary report.

**Architecture:** Two independent features: (1) additive notification on event registration via a new case in the existing `/api/email/notify` pipeline, (2) a new cron endpoint that conditionally dispatches the existing report logic on a Vercel Cron schedule. No existing notification flows are modified.

**Tech Stack:** Next.js API routes, Firebase Admin SDK (Firestore), Resend (email), Vercel Cron Jobs

---

### Task 1: Add admin notification function for event registrations

**Files:**
- Modify: `src/lib/email/notifications.ts` (append after line 164)

- [ ] **Step 1: Add `sendEventAdminNotification` function to notifications.ts**

Append after `sendEventRegistrationConfirmation` (after line 164):

```typescript
export interface EventAdminNotificationData {
  eventName: string;
  attendeeName: string;
  attendeeEmail: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
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
```

Also add `EventAdminNotificationData` to the existing exports block (around line 104-113).

- [ ] **Step 2: Verify the file still compiles**

Run: `npx tsc --noEmit src/lib/email/notifications.ts --skipLibCheck 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/notifications.ts
git commit -m "feat: add sendEventAdminNotification function"
```

---

### Task 2: Add `event-admin-notification` case to the notify API

**Files:**
- Modify: `src/app/api/email/notify/route.ts`

- [ ] **Step 1: Add import for the new type and function**

Update the import from `@/lib/email/notifications` to include `EventAdminNotificationData` and `sendEventAdminNotification`:

```typescript
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
  VolunteerRegistrationData,
  FormSubmissionData,
  VolunteerMessageData,
  VolunteerStatusChangeData,
  VolunteerActivationData,
  HelpRequestData,
  VolunteerCertificateRequestData,
  EventAdminNotificationData,
} from "@/lib/email/notifications";
```

- [ ] **Step 2: Add new case to the switch statement**

Add before the `default` case (before line 117):

```typescript
      case "event-admin-notification":
        result = await sendEventAdminNotification(data as EventAdminNotificationData);
        break;
```

- [ ] **Step 3: Verify the file compiles**

Run: `npx tsc --noEmit src/app/api/email/notify/route.ts --skipLibCheck 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/email/notify/route.ts
git commit -m "feat: add event-admin-notification case to notify API"
```

---

### Task 3: Add admin notification fetch to event registration page

**Files:**
- Modify: `src/app/events/register/[id]/page.tsx`

- [ ] **Step 1: Add second fetch call after the existing one**

After the existing fetch block (lines 203-221), add:

```typescript
      // Notify admins about new registration (fire and forget)
      try {
        fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "event-admin-notification",
            data: {
              eventName: eventTitle,
              attendeeName: formValues.full_name || formValues.name || "",
              attendeeEmail: formValues.email || "",
              eventDate: event?.date,
              eventTime: event?.time,
              eventLocation: event?.location,
            },
          }),
        }).catch(() => {});
      } catch {
        // silently fail
      }
```

Place it right after the existing notification block (after line 221's `})` and before `setIsSubmitted(true)`).

- [ ] **Step 2: Commit**

```bash
git add src/app/events/register/\[id\]/page.tsx
git commit -m "feat: add admin notification on event registration"
```

---

### Task 4: Create cron report endpoint

**Files:**
- Create: `src/app/api/cron/report/route.ts`

- [ ] **Step 1: Create the cron endpoint**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key_for_build");
const FROM_EMAIL = process.env.EMAIL_FROM || "Viva Resource <onboarding@resend.dev>";

function getTimeWindowMs(frequency: string): number {
  switch (frequency) {
    case "daily": return 24 * 60 * 60 * 1000;
    case "weekly": return 7 * 24 * 60 * 60 * 1000;
    case "biweekly": return 14 * 24 * 60 * 60 * 1000;
    case "monthly": return 30 * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  if (typeof value === "number") return new Date(value);
  return null;
}

function getReportEmails(settings: Record<string, unknown>): string[] {
  const reportEmails = settings.report_emails;
  if (typeof reportEmails === "string" && reportEmails.trim()) {
    return reportEmails.split(",").map((e) => e.trim()).filter(Boolean);
  }
  const fallback = process.env.NEWSLETTER_ADMIN_EMAILS;
  if (fallback) {
    return fallback.split(",").map((e) => e.trim()).filter(Boolean);
  }
  return ["vivaresourcefoundation@gmail.com"];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Auth via X-Report-Secret (set in Vercel cron config)
    const reportSecret = request.headers.get("X-Report-Secret");
    if (!reportSecret || reportSecret !== process.env.REPORT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[Cron Report] RESEND_API_KEY not configured");
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Read settings
    const settingsSnapshot = await db.collection("site_settings").get();
    const settings: Record<string, unknown> = {};
    settingsSnapshot.forEach((doc) => {
      settings[doc.id] = doc.data().value;
    });

    const frequency = String(settings.report_frequency || "off");

    // If frequency is off, skip silently
    if (frequency === "off") {
      console.log("[Cron Report] Reports disabled via settings");
      return NextResponse.json({ success: true, skipped: true });
    }

    // Check if enough time has passed since last report
    const windowMs = getTimeWindowMs(frequency);
    const lastReportSent = parseDateValue(settings.last_report_sent_at);
    const now = new Date();

    if (lastReportSent) {
      const elapsed = now.getTime() - lastReportSent.getTime();
      if (elapsed < windowMs) {
        console.log(`[Cron Report] Skipping: only ${Math.round(elapsed / 3600000)}h since last report`);
        return NextResponse.json({ success: true, skipped: true });
      }
    }

    const reportEmails = getReportEmails(settings);
    if (reportEmails.length === 0) {
      return NextResponse.json({ error: "No report emails configured" }, { status: 400 });
    }

    const startDate = lastReportSent ?? new Date(now.getTime() - windowMs);
    const results: Record<string, { count: number; items: Record<string, unknown>[] }> = {};

    const includeForms = settings.report_include_forms === "true";
    const includeEvents = settings.report_include_events === "true";
    const includeHelp = settings.report_include_help === "true";
    const includeVolunteers = settings.report_include_volunteers === "true";

    if (includeForms) {
      try {
        const snapshot = await db
          .collection("form_submissions")
          .where("submittedAt", ">=", startDate)
          .get();
        results.forms = {
          count: snapshot.size,
          items: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              name: data.formName || data.formTitle || "Unknown form",
              email: data.email || "-",
              date: data.submittedAt
                ? parseDateValue(data.submittedAt)?.toLocaleString() || "-"
                : "-",
            };
          }),
        };
      } catch {
        results.forms = { count: 0, items: [] };
      }
    }

    if (includeEvents) {
      try {
        const snapshot = await db
          .collection("event_registrations")
          .where("created_at", ">=", startDate)
          .get();
        results.events = {
          count: snapshot.size,
          items: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              name: data.full_name || data.name || "-",
              email: data.email || "-",
              extra: data.event_name || data.eventName || "Unknown event",
              date: data.created_at
                ? parseDateValue(data.created_at)?.toLocaleString() || "-"
                : "-",
            };
          }),
        };
      } catch {
        results.events = { count: 0, items: [] };
      }
    }

    if (includeHelp) {
      try {
        const snapshot = await db
          .collection("help_requests")
          .where("createdAt", ">=", startDate)
          .get();
        results.help = {
          count: snapshot.size,
          items: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              name: data.fullName || "-",
              email: data.email || "-",
              extra: Array.isArray(data.assistanceTypes)
                ? data.assistanceTypes.join(", ")
                : "-",
              date: data.createdAt
                ? parseDateValue(data.createdAt)?.toLocaleString() || "-"
                : "-",
            };
          }),
        };
      } catch {
        results.help = { count: 0, items: [] };
      }
    }

    if (includeVolunteers) {
      try {
        const snapshot = await db
          .collection("volunteer_registrations")
          .where("created_at", ">=", startDate)
          .get();
        results.volunteers = {
          count: snapshot.size,
          items: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "-",
              email: data.email || "-",
              extra: data.program || "-",
              date: data.created_at
                ? parseDateValue(data.created_at)?.toLocaleString() || "-"
                : "-",
            };
          }),
        };
      } catch {
        results.volunteers = { count: 0, items: [] };
      }
    }

    const totalItems =
      (results.forms?.count || 0) +
      (results.events?.count || 0) +
      (results.help?.count || 0) +
      (results.volunteers?.count || 0);

    const buildSection = (
      title: string,
      data: { count: number; items: Record<string, unknown>[] } | undefined
    ): string => {
      if (!data || data.count === 0) return "";
      const rows = data.items
        .map(
          (item) => `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.name || "-"}</td>
          <td style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.email || "-"}</td>
          <td style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.extra || "-"}</td>
          <td style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.date || "-"}</td>
        </tr>`
        )
        .join("");

      return `
        <h3 style="color: #025689; margin: 24px 0 8px 0; font-size: 18px;">${title} (${data.count})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #025689; color: white;">
              <th style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; font-size: 13px;">Name</th>
              <th style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; font-size: 13px;">Email</th>
              <th style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; font-size: 13px;">Details</th>
              <th style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; font-size: 13px;">Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:'Public Sans',Arial,sans-serif;background-color:#f9f9f9;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;padding:40px 0;">
          <tr><td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <tr><td style="background-color:#025689;padding:24px 32px;text-align:center;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:24px;font-weight:800;color:#ffffff;">VIVA RESOURCE</span>
                <p style="color:#b7f569;font-size:14px;margin:8px 0 0 0;">Activity Report</p>
              </td></tr>
              <tr><td style="padding:32px;">
                <h2 style="color:#025689;font-size:22px;margin:0 0 16px 0;">Weekly Activity Summary</h2>
                <p style="color:#666;font-size:14px;margin:0 0 24px 0;">
                  Period: ${startDate.toLocaleDateString()} – ${now.toLocaleDateString()}<br>
                  Total new items: <strong>${totalItems}</strong>
                </p>
                ${buildSection("Form Submissions", results.forms)}
                ${buildSection("Event Registrations", results.events)}
                ${buildSection("Help Requests", results.help)}
                ${buildSection("Volunteer Registrations", results.volunteers)}
              </td></tr>
              <tr><td style="background-color:#f3f3f3;padding:24px 32px;text-align:center;border-top:1px solid #e0e0e0;">
                <p style="margin:0 0 8px 0;color:#666;font-size:14px;">Viva Resource</p>
                <p style="margin:0;color:#999;font-size:12px;">Building a more resilient community together.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: reportEmails,
      subject: `Activity Report: ${startDate.toLocaleDateString()} – ${now.toLocaleDateString()}`,
      html,
    });

    if (error) throw new Error(error.message);

    // Update last_report_sent_at
    await db.collection("site_settings").doc("last_report_sent_at").set(
      { value: now.toISOString(), updated_at: new Date() },
      { merge: true }
    );

    console.log(`[Cron Report] Sent report to ${reportEmails.length} recipients (${totalItems} items)`);
    return NextResponse.json({ success: true, totalItems });
  } catch (error: unknown) {
    console.error("[Cron Report] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/cron/report/route.ts
git commit -m "feat: add cron report endpoint for automated weekly reports"
```

---

### Task 5: Add cron configuration to vercel.json

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Add crons section to vercel.json**

After the closing brace of `functions` (line 23), add a comma and the `crons` section. The file should end looking like:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "regions": ["sfo1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ],
  "functions": {
    "src/app/api/ai/generate/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/report",
      "schedule": "0 15 * * *"
    }
  ]
}
```

`0 15 * * *` = 15:00 UTC = ~9:00 AM Mountain Time.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: add daily cron job for automated reports"
```

---

### Task 6: Set REPORT_SECRET environment variable

- [ ] **Step 1: Generate a random secret and tell the user to add it**

The Vercel cron job sends `X-Report-Secret` header automatically. We need `REPORT_SECRET` set in Vercel environment variables.

Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Then add to Vercel:
- Production: `vercel env add REPORT_SECRET production`
- Or via Vercel Dashboard: Settings → Environment Variables

- [ ] **Step 2: Also add locally for testing**

Add `REPORT_SECRET=your-generated-secret` to `.env.local` for local testing.

---

### Spec Coverage Check

| Spec requirement | Task |
|-----------------|------|
| Admin notification on event registration (additive) | Tasks 1, 2, 3 |
| Automated weekly report via Vercel cron | Tasks 4, 5 |
| Report respects `report_frequency` setting | Task 4 (reads `report_frequency`, skips if "off") |
| Report respects `report_include_*` settings | Task 4 (checks each `report_include_*` flag) |
| Updates `last_report_sent_at` | Task 4 (saves timestamp on success) |
| No existing code modified | All tasks are additive or new files |
