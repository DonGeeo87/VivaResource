# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
- **Stack**: Next.js 14.2 (App Router) + React 18 + TypeScript 5 + Firebase 12.x
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **Forms**: React Hook Form + Zod validation via `@hookform/resolvers`
- **Email**: Resend API (`/api/email/send`)
- **Payments**: PayPal SDK (pending configuration)
- **Languages**: Bilingual EN/ES via LanguageContext
- **Icons**: Lucide React
- **Images**: Cloudinary (signed uploads via API route)
- **Deployment**: Vercel (via deploy-vercel.bat)
- **Path Alias**: `@/*` → `./src/*`

## Commands
```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint (Next.js + TypeScript strict)

# Firestore scripts (run with node):
node scripts/init-firestore.js   # Initialize Firestore collections
node scripts/seed-firestore.js   # Seed sample data
node scripts/add-admin.js        # Add admin user
node scripts/seed-blog-posts.js  # Seed blog articles

# Vercel deploy:
deploy-vercel.bat            # Deploy to Vercel (Windows)
vercel --prod                # Deploy to Vercel (manual)

# Firebase rules deploy (still needed):
firebase deploy --only firestore:rules  # Deploy security rules
firebase deploy --only storage:rules    # Deploy storage rules
```

**Note**: No test framework configured. Manual testing required. Recommended: Vitest + Playwright.

## Code Style

### Naming Conventions
- Components: PascalCase (e.g., `ClientLayout.tsx`, `Header.tsx`)
- Routes: kebab-case (e.g., `/volunteer-portal`, `/admin/login`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth`)
- Types/Interfaces: PascalCase (e.g., `BlogPost`, `EventRegistration`)
- Constants: UPPER_SNAKE_CASE

### File Conventions
- Components: `.tsx` extension
- Utilities/types: `.ts` extension
- Import order: external → internal (@/) → relative
- Add `"use client"` ONLY when using hooks or inline event handlers

### Component Structure
```tsx
"use client";  // Only if using hooks (useState, useEffect, useContext)

import { useState } from "react";
import { SomeComponent } from "@/components/SomeComponent";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  title: string;
  count?: number;
}

export default function Component({ title, count = 0 }: Props): JSX.Element {
  const [state, setState] = useState(false);
  
  return <div>{title}</div>;
}
```

### TypeScript Rules
- **Strict mode**: `strict: true` in tsconfig.json
- Return type: explicit `JSX.Element` (never implicit)
- Error handling: catch blocks MUST use `unknown` (never `any`)
- Props interface: defined above component
- Optional props: use `?` with defaults where applicable
- Immutability: never mutate original objects

### Tailwind CSS
- Use design token values from `tailwind.config.ts`
- Class order: [width] [margin/padding] [flex/grid] [colors] [text] [effects]
- Custom shadows: `shadow-ambient`, `shadow-ambient-md`, `shadow-ambient-lg`
- Never use hard shadows — only ambient soft shadows

## Key Patterns

### Firebase Initialization
```typescript
// src/lib/firebase/config.ts:15 - ALWAYS use this guard
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
```

### Admin Authentication (Dual Check)
- Requires BOTH Firebase Auth AND Firestore `admin_users` collection
- Auto-logout if user not in `admin_users` (`AdminAuthContext.tsx:46`)
- Role hierarchy: admin > editor > viewer
- Use `isEditor()` in Firestore rules (= admin OR editor)

### Language/Hydration
- Use `isHydrated` state to prevent SSR/CSR mismatch
- Always: `if (!isHydrated) return null` before language-dependent content
- localStorage key: `viva-lang`
- Fallback: English if no provider

### Form Validation
- Define Zod schema BEFORE component
- Use `@hookform/resolvers` with `zodResolver(schema)`
- Never validate manually
- Schema must match form fields exactly

### API Routes
- Pattern: `/src/app/api/{resource}/route.ts` (POST/PUT/GET/DELETE)
- Validate input with Zod schema BEFORE Firestore operations
- Return consistent format: `{ success: false, error: "message" }`
- Check `isEditor()` or `isAdmin()` via Firestore lookup

### Image Uploads (Cloudinary)
- Allowed: JPG, PNG, WebP, GIF only
- Max size: 5MB
- Upload via `/api/upload` (signed server-side to Cloudinary)
- Folder structure: `vivaresource/{blog|events|...}`
- Delete via `/api/upload` with DELETE method
- URLs: `res.cloudinary.com/{cloud_name}/image/upload/...`

## Firestore Collections
`blog_posts`, `events`, `event_registrations`, `volunteer_registrations`, `site_settings`, `admin_users`, `forms`, `form_submissions`, `newsletter_subscribers`, `donations`, `newsletter_history`, `volunteer_messages`, `ai_generated_content`

## Cloudinary Storage
- Images stored in Cloudinary (not Firebase Storage)
- Upload via signed API route `/api/upload`
- Folder: `vivaresource/{category}`
- Firebase Storage rules kept for backward compatibility with existing images

## Storage Rules (Legacy - Firebase)
- `/images/*` - public read, editor write (legacy, migrating to Cloudinary)
- `/uploads/*` - authenticated read, admin write only

## Debugging Gotchas

### Silent Auth Failures
Admin users not in `admin_users` collection get auto-signed-out without error message.

### Hydration Mismatches
Language context uses `isHydrated` flag - check for SSR/CSR content mismatches.

### Firebase Re-init
Multiple Firebase instances cause errors - always check `getApps().length === 0`.

### Storage Permissions
Two paths with different permissions - `/images/` vs `/uploads/`.

### Email Failures
Resend API requires valid `RESEND_API_KEY`. Sandbox uses `onboarding@resend.dev`.

## Environment Variables
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
RESEND_API_KEY
NEWSLETTER_ADMIN_EMAILS (comma-separated)
NEXT_PUBLIC_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_MODE
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
OPENROUTER_API_KEY
NEXT_PUBLIC_SITE_URL
```

## Design Tokens
| Token | Value | Usage |
|-------|-------|-------|
| primary | #025689 | Trust blue |
| secondary | #416900 | Hope green |
| surface | #f9f9f9 | Background |
| on-surface | #1a1c1c | Text |
| font-headline | Plus Jakarta Sans | Headlines |
| font-body | Public Sans | Body text |

## Security Checklist (Before Commit)
- [ ] No hardcoded API keys or secrets (use `.env.local`)
- [ ] All user inputs validated with Zod schema
- [ ] Admin routes check BOTH Firebase Auth AND Firestore `admin_users` role
- [ ] Firestore rules reviewed: `isEditor()` = admin OR editor
- [ ] Error messages don't leak internal details (catch `unknown`, sanitize output)
- [ ] Never commit `.env.local`

## Architecture Notes
- **Client-only Firebase**: No server-side Firebase operations
- **Bilingual by Design**: All user-facing content via LanguageContext, never hardcode
- **Role Checks**: isEditor() = admin OR editor in Firestore rules
- **Admin UID**: 3TP4IksNrMOfTeEfmjrjiUq31nx2 (hardcoded in `scripts/add-admin.js`)
- **ClientLayout**: Conditionally excludes Header/Footer for /admin and /volunteer-portal
- **Cloudinary**: Signed uploads via `/api/upload` API route. Client utility in `src/lib/cloudinary.ts`
- **Vercel Deploy**: Via `deploy-vercel.bat` or `vercel --prod`. AI generate route has `maxDuration: 60`

## Key Reference Files
| File | Purpose |
|------|---------|
| `src/lib/firebase/config.ts` | Firebase client initialization |
| `src/contexts/LanguageContext.tsx` | EN/ES language handling |
| `src/contexts/AdminAuthContext.tsx` | Admin auth & roles |
| `src/i18n/translations.ts` | All EN/ES strings (~65KB) |
| `src/types/forms.ts` | Dynamic form types |
| `src/components/Skeleton.tsx` | Loading skeleton |
| `src/lib/cloudinary.ts` | Cloudinary upload/delete utility |
| `src/app/api/upload/route.ts` | Cloudinary signed upload API |
| `src/app/admin/users/page.tsx` | Admin user management |
| `src/app/admin/event-registrations/page.tsx` | Event registrations viewer |
| `firestore.rules` | Security rules |
| `storage.rules` | Storage permissions |
| `tailwind.config.ts` | Design tokens |
