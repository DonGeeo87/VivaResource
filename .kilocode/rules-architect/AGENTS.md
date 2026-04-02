# Architect Mode Rules (Non-Obvious Only)

This file provides guidance to agents when designing architecture for this repository.

## Architectural Constraints

- **Stateless Components**: All components must be stateless unless using React hooks - webview compatibility requirement
- **Firebase Client-Only**: No server-side Firebase operations - all Firestore/Auth/Storage via client SDK
- **Role Hierarchy**: admin > editor > viewer - enforced in Firestore rules AND AdminAuthContext
- **Bilingual by Design**: All user-facing content must support EN/ES - use LanguageContext, never hardcode text

## Hidden Coupling

- **AdminAuthContext + Firestore Rules**: Both check user roles - changes to one require updates to the other
- **ClientLayout + Route Structure**: Header/Footer exclusion for /admin and /volunteer-portal is hardcoded
- **Form Builder + Form Types**: `FormBuilder.tsx` components must match types in `src/types/forms.ts`
- **Storage Paths + Rules**: `/images/` and `/uploads/` have different permission models - cannot be merged

## Performance Considerations

- **Skeleton Loaders**: Required for all Firestore data fetching (see `src/components/Skeleton.tsx`)
- **Image Optimization**: Use Next/Image for all images - configured for `lh3.googleusercontent.com` and `images.unsplash.com`
- **Language Persistence**: localStorage with key `viva-lang` - affects initial render

## Extension Points

- **Dynamic Forms**: `forms` and `form_submissions` collections support custom form creation
- **Newsletter**: Separate `newsletter_subscribers` collection with API endpoint
- **Event Registration**: `event_registrations` collection linked to `events`
- **Site Settings**: `site_settings` collection for runtime configuration (PayPal, social links, SEO)

## Monorepo Structure
Not a monorepo - single Next.js app. All code in `src/` directory.

## Deployment
Firebase Hosting configured via `firebase.json`. No CI/CD pipeline set up.
