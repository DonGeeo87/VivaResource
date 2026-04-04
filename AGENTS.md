# VivaResource - Agent Guidelines

## Overview

This is a Next.js 14 + TypeScript project with Firebase backend, Tailwind CSS for styling, and multilingual (English/Spanish) support.

---

## Build & Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (Next.js + TypeScript)
```

There are currently no dedicated test commands or test files in this project.

---

## Code Style Guidelines

### General Rules

- **Use TypeScript everywhere** - No plain JavaScript files
- **Always define return types** for functions and components (`: JSX.Element`, `: void`, etc.)
- **Use path aliases** (`@/components`, `@/lib`, `@/contexts`) - never relative imports beyond parent directory
- **"use client" directive** - Add at top of any component using hooks (useState, useEffect, useContext, etc.)

### Component Structure

```typescript
"use client";

import { useState, useEffect } from "react";
import { SomeIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SomeComponent from "@/components/SomeComponent";

interface Props {
  title: string;
  onSubmit: () => void;
}

export default function ComponentName({ title, onSubmit }: Props): JSX.Element {
  const { language, translations } = useLanguage();
  const [state, setState] = useState<string>("");

  // ...

  return (
    <div>...</div>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (`BlogEditor.tsx`, `Header.tsx`)
- **Interfaces/Types**: PascalCase (`BlogFormData`, `SiteSettings`)
- **Functions**: camelCase (`handleSubmit`, `fetchSettings`)
- **Files**: kebab-case or PascalCase for components
- **Variables**: camelCase, descriptive names

### Imports Order

1. React/Next imports (`useState`, `usePathname`, `Link`, `Image`)
2. Third-party libraries (`lucide-react`, `firebase/firestore`)
3. Path alias imports (`@/components`, `@/lib`, `@/contexts`)
4. CSS imports (e.g., `react-quill/dist/quill.snow.css`)

### Types & Interfaces

```typescript
interface FormData {
  title: string;
  slug: string;
  status: "draft" | "published";
  language: "en" | "es";
}

// Use explicit types, avoid 'any'
```

### Error Handling

```typescript
try {
  const snapshot = await getDocs(collection(db, "collection"));
  // process data
} catch (error) {
  console.error("Error fetching data:", error);
  // Optionally show user-facing error
} finally {
  setLoading(false);
}
```

### Forms & Validation

- Use `react-hook-form` with `zod` for validation
- Use existing form components in `@/components/forms/`
- Handle loading/saving states with boolean flags

### Tailwind CSS

- Use custom color palette defined in `tailwind.config.ts`
- Use `font-headline`, `font-body` for typography
- Use `shadow-ambient*` for soft shadows (no hard shadows)
- Use semantic class names, avoid magic numbers

### Multilingual Support

- Import and use `useLanguage` hook from `@/contexts/LanguageContext`
- Use language-aware strings: `language === "es" ? "Texto español" : "English text"`
- Store translations in `translations` object from context

### Firebase Usage

- Firestore operations via `@/lib/firebase/config` (exports `db`)
- Use async/await with proper error handling
- Use `getDocs`, `getDoc`, `setDoc`, `doc`, `collection` from firebase/firestore

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── admin/        # Admin dashboard pages
│   ├── api/          # API routes (if any)
│   └── [routes]/     # Public pages
├── components/       # Reusable React components
│   ├── forms/        # Form components (BlogEditor, etc.)
│   └── *.tsx         # UI components
├── contexts/         # React Context providers (LanguageContext)
├── lib/              # Utility libraries (firebase config)
└── styles/           # Global styles
```

---

## ESLint Configuration

The project uses Next.js TypeScript ESLint config (`next/core-web-vitals`, `next/typescript`). Run `npm run lint` to check.

---

## Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

# Resend API Key
RESEND_API_KEY

# Newsletter Admin Emails
NEWSLETTER_ADMIN_EMAILS (comma-separated)

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_MODE

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Other
OPENROUTER_API_KEY
NEXT_PUBLIC_SITE_URL
```

---

## Firestore Collections

| Collection | Purpose | Permissions |
|-----------|---------|-------------|
| `blog_posts` | Blog articles | Public read published, editors CRUD |
| `events` | Community events | Public read published, editors CRUD |
| `event_registrations` | Event sign-ups | Public create, editors manage |
| `volunteer_registrations` | Volunteer sign-ups | Public create, editors manage |
| `site_settings` | Site configuration | Public read, admin write |
| `admin_users` | Admin user accounts | Signed-in read, admin write |
| `forms` | Dynamic forms | Public read, editors CRUD |
| `form_submissions` | Form responses | Public create, editors manage |
| `newsletter_subscribers` | Newsletter list | Public create, editors manage |
| `newsletter_history` | Email send history | Editors CRUD |
| `donations` | Donation records | Editors read, server write |
| `ai_generated_content` | AI-generated content | Editors CRUD |

---

## Cloudinary Storage

- Images stored in Cloudinary (not Firebase Storage)
- Upload via signed API route `/api/upload`
- Folder: `vivaresource/{category}` (blog, events, etc.)
- Allowed formats: JPG, PNG, WebP, GIF only
- Max size: 5MB
- Firebase Storage rules kept for backward compatibility with existing images

---

## Debugging Gotchas

### Silent Auth Failures
Admin users not in `admin_users` collection get auto-signed-out without error message. Check Firestore `admin_users` collection.

### Hydration Mismatches
Language context uses `isHydrated` flag — check for SSR/CSR content mismatches. Use `if (!isHydrated) return null` before language-dependent content.

### Firebase Re-initialization
Multiple Firebase instances cause errors — always check `getApps().length === 0` before initializing.

### Storage Permissions
Two paths with different permissions: `/images/` (public read, editor write) vs `/uploads/` (authenticated read, admin write only).

### Email Failures
Resend API requires valid `RESEND_API_KEY`. Sandbox uses `onboarding@resend.dev`.

### "Missing Error Components" in Development
The message "missing required error components, refreshing..." indicates a React hydration error. Common causes:
- Undefined Tailwind colors in config
- Conditionally rendered components without unique keys
- Hooks used outside the component tree

---

## Security Checklist (Before Commit)

- [ ] No hardcoded API keys or secrets (use `.env.local`)
- [ ] All user inputs validated with Zod schema
- [ ] Admin routes check BOTH Firebase Auth AND Firestore `admin_users` role
- [ ] Firestore rules reviewed: `isEditor()` = admin OR editor
- [ ] Error messages don't leak internal details (catch `unknown`, sanitize output)
- [ ] Never commit `.env.local`

---

## Architecture Notes

- **Client-only Firebase**: No server-side Firebase operations (except API routes)
- **Bilingual by Design**: All user-facing content via LanguageContext, never hardcoded
- **Role Checks**: `isEditor()` = admin OR editor in Firestore rules
- **Role hierarchy**: admin > editor > viewer
- **Admin UID**: `3TP4IksNrMOfTeEfmjrjiUq31nx2` (hardcoded in `scripts/add-admin.js`)
- **ClientLayout**: Conditionally excludes Header/Footer for `/admin` and `/volunteer-portal`
- **Cloudinary**: Signed uploads via `/api/upload` API route. Client utility in `src/lib/cloudinary.ts`
- **Blog model**: Single-language posts (one doc per language, linked by `slug` + `language` fields)
- **Blog sanitization**: Uses regex-based `sanitizeHtml` — sufficient for admin-authored content but consider `isomorphic-dompurify` for production with external authors

---

## Notes

- No test framework currently configured
- This is a Firebase-backed app (Firestore, Storage)
- Supports multilingual content (English/Spanish)
- Uses React Quill for rich text editing in blog admin