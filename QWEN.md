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

Phases 1-5 are **COMPLETE** (see `PLAN_DE_TRABAJO.md`). The project is currently ~92% complete with admin system (Phase 6) planned and performance/SEO (Phase 7) pending.

---

## Building and Running

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (Next.js + TypeScript)
```

---

## Project Structure

```
vivaresource/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── about/              # About Us page
│   │   ├── admin/              # Admin dashboard (planned)
│   │   ├── api/                # API routes
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
│   │   └── sitemap.ts          # Dynamic sitemap generator
│   ├── components/
│   │   ├── Header.tsx          # Global navigation header
│   │   ├── forms/              # Form components
│   │   └── ui/                 # Reusable UI components
│   ├── contexts/               # React Context providers
│   ├── data/                   # Static data files
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Internationalization (EN/ES)
│   ├── lib/
│   │   ├── email/              # Resend email utilities
│   │   └── firebase/           # Firebase configuration
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── logos/                      # Logo source files
├── scripts/                    # Utility scripts
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
- `firebasestorage.googleapis.com` (user uploads)
- `res.cloudinary.com` (Cloudinary CDN)

Formats: `image/webp`, `image/avif`

Always use Next.js `<Image>` component (not `<img>`) with proper `sizes` attribute.

---

## Key Files

| File | Purpose |
|------|---------|
| `PLAN_DE_TRABAJO.md` | Detailed project roadmap with completed/pending phases |
| `AGENTS.md` | Agent/coding assistant guidelines |
| `next.config.mjs` | Next.js configuration (image domains, etc.) |
| `tailwind.config.ts` | Design tokens (colors, fonts, shadows) |
| `tsconfig.json` | TypeScript configuration with `@/*` path alias |
| `.eslintrc.json` | ESLint rules (next/core-web-vitals, next/typescript) |
| `src/app/sitemap.ts` | Dynamic sitemap generator (static + Firestore content) |

---

## Notable Notes

- **No test framework configured** - No dedicated test commands or test files
- **Firebase-backed** - Uses Firestore for dynamic content (blog, events, forms)
- **501(c)(3) nonprofit** - Tax-deductible donations via PayPal
- **Multilingual** - English and Spanish throughout
- **SEO-optimized** - Each page has metadata (title, description, keywords, OpenGraph)
- **Accessible** - Semantic HTML, proper form validation, loading states
- **Phase 6 (Admin) planned** - Admin dashboard for managing blog, events, volunteer registrations, site settings
- **Phase 7 (Performance) pending** - Lighthouse improvements, dynamic lang attribute, lazy loading
