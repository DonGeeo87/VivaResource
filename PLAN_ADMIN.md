# 📊 PLAN ADMIN - SISTEMA ADMINISTRATIVO

**Última Actualización**: 30 Mar 2026  
**Responsable**: Equipo Dev  
**Versión**: 2.0 (Post-Fase 6A)

---

## 📌 RESUMEN EJECUTIVO

**Objetivo**: Crear un panel administrativo completo que permita gestionar contenido (eventos, blog, voluntarios) de la plataforma Viva Resource con máxima facilidad.

**Status Actual**: **50% Completado** ✅ (18 de 35 horas)

**Próximo Milestone**: Agregar CRUD completo para Events + Blog (Semana 1)

**Timeline Total**: 4-5 semanas

---

## 🏗️ ARQUITECTURA

```
CLIENT (Next.js + React)
  ├─ Admin UI (React Components)
  │  ├─ Forms (Events, Blog, Voluntarios)
  │  ├─ Lists (Data Tables, Filters)
  │  └─ Details (Individual records)
  └─ Contexts
     ├─ AdminAuthContext (Firebase Auth)
     └─ LanguageContext (EN/ES)

SERVER (Next.js API Routes)
  ├─ /api/events → CRUD (POST, PUT, DELETE)
  ├─ /api/blog → CRUD (POST, PUT, DELETE)
  ├─ /api/upload → File upload to Storage
  ├─ /api/email → Send notifications
  └─ /api/payments → PayPal webhooks

DATABASE (Firestore)
  ├─ blog_posts (2 seeded)
  ├─ events (3 seeded)
  ├─ event_registrations
  ├─ volunteer_registrations
  ├─ admin_users (1 seeded)
  ├─ site_settings (1 seeded)
  └─ subscriptions

STORAGE (Firebase Storage)
  ├─ /images/events/...
  ├─ /images/blog/...
  └─ /uploads/temp/...
```

---

## ✅ COMPONENTES COMPLETADOS

### 1. **Autenticación Admin** ✅
- Firebase Auth integration
- Login page with email/password
- Session persistence
- Logout functionality

**Archivos**:
- `src/contexts/AdminAuthContext.tsx`
- `src/app/admin/login/page.tsx`

**Credenciales de Prueba**:
- Email: `dongeeodev@gmail.com`
- Password: (ask in Slack)

---

### 2. **Admin Layout** ✅
- Responsive sidebar (fixed desktop, toggle mobile)
- Navigation menu
- User profile area
- Logout button
- Auth guard (prevents unauthorized access)

**Archivos**:
- `src/app/admin/layout.tsx`
- `src/components/AdminSidebar.tsx`
- `src/components/ClientLayout.tsx`

**Responsive Behavior**:
- Desktop (lg:): Sidebar visible, full width
- Tablet (md:): Sidebar visible, adjusted spacing
- Mobile: Hamburger toggle, overlay menu

---

### 3. **Dashboard** ✅
- 4 statistic widgets (blog posts, events, volunteers, registrations)
- Realtime Firestore data
- Loading states
- Responsive grid

**Archivos**: `src/app/admin/page.tsx`

**Widgets**:
- Total Blog Posts
- Total Events
- Total Volunteers
- Recent Event Registrations

---

### 4. **Events Management (List)** ✅
- Events list from Firestore
- Status filter (all/draft/published/cancelled)
- Search by title
- Delete functionality
- Firestore Timestamp formatting

**Archivos**: `src/app/admin/events/page.tsx`

**Features**:
- Real-time sync with Firestore
- Bilingual search (EN/ES)
- Status-based filtering
- Delete with confirmation
- Date formatting: `formatDate()`

---

### 5. **Page Stubs** ✅
- `/admin/blog` - Ready for CRUD
- `/admin/volunteers` - Ready for CRUD  
- `/admin/donations` - Ready for PayPal config
- `/admin/settings` - Ready for site config

---

### 6. **Internationalization Context** ✅
- Language switching (EN/ES)
- Persistence in localStorage
- Used throughout admin panel

**Archivos**: `src/contexts/LanguageContext.tsx`

---

## 🚧 COMPONENTES EN PROGRESO / PRÓXIMOS

### 1. **Events CRUD - Create/Edit** 🔴 NOT STARTED
**Priority**: P1 (Primera tarea)
**Estimado**: 6 horas

**Tareas**:
- [ ] Create form component
- [ ] Create page `/admin/events/new`
- [ ] Edit page `/admin/events/[id]`
- [ ] POST/PUT API routes
- [ ] Form validation (Zod + React Hook Form)
- [ ] Image upload integration
- [ ] Success/error notifications

**Dependencias**: File upload system

**Campos del Evento**:
```tsx
{
  titleEN: string,
  titleES: string,
  slug: string,        // auto-generated
  description: string, // Markdown support?
  date: Timestamp,
  location: string,
  category: "workshop" | "community" | "fundraiser",
  requiresRegistration: boolean,
  image: string,       // URL to Storage
  status: "draft" | "published" | "cancelled"
}
```

---

### 2. **Blog CRUD - Create/Edit** 🔴 NOT STARTED
**Priority**: P1 (Segunda tarea)
**Estimado**: 6 horas

**Tareas**:
- [ ] Rich text editor selection (TipTap/Draft.js/Markdown)
- [ ] Create form component
- [ ] Create page `/admin/blog/new`
- [ ] Edit page `/admin/blog/[id]`
- [ ] POST/PUT/DELETE API routes
- [ ] Image upload for featured image
- [ ] SEO fields (meta, slug)
- [ ] Category support

**Campos del Post**:
```tsx
{
  titleEN: string,
  titleES: string,
  slug: string,
  excerptEN: string,
  excerptES: string,
  contentEN: string,       // Rich HTML
  contentES: string,       // Rich HTML
  featuredImage: string,   // Storage URL
  categories: string[],    // ["community", "updates"]
  author: string,          // Admin user
  published: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 3. **Volunteer Registrations Display** 🔴 NOT STARTED
**Priority**: P1 (Tercera tarea)
**Estimado**: 4 horas

**Tareas**:
- [ ] Improve volunteer list page
- [ ] Data table component
- [ ] Filter by status (pending/approved/rejected)
- [ ] Search by name/email
- [ ] View full details modal
- [ ] Update status functionality
- [ ] Export to CSV
- [ ] Send notification email

**Campos Mostrados**:
```
| Nombre | Email | Teléfono | Posición | Fecha | Estado | Acciones |
```

---

### 4. **File Upload System** 🔴 NOT STARTED
**Priority**: P2
**Estimado**: 4 horas

**Componentes**:
- [ ] `ImageUpload.tsx` - Drag & drop component
- [ ] `src/lib/firebase/storage.ts` - Utilities
- [ ] API route `/api/upload`

**Features**:
- Drag & drop upload
- File validation (size, type)
- Progress indicator
- Image optimization
- Delete old images
- Error handling

---

### 5. **Email System** 🔴 NOT STARTED
**Priority**: P2
**Estimado**: 4 horas

**Servicio**: SendGrid (recomendado)

**Email Templates**:
- Event registration confirmation
- Volunteer application confirmation
- Admin: New event published
- Admin: New blog post
- Volunteer: Status updated

---

## 📱 UI/UX SPECIFICATIONS

### Color Palette
```css
Primary: #025689 (Trust Blue)
Secondary: #416900 (Hope Green)
Background: #f9f9f9
Text: #1a1c1c
Error: #d32f2f
Success: #388e3c
Warning: #ff9800
```

### Typography
```
Headings: Plus Jakarta Sans (Bold)
Body: Public Sans (Regular)
Sizes: H1 (32px) → H4 (18px), Body (16px/14px)
```

### Layout Grid
```
Desktop: 12-column grid (1200px max)
Tablet:  12-column grid (768px)
Mobile:  Single column (320px+)
Spacing: 16px base unit
```

---

## 🔐 SEGURIDAD

### Reglas Firestore (Deployed ✅)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users can do everything
    match /{document=**} {
      allow read, write: if request.auth.uid in get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.roles
    }
  }
}
```

### Validación Frontend
- React Hook Form (client-side)
- Zod schemas (runtime validation)

### Validación Backend
- Type checking (TypeScript)
- Firestore Auth Guards
- Input sanitization

---

## 📊 ESTADÍSTICAS & MÉTRICAS

### Progress Tracker
```
Componentes: 5/15 completados (33%)
Horas: 18/53 completadas (34%)
Bugs: 0 outstanding ✅

Tier 1: 16 horas planificadas
  - Events CRUD: 0/6
  - Blog CRUD: 0/6
  - Volunteers: 0/4

Tier 2: 12 horas planificadas
  - File Upload: 0/4
  - Email System: 0/4
  - Dashboard: 0/2
  - Other: 0/2

Tier 3: 12 horas planificadas
  - PayPal: 0/5
  - Settings: 0/2
  - Scheduling: 0/3
  - User Mgmt: 0/2

Tier 4: 13 horas planificadas
  - Testing: 0/8
  - Performance: 0/3
  - Deployment: 0/2
```

---

## 🚀 ROADMAP

### Week 1 (30 Mar - 5 Apr) - FOUNDATIONS
**Goal**: Complete all Tier 1 CRUD

```
Day 1-2: Events Create/Edit Forms
Day 3-4: Blog CRUD Implementation
Day 5: Volunteer Display
Result: Full CRUD for content
```

### Week 2 (6 Apr - 12 Apr) - INFRASTRUCTURE
**Goal**: Add file uploads, email, polish UI

```
Day 1-2: File Upload System
Day 3-4: Email Notifications
Day 5: Dashboard Enhancements
Result: Professional admin experience
```

### Week 3 (13 Apr - 19 Apr) - ADVANCED
**Goal**: Payment processing, settings, scheduling

```
Day 1-3: PayPal Integration
Day 4-5: Settings + User Management
Result: Advanced features
```

### Week 4 (20 Apr - 26 Apr) - QA & DEPLOYMENT
**Goal**: Testing, optimization, go live

```
Day 1-2: Unit + E2E Tests
Day 3: Performance Optimization
Day 4-5: Deployment Setup
Result: Production 🚀
```

---

## 📋 CHECKLIST - CADA FEATURE

### Cuando Marcar como "LISTO":
```
✅ Funcionalidad principal implementada
✅ No hay errors en consola
✅ Responsive en móvil/tablet/desktop
✅ Validaciones en forma
✅ Mensajes error visibles
✅ Loading states
✅ Confirmaciones para acciones destructivas
✅ Tests básicos pasando
✅ Documentado
✅ Commit claro en git
```

---

## 🔗 REFERENCIAS

- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **React Hook Form**: https://react-hook-form.com/
- **Zod Validation**: https://zod.dev/
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Firebase Storage**: https://firebase.google.com/docs/storage

---

## 📞 CONTACTOS

**Admin Account**:
- Email: `dongeeodev@gmail.com`
- Role: Super Admin
- Firebase UID: `3TP4IksNrMOfTeEfmjrjiUq31nx2`

**Development Environment**:
- Dev Server: http://localhost:3003
- Firebase Project: `vivaresource`
- Database: Firestore (live, seeded)

**Credentials Stored**:
- `.env.local` - Contains all Firebase keys
- Never commit credentials!

---

**Última revisión**: 30 Mar 2026  
**Próxima revisión**: 5 Apr 2026 (al completar Week 1)
