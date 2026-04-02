# Viva Resource Foundation Website

A bilingual (English/Spanish) nonprofit website built with Next.js 14, TypeScript, Tailwind CSS, and Firebase.

## Features

- **Public Pages**: Home, About, Blog, Events, Get Involved, Resources, Contact
- **Admin Panel**: Dashboard, Blog/Events/Volunteers/Forms/Users management, Donations config, Newsletter, AI Generator, Site settings
- **Firebase Integration**: Firestore for content, Auth for admin
- **Cloudinary Integration**: Optimized image hosting and delivery
- **Bilingual Support**: English and Spanish with context-based translations
- **Accessibility**: Skip link, focus states, ARIA labels
- **UX Enhancements**: Toast notifications, form validation, skeleton loaders, FAQ accordion

## Tech Stack

- Next.js 14.2 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Firebase (Firestore + Auth)
- Cloudinary (image storage)
- Resend (email)
- Zod (validation)
- Vercel (deployment)
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
RESEND_API_KEY=
NEWSLETTER_ADMIN_EMAILS=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENROUTER_API_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

### Deploy (Vercel)

```bash
deploy-vercel.bat    # Windows
vercel --prod        # Manual
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable React components
├── contexts/      # Language & Auth contexts
├── lib/          # Firebase config
├── i18n/         # Translations (EN/ES)
└── types/        # TypeScript types
```

## Admin Access

- URL: `/admin`
- Login: Configured via Firebase Auth
- Contact admin for credentials

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

## License

Private - Viva Resource Foundation
