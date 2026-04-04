# 📋 Plan de Trabajo - Viva Resource Foundation

**Fecha:** 3 de abril de 2026
**Estado:** Fases 1-4 COMPLETADAS ✅ | Fases 5-7 EN PROGRESO
**Progreso Total:** ~78%

---

## 🔴 CRÍTICO - Bloqueantes antes de cualquier deploy

Estos bugs ROMPEN la aplicación y deben resolverse primero.

### 1. Null guard en `post.title` — crash en blog
- **Archivos:** `src/app/blog/page.tsx:112`, `src/app/admin/blog/page.tsx:59`
- **Problema:** `post.title.toLowerCase()` crashea si `title` es `null`/`undefined` (documentos legacy en Firestore)
- **Fix:** `post.title?.toLowerCase().includes(search.toLowerCase()) ?? false`
- **Tiempo estimado:** 10 min

### 2. BlogEditor pierde contenido al cambiar idioma
- **Archivo:** `src/components/forms/BlogEditor.tsx:154-161`
- **Problema:** Cambiar el selector de idioma NO resetea los campos. Se puede publicar contenido en inglés como si fuera español.
- **Fix:** Resetear `title`, `excerpt`, `content` al cambiar idioma
- **Tiempo estimado:** 15 min

### 3. Índice compuesto de Firestore faltante para blog detail
- **Archivo:** `src/app/blog/[slug]/page.tsx:30-35`, `firestore.indexes.json`
- **Problema:** Query con 3 campos (`slug`, `language`, `status`) requiere índice compuesto que NO existe. TODAS las páginas de blog detail fallarán.
- **Fix:** Agregar índice a `firestore.indexes.json` y desplegar con Firebase CLI
- **Tiempo estimado:** 20 min

---

## ✅ Fase 1 - Crítico (COMPLETADA)

- ✅ Headers/Footers globalizados
- ✅ Navegación dinámica con `usePathname`
- ✅ Errores de sintaxis corregidos
- ✅ Build exitoso (al momento de la última versión estable)

---

## ✅ Fase 2 - Sistema de Traducciones (COMPLETADA)

- ✅ `LanguageContext.tsx` funcional
- ✅ Diccionario EN/ES en `translations.ts`
- ✅ Botón EN/ES en Header
- ✅ Persistencia en localStorage

---

## ✅ Fase 3 - Páginas Públicas (COMPLETADA)

| Página | Ruta | Estado |
|--------|------|--------|
| Home | `/` | ✅ |
| About Us | `/about` | ✅ |
| Resources | `/resources` | ✅ |
| Get Help | `/get-help` | ✅ |
| Get Involved | `/get-involved` | ✅ |
| Donate | `/donate` | ✅ |
| Blog | `/blog` | ✅ (con bugs pendientes) |
| Contact | `/contact` | ✅ |
| Events | `/events` | ✅ |
| Event Registration | `/events/register` | ✅ |
| Privacy | `/privacy` | ✅ |

---

## ✅ Fase 4 - Optimización de Imágenes (COMPLETADA)

- ✅ Todos `<img>` → `<Image>` de Next.js
- ✅ Atributo `sizes` configurado
- ✅ Remote patterns en `next.config.mjs`

---

## ⚠️ Fase 5 - Contenido Bilingüe (85% - PARCIAL)

### Completado:
- ✅ Home page - 100% bilingüe
- ✅ About page - 100% bilingüe
- ✅ Resources page - 100% bilingüe
- ✅ Get Help page - 100% bilingüe
- ✅ Donate page - bilingüe con diccionario

### Pendiente:
- [ ] Blog listing page - strings hardcodeados en inglés (CTA, newsletter, etc.)
- [ ] Blog detail page - CTA final hardcodeado en inglés
- [ ] Contact page - verificar todos los strings bilingües
- [ ] Events page - verificar strings bilingües
- [ ] Volunteer portal - verificar strings bilingües
- [ ] Privacy page - verificar strings bilingües
- [ ] BlogEditor admin - labels hardcodeados, no usa LanguageContext
- [ ] BlogEditor - categorías solo en español

---

## 🔄 Fase 6 - Sistema de Admin (40% - EN PROGRESO)

### Completado:
- ✅ Layout admin con sidebar
- ✅ Login admin (`/admin/login`)
- ✅ Dashboard básico (`/admin`)
- ✅ Blog CRUD (listar, crear, editar, eliminar)
- ✅ Events CRUD básico
- ✅ Forms management básico
- ✅ Volunteers listing
- ✅ Settings page (`/admin/settings`)
- ✅ AI Content Generator (`/admin/ai-generator`)
- ✅ Newsletter management

### Pendiente:
- [ ] **Blog Editor - Fix crítico de pérdida de contenido** (ver sección CRÍTICO)
- [ ] **Blog Editor - Integrar LanguageContext** para labels bilingües
- [ ] Events - CRUD completo con image upload
- [ ] Event registrations - Viewer con filtros y export CSV
- [ ] Volunteers - Detalle individual, messaging, approve/reject
- [ ] Donations - Dashboard con historial y métricas
- [ ] Forms - Builder visual, preview, share panel con QR
- [ ] Users management - Crear, editar roles, eliminar admins
- [ ] Site settings - Editar info del sitio, redes sociales, PayPal config
- [ ] Image manager - Galería central de imágenes subidas
- [ ] Newsletter - Editor visual, envío masivo, historial
- [ ] AI Generator - Guardar contenido generado, convertir a draft de blog
- [ ] Protección de rutas admin - Verificar que TODAS las rutas `/admin/*` requieran auth
- [ ] Role-based UI - Mostrar/ocultar secciones según rol (admin/editor/viewer)

---

## ❌ Fase 7 - Rendimiento y SEO (0% - PENDIENTE)

### SEO:
- [ ] Meta tags únicos por página (title, description, OG, Twitter cards)
- [ ] Dynamic `lang` attribute en `<html>` según idioma del usuario
- [ ] Structured data (JSON-LD) para Organization, BlogPosting, Event
- [ ] Open Graph images por página
- [ ] Canonical URLs
- [ ] `robots.txt` configurado
- [ ] Sitemap dinámico verificado (ya existe `sitemap.ts`)

### Performance:
- [ ] Cache de queries Firestore con React `cache()`
- [ ] Duplicar `getPostBySlug` en blog detail (se llama 2 veces)
- [ ] Filtrar blog por `language` a nivel de Firestore, no client-side
- [ ] Paginación en admin blog listing (ahora trae TODOS los posts)
- [ ] Paginación en admin volunteers listing
- [ ] `useMemo` para filtros client-side
- [ ] Parallax scroll con `requestAnimationFrame` (evitar layout thrashing)
- [ ] Eliminar `unoptimized` de imágenes locales en About page
- [ ] Font optimization (preload, display swap)
- [ ] Code splitting para componentes pesados (ReactQuill)
- [ ] Lazy loading para imágenes below the fold

### Core Web Vitals:
- [ ] LCP < 2.5s (optimizar hero images)
- [ ] CLS < 0.1 (evitar layout shift con skeleton loaders)
- [ ] INP < 200ms (optimizar handlers de eventos)

---

## ❌ Fase 8 - Infraestructura y Deploy (0% - PENDIENTE)

### Firebase:
- [ ] Firestore security rules revisadas y deployadas
- [ ] Storage rules actualizadas y deployadas
- [ ] Composite indexes deployados (blog slug query)
- [ ] Firebase Config verificada en producción

### Vercel:
- [ ] Variables de entorno configuradas en Vercel
- [ ] `vercel.json` con `maxDuration: 60` para ruta AI
- [ ] Custom domain configurado (vivaresource.org)
- [ ] SSL certificado activo
- [ ] Environment variables:
  - [ ] `NEXT_PUBLIC_FIREBASE_*` (6 vars)
  - [ ] `RESEND_API_KEY`
  - [ ] `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
  - [ ] `PAYPAL_CLIENT_SECRET`
  - [ ] `PAYPAL_MODE`
  - [ ] `CLOUDINARY_*` (3 vars)
  - [ ] `OPENROUTER_API_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `NEWSLETTER_ADMIN_EMAILS`

### Scripts:
- [ ] Seed script con `--clean` flag (no borrar sin confirmación)
- [ ] Script de backup de Firestore
- [ ] Script de migración de datos si cambia estructura

---

## ❌ Fase 9 - Testing y Calidad (0% - PENDIENTE)

- [ ] Configurar Vitest o Jest
- [ ] Tests unitarios para utilidades (formatTimestamp, slug generation, etc.)
- [ ] Tests de integración para API routes
- [ ] Tests E2E con Playwright (flujos críticos: donate, register, contact)
- [ ] Verificar build sin errores TypeScript (`npm run build`)
- [ ] ESLint sin warnings (`npm run lint`)
- [ ] Verificar rutas huérfanas (links a páginas que no existen)

---

## ❌ Fase 10 - Pulido Final (0% - PENDIENTE)

### UX:
- [ ] Error pages personalizadas (404, 500)
- [ ] Loading states consistentes (usar Skeleton component)
- [ ] Toast notifications para acciones (guardar, eliminar, enviar)
- [ ] Confirmación antes de eliminar recursos
- [ ] Empty states con CTA (ej: "No hay posts aún, crea uno")
- [ ] Form validation visual inline (no solo al submit)

### Accesibilidad:
- [ ] ARIA labels en todos los botones e inputs
- [ ] Keyboard navigation funcional
- [ ] Focus states visibles
- [ ] Alt text en todas las imágenes
- [ ] Contraste WCAG AA verificado

### Legal:
- [ ] Privacy policy actualizada
- [ ] Terms of service (si aplica)
- [ ] Cookie consent banner (si se usan cookies analíticas)
- [ ] Disclaimer de donaciones deducibles de impuestos

---

## 📊 Resumen por Prioridad

| Prioridad | Tareas | Tiempo Est. |
|-----------|--------|-------------|
| 🔴 Crítico (bloqueante) | 3 fixes | ~45 min |
| 🟡 Fase 5 - Bilingüe completo | 8 tareas | ~4 hrs |
| 🟡 Fase 6 - Admin completo | 16 tareas | ~24 hrs |
| 🟢 Fase 7 - SEO/Performance | 20 tareas | ~16 hrs |
| 🟢 Fase 8 - Infraestructura | 12 tareas | ~6 hrs |
| 🟢 Fase 9 - Testing | 7 tareas | ~12 hrs |
| 🟢 Fase 10 - Pulido | 15 tareas | ~10 hrs |

**Total restante:** ~72 horas de trabajo

**Progreso por fase completada:**
- Fases 1-4: ✅ 100%
- Fase 5: ⚠️ 85%
- Fase 6: 🔄 40%
- Fase 7: ❌ 0%
- Fase 8: ❌ 0%
- Fase 9: ❌ 0%
- Fase 10: ❌ 0%

---

## 🚀 Orden Recomendado de Ejecución

1. **HOY:** Fix los 3 bugs críticos (sección CRÍTICO arriba)
2. **Sprint 1:** Completar Fase 5 (bilingüe faltante)
3. **Sprint 2:** Completar Fase 6 (admin funcional completo)
4. **Sprint 3:** Fase 7 (SEO + Performance)
5. **Sprint 4:** Fase 8 (Infraestructura + Deploy a producción)
6. **Sprint 5:** Fase 9 (Testing)
7. **Sprint 6:** Fase 10 (Pulido final → Lanzamiento)

---

**Última actualización:** 3 de abril de 2026
