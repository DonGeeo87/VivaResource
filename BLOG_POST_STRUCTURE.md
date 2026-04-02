# 📝 Estructura de Posts del Blog - Viva Resource Foundation

**Importante**: Para que el blog funcione correctamente en modo bilingüe (EN/ES), todos los posts deben seguir esta estructura.

---

## ✅ Estructura Requerida en Firestore

### Colección: `blog_posts`

Cada documento debe tener estos campos:

```javascript
{
  // === TÍTULOS (OBLIGATORIOS) ===
  "title_en": "Post Title in English",
  "title_es": "Título del Post en Español",
  
  // === SLUG (OBLIGATORIO - único) ===
  "slug": "post-title-in-english",
  
  // === EXTRACTOS (OBLIGATORIOS) ===
  "excerpt_en": "Short description in English (1-2 sentences)",
  "excerpt_es": "Descripción corta en español (1-2 oraciones)",
  
  // === CONTENIDO (OBLIGATORIO - HTML) ===
  "content_en": "<p>Full article content in English...</p>",
  "content_es": "<p>Contenido completo del artículo en español...</p>",
  
  // === CATEGORÍA (OBLIGATORIO) ===
  // Valores válidos: "news", "impact", "resources", "events"
  "category": "news",
  
  // === IMAGEN DESTACADA (OBLIGATORIO) ===
  // Usar URLs de Unsplash, Firebase Storage, o CDN confiable
  "featured_image": "https://images.unsplash.com/photo-xxxx?auto=format&fit=crop&w=1200&q=80",
  
  // === AUTOR (OPCIONAL) ===
  "author": "Author Name",
  
  // === ESTADO (OBLIGATORIO) ===
  // Valores válidos: "published", "draft"
  "status": "published",
  
  // === FECHAS (AUTOMÁTICO) ===
  "published_at": Timestamp.now(),
  "created_at": Timestamp.now()
}
```

---

## 📋 Campos Detallados

### 1. Títulos (`title_en`, `title_es`)
- **Tipo**: String
- **Requerido**: Sí (ambos idiomas)
- **Longitud**: 5-100 caracteres
- **Ejemplo**:
  ```javascript
  title_en: "Building Community Resilience in Rural Colorado",
  title_es: "Construyendo Resiliencia Comunitaria en el Colorado Rural"
  ```

### 2. Slug (`slug`)
- **Tipo**: String (URL-safe)
- **Requerido**: Sí
- **Formato**: lowercase, guiones, sin espacios
- **Debe ser único**
- **Ejemplo**:
  ```javascript
  slug: "building-community-resilience-colorado"
  ```

### 3. Extractos (`excerpt_en`, `excerpt_es`)
- **Tipo**: String
- **Requerido**: Sí (ambos idiomas)
- **Longitud**: 50-200 caracteres
- **Propósito**: Vista previa en el grid del blog
- **Ejemplo**:
  ```javascript
  excerpt_en: "How local organizations are coming together to support immigrant families.",
  excerpt_es: "Cómo las organizaciones locales se unen para apoyar a familias inmigrantes."
  ```

### 4. Contenido (`content_en`, `content_es`)
- **Tipo**: String (HTML)
- **Requerido**: Sí (ambos idiomas)
- **Formato**: HTML válido desde Quill.js o editor rich text
- **Debe incluir**: al menos 2-3 párrafos
- **Ejemplo**:
  ```javascript
  content_en: `
    <h2>Introduction</h2>
    <p>Content paragraph...</p>
    <h2>Our Approach</h2>
    <p>More content...</p>
    <blockquote>Inspirational quote...</blockquote>
  `
  ```

### 5. Categoría (`category`)
- **Tipo**: String
- **Requerido**: Sí
- **Valores válidos**:
  - `"news"` - Noticias y actualizaciones
  - `"impact"` - Historias de impacto comunitario
  - `"resources"` - Recursos y guías
  - `"events"` - Eventos y talleres
- **Ejemplo**:
  ```javascript
  category: "impact"
  ```

### 6. Imagen Destacada (`featured_image`)
- **Tipo**: String (URL)
- **Requerido**: Sí
- **Formatos soportados**: JPG, PNG, WebP
- **Tamaño recomendado**: 1200x630px (aspect ratio 16:9)
- **Fuentes recomendadas**:
  - Unsplash: `https://images.unsplash.com/photo-xxxx?auto=format&fit=crop&w=1200&q=80`
  - Firebase Storage: `https://firebasestorage.googleapis.com/...`
- **Ejemplo**:
  ```javascript
  featured_image: "https://images.unsplash.com/photo-1559027615-cd4628902d42?auto=format&fit=crop&w=1200&q=80"
  ```

### 7. Autor (`author`)
- **Tipo**: String
- **Requerido**: No (opcional)
- **Ejemplo**:
  ```javascript
  author: "Viva Resource Team"
  ```

### 8. Estado (`status`)
- **Tipo**: String
- **Requerido**: Sí
- **Valores válidos**:
  - `"published"` - Visible públicamente
  - `"draft"` - Solo visible para admins
- **Ejemplo**:
  ```javascript
  status: "published"
  ```

---

## 🚀 Cómo Crear Posts

### Opción 1: Desde el Admin Panel (Recomendado)

1. Ve a `/admin/blog`
2. Haz clic en "Create New Post"
3. Compleza todos los campos en **INGLÉS** y **ESPAÑOL**
4. Sube una imagen destacada
5. Selecciona la categoría
6. Cambia el estado a "Published"
7. Haz clic en "Save"

### Opción 2: Desde Firestore Console

1. Ve a https://console.firebase.google.com/project/vivaresource/firestore
2. Selecciona la colección `blog_posts`
3. Haz clic en "Add Document"
4. Agrega todos los campos requeridos
5. Usa `Timestamp` para las fechas

### Opción 3: Usando el Script de Seed

```bash
# Ejecuta el script para crear 3 posts de ejemplo
node scripts/seed-blog-posts-bilingual.js
```

---

## ⚠️ Errores Comunes a Evitar

### ❌ MAL
```javascript
{
  title_en: "My Post",  // ❌ Sin título en español
  slug: "My Post",      // ❌ Slug con espacios y mayúsculas
  category: "Other",    // ❌ Categoría inválida
  status: "live"        // ❌ Estado inválido
}
```

### ✅ BIEN
```javascript
{
  title_en: "My Post",
  title_es: "Mi Post",
  slug: "my-post",
  category: "news",
  status: "published"
}
```

---

## 🔍 Verificación de Posts

Después de crear un post, verifica:

1. ✅ Aparece en `/blog` (página pública)
2. ✅ Se ve en ambos idiomas (cambiando EN/ES)
3. ✅ El filtro por categoría funciona
4. ✅ La imagen se carga correctamente
5. ✅ El slug funciona: `/blog/my-post-slug`

---

## 📊 Ejemplo Completo

```javascript
{
  "title_en": "Community Health Workshop Series Launches This Spring",
  "title_es": "Serie de Talleres de Salud Comunitaria se Lanza Esta Primavera",
  "slug": "community-health-workshop-series",
  "excerpt_en": "Free bilingual health education workshops coming to Peyton and surrounding communities.",
  "excerpt_es": "Talleres gratuitos de educación en salud bilingüe llegan a Peyton y comunidades circundantes.",
  "content_en": "<h2>Workshop Topics</h2><p>Our free, bilingual workshops will cover...</p>",
  "content_es": "<h2>Temas de los Talleres</h2><p>Nuestros talleres gratuitos y bilingües cubrirán...</p>",
  "category": "events",
  "featured_image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  "author": "Viva Resource Team",
  "status": "published",
  "published_at": "Timestamp",
  "created_at": "Timestamp"
}
```

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12) para errores
2. Verifica que todos los campos requeridos estén presentes
3. Asegúrate de que el slug sea único
4. Confirma que `status === "published"`

---

**Última actualización**: 1 de abril de 2026
**Versión**: 1.0
