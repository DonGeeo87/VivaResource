# Claude Copilot Instructions — Viva Resource Foundation

**Source of Truth**: [AGENTS.md](../AGENTS.md) → Read first before any work. This file extends it with Claude-specific agent guidance.

---

## ⚡ Quick Start for Agents

### First Steps
1. **Read context**: Project status in [ESTADO_ACTUAL.md](../ESTADO_ACTUAL.md) & admin registry [/memories/repo/ADMIN_SYSTEM_STATUS.md](../ADMIN_SYSTEM_STATUS.md)
2. **Load AGENTS.md**: Non-negotiable—contains all conventions, gotchas, and design tokens
3. **Check environment**: `.env.local` must have Firebase keys + `RESEND_API_KEY` + PayPal credentials
4. **Know the terminal state**: Last command may have failed (check context)

### Critical Skills & Agents to Load
- **code-reviewer**: All TypeScript/React changes MUST be reviewed
- **tdd-guide**: No test framework installed—recommend Vitest + Playwright per AGENTS.md
- **security-reviewer**: Project handles auth, payments, and user data
- **database-reviewer**: Firestore rules and query patterns need validation
- **frontend-patterns**: UI consistency and React 18 best practices

---

## 🏗️ Architecture Overview

### Stack Summary
```
Frontend Layer:
├─ Next.js 14.2 App Router (all files in src/app/)
├─ React 18 with TypeScript 5
├─ Tailwind CSS 3.4 (design tokens in tailwind.config.ts)
└─ React Hook Form + Zod (schema-first validation)

Data Layer:
├─ Firestore (client SDK — reads/writes from browser)
├─ Firebase Auth (email/password, role-based via admin_users collection)
└─ Cloudinary (image storage via signed API uploads)

Services:
├─ Email: Resend API (requires RESEND_API_KEY)
├─ Payments: PayPal SDK (requires credentials — pending)
├─ Images: Cloudinary (signed uploads via /api/upload)
├─ AI: OpenRouter API (content generation)
└─ i18n: LanguageContext (EN/ES, bilingual, never hardcode strings)
```

### Project State
- ✅ **Public site**: 100% complete (16 routes, all bilingual, responsive)
- ✅ **Admin panel**: 100% complete (21 routes, bilingual, skeletons, Zod validation)
- ✅ **Email system**: Operational (event confirmations, volunteer applications, newsletters, form notifications)
- ✅ **Forms system**: Dynamic forms with templates, preview, slug routing, Zod validation, progress bar
- ✅ **Cloudinary integration**: Signed uploads replacing Firebase Storage
- ✅ **Vercel deployment**: Configured via deploy-vercel.bat
- ⚠️ **PayPal**: Integration code exists, credentials pending
- ❌ **No test framework**: Manual testing; recommend Vitest + Playwright

---

## 🎯 Agent-Specific Guidance

### For Code Changes
1. **TypeScript Strict Mode**: Always explicit return types (`JSX.Element`, never `any`)
2. **Error Handling**: `catch (e: unknown)` ALWAYS (not `Error`)
3. **Props Interface**: Define `interface Props` above component with explicit types
4. **Form Validation**: Zod schema BEFORE component—never validate manually
5. **Immutability**: Use immutable patterns; original objects must never be mutated

### For API Routes
1. **Route Pattern**: `/src/app/api/{resource}/route.ts` (POST/PUT/GET/DELETE)
2. **Validation First**: Validate input with Zod schema before Firestore operations
3. **Error Response**: Return `{ success: false, error: "message" }` (consistent format)
4. **Role Guards**: Check `isEditor()` or `isAdmin()` via Firestore lookup, not just Firebase Auth
5. **No Server-Side Firebase**: Client writes directly; API routes validate before write

### For Components
1. **Client Boundary**: Add `"use client"` ONLY if using hooks (useState, useEffect, useContext)
2. **Hydration**: Check `const { isHydrated } = useLanguage()` before rendering language-dependent content
3. **Bilingual Required**: All user-facing text via `translations` object—NEVER hardcode strings
4. **Design Tokens**: Use `tailwind.config.ts` values (primary=#025689, secondary=#416900, shadows)
5. **Icons**: Import from `lucide-react` (no custom SVGs without approval)

### For Admin-Only Code
1. **Dual Auth Check**:
   ```typescript
   const firebaseUser = auth.currentUser;
   const adminDoc = await getDoc(doc(db, "admin_users", firebaseUser.uid));
   if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
     // Auto-logout happens in AdminAuthContext
   }
   ```
2. **Frontend & Backend**: Check both Firebase Auth AND Firestore `admin_users` collection
3. **Role Hierarchy**: admin > editor > viewer; use `isEditor()` in rules (covers admin + editor)

### For Firebase Patterns
1. **Always Guard Re-init**: 
   ```typescript
   import { getApps, initializeApp } from "firebase/app";
   if (getApps().length === 0) initializeApp(firebaseConfig);
   ```
2. **Security Rules**: Review [firestore.rules](../firestore.rules) before writes—role checks matter
3. **Admin Users Collection**: Required fields: `uid` (doc ID), `role` ('admin'|'editor'|'viewer'), `email`
4. **Storage Paths**: `/images/*` for public assets, `/uploads/*` for authenticated user uploads

---

## 🚨 Critical Gotchas & Debugging

| Issue | Why It Happens | Fix |
|-------|----------------|-----|
| **Admin auto-logged-out** | User UID in Firebase Auth but NOT in `admin_users` collection | Add doc: `admin_users/{uid}` with `role`, `email` fields |
| **Hydration mismatch** | SSR renders EN, client renders ES (different HTML) | Always: `if (!isHydrated) return null` before language-dependent render |
| **Firebase re-init error** | Multiple `initializeApp()` calls | Check `getApps().length === 0` guard in `src/lib/firebase/config.ts` |
| **Storage permission denied** | If using Firebase Storage (legacy images), check rules. New images use Cloudinary via /api/upload. | `/images/` is editor-writable; `/uploads/` is admin-only; verify `.rules` file |
| **Email fails silently** | Missing/invalid `RESEND_API_KEY` in `.env.local` | Sandbox: `onboarding@resend.dev`; prod requires API key |
| **Form validation bypassed** | Manual validation instead of Zod | Forms MUST have Zod schema + `useForm(resolver: zodResolver(schema))` |
| **Build fails locally** | ESLint strict config (Next.js default) | Run `npm run lint` first; fix errors before deploy |
| **PayPal checkout fails** | Missing `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in public env | Keys must be in `.env.local` and built into `next.config.mjs` |
| **Cloudinary upload fails** | Missing `CLOUDINARY_API_SECRET` in `.env.local` | Verify all 3 `CLOUDINARY_*` vars are set |
| **AI generate timeout** | Vercel Hobby has 10s function limit | Upgrade to Pro for 60s maxDuration |
| **Form slug not found** | `customSlug` not set on form or form not published | Set `customSlug` in form editor + publish |

---

## 📋 Agent Task Templates

### "I need to create a new admin page"
✅ Follow this TDD sequence:
1. Read [AGENTS.md](../AGENTS.md) for naming conventions (kebab-case routes, components)
2. Create Zod schema in component file (never inline validation)
3. Create test file (Vitest recommended—see [ADMIN_SYSTEM_STATUS.md](../ADMIN_SYSTEM_STATUS.md) Tier 2)
4. Implement component with `"use client"` + explicit return type
5. Create API route in `/src/app/api/{resource}/route.ts` with role guard
6. Test manually (no test framework yet) via browser
7. Run code-reviewer agent on all changes

### "I need to fix a Firebase deployment issue"
✅ Debug sequence:
1. Check exit code in terminal history
2. Validate Firestore rules syntax (check for typos in role fields)
3. Verify admin user exists in `admin_users` collection
4. Ensure `.env.local` has credentials and `.env` is NOT committed
5. Run `firebase deploy --only firestore:rules --project vivaresource` locally first
6. Check Firebase Console for deployment logs

### "I need to add a new form"
✅ Follow form stack:
1. Define Zod schema: `const schema = z.object({ ... })`
2. Create component with `@hookform/resolvers + zodResolver`
3. Use Tailwind classes from `tailwind.config.ts` (design tokens)
4. Add bilingual labels from `src/i18n/translations.ts`
5. Create API route: POST `/api/{resource}` with schema validation
6. Handle success/error via Toast component
7. Never use manual validation or hardcoded error messages

---

## 🔐 Security Checklist

Before any commit:
- [ ] No hardcoded API keys or secrets (use `.env.local`)
- [ ] All user inputs validated with Zod schema
- [ ] Admin routes check BOTH Firebase Auth AND Firestore `admin_users` role
- [ ] Firestore rules reviewed: `isEditor()` = admin OR editor, not just `isSignedIn()`
- [ ] Resend/PayPal credentials managed as environment variables
- [ ] Error messages don't leak internal details (catch `unknown`, sanitize output)
- [ ] CSV exports/sensitive data require role guard
- [ ] Cloudinary uploads go through signed API route (never expose API secret client-side)
- [ ] AI-generated HTML sanitized with `sanitizeHtml()` before `dangerouslySetInnerHTML`

---

## 📚 Reference Files (Read These First)

| File | Purpose | When to Read |
|------|---------|--------------|
| [AGENTS.md](../AGENTS.md) | **SOURCE OF TRUTH** — All conventions, gotchas, design tokens | ALWAYS, before any work |
| [ESTADO_ACTUAL.md](../ESTADO_ACTUAL.md) | Current project status snapshot | When starting to understand context |
| [/memories/repo/ADMIN_SYSTEM_STATUS.md](../ADMIN_SYSTEM_STATUS.md) | Detailed task registry (76+ tasks, Tiers 0-4) | When planning features or checking blockers |
| [firestore.rules](../firestore.rules) | Security rules — role-based access | Before auth/permission changes |
| [tailwind.config.ts](../tailwind.config.ts) | Design tokens (colors, shadows, fonts) | For UI consistency |
| [src/contexts/LanguageContext.tsx](../src/contexts/LanguageContext.tsx) | Bilingual i18n + SSR hydration | For language features |
| [src/contexts/AdminAuthContext.tsx](../src/contexts/AdminAuthContext.tsx) | Role-based admin auth (dual lookup) | For admin-only features |
| [src/i18n/translations.ts](../src/i18n/translations.ts) | Full EN/ES translation object (~65KB) | When adding user-facing text |

---

## 🚀 Common Workflows

### Add a New CRUD Feature (Events/Blog/Forms)
1. **Zod schema** → Define in component or separate types file
2. **API route** → POST/PUT/GET/DELETE in `/src/app/api/{resource}/`
3. **Component** → Admin page with form + table
4. **Bilingual** → All labels from `translations` object
5. **Testing** → Manual test via browser (Vitest setup in progress)
6. **Code review** → Run code-reviewer agent

### Fix a Build Error
1. Run `npm run lint` locally
2. Fix ESLint errors (strict Next.js config)
3. Validate TypeScript: explicit return types, no `any`
4. Test: `npm run build`

### Debug Admin Auth Issue
1. Check Firebase Console: user in `Authentication`?
2. Check Firestore: `admin_users/{uid}` doc exists with `role` field?
3. Check `.env.local`: Firebase keys present?
4. Check AdminAuthContext: auto-logout at line 46 if user not in collection

### Deploy to Firebase Hosting
1. Run `npm run build` locally (verify no errors)
2. Run `firebase deploy --project vivaresource` (or specific resource)
3. Check Firebase Console for deployment status
4. Verify: `npm run build && npm run dev` to test locally first

---

## 🧠 Agent Behavior Expectations

### ✅ **DO**
- Read AGENTS.md completely before starting any task
- Use code-reviewer agent on ALL TypeScript/React changes
- Check `isHydrated` before rendering language-dependent content
- Define Zod schema BEFORE components
- Verify admin users in both Firebase Auth AND Firestore
- Use bilingual labels from `translations` object
- Follow immutability patterns (no mutations)

### ❌ **DON'T**
- Hardcode strings instead of using `translations` object
- Skip Zod validation in forms
- Validate without `@hookform/resolvers`
- Add `any` types in TypeScript
- Mix server-side and client Firebase operations
- Forget `"use client"` on components using hooks
- Skip role checks in admin-only features
- Commit `.env.local` or secrets
- Use `catch (e: Error)` instead of `catch (e: unknown)`

---

## 🔗 Integration with Project Agents

When invoking agents, include this context:
- **planner**: Use when designing features; reference [ADMIN_SYSTEM_STATUS.md](../ADMIN_SYSTEM_STATUS.md) Tiers
- **code-reviewer**: MANDATORY on all code changes; link to AGENTS.md conventions
- **tdd-guide**: Frame as "no test framework installed; recommend Vitest + Playwright"
- **security-reviewer**: Highlight role-based auth dual-check pattern + env variables
- **database-reviewer**: Reference firestore.rules and Firestore security patterns
- **build-error-resolver**: Send `npm run lint` output for strict Next.js config issues

---

## 📞 Quick Reference: Environment Setup

```bash
# Clone & install
git clone <repo>
cd vivaresource
npm install

# Create .env.local (NEVER commit)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vivaresource
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD59...
# ... (see AGENTS.md Environment Variables section)
RESEND_API_KEY=re_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Run dev
npm run dev  # localhost:3000

# Build & test
npm run lint
npm run build
npm run start

# Deploy
firebase deploy --project vivaresource
```

---

## 🎓 Learning Examples

### Example 1: Reading a form correctly
```typescript
// ✅ CORRECT (from AGENTS.md pattern)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title_en: z.string().min(1, "Title required"),
  email: z.string().email(),
});

export default function MyForm(): JSX.Element {
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  return <form>{/* ... */}</form>;
}

// ❌ WRONG
export default function MyForm() {  // Missing: JSX.Element return type
  const [title, setTitle] = useState("");
  if (!title) console.log("error");  // Manual validation
  return <form>{/* ... */}</form>;
}
```

### Example 2: Language handling (hydration safety)
```typescript
// ✅ CORRECT
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header(): JSX.Element {
  const { isHydrated, language } = useLanguage();
  if (!isHydrated) return null;
  return <h1>{language === "es" ? "Inicio" : "Home"}</h1>;
}

// ❌ WRONG
export default function Header(): JSX.Element {
  const { language } = useLanguage();  // No isHydrated check = hydration mismatch
  return <h1>{language === "es" ? "Inicio" : "Home"}</h1>;
}
```

### Example 3: Admin auth pattern
```typescript
// ✅ CORRECT (dual check)
async function getAdminUser(uid: string) {
  // Check Firebase Auth
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("Not authenticated");
  
  // Check Firestore admin role
  const adminDoc = await getDoc(doc(db, "admin_users", uid));
  if (!adminDoc.exists()) throw new Error("Not admin");
  
  return adminDoc.data();
}

// ❌ WRONG (Firebase Auth only)
if (auth.currentUser) {
  // This ALONE is insufficient—user might be in Auth but not in admin_users collection
}
```

---

## 📊 Project Health Status

| Metric | Status | Notes |
|--------|--------|-------|
| **Build Health** | ✅ Good | No blocking failures |
| **Test Coverage** | ❌ 0% | No test framework; recommend Vitest + Playwright |
| **Code Quality** | ✅ Good | ESLint strict, TypeScript strict, AGENTS.md conventions enforced |
| **Security** | ✅ Good | Firestore rules configured, env vars managed, dual auth checks |
| **Deployment** | ✅ OK | Vercel configured via deploy-vercel.bat |
| **Documentation** | ✅ Excellent | AGENTS.md is comprehensive source of truth |

---

## Next Steps

1. **Pending**:
   - [ ] Configure PayPal credentials (NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE)
   - [ ] Migrate existing Firebase Storage images to Cloudinary
   - [ ] Set up Vitest + Playwright test framework

2. **Completed in recent sessions**:
   - [x] All admin routes bilingual (21 pages)
   - [x] Skeleton loading on all admin pages
   - [x] Dynamic form system (templates, preview, slug, Zod, progress bar)
   - [x] Cloudinary image upload integration
   - [x] Vercel deployment configuration
   - [x] Admin users management page
   - [x] Event registrations viewer
   - [x] Form submission email notifications

---

**Last Updated**: April 2, 2026  
**Maintained By**: Claude Copilot + Project Team  
**Version**: 1.0 — Initial Bootstrap
