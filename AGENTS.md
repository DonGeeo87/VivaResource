# VivaResource - Agent Guidelines

## Overview

Next.js 14 + TypeScript + Firebase (Firestore, Auth, Storage) + Tailwind CSS + multilingual (EN/ES).

---

## Build & Test Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build       # Production build
npm run start      # Production server
npm run lint       # ESLint (Next.js + TypeScript)

# Testing - Vitest configured
npm run test         # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # With coverage

# Single test file
npx vitest run src/components/SomeComponent.test.ts
```

---

## Code Style

### General Rules
- **TypeScript everywhere** - No plain JS
- **Define return types** (`: JSX.Element`, `: void`)
- **Use path aliases** (`@/components`, `@/lib`, `@/contexts`)
- **"use client"** - Add ONLY when using hooks
- **No `any` types**

### Component Template
```typescript
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  title: string;
  onSubmit: () => void;
}

export default function ComponentName({ title, onSubmit }: Props): JSX.Element {
  const { language, isHydrated } = useLanguage();
  const [state, setState] = useState<string>("");

  if (!isHydrated) return null;

  return <div>{title}</div>;
}
```

### Imports Order
1. React/Next (`useState`, `Link`, `Image`)
2. Third-party (`lucide-react`, `firebase`)
3. Path aliases (`@/components`, `@/lib`)
4. CSS

### Naming
- Components: PascalCase (`Header.tsx`)
- Types: PascalCase (`BlogFormData`)
- Functions: camelCase (`handleSubmit`)

### Error Handling
```typescript
try {
  const snapshot = await getDocs(collection(db, "collection"));
} catch (error: unknown) {
  console.error("Error:", error);
} finally {
  setLoading(false);
}
```

---

## Firebase Patterns

### Init Guard (required)
```typescript
import { getApps, initializeApp } from "firebase/app";
if (getApps().length === 0) initializeApp(firebaseConfig);
```

### Admin Auth (dual check)
```typescript
const firebaseUser = auth.currentUser;
const adminDoc = await getDoc(doc(db, "admin_users", firebaseUser.uid));
if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
  // auto-logout
}
```

### Security Rules
- `isEditor()` = admin OR editor
- Role hierarchy: admin > editor > viewer

---

## Multilingual

- Use `useLanguage` from `@/contexts/LanguageContext`
- Check `isHydrated` before language content
- Use `translations.key` or `language === "es" ? "ES" : "EN"`
- Never hardcode user-facing strings

---

## Security Checklist

- [ ] No hardcoded API keys (use `.env.local`)
- [ ] All inputs validated with Zod schema
- [ ] Admin routes check Firebase Auth AND Firestore `admin_users`
- [ ] Catch `unknown`, never `any`
- [ ] Never commit `.env.local`

---

## Debugging Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| Admin logged out | UID in Auth, not in `admin_users` | Add doc with `role`, `email` |
| Hydration mismatch | SSR EN, client ES | Check `isHydrated` |
| Firebase re-init error | Multiple `initializeApp()` | Check `getApps().length === 0` |
| Email fails | Missing `RESEND_API_KEY` | Sandbox: `onboarding@resend.dev` |

---

## Environment Variables

```env
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

---

## Key Reference Files

- `tailwind.config.ts` - Design tokens
- `src/lib/firebase/config.ts` - Firebase init
- `src/contexts/AdminAuthContext.tsx` - Role-based auth
- `src/contexts/LanguageContext.tsx` - i18n + hydration
- `src/i18n/translations.ts` - EN/ES translations

---

## Additional Rules

Supplemented by:
- `.kilocode/rules-code/AGENTS.md` - Code rules
- `.kilocode/rules-ask/AGENTS.md` - Ask mode rules
- `.kilocode/rules-architect/AGENTS.md` - Architecture rules
- `.kilocode/rules-debug/AGENTS.md` - Debugging rules
- `.github/copilot-instructions.md` - Copilot guidance

---

## Notes

- No server-side Firebase (client SDK only)
- Role hierarchy: admin > editor > viewer
- Admin UID: `3TP4IksNrMOfTeEfmjrjiUq31nx2`
- Images use Cloudinary via `/api/upload`