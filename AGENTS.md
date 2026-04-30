# VivaResource - Agent Guidelines

Next.js 14 + TypeScript + Firebase (Firestore, Auth, Storage) + Tailwind CSS + multilingual (EN/ES).

## Developer Commands

```bash
npm run dev          # Dev server localhost:3000
npm run build        # Production build
npm run lint         # ESLint (run before build)
npm run test         # Vitest run all tests
npm run test:watch   # Vitest watch mode
npm run test:coverage
npx vitest run src/__tests__/setup.ts  # Single test file
```

Tests live in `src/__tests__/**/*.test.ts`.

## Domain & Email

- **Website**: www.vivaresource.com
- **Foundation email**: vivaresourcefoundation@gmail.com
- **Social handles**: @vivaresource (Facebook, X, Instagram, LinkedIn, YouTube, TikTok)

## Timezone

All events/activities are scheduled in **America/Denver** (Peyton, Colorado / Mountain Time). Display times include `(MT)` suffix.

## Code Rules

- TypeScript everywhere, no `any`, explicit return types (`JSX.Element`, `void`)
- `"use client"` ONLY when using hooks
- Check `isHydrated` from `useLanguage()` before rendering language-dependent content
- All inputs: Zod schema + `@hookform/resolvers` + `zodResolver`
- Error handling: `catch (error: unknown)`, never `any`
- User-facing strings: use `translations` object, never hardcode

## Firebase Patterns

Init guard (required in every file using Firebase):
```typescript
import { getApps, initializeApp } from "firebase/app";
if (getApps().length === 0) initializeApp(firebaseConfig);
```

Admin auth: requires BOTH Firebase Auth AND Firestore `admin_users` collection check.
Role hierarchy: admin > editor > viewer. `isEditor()` = admin OR editor.

## Key Files

- `src/lib/firebase/config.ts` - Firebase init
- `src/contexts/AdminAuthContext.tsx` - Role-based auth
- `src/contexts/LanguageContext.tsx` - i18n + hydration
- `src/i18n/translations.ts` - EN/ES translations
- `src/lib/timezone.ts` - Peyton, CO timezone (America/Denver)
- `tailwind.config.ts` - Design tokens (primary=#025689, secondary=#416900)

## Event Wizard

- Step 1 (Event Details): title, description, date/time, location, category, status, registration toggle
- Step 2 (Registration): form template selection, participant limit, QR options
- Step 3 (Publish): image upload, submit
- AI Generator is NOT shown in event wizard (removed)
- QR code display is in admin event details page (`/admin/events/[id]`)

## Debugging Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| Admin logged out | UID in Auth, not in `admin_users` | Add doc with `role`, `email` |
| Hydration mismatch | SSR EN, client ES | Check `isHydrated` |
| Firebase re-init error | Multiple `initializeApp()` | Check `getApps().length === 0` |
| Email fails | Missing `RESEND_API_KEY` | Sandbox: `onboarding@resend.dev` |

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
RESEND_API_KEY
NEWSLETTER_ADMIN_EMAILS
NEXT_PUBLIC_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## Security

- Never commit `.env.local`
- Admin routes: Firebase Auth + Firestore `admin_users` role check
- Cloudinary uploads via `/api/upload` (signed, secret never client-side)
- AI-generated HTML: sanitize with `sanitizeHtml()` before `dangerouslySetInnerHTML`