# Ask Mode Rules (Non-Obvious Only)

This file provides guidance to agents when answering questions about this repository.

## Documentation Context

- **Project Status**: ~99% complete (Fases 1-8 done) - see `ESTADO_ACTUAL.md` for full details
- **Bilingual**: Full EN/ES support via `LanguageContext` - translations in `src/i18n/translations.ts` (~65KB)
- **Admin Panel**: 11 routes under `/admin` - dashboard, blog, events, forms, volunteers, donations, settings, newsletter, form responses

## Counterintuitive Organization

- **`src/app/forms/[id]/`**: Public-facing dynamic forms (NOT admin forms)
- **`src/app/admin/forms/`**: Admin form builder and management
- **`src/components/ClientLayout.tsx`**: Conditionally renders Header/Footer (excludes them for /admin and /volunteer-portal)
- **`stitch/` directory**: Contains design mockups (HTML + screenshots) - NOT production code

## Key Reference Files

- **Design Tokens**: `tailwind.config.ts` - primary/secondary colors, fonts, shadows
- **Firebase Config**: `src/lib/firebase/config.ts` - client-side initialization
- **Admin Auth**: `src/contexts/AdminAuthContext.tsx` - role-based access control
- **Translations**: `src/i18n/translations.ts` - all EN/ES text strings
- **Form Types**: `src/types/forms.ts` - TypeScript definitions for dynamic forms

## Architecture Notes

- **Next.js App Router**: 17 public routes + 9 admin routes + 5 API endpoints
- **Firebase Client SDK**: Used for Firestore, Auth, Storage (no server-side Firebase)
- **Email via Resend**: API route at `/api/email/send` - not configured for production domain yet
- **No Testing**: Zero test files exist - all testing is manual

## Environment Requirements

6 Firebase variables + RESEND_API_KEY + NEWSLETTER_ADMIN_EMAILS required in `.env.local`
