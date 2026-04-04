# Changelog - Viva Resource Foundation Website

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-04-04 - Email System, Forms Bilingual, Events Registration Summary

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
