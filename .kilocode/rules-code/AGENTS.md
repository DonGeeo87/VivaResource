# Code Mode Rules (Non-Obvious Only)

This file provides guidance to agents when working with code in this repository.

## Critical Coding Rules

- **Firebase Init**: Always check `getApps().length === 0` before initializing (prevents re-init errors) - see `src/lib/firebase/config.ts:15`
- **Admin Auth**: Double verification required - Firebase Auth AND Firestore `admin_users` collection must both validate
- **Role Checks**: Use `isEditor()` helper in Firestore rules (= admin OR editor) - `firestore.rules:13`
- **Client Components**: Add `"use client"` ONLY when using hooks (useState, useEffect, useContext) or inline event handlers
- **Language Context**: Always handle unhydrated state - use `isHydrated` flag to prevent SSR/CSR mismatch
- **Error Types**: Catch blocks MUST use `unknown` type, never `any` (enforced by TypeScript strict mode)
- **Form Validation**: Use Zod schemas with `@hookform/resolvers` - never validate manually
- **Image Upload**: Only JPG, PNG, WebP, GIF allowed (max 5MB) - validated in `src/lib/firebase/storage.ts`
- **File Naming**: Uploads use `timestamp-randomString.extension` format for uniqueness

## Import Conventions
1. External libraries (react, next, lucide-react)
2. Internal imports (@/components, @/lib, @/contexts)
3. Relative imports (../, ./)

## Component Structure
```tsx
"use client";  // Only if using hooks

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  title: string;
}

export default function Component({ title }: Props): JSX.Element {
  return <div>{title}</div>;
}
```

## Gotchas
- `ClientLayout.tsx` conditionally excludes Header/Footer for /admin and /volunteer-portal routes
- Newsletter emails use comma-separated env var `NEWSLETTER_ADMIN_EMAILS`
- Email from address defaults to `onboarding@resend.dev` (Resend sandbox)
- Admin UID is hardcoded in `scripts/add-admin.js`: `3TP4IksNrMOfTeEfmjrjiUq31nx2`
