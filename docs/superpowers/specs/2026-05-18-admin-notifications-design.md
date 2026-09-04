---
name: admin-notifications-automation
description: Admin email notifications for event registrations + automated weekly report via Vercel cron
---

# Admin Notifications Automation

## Objective

Notify foundation directors (vivaresourcefoundation@gmail.com, ginterdonatop@gmail.com) when users interact with the site, and send a weekly summary report every Friday — all without touching existing notification flows.

## 1. Admin Notification on Event Registration

### Trigger
When a user registers for an event via `events/register/[id]/page.tsx`.

### Current behavior
The page saves to `event_registrations` in Firestore, then calls `/api/email/notify` with type `event-registration`, which sends a confirmation email to the **attendee**. The user gets an on-screen toast.

### New behavior (additive, no existing code modified)
A second fire-and-forget `fetch` call to `/api/email/notify` with a **new type** `event-admin-notification`. This dispatches to a new function that emails the directors with registration details.

### Files to create/modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/email/notifications.ts` | Add function | `sendEventAdminNotification(data)` — sends registration details to admin emails |
| `src/app/api/email/notify/route.ts` | Add case | New `event-admin-notification` case in the switch |
| `src/app/events/register/[id]/page.tsx` | Add call | Second `fetch` after the existing one (fire-and-forget) |

### Email content (directors)
```
Subject: New Event Registration: {eventName}

- Event: {eventName}
- Attendee: {name}
- Email: {email}
- Date/Time: {eventDate} {eventTime}
- Location: {eventLocation}
```

## 2. Automated Weekly Report

### Trigger
Vercel Cron Job fires daily at ~9:00 AM MT (Hobby plan: once per day, ±59 min precision is acceptable for weekly).

### Flow
1. Cron in `vercel.json` calls `GET /api/cron/report`
2. `/api/cron/report` reads `report_frequency` from `site_settings`
3. If frequency === "weekly" and at least 7 days have passed since `last_report_sent_at`, build and send the report
4. Report includes form submissions, event registrations, help requests, and volunteer registrations (controlled by `report_include_*` settings)
5. Updates `last_report_sent_at` on success
6. If frequency is "off" or not enough time has passed, return 200 (no-op)

### Files to create/modify

| File | Action | Description |
|------|--------|-------------|
| `vercel.json` | Modify | Add `crons` section with daily schedule |
| `src/app/api/cron/report/route.ts` | Create | CRON endpoint that conditionally sends report |

### Cron config
```json
{
  "crons": [
    {
      "path": "/api/cron/report",
      "schedule": "0 15 * * *"
    }
  ]
}
```
`0 15 * * *` = 15:00 UTC = 9:00 AM MT (Peyton, Colorado, UTC-6/-7 depending on DST). Close enough for a weekly report.

### Auth
The cron endpoint uses `X-Report-Secret` header (same pattern already supported in `/api/reports/send`). Vercel Cron Jobs automatically include this header when configured.

### Report content
Reuses the same logic as `/api/reports/send` — HTML email with summary tables of form submissions, event registrations, help requests, and volunteer registrations for the period since the last report.

## Non-goals
- Do NOT modify existing notification flows (volunteer, form, help-request)
- Do NOT modify the existing `/api/reports/send` endpoint
- Do NOT send email confirmations to users (on-screen toasts are sufficient)
- Do NOT add a scheduler library — use Vercel's built-in cron
