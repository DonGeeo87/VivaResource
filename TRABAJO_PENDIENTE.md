# 📋 PLAN DE TRABAJO - TRABAJO PENDIENTE

**Última Actualización**: 13 Abr 2026 (18:00)
**Versión Actual**: v0.4.0
**Status Actual**: Sistema de Comunicación con Voluntarios COMPLETO ✅ | reCAPTCHA v3 integrado ✅
**Progreso Total**: ~98% (Fases 1-7 completadas ✅)

---

## ✅ FASES COMPLETADAS (1-7)

### Fase 1 - Crítico ✅
- Eliminación de Headers/Footers duplicados
- Navegación dinámica con usePathname
- Corrección de errores de sintaxis
- Build exitoso

### Fase 2 - Traducciones ✅
- LanguageContext implementado
- Diccionario EN/ES completo
- Botón EN/ES funcional
- Persistencia en localStorage
- Atributo `lang` dinámico en HTML

### Fase 3 - Páginas ✅
- 14+ páginas públicas funcionando
- Contenido bilingüe verificado

### Fase 4 - Optimización ✅
- Todas las imágenes con Next/Image
- CERO warnings críticos en build
- Imágenes rotas del blog con fallback automático

### Fase 5 - Contenido Bilingüe ✅
- Home, About, Resources, Get Help con diccionario
- Donate, Get Involved, Blog, Contact, Events, Privacy con EN/ES

### Fase 6 - Admin System ✅ (COMPLETADA 30 Mar)
- Events CRUD completo + builder
- Blog CRUD completo con editor rico (Quill)
- Volunteer Management completo
- File Upload System (Cloudinary)
- Dashboard con estadísticas
- Donations/PayPal config
- Settings page + SEO page
- Forms Builder con 9 tipos de campos
- Help Requests viewer
- Newsletter management (subscribers, historial, envío masivo)
- AI Content Generator
- Admin User Management con roles

### Fase 7 - Volunteer Communication System ✅ (COMPLETADA 13 Abr)
- **Mensajería bidireccional** admin ↔ voluntarios
- **Asignación de tareas** con campos bilingües (EN/ES)
- **Inbox de mensajes** (`/admin/volunteers/messages`) con filtros, búsqueda y actualizaciones en tiempo real
- **Notificaciones en tiempo real** - Firestore `onSnapshot`, badge de no leídos, toast al recibir mensaje
- **Flujo de onboarding reestructurado**:
  1. Voluntario aplica desde `/get-involved` (status: pending)
  2. Admin revisa y aprueba desde `/admin/volunteers`
  3. Se genera token de activación único (UUID)
  4. Email de activación con link para crear contraseña
  5. Voluntario crea cuenta en `/volunteer-portal/activate`
  6. Voluntario inicia sesión en `/volunteer-portal/login` (solo login, sin signup público)
- **Volunteer Portal mejorado**: Responder mensajes, ver tareas, marcar como completadas
- **UID de admin dinámico** - Ya no está hardcodeado, se obtiene de Firebase Auth

### Seguridad ✅
- **reCAPTCHA v3** integrado en formularios públicos (Get Involved, Get Help, Newsletter)
- Verificación server-side con score threshold (0.5)
- Modo dev graceful (salta verificación si no hay site key)

### Testing Framework ✅
- Vitest configurado con 5 archivos de tests
- Playwright configurado para E2E

### Tipos TypeScript ✅
- 7 archivos dedicados: `blog.ts`, `events.ts`, `forms.ts`, `admin.ts`, `donations.ts`, `newsletter.ts`, `volunteer.ts`

### Build
- **53/53 páginas** generadas sin errores
- Tags: `v0.3.1`, `v0.4.0`
- Release: https://github.com/DonGeeo87/VivaResource/releases/tag/v0.4.0

### Logo ✅
- Implementado en Header
- Path: `/public/logo.png` (50x50px)

---

## 🚨 PROBLEMAS CRÍTICOS RESUELTOS

### ✅ 1. Eventos no se ven en página pública
**Resuelto**: Queries Firestore corregidas con fallback de ordenamiento

### ✅ 2. Blog posts no se ven
**Resuelto**: Query con fallbacks para `published_at` y `created_at`, filtro por idioma

### ✅ 3. Get Involved - Traducción
**Resuelto**: Contenido bilingüe implementado correctamente

### ✅ 4. Get Help - Imagen Hero
**Resuelto**: Imagen corregida

### ✅ 5. Volunteer fetch con `created_at` null
**Resuelto**: Fallback con sorting client-side + `new Date()` en lugar de `serverTimestamp()`

### ✅ 6. Duplicate Header/Footer en volunteer portal
**Resuelto**: Layout aislado sin Header/Footer global (igual que admin)

### ✅ 7. Imágenes rotas en blog
**Resuelto**: Placeholder local `/photo-bank/hero_01.jpg` + handler `onError`

### ✅ 8. UID de admin hardcodeado
**Resuelto**: `onAuthStateChanged` obtiene UID real de Firebase Auth

---

## 🟡 PENDIENTES PARA PRODUCCIÓN

### PRIORIDAD 1 - Alta (15-18 horas)

#### [ ] 1. **Tests E2E con Playwright** (8 horas)
**Prioridad**: 🟡 ALTA - Necesario para confiabilidad
**Scenarios**:
- [ ] Admin login flow
- [ ] Crear evento completo
- [ ] Crear blog post con imagen
- [ ] Aprobar voluntario + enviar mensaje
- [ ] Flujo de donación PayPal
- [ ] Newsletter subscription
**Framework**: Playwright (ya configurado)

#### [ ] 2. **Tests Unitarios** (6 horas)
**Prioridad**: 🟡 ALTA
**Archivos**:
- [ ] Utilidades `src/lib/` (email, cloudinary, metadata, rate-limit, recaptcha)
- [ ] Hooks `src/hooks/`
- [ ] Context providers
**Framework**: Vitest (ya configurado)
**Coverage target**: 80%

#### [ ] 3. **Página 500 personalizada** (1 hora)
**Prioridad**: 🟡 ALTA
**Archivos**:
- [ ] `src/app/global-error.tsx` - Error 500 del servidor
**Features**:
- [ ] Mensaje bilingüe EN/ES
- [ ] Botón para volver al home
- [ ] Diseño consistente con la marca

---

### PRIORIDAD 2 - Media (12-15 horas)

#### [ ] 4. **Imágenes Reales del Equipo/Eventos** (4-6 horas)
**Prioridad**: 🟢 MEDIA
**Archivos**: Todas las páginas con imágenes de Unsplash
**Tareas**:
- [ ] Reemplazar Unsplash con fotos reales de Viva Resource
- [ ] Optimizar formato WebP
- [ ] Agregar alt text descriptivo

#### [ ] 5. **Empty States con CTAs en Admin** (3 horas)
**Prioridad**: 🟢 MEDIA
**Archivos**: Todas las páginas admin con listas
**Features**:
- [ ] Blog sin posts → "No hay artículos aún, ¿quieres crear uno?"
- [ ] Eventos sin registros → "No hay registros aún"
- [ ] Volunteers sin mensajes → "No hay mensajes aún"
- [ ] Newsletter sin suscriptores → "No hay suscriptores aún"

#### [ ] 6. **SSR Translations con Cookies** (4 horas)
**Prioridad**: 🟢 MEDIA
**Problema**: Durante SSR el usuario siempre ve inglés, flash de contenido incorrecto al hidratar
**Solución**: Cookie `NEXT_LOCALE` + middleware de Next.js
**Archivos**:
- [ ] `src/middleware.ts` - Detectar cookie de idioma
- [ ] `LanguageContext.tsx` - Leer cookie en servidor

#### [ ] 7. **Volunteer Portal - Ver estado de aplicación en tiempo real** (2 horas)
**Prioridad**: 🟢 MEDIA
**Archivos**: `src/app/volunteer-portal/page.tsx`
**Features**:
- [ ] Mostrar estado actual (pending/approved/active)
- [ ] Historial de actividades
- [ ] Próximos eventos asignados

---

### PRIORIDAD 3 - Baja / Nice to Have (6-8 horas)

#### [ ] 8. **Fix Warning de Tailwind en Build** (30 min)
**Prioridad**: 🔵 BAJA
**Problema**: `warn - The utility '' contains an invalid theme value`
**Causa**: className vacío en algún componente
**Impacto**: No bloqueante pero indica código descuidado

#### [ ] 9. **Agregar `@tailwindcss/forms`** (15 min)
**Prioridad**: 🔵 BAJA
**Beneficio**: Estilos consistentes en inputs, selects, checkboxes nativos

#### [ ] 10. **Firebase App Check** (3 horas)
**Prioridad**: 🔵 BAJA
**Beneficio**: Protección adicional contra abuso de Firestore

#### [ ] 11. **Centralizar FAQs** (2 horas)
**Prioridad**: 🔵 BAJA
**Archivos**:
- [ ] `src/components/FAQ.tsx` - Componente reutilizable
- [ ] Separar FAQ del diccionario principal

#### [ ] 12. **Redirects www → non-www** (15 min)
**Prioridad**: 🔵 BAJA
**Archivos**: `vercel.json` o `next.config.mjs`

---

## 📊 RESUMEN DE HORAS PENDIENTES

| Prioridad | Tareas | Tiempo Estimado |
|-----------|--------|-----------------|
| 🟡 Alta (Tests + 500) | 3 tareas | ~15 horas |
| 🟢 Media (UX + SSR) | 4 tareas | ~13 horas |
| 🔵 Baja (Nice to have) | 5 tareas | ~6 horas |
| **TOTAL** | **~12 tareas** | **~34 horas** |

---

## 🗓️ ROADMAP RECOMENDADO

### **SEMANA ACTUAL** (13-19 Abr) - Tests + Producción
- [ ] Tests E2E (5 flujos críticos)
- [ ] Tests unitarios (utilidades core)
- [ ] Página 500 personalizada
- [ ] Fix warning de Tailwind

**Salida**: v0.5.0 - Site listo para producción con tests

---

### **SEMANA SIGUIENTE** (20-26 Abr) - Pulido UX
- [ ] Imágenes reales del equipo
- [ ] Empty states con CTAs
- [ ] SSR translations
- [ ] Volunteer portal - estado de aplicación

**Salida**: v0.6.0 - Site pulido y profesional

---

### **SEMANA 3** (27 Abr - 3 May) - Extras
- [ ] Firebase App Check
- [ ] Centralizar FAQs
- [ ] Redirects www → non-www
- [ ] @tailwindcss/forms

**Salida**: v0.7.0 - Features completas

---

## ✅ DEFINICIONES DE "LISTO"

Una tarea está "LISTA" cuando:

```
✅ Código escrito y probado
✅ No console errors/warnings
✅ Responsive en móvil/tablet/desktop
✅ Validaciones implementadas
✅ Error messages visibles
✅ Tests pasando (si aplica)
✅ Documentado en código
✅ Commit con mensaje claro
✅ CHANGELOG.md actualizado
✅ Tag semántico creado
✅ Release en GitHub creado
```

---

## 📦 VERSIONES RECIENTES

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| **v0.4.0** | 13 Abr 2026 | Volunteer Communication System + reCAPTCHA v3 |
| **v0.3.1** | 11 Abr 2026 | SEO Settings + Email System (Gmail SMTP) |
| **v0.3.0** | ~10 Abr 2026 | Firebase Admin SDK fixes |
| **v0.2.x** | ~Mar 2026 | Admin System base (Blog, Events, Forms) |
| **v0.1.0** | ~Feb 2026 | Sitio público base + traducciones |

---

## 🔗 REFERENCIAS

- Firebase Admin Docs: https://firebase.google.com/docs/firestore
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev/
- Playwright E2E: https://playwright.dev/
- Vitest: https://vitest.dev/
- reCAPTCHA v3: https://www.google.com/recaptcha/admin

---

## 📝 NOTAS IMPORTANTES

### Variables de Entorno Requeridas para Producción
```env
# Firebase (6 variables)
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

# Email (Gmail SMTP)
EMAIL_USER
EMAIL_APP_PASSWORD

# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_MODE

# Cloudinary (3 variables)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# AI y varios
OPENROUTER_API_KEY
NEXT_PUBLIC_SITE_URL

# Newsletter
NEWSLETTER_ADMIN_EMAILS
```

### Colecciones Firestore (14)
`blog_posts`, `events`, `event_registrations`, `volunteer_registrations`, `volunteer_users`, `volunteer_tasks`, `volunteer_messages`, `site_settings`, `seo_settings`, `admin_users`, `forms`, `form_submissions`, `newsletter_subscribers`, `newsletter_history`, `donations`, `ai_generated_content`, `help_requests`
