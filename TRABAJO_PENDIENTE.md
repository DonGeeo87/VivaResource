# 📋 PLAN DE TRABAJO - TRABAJO PENDIENTE

**Última Actualización**: 30 Mar 2026 (02:00)
**Status Actual**: Fase 6 - Admin System COMPLETADA ✅
**Progreso Total**: 95% (Fases 1-6 completadas ✅)

---

## ✅ FASES COMPLETADAS (1-6)

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

### Fase 3 - Páginas ✅
- 11 páginas funcionando
- Contenido bilingüe verificado

### Fase 4 - Optimización ✅
- Todas las imágenes con Next/Image
- CERO warnings en build

### Fase 5 - Contenido Bilingüe ✅
- Home, About, Resources, Get Help con diccionario
- Donate, Get Involved, Blog, Contact, Events, Privacy con EN/ES hardcoded

### Fase 6 - Admin System ✅ (COMPLETADA 30 Mar)
- Events CRUD completo
- Blog CRUD completo
- Volunteer Management
- File Upload System
- Dashboard con estadísticas
- Donations/PayPal config
- Settings page

### Logo ✅
- Implementado en Header
- Path: `/public/logo.png`
- Tamaño: 50x50px

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS (30 Mar 2026)

### [ ] 1. **Eventos no se ven en página pública** (2 horas) 🔴
**Problema**: Admin muestra 6 eventos, página pública solo 3
**Archivos**: `src/app/events/page.tsx`
**Causa**: Query Firestore o filtros no funcionan correctamente

### [ ] 2. **Blog posts no se ven** (2 horas) 🔴
**Problema**: Admin tiene artículos, página pública vacía
**Archivos**: `src/app/blog/page.tsx`
**Causa**: Falta campo `published_at` o query incorrecto

### [ ] 3. **Get Involved - Traducción** (1 hora) 🔴
**Problema**: Contenido bilingüe hardcoded, no respeta idioma seleccionado
**Archivos**: `src/app/get-involved/page.tsx`

### [ ] 4. **Get Help - Imagen Hero** (30 min) 🟡
**Problema**: Imagen de cabecera se ve mal configurada
**Archivos**: `src/app/get-help/page.tsx`

---

##  FASE 7 - UX IMPROVEMENTS & FIXES

### TIER 1: CRÍTICO - ESTA SEMANA (1-3 Abr)

#### [ ] 5. **Menú Móvil Anidado** (3 horas)
**Descripción**: Mejorar navegación móvil con accordion
**Archivos**: `src/components/Header.tsx`
**Implementación**:
- Submenús para categorías
- Animaciones suaves
- Mejor jerarquía visual

#### [ ] 6. **Newsletter System** (4 horas)
**Descripción**: Sistema básico de suscripción
**Archivos**:
- [ ] `src/app/api/newsletter/route.ts`
- [ ] `src/components/NewsletterForm.tsx`
- [ ] Colección Firestore `newsletter_subscribers`
- [ ] Admin page para ver subscribers

#### [ ] 7. **Resources Page - Contenido Real** (6 horas)
**Descripción**: Reemplazar mockup con contenido real
**Investigación**:
- [ ] Definir estructura de recursos necesarios
- [ ] Buscar/crear PDFs descargables
- [ ] Seleccionar videos educativos (YouTube/vimeo)
- [ ] Verificar links externos

**Implementación**:
- [ ] Colección Firestore `resources`
- [ ] Admin para gestionar recursos
- [ ] Filtros por categoría reales
- [ ] Eliminar contenido falso o marcar "Próximamente"

---

### TIER 2: ALTO - PRÓXIMA SEMANA (4-10 Abr)

#### [ ] 8. **Volunteer Portal** (8 horas)
**Descripción**: Portal para voluntarios aprobados
**Archivos**:
- [ ] `src/app/volunteer-portal/page.tsx`
- [ ] `src/app/admin/volunteers/[id]/page.tsx` (detalle + mensajes)
- [ ] Colección `volunteer_messages`
- [ ] Auth para voluntarios (email/password o magic link)

**Features**:
- [ ] Ver estado de aplicación
- [ ] Mensajes del admin
- [ ] Horarios/tareas asignadas
- [ ] Recursos exclusivos

**Admin Features**:
- [ ] Enviar mensajes a voluntarios
- [ ] Asignar tareas
- [ ] Ver historial

#### [ ] 9. **FAQ Centralizada** (2 horas)
**Descripción**: Unificar FAQs en componente reutilizable
**Archivos**:
- [ ] `src/components/FAQ.tsx`
- [ ] `src/i18n/faq-translations.ts` (separar del diccionario principal)

---

### TIER 3: MEDIO - SEMANA 3 (11-17 Abr)

#### [ ] 10. **Event Filters Fix** (2 horas)
**Descripción**: Filtros de eventos no funcionan correctamente
**Archivos**: `src/app/events/page.tsx`
**Tareas**:
- [ ] Revisar categorías en Firestore
- [ ] Implementar filtros por categoría real
- [ ] Mostrar todos los eventos publicados

#### [ ] 11. **Blog Categories** (2 horas)
**Descripción**: Mejorar sistema de categorías del blog
**Archivos**: `src/app/blog/page.tsx`
**Tareas**:
- [ ] Filtros por categoría funcionales
- [ ] Mostrar fecha de publicación
- [ ] Mejorar excerpt

---

## 📊 RESUMEN DE HORAS

| Categoría | Horas | Prioridad |
|-----------|-------|-----------|
| Fixes Críticos | 5.5 | MUST |
| Tier 1 (UX) | 13 | MUST |
| Tier 2 (Portal) | 10 | SHOULD |
| Tier 3 (Mejoras) | 4 | NICE |
| **TOTAL** | **32.5** | |

**Status**: Fase 6 completa, nuevos issues identificados

---

## 🗓️ ROADMAP ACTUALIZADO

### **SEMANA 1** (31 Mar - 5 Abr) - FIXES & UX
- [ ] Fix eventos no se ven
- [ ] Fix blog no se ve
- [ ] Fix traducción Get Involved
- [ ] Fix imagen Get Help
- [ ] Menú móvil anidado
- [ ] Newsletter system básico

**Salida**: Site 100% funcional sin bugs críticos

---

### **SEMANA 2** (6 Apr - 12 Apr) - CONTENT & PORTAL
- [ ] Resources page con contenido real
- [ ] Volunteer portal MVP
- [ ] Admin messaging system

**Salida**: Portal voluntarios + resources reales

---

### **SEMANA 3** (13 Apr - 19 Apr) - POLISH
- [ ] Event filters fix
- [ ] Blog categories
- [ ] FAQ centralizada
- [ ] Testing manual completo

**Salida**: Site pulido y listo para testing

---

### **SEMANA 4** (20 Apr - 26 Apr) - TESTING & DEPLOYMENT
- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] Performance optimization
- [ ] Deployment setup

**Salida**: Production-ready 🚀

#### [ ] 1. **Events Form - Create/Edit** (6 horas)
**Descripción**: Implementar formulario para crear y editar eventos  
**Archivos Afectados**:
- [ ] `src/app/admin/events/new/page.tsx` - Página crear evento
- [ ] `src/app/admin/events/[id]/page.tsx` - Página editar evento
- [ ] `src/components/forms/EventForm.tsx` - Componente reutilizable
- [ ] `src/app/api/events/route.ts` - POST/PUT endpoints

**Campos del Formulario**:
- [ ] Título (en/es) - required
- [ ] Slug - auto-generate
- [ ] Descripción (en/es)
- [ ] Fecha/Hora - date picker
- [ ] Ubicación - text
- [ ] Categoría - select (workshop/community/fundraiser)
- [ ] Estado - select (draft/published/cancelled)
- [ ] Requiere registro - checkbox
- [ ] Imagen principal - file upload

**Validaciones**:
- [ ] Títulos no vacíos
- [ ] Slug único
- [ ] Fecha en futuro
- [ ] Imagen < 5MB

**Checklist Técnico**:
- [ ] Usar React Hook Form + Zod
- [ ] Validación real-time
- [ ] Loading states
- [ ] Error messages bilingual
- [ ] Toast notifications
- [ ] Redirect después de guardar

**Estimado**: 6 horas  
**Blockers**: Necesita decisión sobre editor de imagen

---

#### [ ] 2. **Blog CRUD System** (6 horas)
**Descripción**: Implementar completo sistema CRUD para blog posts  
**Archivos Afectados**:
- [ ] `src/app/admin/blog/page.tsx` - Mejorar list page
- [ ] `src/app/admin/blog/new/page.tsx` - Create post
- [ ] `src/app/admin/blog/[id]/page.tsx` - Edit post
- [ ] `src/components/forms/BlogForm.tsx` - Form component
- [ ] `src/app/api/blog/route.ts` - API routes

**Campos**:
- [ ] Título (en/es)
- [ ] Slug - auto
- [ ] Contenido (en/es) - rich editor
- [ ] Excerpt (en/es)
- [ ] Imagen destacada
- [ ] Categorías (multi-select)
- [ ] Estado - publicado/borrador

**Editor de Contenido**:
- [ ] Evaluar opciones: Tiptap, ReactMarkdown, o simple textarea
- [ ] Soporte para bold, italic, links, lists
- [ ] Preview de contenido

**API**:
- [ ] POST /api/blog
- [ ] PUT /api/blog/[id]
- [ ] DELETE /api/blog/[id]

**Estimado**: 6 horas  
**Blockers**: Elección de editor rico

---

#### [ ] 3. **Volunteer Registrations Display** (4 horas)
**Descripción**: Mostrar y gestionar registros de voluntarios  
**Archivos Afectados**:
- [ ] `src/app/admin/volunteers/page.tsx` - Mejorar listado
- [ ] `src/components/VolunteerTable.tsx` - Nuevo componente
- [ ] `src/app/admin/volunteers/[id]/page.tsx` - Ver detalles

**Funcionalidades**:
- [ ] Tabla con columnas: Nombre, Email, Teléfono, Posición, Fecha, Estado
- [ ] Filtro por estado (pending/approved/rejected)
- [ ] Buscar por nombre/email
- [ ] Ver detalles completos
- [ ] Actualizar estado (approve/reject)
- [ ] Exportar a CSV
- [ ] Email notificación al cambiar estado

**Estimado**: 4 horas  
**Blockers**: Email system (puede ser mock inicialmente)

---

### TIER 2: ALTO - COMPLETAR PRÓXIMA SEMANA

#### [ ] 4. **File Upload System** (4 horas)
**Descripción**: Implementar carga de imágenes a Firebase Storage  
**Archivos**:
- [ ] `src/components/ImageUpload.tsx` - Componente upload
- [ ] `src/lib/firebase/storage.ts` - Firebase Storage utils
- [ ] `src/app/api/upload/route.ts` - Backend upload

**Funcionalidades**:
- [ ] Drag & drop
- [ ] Validación tamaño (max 5MB)
- [ ] Validación tipo (jpg, png, webp)
- [ ] Progress bar
- [ ] Optimización con next/image
- [ ] Fallback images
- [ ] Delete image

**Paths en Firebase Storage**:
- `/images/events/` - Event images
- `/images/blog/` - Blog images
- `/images/admin/` - Temp uploads

**Estimado**: 4 horas

---

#### [ ] 5. **Email Notification System** (4 horas)
**Descripción**: Configurar sistema de email para notificaciones  
**Archivos**:
- [ ] `.env.local` - SendGrid API key
- [ ] `src/lib/email/templates.ts` - Email templates
- [ ] `src/lib/email/sender.ts` - Email sender function
- [ ] `src/app/api/email/route.ts` - Email endpoint

**Emails a Implementar**:
- [ ] Confirmación registro evento
- [ ] Confirmación registro voluntario
- [ ] Admin: Nuevo evento creado
- [ ] Admin: Nuevo post blogueado
- [ ] Admin: Voluntario nuevo
- [ ] Usuario: Estado voluntario actualizado

**Servicio Recomendado**: SendGrid (gratuito hasta 100 emails/día)

**Estimado**: 4 horas

---

#### [ ] 6. **Dashboard Enhancements** (2 horas)
**Descripción**: Mejorar dashboard con más información  
**Cambios**:
- [ ] Chart: Posts por mes
- [ ] Chart: Eventos próximos vs completados
- [ ] Activity feed: Últimas acciones
- [ ] Quick actions: Crear evento, post, etc
- [ ] Coming soon: Próximos 3 eventos
- [ ] Pending tasks: Voluntarios pendientes

**Estimado**: 2 horas

---

### TIER 3: MEDIO - SEMANA 3

#### [ ] 7. **PayPal Integration** (5 horas)
**Descripción**: Procesamiento de donaciones con PayPal  
**Archivos**:
- [ ] `src/components/DonationButton.tsx` - Button en página público
- [ ] `src/app/admin/donations/page.tsx` - Admin view
- [ ] `src/app/api/payments/route.ts` - Payment processing
- [ ] Webhooks - Confirmación pagos

**Funcionalidades**:
- [ ] Botón donar en página
- [ ] Modal cantidad personalizada
- [ ] Confirmación después pago
- [ ] Admin ve historial transacciones
- [ ] Email confirmación a donor

**Estimado**: 5 horas
**Blocker**: Cuenta PayPal developer

---

#### [ ] 8. **Admin User Management** (2 horas)
**Descripción**: Gestionar usuarios admin del sistema  
**Archivos**:
- [ ] `src/app/admin/users/page.tsx` - User list
- [ ] Admin roles: admin/editor/viewer
- [ ] Crear/eliminar admins
- [ ] Actualizar roles

**Estimado**: 2 horas

---

#### [ ] 9. **Event Calendar/Scheduling** (3 horas)
**Descripción**: Vista calendario de eventos  
**Componentes**:
- [ ] Calendar UI (react-calendar o similar)
- [ ] Drag to reschedule
- [ ] Conflict detection
- [ ] Time zone support

**Estimado**: 3 horas

---

#### [ ] 10. **Admin Settings Page** (2 horas)
**Descripción**: Configuración global del sitio  
**Campos**:
- [ ] Nombre organización
- [ ] Email contacto
- [ ] Teléfono
- [ ] Dirección
- [ ] Links redes sociales
- [ ] Logo/favicon
- [ ] Credenciales PayPal

**Estimado**: 2 horas

---

### TIER 4: TESTING & DEPLOYMENT

#### [ ] 11. **Unit Tests** (4 horas)
**Archivos**:
- [ ] Utilities & helpers
- [ ] Form validation
- [ ] Firebase adapters
- Coverage target: 80%

**Framework**: Vitest + React Testing Library

---

#### [ ] 12. **E2E Tests** (4 horas)
**Scenarios**:
- [ ] Admin login flow
- [ ] Create event workflow
- [ ] Create blog post
- [ ] Edit voluntario status
- [ ] Donation flow

**Framework**: Playwright

---

#### [ ] 13. **Performance Optimization** (3 horas)
**Tasks**:
- [ ] Image optimization (WebP, responsive)
- [ ] Code splitting
- [ ] Lazy loading components
- [ ] Query optimization
- [ ] Lighthouse audit (target 90+)

---

#### [ ] 14. **Deployment Setup** (4 horas)
**Tasks**:
- [ ] Firebase Hosting setup
- [ ] Environment variables
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated backups
- [ ] Error tracking (Sentry)
- [ ] Analytics setup

---

#### [ ] 15. **Documentation** (2 horas)
**Documents**:
- [ ] Admin user guide
- [ ] API documentation
- [ ] Contributing guidelines
- [ ] Deployment guide

---

## 📊 RESUMEN DE HORAS

| Categoría | Horas | Con/Sin |
|-----------|-------|---------|
| Tier 1 (Crítico) | 16 | MUST |
| Tier 2 (Alto) | 12 | SHOULD |
| Tier 3 (Medio) | 12 | NICE |
| Tier 4 (Testing) | 13 | Production |
| **TOTAL** | **53** | |

**Status**: 0% completado (Fase 6 por comenzar), 100% pendiente (53 horas)

**Progreso Total del Proyecto**: 92% completado (Fases 1-5 listas ✅)

---

## 🗓️ ROADMAP SEMANAL

### **SEMANA 1** (30 Mar - 5 Apr) - Tier 1
- [ ] Events Create/Edit completo
- [ ] Blog CRUD implementado  
- [ ] Volunteer display funcionando

**Salida**: Sistema CRUD funcional 100%

---

### **SEMANA 2** (6 Apr - 12 Apr) - Tier 2
- [ ] File uploads
- [ ] Email notifications
- [ ] Dashboard enhanced
- [ ] UI/UX polishing

**Salida**: Todas features core listas

---

### **SEMANA 3** (13 Apr - 19 Apr) - Tier 3
- [ ] PayPal integration
- [ ] Admin settings
- [ ] User management
- [ ] Event calendar

**Salida**: Features avanzadas listas

---

### **SEMANA 4** (20 Apr - 26 Apr) - Tier 4
- [ ] Todos tests (unit + E2E)
- [ ] Performance optimization
- [ ] Deployment setup
- [ ] Documentation

**Salida**: Production-ready 🚀

---

## ✅ DEFINICIONES DE "LISTO"

Una tarea está "LISTA" cuando:

```
✅ Código escrito and tested
✅ No console errors/warnings
✅ Responsive en móvil/tablet/desktop
✅ Validações implementadas
✅ Error messages visibles
✅ Tests pasando (si aplica)
✅ Documentado en código
✅ Commit con mensaje claro
```

---

## 🔗 REFERENCIAS

- Firebase Admin Docs: https://firebase.google.com/docs/firestore
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev/
- Playwright E2E: https://playwright.dev/

