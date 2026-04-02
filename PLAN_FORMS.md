# 📋 SISTEMA DE FORMULARIOS - Plan de Implementación

**Fecha**: 30 de marzo de 2026 (04:00)
**Estado**: En progreso
**Prioridad**: ALTA

---

## ✅ COMPLETADO

### Estructura Base
- [x] Tipos TypeScript (`src/types/forms.ts`)
- [x] Página admin de formularios (listado)
- [x] Enlace en sidebar de admin

---

## 🚧 PENDIENTE

### Admin - Crear/Editar Formulario (4h)
- [ ] `src/app/admin/forms/new/page.tsx`
- [ ] `src/app/admin/forms/[id]/page.tsx`
- [ ] Componente `src/components/forms/FormBuilder.tsx`
- [ ] Tipos de campos: text, email, textarea, select, radio, checkbox
- [ ] Drag & drop para reordenar campos
- [ ] Vista previa en tiempo real

### Admin - Ver Respuestas (2h)
- [ ] `src/app/admin/forms/[id]/responses/page.tsx`
- [ ] Tabla de respuestas
- [ ] Exportar a CSV
- [ ] Estadísticas básicas

### Pública - Llenar Formulario (3h)
- [ ] `src/app/forms/[id]/page.tsx`
- [ ] Renderizado dinámico de campos
- [ ] Validaciones
- [ ] Mensaje de agradecimiento
- [ ] Redirect opcional

### API Routes (2h)
- [ ] `POST /api/forms` - Crear formulario
- [ ] `PUT /api/forms/[id]` - Actualizar formulario
- [ ] `DELETE /api/forms/[id]` - Eliminar formulario
- [ ] `POST /api/forms/[id]/submit` - Enviar respuesta
- [ ] `GET /api/forms/[id]/responses` - Ver respuestas (admin)

### Integración con Eventos (1h)
- [ ] Agregar campo `eventId` en Form
- [ ] En events edit, mostrar "Crear formulario para este evento"
- [ ] Link directo desde evento a su formulario

---

## 📊 ESTIMADO TOTAL

**Total**: 12 horas

**Distribución**:
- Admin UI: 6h
- Pública UI: 3h
- API: 2h
- Integración: 1h

---

## 🎯 FEATURES MVP

### Formulario Básico
- ✅ Títulos bilingües (EN/ES)
- ✅ Descripción bilingüe
- ✅ Campos ilimitados
- ✅ 9 tipos de campos
- ✅ Campo requerido/opcional
- ✅ Estado (draft/published/closed)

### Tipos de Campos
1. **Text** - Texto corto
2. **Email** - Email con validación
3. **Textarea** - Texto largo
4. **Select** - Dropdown con opciones
5. **Radio** - Selección única
6. **Checkbox** - Selección múltiple
7. **Number** - Número
8. **Date** - Fecha
9. **Phone** - Teléfono

### Configuración
- [ ] Permitir múltiples envíos
- [ ] Mostrar barra de progreso
- [ ] Requerir email
- [ ] URL de redirect después de enviar
- [ ] Mensaje de agradecimiento personalizado

### Respuestas
- [ ] Ver todas las respuestas
- [ ] Exportar CSV
- [ ] Filtrar por fecha
- [ ] Estadísticas básicas

---

## 🔥 PRIORIDADES

### Semana 1 (Crítico)
1. Crear/Editar formulario (4h)
2. API routes básicas (2h)
3. Página pública para llenar (3h)

### Semana 2 (Nice to have)
4. Ver respuestas (2h)
5. Exportar CSV (1h)
6. Integración con eventos (1h)

---

## 💡 NOTAS

- Usar React Hook Form para manejo de formularios
- Zod para validaciones
- Firestore collections: `forms`, `form_submissions`
- Mantener bilingüe todo (EN/ES)
- Responsive design

---

**Próximo paso**: Comenzar con Admin - Crear/Editar Formulario
