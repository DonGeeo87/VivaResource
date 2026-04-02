# Debug Mode Rules (Non-Obvious Only)

This file provides guidance to agents when debugging code in this repository.

## Debugging Gotchas

- **Silent Auth Failures**: Admin users not in Firestore `admin_users` collection get auto-signed-out without error message (see `AdminAuthContext.tsx:46`)
- **Hydration Mismatches**: Language context uses `isHydrated` state - check for SSR/CSR content mismatches
- **Firebase Re-init**: Multiple Firebase instances cause errors - always check `getApps().length === 0`
- **Storage Permission Errors**: Two storage paths with different permissions - `/images/` vs `/uploads/`
- **Email Failures**: Resend API requires valid `RESEND_API_KEY` - sandbox mode uses `onboarding@resend.dev`

## Environment Debug Checklist
- All 6 `NEXT_PUBLIC_FIREBASE_*` variables must be set
- `RESEND_API_KEY` required for email functionality
- `NEWSLETTER_ADMIN_EMAILS` must be comma-separated list

## Common Error Sources
- **Form Validation**: Zod schemas in forms - check schema matches form fields
- **Image Uploads**: 5MB limit, only JPG/PNG/WebP/GIF - silent rejection on invalid type
- **Firestore Rules**: `isEditor()` = admin OR editor - check user role in `admin_users`
- **API Routes**: Email endpoint at `/api/email/send` requires POST with valid body

## Firebase Debug Tips
- Firestore rules can be tested in Firebase Console emulator
- Storage rules: check path prefix (`/images/` vs `/uploads/`)
- Admin users must exist in BOTH Firebase Auth AND Firestore `admin_users`

## No Test Framework
No test framework configured - manual testing required. Recommended: add Vitest + Playwright.
