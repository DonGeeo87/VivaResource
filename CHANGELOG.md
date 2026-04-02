# Changelog - Viva Resource Foundation Website

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
