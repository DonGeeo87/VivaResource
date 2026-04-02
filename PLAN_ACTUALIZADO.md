# 📋 PLAN ACTUALIZADO - Viva Resource Foundation

**Fecha**: 30 de marzo de 2026 (02:00)
**Estado**: 95% completado ✅
**Fase 6**: Admin System COMPLETADA ✅

---

## 🎯 RESUMEN EJECUTIVO

### Lo que está COMPLETO ✅
- ✅ 11 páginas públicas funcionando
- ✅ Admin Panel completo (CRUD Events, Blog, Volunteers)
- ✅ File Upload System (Firebase Storage)
- ✅ Dashboard con estadísticas
- ✅ Traducciones EN/ES (mayoría de páginas)
- ✅ Auth de administradores
- ✅ Donations/PayPal config
- ✅ Settings del sitio

### Problemas Críticos Identificados 🔴
1. **Eventos no se ven** - Admin tiene 6, página pública muestra 3
2. **Blog posts no se ven** - Admin tiene artículos, página pública vacía
3. **Get Involved** - No respeta selección de idioma (contenido bilingüe hardcoded)
4. **Get Help Hero** - Imagen de cabecera mal configurada

---

## 📊 PLAN DE TRABAJO ACTUALIZADO

### Semana 1 (31 Mar - 5 Abr) - FIXES & UX BÁSICO
**Horas estimadas**: 12.5 horas

| Prioridad | Tarea | Horas | Estado |
|-----------|-------|-------|--------|
| 🔴 | Fix eventos no se ven | 2h | Pendiente |
| 🔴 | Fix blog posts no se ven | 2h | Pendiente |
| 🔴 | Fix Get Involved traducción | 1h | Pendiente |
| 🟡 | Fix Get Help imagen | 0.5h | Pendiente |
| 🟡 | Menú móvil anidado | 3h | Pendiente |
| 🟡 | Newsletter system básico | 4h | Pendiente |

**Salida esperada**: Site 100% funcional sin bugs críticos

---

### Semana 2 (6 Abr - 12 Abr) - CONTENIDO & PORTAL
**Horas estimadas**: 14 horas

| Prioridad | Tarea | Horas | Estado |
|-----------|-------|-------|--------|
| 🟡 | Resources page - contenido real | 6h | Pendiente |
| 🟢 | Volunteer portal MVP | 8h | Pendiente |

**Salida esperada**: Resources con información real + portal voluntarios

---

### Semana 3 (13 Abr - 19 Abr) - PULIR
**Horas estimadas**: 6 horas

| Prioridad | Tarea | Horas | Estado |
|-----------|-------|-------|--------|
| 🟢 | Event filters fix | 2h | Pendiente |
| 🟢 | Blog categories | 2h | Pendiente |
| 🟢 | FAQ centralizada | 2h | Pendiente |

**Salida esperada**: Site pulido y listo para testing

---

### Semana 4 (20 Abr - 26 Abr) - TESTING & DEPLOYMENT
**Horas estimadas**: 13 horas

| Prioridad | Tarea | Horas | Estado |
|-----------|-------|-------|--------|
| 🟢 | Unit tests (Vitest) | 4h | Pendiente |
| 🟢 | E2E tests (Playwright) | 4h | Pendiente |
| 🟢 | Performance optimization | 3h | Pendiente |
| 🟢 | Deployment setup | 2h | Pendiente |

**Salida esperada**: Production-ready 🚀

---

## 📁 ARCHIVOS DE DOCUMENTACIÓN

| Archivo | Propósito |
|---------|-----------|
| `PLAN_ACTUALIZADO.md` | Este archivo - visión general |
| `TRABAJO_PENDIENTE.md` | Tareas detalladas con descripciones |
| `ANALISIS_PROBLEMAS.md` | Problemas identificados y soluciones |
| `ESTADO_DEL_PROYECTO.md` | Estado completo del proyecto |
| `RESUMEN.md` | Vista rápida |
| `.remember/remember.md` | Contexto de sesión |
| `SESSION_30_MARZO_2026.md` | Resumen de la sesión de hoy |

---

## 🔧 NECESIDADES INMEDIATAS

### 1. Fix Eventos (2h)
**Archivos**: `src/app/events/page.tsx`
**Acciones**:
- Revisar query de Firestore
- Verificar campo `status` en eventos
- Comprobar filtros por categoría

### 2. Fix Blog (2h)
**Archivos**: `src/app/blog/page.tsx`
**Acciones**:
- Revisar query de Firestore
- Verificar campo `published_at`
- Comprobar filtro `status === 'published'`

### 3. Fix Get Involved (1h)
**Archivos**: `src/app/get-involved/page.tsx`
**Acciones**:
- Agregar traducciones al diccionario
- Reemplazar texto hardcoded EN/ES
- Usar `useLanguage()` correctamente

### 4. Fix Get Help Image (0.5h)
**Archivos**: `src/app/get-help/page.tsx`
**Acciones**:
- Reemplazar URL de imagen
- Ajustar `object-fit` y `sizes`

### 5. Menú Móvil Anidado (3h)
**Archivos**: `src/components/Header.tsx`
**Acciones**:
- Implementar accordions para submenús
- Mejorar jerarquía visual
- Animaciones suaves

### 6. Newsletter System (4h)
**Archivos Nuevos**:
- `src/app/api/newsletter/route.ts`
- `src/components/NewsletterForm.tsx`

**Acciones**:
- Crear colección `newsletter_subscribers`
- API route para guardar emails
- Formulario componente
- Admin page para ver/exportar

---

## ️ FIRESTORE COLLECTIONS

### Existentes ✅
- `blog_posts`
- `events`
- `event_registrations`
- `volunteer_registrations`
- `site_settings`
- `admin_users`

### Necesarias 🆕
- `newsletter_subscribers` (Semana 1)
- `resources` (Semana 2)
- `volunteer_messages` (Semana 2)
- `volunteer_portal_access` (Semana 2)

---

## 📉 MÉTRICAS ACTUALES

- **Progreso**: 95% ✅
- **Fases Completas**: 6 de 6
- **Build**: ✅ Exitoso
- **Lint**: ✅ Sin errores
- **Páginas**: 26 generadas

---

##  PRÓXIMOS PASOS INMEDIATOS

**Mañana (31 Mar)**:
1. Fix eventos no se ven (2h)
2. Fix blog posts no se ven (2h)

**Miércoles (1 Abr)**:
3. Fix Get Involved traducción (1h)
4. Fix Get Help imagen (0.5h)
5. Comenzar menú móvil anidado (3h)

**Jueves (2 Abr)**:
6. Newsletter system (4h)

**Viernes (3 Abr)**:
- Testing manual de todos los fixes
- Revisar Firestore data
- Planificar Semana 2

---

## 💡 NOTAS IMPORTANTES

1. **Prioridad Cero**: Los fixes críticos (eventos, blog, traducciones) deben hacerse primero
2. **Firestore**: Verificar que los datos existan y tengan los campos correctos
3. **Traducciones**: Usar siempre el diccionario, no hardcoded
4. **Imágenes**: Usar Next/Image con sizes apropiados
5. **Documentación**: Mantener actualizado TRABAJO_PENDIENTE.md

---

**Última actualización**: 30 de marzo de 2026 (02:00)
**Próxima revisión**: 5 de abril de 2026
