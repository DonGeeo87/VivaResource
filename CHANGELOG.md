# Changelog - Viva Resource Foundation Website

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.1] - 2026-04-19 - Participants Directory Fix

### Bug Fix 🐛
- **Participants page loading stuck** - Added Firestore security rules for `participants` collection to allow public read/list access
- `/participants` page now displays participant data correctly

### Technical Details
- **Files modified**: `firestore.rules` (+8 lines)
- **Build status**: ✅ Successful after cache clean

---

## [0.5.0] - 2026-04-14 - Performance, Accessibility & SEO Optimization

### Performance Optimization (Lighthouse: 45 → 75-85) 🚀
- **Code splitting optimized** - Webpack splitChunks config with separate chunks for Firebase, reCAPTCHA, and PayPal
- **Polyfills eliminated** - Added `.browserslistrc` targeting modern browsers (>0.5%, last 2 versions, not IE 11)
- **reCAPTCHA lazy loaded** - Deferred loading with 3s delay or on-demand trigger (reduces initial TBT by ~1000ms)
- **CSS purged** - Tailwind safelist configured for dynamic classes
- **Hero image preloaded** - Link preload for LCP image (`/photo-bank/hero_01.jpg`)
- **Preconnect headers** - Added for fonts.googleapis.com, fonts.gstatic.com, firestore.googleapis.com, google.com, gstatic.com
- **DNS prefetch** - Added for res.cloudinary.com

### Accessibility Improvements (Lighthouse: 90 → 95-98) ♿
- **Color contrast fixed** - 7 elements corrected to meet WCAG AA 4.5:1 ratio
  - Partners section: `text-slate-400` → `text-primary`
  - Footer copyright: `text-on-primary/50` → `text-on-primary/80`
  - Footer contact labels: `opacity-60` → `text-on-primary/90`
- **Form labels associated** - Added `id` and `htmlFor` to 6 contact form inputs
- **Heading hierarchy fixed** - 9 elements corrected (H2 → H3, no H4 skips)
- **Link purpose clarified** - Added `aria-label` to 3 "Más Información" links with context

### SEO Enhancements (Lighthouse: 92 → 96-98) 🔍
- **Canonical URL** - Added `alternates.canonical` to metadata
- **HSTS preload** - `Strict-Transport-Security` header with `max-age=31536000; includeSubDomains; preload`
- **Security headers** - Added X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Image optimization** - Configured deviceSizes and imageSizes for optimal responsive images

### Technical Details
- **Files modified**: 8 files + 3 new documentation files
- **Lines changed**: +204 lines added, -32 lines removed
- **Build status**: ✅ Successful (53 pages generated)
- **ESLint warnings**: 2 minor (non-breaking)

---

## [0.4.0] - 2026-04-13 - Volunteer Communication System & Security

### Volunteer Communication System (Complete) ✅
- **Bidirectional messaging** - Admins can send messages to volunteers, volunteers can reply
- **Task assignment UI** - Admins can assign tasks to volunteers from detail page with bilingual fields
- **Volunteer message inbox** (`/admin/volunteers/messages`) - Full inbox with filters, search, and real-time updates
- **Real-time notifications** - Firestore `onSnapshot` listeners update inbox instantly, unread badge on header
- **Toast notifications** - Visual alert when new message arrives
- **Volunteer portal enhancements** - Reply to messages, view assigned tasks, mark tasks as complete
- **Volunteer onboarding flow restructured**:
  1. Volunteer applies via `/get-involved` (status: pending)
  2. Admin reviews and approves from `/admin/volunteers`
  3. Approval generates unique activation token
  4. Activation email sent with link to create password
  5. Volunteer creates account at `/volunteer-portal/activate`
  6. Volunteer logs in at `/volunteer-portal/login` (login only, no public signup)
- **Removed volunteer signup from portal** - Only approved volunteers can create accounts via activation link
- **Activation token system** - Secure UUID tokens stored in `volunteer_registrations`
- **Activation email template** - Professional HTML with CTA button

### Security - reCAPTCHA v3 ✅
- **reCAPTCHA v3 integration** on all public forms (Get Involved, Get Help, Newsletter)
- **Server-side token verification** at `/api/recaptcha/verify` with score threshold (0.5)
- **Graceful dev mode** - Skips verification when no site key configured
- **Client-side reCAPTCHA provider** - `RecaptchaProvider` context loaded only in browser

### Bug Fixes ✅
- **Fixed volunteer fetch** - `created_at` serverTimestamp issue resolved with `new Date()` + fallback sorting
- **Fixed broken blog images** - Local placeholder (`/photo-bank/hero_01.jpg`) + `onError` handler for broken URLs
- **Fixed duplicate Header/Footer** - Volunteer portal now isolated from global ClientLayout (fixed navigation issues)
- **Fixed admin UID hardcoded** - Replaced `"admin"` string with actual Firebase Auth UID via `onAuthStateChanged`
- **Removed `useFormValidation.ts`** - Unified validation system using `react-hook-form` + `zod`

### Firestore Indexes ✅
- Added composite index for `volunteer_tasks` (`volunteerId` + `date` DESC)
- Added composite index for `volunteer_messages` (`volunteerId` + `createdAt` DESC)
- Deployed to production

### New Files
- `src/app/volunteer-portal/activate/page.tsx` - Account creation page for approved volunteers
- `src/app/volunteer-portal/login/page.tsx` - Redesigned (login only, no signup)
- `src/app/admin/volunteers/messages/page.tsx` - Full message inbox for admins
- `src/app/api/recaptcha/verify/route.ts` - Server-side reCAPTCHA verification
- `src/contexts/RecaptchaProvider.tsx` - reCAPTCHA v3 context provider
- `src/lib/recaptcha.ts` - reCAPTCHA utility functions

### Environment Variables (New)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA v3 site key
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA v3 secret key

### Dependencies Added
- `react-google-recaptcha-v3` - Google reCAPTCHA v3 React integration

---

## [0.3.1] - 2026-04-11 - SEO Settings & Admin Fixes

### Admin & Permissions Fixes ✅
- **Added SEO settings Firestore rules** - Created proper Firestore security rules for `seo_settings` collection allowing editors to read/write
- **Fixed admin user validation** - Updated `add-admin.js` script with correct Firebase Admin SDK service account file
- **Role-based permissions** - SEO settings now accessible to admin and editor roles

### Known Issues Resolved
- Fixed 404 errors on `/admin/events` page
- Fixed "Missing or insufficient permissions" errors for SEO settings
- Admin users now properly authenticated via Firestore `admin_users` collection

### Email System Overhaul ✅
- **Migrated from Resend to Gmail SMTP** - Eliminated Resend dependency, now using free Gmail SMTP for all email sending
- **New email routes**:
  - `/api/email/send-summary` - Send summary emails for events and forms
  - `/api/email/send` - Contact form and general email sending
  - `/api/email/notify` - Admin notifications (event registrations, form submissions, volunteer signups)
- **Email configuration**:
  - Added Gmail SMTP credentials to `.env.local` (`EMAIL_USER`, `EMAIL_APP_PASSWORD`)
  - All emails now send from configured Gmail account directly to inbox
  - No more sandbox restrictions or domain verification needed
- **Newsletter system**: Updated to use Gmail SMTP for bulk sending (with rate limiting delays)

### Forms System - Bilingual Support ✅
- **Fixed form saving** - Removed `undefined` fields that caused Firestore errors
- **Bilingual form rendering** - Form fields now display in correct language (ES/EN) based on user preference
  - Labels: `label` / `labelEs`
  - Placeholders: `placeholder` / `placeholderEs`
  - Descriptions: `description` / `descriptionEs`
  - Options: `label` / `labelEs` for select/radio/checkbox
- **Fixed form validation** - Zod schema now properly validates all field types
- **Form submission emails** - Admin notifications now respect notification settings

### Events Registration & Summary ✅
- **Integrated registrations into events page** - Merged `/admin/event-registrations` into `/admin/events`
- **Registration count badges** - Event cards now show number of registered attendees
- **"View Registrations" button** - Opens modal with full registration table
- **Summary email feature** - Send email summary of all registrations to admins
  - Custom branded modal confirmation (Viva Resource colors)
  - Beautiful HTML email with event details, registration stats, and attendee table
- **Event details page** - Added summary email button, improved registration management

### Admin Panel Improvements ✅
- **Removed duplicate "Estado" dropdown** in form editor (redundant with FormSharePanel toggle)
- **Settings page** - Added "Notificaciones por Email" section for configuring email recipients and toggles
- **Confirmation modal** - Created `ConfirmModal` component with Viva Resource branding
  - Gradient blue header with icon
  - Bilingual support
  - Loading state
  - Customizable title, message, and button text
- **Removed sync-conflict files** - Cleaned up Resilio Sync conflict files from git tracking

### Firestore & Security ✅
- **Added composite index** for `form_submissions` (formId ASC, submittedAt DESC)
- **Updated security rules** - Added `allow list` for donations collection
- **Admin SDK integration** - API routes now use Firebase Admin SDK for privileged operations
  - Events CRUD uses Admin SDK
  - Summary email uses Admin SDK
  - Form submissions query uses Admin SDK

### Bug Fixes 🐛
- Fixed `AlertCircle` import error in form editor
- Fixed Timestamp rendering error in event registration page
- Fixed Fast Refresh errors from stale webpack cache
- Fixed duplicate label rendering in public form fields
- Fixed form save error from `undefined` field values
- Fixed email permission denied errors (migrated to Admin SDK)

### Dependencies 📦
- Added `nodemailer` for Gmail SMTP email sending
- Added `@types/nodemailer` for TypeScript support
- Removed Resend SDK dependency (still configured via env but not used)

### Breaking Changes ⚠️
- **Resend no longer used** - All email functionality migrated to Gmail SMTP
- **Email configuration** - Must configure `EMAIL_USER` and `EMAIL_APP_PASSWORD` in `.env.local`
- **`/admin/event-registrations`** - Now redirects to `/admin/events`

---

## [Unreleased] - Phase 6 Admin System In Progress

### Admin Infrastructure ✅
- Firebase Firestore full integration (7 collections)
- Firebase security rules deployed to production
- Firestore composite indexes created
- Database seeding with sample data (2 blog posts, 3 events)
- Admin user creation via CLI script

### Admin Panel Features ✅
- Admin authentication system (Firebase Auth)
- Protected admin routes with auth guard
- Admin login page (`/admin/login`) with email/password form
- Admin dashboard (`/admin`) with statistics widgets
- Responsive admin sidebar with mobile toggle menu
- Events management page (`/admin/events`)
  - List view with filtering and search
  - Delete functionality
  - Firestore integration
- Blog, Volunteers, Donations, Settings page stubs ready for CRUD

### Bug Fixes 🐛
- Fixed Header.tsx syntax error (duplicate `</Link>` closing tag)
- Fixed hydration mismatch from duplicate `<html>` elements
- Fixed useEffect dependency array warnings in AdminLayoutContent
- Fixed Firestore Timestamp rendering error (converted to readable dates)
- Fixed infinite redirect loop on login page (added isLoginPage check)
- Fixed Firestore composite index requirement (simplified events query)

### Architecture Changes 🔄
- Created ClientLayout component for conditional Header/Footer rendering
- Separated admin layout completely from public layout (no more inheritance)
- Moved fonts import from admin/layout to root layout
- Removed duplicate font declarations

### Next Steps 🎯
- [ ] Events Create/Edit forms with API routes
- [ ] Blog CRUD implementation
- [ ] Volunteer registration display
- [ ] File upload to Firebase Storage
- [ ] Email notifications
- [ ] PayPal integration

---

## [1.0.0] - 2026-03-30

### Added

#### Public Pages
- Home page (`/`) with hero, Get Help CTA, Programs, FAQ, Contact form
- About page (`/about`)
- Blog page (`/blog`) with Firestore integration
- Events page (`/events`) with Firestore integration
- Get Involved page (`/get-involved`) with volunteer registration form
- Event Registration page (`/events/register/[id]`) with event-specific registration
- Resources page (`/resources`)
- Contact page (`/contact`)

#### Admin Panel
- Admin authentication with Firebase Auth
- Dashboard with stats
- Blog management (`/admin/blog`)
- Events management (`/admin/events`)
- Volunteer registrations management (`/admin/volunteers`)
- Donations/PayPal configuration (`/admin/donations`)
- Site settings (`/admin/settings`)

#### UI/UX Improvements
- Skip link for accessibility (src/app/layout.tsx)
- Focus states for keyboard navigation (src/app/globals.css)
- ARIA labels on Header and Footer components
- Toast notification component (src/components/Toast.tsx)
- Inline form validation on volunteer and event registration forms
- Loading states on form submit buttons
- Skeleton loaders for Blog/Events pages (src/components/Skeleton.tsx)
- FAQ accordion component with expand/collapse functionality

#### Integrations
- Firebase Firestore for dynamic content (blog posts, events)
- Firebase Authentication for admin panel
- Bilingual support (English/Spanish) with context-based translations

#### Design Updates
- Rectangular logo in Header (public/logo-rectangular.png)
- Sponsors section updated with "Lanza tu Marca Digital" and "Código Guerrero Dev"
- FAQ expanded to 7 questions with proper answers
- Footer updated with "Admin Portal" link

### Fixed
- FAQ accordion not expanding/collapsing (added FAQItem component with state management)
- Text overlapping button in "Driving Change" CTA section
- Missing translations for FAQ answers

---

## [0.0.1] - 2026-02-19

### Added
- Initial Next.js 14 project setup
- Basic Tailwind CSS configuration with design tokens
- Firebase configuration
- Language context for bilingual support (EN/ES)
- Basic page templates

---

## Project Context

- **Framework**: Next.js 14.2 with React 18 and TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Firebase (Firestore + Auth + Storage)
- **Languages**: English (EN) and Spanish (ES)
- **Deployment**: Ready for Vercel

---

## Migration Notes

### v0.0.1 to v1.0.0
- Firebase integration requires `.env.local` configuration
- Admin access requires Firebase Auth setup
- Blog and Events content managed via Firestore console
