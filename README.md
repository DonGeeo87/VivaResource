# Viva Resource Website

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)](https://docker.com)

Sitio web bilingüe (Inglés/Español) para Viva Resource. Nonprofit con panel admin completo, migrado de Firebase a infraestructura propia en VPS.

## 🚀 Características Principales

- **Páginas Públicas**: Home, About, Blog, Events, Get Involved, Resources, Contact, Donate, Forms
- **Panel Admin**: Dashboard, Blog, Events, Volunteers, Forms, Users, Donations, Newsletter, AI, Settings, SEO
- **Base de Datos**: PostgreSQL (auto-gestionado en VPS, migrado desde Firestore)
- **Auth**: JWT + Firebase Auth REST API (login existente sin SDK)
- **Storage**: Cloudinary (imágenes optimizadas)
- **Pagos**: PayPal (one-time/monthly)
- **Forms Dinámicos**: Builder con validación Zod
- **Bilingüe**: Traducciones contextuales EN/ES
- **Accesibilidad**: WCAG 2.1 AA, ARIA, focus visible
- **Testing**: Vitest (unit), Playwright (E2E)
- **SEO/Performance**: SSR, sitemap dinámico, metadata, images AVIF/WebP
- **Infraestructura**: Docker, VPS propio, GitHub Actions CI/CD

## 🛠️ Tech Stack

| Frontend | Backend | Infraestructura | Testing |
|----------|---------|-----------------|---------|
| Next.js 14 App Router | PostgreSQL 16 | Docker | Vitest |
| React 18 + TS | Express API routes | VPS (62.146.227.146) | Playwright |
| Tailwind CSS 3.4 | JWT Auth | GitHub Actions | |
| Zod + React Hook Form | Cloudinary | Nginx Proxy Manager | |
| Lucide React | Nodemailer (Gmail SMTP) | Coolify | |

## 📋 Requisitos Previos

- Node.js 18+
- Docker (para deploy en VPS)
- Acceso SSH al VPS (62.146.227.146)

## 🧪 Instalación & Setup Local

```bash
git clone <repo>
cd Viva-Resource
npm install
```

### 1. Variables de Entorno

`.env.local`:
```env
# Firebase (solo para auth REST, sin SDK)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vivaresource
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vivaresource.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vivaresource.firebasestorage.app
FIREBASE_ADMIN_KEY=...  # Service account base64 (para migración/adminDb legacy)

# PostgreSQL
PGHOST=localhost
PGPORT=5432
PGDATABASE=vivaresource_blog
PGUSER=vivaresource
PGPASSWORD=...

# Email
EMAIL_USER=ginterdonatop@gmail.com
EMAIL_APP_PASSWORD=...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEWSLETTER_ADMIN_EMAILS=admin@vivaresource.org
JWT_SECRET=...  # Para firmar tokens JWT

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox

# Reports
REPORT_SECRET=...
```

### 2. Desarrollo

```bash
npm run dev        # http://localhost:3000
npm run build      # Build producción (usar build.bat en Windows)
npm test           # Vitest (51 tests)
```

**Admin**: `/admin` (usa JWT + Firebase Auth REST)

## 🧑‍💻 Scripts NPM

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Build producción |
| `npm run start` | Server prod |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit (51 tests) |
| `npm run test:ui` | Vitest UI |
| `npm run test:e2e` | Playwright E2E |
| `build.bat` | Build en Windows (evita MSYS corruption) |

## 🗄️ Esquema de Base de Datos

El proyecto usa PostgreSQL con una tabla genérica `collections` para datos flexibles (migrado desde Firestore):

```sql
CREATE TABLE collections (
  id TEXT NOT NULL,
  name TEXT NOT NULL,       -- Nombre de la colección (equivalente a Firestore)
  data JSONB NOT NULL,       -- Datos del documento
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (name, id)
);
```

Colecciones migradas (313 documentos, 16 colecciones):
`admin_users`, `blog_posts`, `events`, `event_registrations`, `forms`, `form_submissions`, `help_requests`, `newsletter_subscribers`, `participants`, `seo_settings`, `site_images`, `site_settings`, `survey_responses`, `volunteer_messages`, `volunteer_registrations`, `volunteer_users`

## 📁 Estructura Proyecto

```
.
├── src/app/             # Pages (App Router)
├── src/components/      # UI reutilizables
├── src/contexts/        # Auth/Language/Recaptcha
├── src/lib/
│   ├── auth/            # JWT sign/verify + client session
│   ├── admin-db.ts      # PostgreSQL wrapper (reemplaza Firestore)
│   └── db-client.ts     # Cliente frontend (imita Firestore API)
├── src/types/           # TS Types
├── scripts/             # Migración Firestore→PostgreSQL
├── public/              # Assets estáticos
├── e2e/                 # Playwright tests
└── ...
```

## 🚀 Despliegue

### Pipeline CI/CD (GitHub Actions)

| Branch | Workflow | Destino |
|--------|----------|---------|
| `master` | Deploy Viva Resource | `vivaresource.com` (producción) |
| `migracion-vps` | Deploy Viva Migracion | `viva.codigoguerrero.dev` (staging) |

### Manual (VPS)

```bash
docker compose -f docker-compose.migracion.yml build --no-cache
docker compose -f docker-compose.migracion.yml up -d
```

## 🔄 Historial de Migración

- **Jul 2026**: Migración completa de Firebase a infraestructura propia
  - Firebase Auth → JWT + Firebase Auth REST API
  - Firestore → PostgreSQL (tabla collections con JSONB)
  - Firebase Storage → Cloudinary (ya estaba)
  - Firebase Admin SDK → REST wrapper propio
  - 0 dependencias de Firebase en el bundle frontend
  - 313 documentos migrados, 0 pérdida de datos

## 🤝 Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 Licencia

Private - Viva Resource

---

**Live**: https://vivaresource.com  
**Staging**: https://viva.codigoguerrero.dev  
**Issues**: [Crear issue](https://github.com/DonGeeo87/VivaResource/issues/new)
