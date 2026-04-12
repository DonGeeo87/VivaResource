# VivaResource - Project Context

## Project Overview

**VivaResource** is a Next.js 14 + TypeScript web application for the **Viva Resource Foundation**, a 501(c)(3) nonprofit organization supporting immigrant families in Colorado. The site provides resource directories, donation capabilities, event registration, volunteer portals, blog content, and multilingual (English/Spanish) support.

### Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 3.4 |
| **Backend** | Firebase (Firestore, Storage, Auth) |
| **Email** | Resend |
| **Payments** | PayPal React SDK |
| **Forms** | react-hook-form + Zod validation |
| **Rich Text** | React Quill |
| **Icons** | lucide-react |
| **Images** | Cloudinary + Firebase Storage |
| **Linting** | ESLint (next/core-web-vitals, next/typescript) |

### Project Status

Phases 1-4 are **COMPLETE**. Phases 5-7 are **IN PROGRESS** (~78% total completion). The admin system (Phase 6) is partially implemented with CRUD for blog, events, forms, and volunteers. SEO/performance optimization (Phase 7) is pending.

---

## Building and Running

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (Next.js + TypeScript)
```

**Deploy to Vercel:**
```bash
deploy-vercel.bat    # Windows batch script
vercel --prod        # Manual deploy
```

---

## Project Structure

```
vivaresource/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── about/              # About Us page
│   │   ├── admin/              # Admin dashboard (partially implemented)
│   │   ├── api/                # API routes (upload, etc.)
│   │   ├── blog/               # Blog listing/posts
│   │   ├── contact/            # Contact page/form
│   │   ├── donate/             # Donation page (PayPal)
│   │   ├── events/             # Events listing
│   │   │   └── register/       # Event registration
│   │   ├── forms/              # Dynamic form handling
│   │   ├── get-help/           # Get Help page
│   │   ├── get-involved/       # Get Involved page
│   │   ├── privacy/            # Privacy policy
│   │   ├── resources/          # Resource directory
│   │   ├── volunteer-portal/   # Volunteer portal
│   │   ├── error.tsx           # Global error page
│   │   ├── not-found.tsx       # 404 page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── robots.ts           # Dynamic robots.txt
│   │   └── sitemap.ts          # Dynamic sitemap generator
│   ├── components/             # Reusable React components
│   │   ├── forms/              # Form components (BlogEditor, etc.)
│   │   ├── ui/                 # UI primitives
│   │   ├── Header.tsx          # Global navigation header
│   │   ├── Footer.tsx          # Global footer
│   │   ├── ClientLayout.tsx    # Client-side layout wrapper
│   │   ├── ImageUpload.tsx     # Cloudinary upload component
│   │   ├── NewsletterForm.tsx  # Newsletter subscription form
│   │   ├── Skeleton.tsx        # Loading skeleton
│   │   └── Toast.tsx           # Toast notifications
│   ├── contexts/               # React Context providers
│   │   ├── LanguageContext.tsx # Bilingual (EN/ES) context
│   │   └── AuthContext.tsx     # Firebase Auth context
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Internationalization (EN/ES)
│   ├── lib/                    # Utility libraries
│   │   ├── firebase/           # Firebase configuration
│   │   ├── cloudinary.ts       # Cloudinary upload utility
│   │   └── email/              # Resend email utilities
│   ├── types/                  # TypeScript type definitions
│   └── data/                   # Static data files
├── public/                     # Static assets
├── logos/                      # Logo source files
├── scripts/                    # Utility scripts (admin setup, etc.)
├── stitch/                     # Design mockups/wireframes
└── [config files]              # next.config.mjs, tailwind.config.ts, etc.
```

---

## Development Conventions

### TypeScript

- **Strict mode enabled** - Use TypeScript everywhere, avoid `any`
- **Always define return types** for functions and components (`: JSX.Element`, `: void`, etc.)
- **Use path aliases** (`@/components`, `@/lib`, `@/contexts`) via `@/*` → `./src/*`

### Component Structure

```typescript
"use client";

import { useState, useEffect } from "react";
import { SomeIcon } from "lucide-react";
import SomeComponent from "@/components/SomeComponent";

interface Props {
  title: string;
  onSubmit: () => void;
}

export default function ComponentName({ title, onSubmit }: Props): JSX.Element {
  const [state, setState] = useState<string>("");

  return <div>...</div>;
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `BlogEditor.tsx`, `Header.tsx` |
| Interfaces/Types | PascalCase | `BlogFormData`, `SiteSettings` |
| Functions | camelCase | `handleSubmit`, `fetchSettings` |
| Files | kebab-case or PascalCase | `blog-editor.tsx` or `Header.tsx` |
| Variables | camelCase | `isLoading`, `userData` |

### Imports Order

1. React/Next imports (`useState`, `usePathname`, `Link`, `Image`)
2. Third-party libraries (`lucide-react`, `firebase/firestore`)
3. Path alias imports (`@/components`, `@/lib`, `@/contexts`)
4. CSS imports (e.g., `react-quill/dist/quill.snow.css`)

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

### Firebase Usage

- Firestore operations via `@/lib/firebase/config` (exports `db`)
- Use async/await with proper error handling
- Use `getDocs`, `getDoc`, `setDoc`, `doc`, `collection` from firebase/firestore

---

## Design System

### Color Palette (Tailwind Config)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#025689` | Trust, CTAs, links |
| Primary Container | `#2e6fa3` | Backgrounds |
| Secondary | `#416900` | Hope, accents |
| Secondary Container | `#b7f569` | Light backgrounds |
| Surface | `#f9f9f9` | Page background |
| Surface Lowest | `#ffffff` | Cards |
| On Surface | `#1a1c1c` | Primary text |
| On Surface Variant | `#41474f` | Secondary text |
| Outline | `#717880` | Borders |

### Typography

- **Headlines:** `Plus Jakarta Sans` (`font-headline`)
- **Body:** `Public Sans` (`font-body`)

### Shadows (Ambient Only - No Hard Shadows)

- `shadow-ambient` - 0 2px 8px rgba(26, 28, 28, 0.04)
- `shadow-ambient-md` - 0 4px 16px rgba(26, 28, 28, 0.06)
- `shadow-ambient-lg` - 0 8px 24px rgba(26, 28, 28, 0.08)
- `shadow-ambient-xl` - 0 12px 32px rgba(26, 28, 28, 0.1)
- `shadow-glass` - Glassmorphism for navigation

### Border Radius

- `sm` - 0.5rem | `DEFAULT/md` - 0.75rem | `lg` - 1rem | `xl` - 1.25rem | `2xl` - 1.5rem | `full` - 9999px

---

## Multilingual Support (EN/ES)

- Use `useLanguage` hook from `@/contexts/LanguageContext`
- Use language-aware strings: `language === "es" ? "Texto español" : "English text"`
- Store translations in `translations` object from context
- Persist language preference in `localStorage`
- Update HTML `lang` attribute dynamically (planned for Phase 7)

---

## Image Configuration

Configured in `next.config.mjs` with remote patterns for:

- `lh3.googleusercontent.com` (Google OAuth avatars)
- `images.unsplash.com` / `unsplash.com` (stock photos)
- `firebasestorage.googleapis.com` (Firebase Storage uploads)
- `res.cloudinary.com` (Cloudinary CDN)
- `via.placeholder.com` (placeholder images)

Formats: `image/webp`, `image/avif`

Always use Next.js `<Image>` component (not `<img>`) with proper `sizes` attribute.

---

## Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

# Resend API Key
RESEND_API_KEY=

# Newsletter Admin Emails
NEWSLETTER_ADMIN_EMAILS=

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Other
OPENROUTER_API_KEY=
NEXT_PUBLIC_SITE_URL=
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

## Admin Panel

- URL: `/admin`
- Login: Firebase Auth + Firestore `admin_users` collection verification
- **Admin UID:** `3TP4IksNrMOfTeEfmjrjiUq31nx2` (hardcoded in `scripts/add-admin.js`)

### Admin Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/login` | Admin login |
| `/admin/blog` | Blog post management |
| `/admin/events` | Event management |
| `/admin/event-registrations` | Event registrations viewer |
| `/admin/volunteers` | Volunteer management |
| `/admin/forms` | Form builder & management |
| `/admin/users` | Admin user management |
| `/admin/donations` | Donations configuration |
| `/admin/newsletter` | Newsletter management |
| `/admin/ai-generator` | AI content generator |
| `/admin/settings` | Site settings |

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
- **ClientLayout**: Conditionally excludes Header/Footer for `/admin` and `/volunteer-portal`
- **Cloudinary**: Signed uploads via `/api/upload` API route. Client utility in `src/lib/cloudinary.ts`
- **Blog model**: Single-language posts (one doc per language, linked by `slug` + `language` fields)
- **Blog sanitization**: Uses regex-based `sanitizeHtml` — sufficient for admin-authored content but consider `isomorphic-dompurify` for production with external authors

---

## Notable Notes

- **No test framework configured** - No dedicated test commands or test files
- **Firebase-backed** - Uses Firestore for dynamic content (blog, events, forms)
- **501(c)(3) nonprofit** - Tax-deductible donations via PayPal
- **Multilingual** - English and Spanish throughout
- **SEO-optimized** - Each page has metadata (title, description, keywords, OpenGraph)
- **Accessible** - Semantic HTML, proper form validation, loading states
- **Phase 6 (Admin) in progress** - Partially implemented CRUD for blog, events, forms, volunteers
- **Phase 7 (Performance) pending** - Lighthouse improvements, dynamic lang attribute, lazy loading
