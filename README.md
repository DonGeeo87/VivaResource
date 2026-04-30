# Viva Resource Foundation Website

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20Auth-FFCA28?logo=firebase)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel)](https://vercel.com)

Sitio web bilingüe (Inglés/Español) para la Fundación Viva Resource. Nonprofit con panel admin completo.

## 🚀 Características Principales

- **Páginas Públicas**: Home, About, Blog, Events, Get Involved, Resources, Contact, Donate, Forms
- **Panel Admin**: Dashboard, Blog/Events/Volunteers/Forms/Users/Donations/Newsletter/AI/Settings
- **Firebase**: Firestore (contenido), Auth (admin/voluntarios), Storage (imágenes)
- **Cloudinary**: Imágenes optimizadas
- **Pagos**: PayPal (one-time/monthly)
- **Forms Dinámicos**: Builder con validación Zod
- **Bilingüe**: Traducciones contextuales EN/ES
- **Accesibilidad**: WCAG 2.1 AA, ARIA, focus visible
- **Testing**: Vitest (unit), Playwright (E2E)
- **SEO/Performance**: SSR, sitemap, metadata dinámica, images AVIF/WebP

## 🛠️ Tech Stack

| Frontend | Backend | DevOps | Testing |
|----------|---------|--------|---------|
| Next.js 14 App Router | Firebase Firestore | Vercel | Vitest |
| React 18 + TS | Firebase Auth | Firebase Hosting | Playwright |
| Tailwind CSS | Cloudinary | Git | |
| Zod Validation | Resend Email | | |
| React Hook Form | PayPal | | |

## 📋 Requisitos Previos

- Node.js 18+
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`)
- Cuenta Firebase (proyecto: `vivaresource`)
- Vercel CLI (opcional: `npm i -g vercel`)

## 🧪 Instalación & Setup Local

```bash
git clone <repo>
cd Viva-Resource
npm install
```

### 1. Firebase Setup

**Opción A: Emulador Local (Recomendado para dev)**
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start --only firestore,auth,storage
```

**Opción B: Proyecto Real**
```bash
firebase login
firebase use vivaresource
```

**Service Account para Seeds (scripts/)**
```bash
firebase deploy --only firestore:rules  # Primero deploy rules
```
Descarga `vivaresource-firebase-adminsdk-*.json` de Firebase Console > Project Settings > Service Accounts.

Coloca en root como `firebase-service-account.json`.

### 2. Variables de Entorno

`.env.local` (todas requeridas):
```
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vivaresource
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vivaresource.appspot.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vivaresource.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json  # Para seeds

# Email
RESEND_API_KEY=...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# AI (OpenRouter)
OPENROUTER_API_KEY=...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEWSLETTER_ADMIN_EMAILS=admin@vivaresource.org

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
```

### 3. Seed Database

```bash
node scripts/init-firestore.js
node scripts/seed-blog-posts.js
node scripts/add-admin.js  # Agrega primer admin
```

### 4. Desarrollo

```bash
npm run dev  # http://localhost:3000
```

**Admin**: `/admin` (usa email/password Firebase Auth)

## 🧑‍💻 Scripts NPM

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Build producción |
| `npm run start` | Server prod |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit |
| `npm run test:ui` | Vitest UI |
| `npm run test:e2e` | Playwright E2E |
| `deploy-vercel.bat` | Deploy Windows |

## 🗄️ Esquema Firestore (Resumido)

Ver [DATABASE.md](DATABASE.md) completo.

| Colección | Propósito | Permisos |
|-----------|-----------|----------|
| `blog_posts` | Posts bilingües | Read published, edit w/ role |
| `events` | Eventos | Read published |
| `event_registrations` | Registros eventos | Create public |
| `forms` / `form_submissions` | Forms dinámicos | Create public |
| `admin_users` | Usuarios admin | Admin only |
| `donations` | Donaciones PayPal | View editor |
| `volunteer_users` / `tasks` / `messages` | Portal voluntarios | Own + editor |
| `site_settings` | Config sitio | Admin write |

## 📁 Estructura Proyecto

```
.
├── src/app/             # Pages (App Router)
├── src/components/      # UI reutilizables
├── src/contexts/        # Auth/Language/Recaptcha
├── src/lib/             # Firebase/Cloudinary/Email
├── src/types/           # TS Types (ver DATABASE.md)
├── scripts/             # Seeds/Firestore init
├── public/              # Assets estáticos
├── e2e/                 # Playwright tests
└── ...
```

## 🚀 Despliegue

Ver [DEPLOYMENT.md](DEPLOYMENT.md)

- **Vercel**: `vercel --prod`
- **Firebase Hosting**: `firebase deploy`

## 🤝 Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 Licencia

Private - Viva Resource Foundation

---

**Live**: https://vivaresource.org  
**Design**: Figma prototypes en stitch/  
**Issues**: [Crear issue](https://github.com/issues/new)
