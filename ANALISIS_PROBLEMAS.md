# 🔍 ANÁLISIS DE PROBLEMAS - Viva Resource Foundation

**Fecha**: 30 de marzo de 2026
**Prioridad**: Crítico - UX y Funcionalidad

---

## 📋 PROBLEMAS IDENTIFICADOS

### 1. 🎨 HEADER / NAVEGACIÓN
**Problema**: Menú en pantallas pequeñas se ve amontonado
**Impacto**: Mala UX en móvil
**Solución**: Implementar menú anidado/accordion para móvil

---

### 2. 🖼️ GET HELP - IMAGEN DE CABECERA
**Problema**: Imagen está mal configurada (se ve pixelada/deforme)
**Ubicación**: `src/app/get-help/page.tsx` - Hero section
**Solución**: Reemplazar con imagen de mejor calidad o ajustar object-fit

---

### 3. 📄 RESOURCES PAGE - MOCKUP
**Problema**: Página es solo un mockup, no tiene contenido real
**Faltantes**:
- [ ] Descargas disponibles (PDFs)
- [ ] Videos educativos
- [ ] Links externos verificados
- [ ] Directorio de recursos real

**Solución**: 
- Definir estructura de datos para recursos
- Crear colección Firestore `resources`
- Implementar filtro por categoría real
- Eliminar secciones falsas o marcar como "Próximamente"

---

### 4. 📅 EVENTS PAGE - EVENTOS NO SE VEN
**Problema**: Admin muestra 6 eventos, página pública solo 3
**Causas posibles**:
- Filtro `status === 'published'` no funciona
- Categorías no están bien definidas
- Filtros de eventos no funcionan

**Solución**:
- Revisar query de Firestore
- Verificar datos en Firestore (campos correctos)
- Implementar filtros por categoría funcional

---

### 5. 📧 NEWSLETTER - SIN GESTIÓN
**Problema**: No hay sistema para gestionar newsletter subscribers
**Faltantes**:
- [ ] Colección Firestore `newsletter_subscribers`
- [ ] API route para suscripciones
- [ ] Admin page para ver/exportar subscribers
- [ ] Integración con servicio de email (Mailchimp/SendGrid)

**Solución**:
- Crear sistema básico de suscripción
- Guardar emails en Firestore
- Crear página admin para gestionar

---

### 6. 📝 BLOG - ARTÍCULOS NO SE VEN
**Problema**: Admin tiene artículos, página pública no muestra
**Causas posibles**:
- Filtro `status === 'published'` no funciona
- Falta campo `published_at`
- Error en el query de Firestore

**Solución**:
- Revisar query y filtros
- Verificar datos en Firestore
- Asegurar que los posts tengan `published_at`

---

### 7. 🌐 GET INVOLVED - TRADUCCIÓN
**Problema**: Contenido en bilingüe hardcoded, no respeta selección de idioma
**Solución**:
- Usar diccionario de traducciones
- Eliminar texto hardcoded EN/ES junto
- Mostrar solo idioma seleccionado

---

### 8. ❓ FAQS - DUPLICADAS
**Problema**: FAQs en Home y Contact
**Solución**:
- Centralizar FAQs en un componente
- Usar misma data para ambas páginas
- O crear FAQs específicas por página

---

### 9. 👥 VOLUNTEER PORTAL - INEXISTENTE
**Problema**: No hay portal para voluntarios aprobados
**Faltantes**:
- [ ] Página `/volunteer-portal` (privada)
- [ ] Auth para voluntarios
- [ ] Ver aplicaciones aprobadas
- [ ] Mensajes del admin
- [ ] Horarios/tareas asignadas
- [ ] Admin: enviar mensajes a voluntarios

**Solución**:
- Crear colección `volunteer_messages`
- Página portal con auth
- Admin: UI para enviar mensajes

---

## 🎯 PRIORIDADES

### Tier 1 - Crítico (Esta Semana)
1. ✅ Fix imagen Get Help
2. ✅ Fix eventos no se ven
3. ✅ Fix blog no se ve
4. ✅ Fix traducción Get Involved

### Tier 2 - Alto (Próxima Semana)
5. ✅ Menú móvil anidado
6. ✅ Sistema newsletter básico
7. ✅ Resources - definir estructura real

### Tier 3 - Medio
8. ✅ Volunteer Portal MVP
9. ✅ Centralizar FAQs

---

## 📊 ESTADO ACTUAL DE FIRESTORE

### Collections Existentes
- `blog_posts` ✅
- `events` ✅
- `event_registrations` ✅
- `volunteer_registrations` ✅
- `site_settings` ✅
- `admin_users` ✅

### Collections Faltantes
- [ ] `newsletter_subscribers`
- [ ] `resources`
- [ ] `volunteer_messages`
- [ ] `volunteer_portal_access`

---

## 🔧 ACCIONES INMEDIATAS

1. **Revisar Firestore data** - Verificar campos de events y blog_posts
2. **Fix queries** - Asegurar que filtros funcionen
3. **Actualizar traducciones** - Get Involved page
4. **Crear colección newsletter** - Sistema básico
5. **Definir estructura resources** - Qué información real necesitamos

---

**Documentación creada**: 30 de marzo de 2026
**Próxima revisión**: 2 de abril de 2026
