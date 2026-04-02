# Viva Resource Foundation - Contexto del Proyecto

**Ubicación**: `c:\GeeoDev\vivaresource`
**Última Actualización**: 1 de abril de 2026
**Estado**: 100% Completado ✅ - Listo para producción

---

## 📋 RESUMEN EJECUTIVO

Viva Resource Foundation es un sitio web bilingüe (inglés/español) para una organización sin fines de lucro 501(c)(3) que sirve a comunidades rurales de Colorado. El proyecto está construido con **Next.js 14.2 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS** y **Firebase**.

**Progreso**: 100% completado (Fases 1-6 completadas)
- ✅ Fase 1: Crítico (navegación, estructura)
- ✅ Fase 2: Sistema de traducciones EN/ES
- ✅ Fase 3: Páginas públicas (11 páginas)
- ✅ Fase 4: Optimización de imágenes
- ✅ Fase 5: Contenido bilingüe
- ✅ Fase 6: Sistema Admin completo (CRUD, forms, volunteers, newsletter)

**Build**: 32 páginas generadas exitosamente

---

## 🛠️ STACK TECNOLÓGICO

### Core
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.2.35 | Framework React (App Router) |
| React | 18.x | UI library |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.4.x | Estilos y design system |

### Backend & Servicios
| Servicio | Versión | Propósito |
|----------|---------|-----------|
| Firebase | 12.11.0 | Auth, Firestore, Storage |
| Firebase Admin | 13.7.0 | Operaciones server-side |
| Resend | 6.10.0 | Envío de emails |
| PayPal SDK | 9.1.0 | Procesamiento de donaciones |

### Formularios & Validación
| Librería | Versión | Propósito |
|----------|---------|-----------|
| React Hook Form | 7.72.0 | Gestión de formularios |
| @hookform/resolvers | 5.2.2 | Integración con Zod |
| Zod | 4.3.6 | Validación de esquemas |

### Otros
- **Lucide React** 1.7.0 - Iconos
- **React Quill** 2.0.0 - Editor rich text
- **QRCode React** 4.2.0 - Generación de códigos QR

---

## 📁 ESTRUCTURA DEL PROYECTO

```
vivaresource/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Panel administrativo (CRUD completo)
│   │   ├── api/                # API Routes (newsletter, email, forms)
│   │   ├── blog/               # Página pública del blog
│   │   ├── events/             # Eventos y registros
│   │   ├── forms/              # Formularios públicos dinámicos
│   │   ├── volunteer-portal/   # Portal de voluntarios
│   │   ├── about/              # Sobre la organización
│   │   ├── resources/          # Recursos de Colorado (10 links)
│   │   ├── get-help/           # Página de ayuda
│   │   ├── get-involved/       # Involucrarse
│   │   ├── donate/             # Donaciones (PayPal)
│   │   ├── contact/            # Contacto
│   │   ├── privacy/            # Política de privacidad
│   │   ├── fonts/              # Configuración de fuentes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Estilos globales
│   │   ├── robots.ts           # Robots.txt dinámico
│   │   └── sitemap.ts          # Sitemap dinámico
│   │
│   ├── components/             # Componentes React
│   │   ├── Header.tsx          # Header con navegación y logo
│   │   ├── Footer.tsx          # Footer corporativo
│   │   ├── ImageUpload.tsx     # Upload con drag & drop
│   │   ├── NewsletterForm.tsx  # Formulario newsletter
│   │   ├── Skeleton.tsx        # Loading skeletons
│   │   ├── Toast.tsx           # Notificaciones
│   │   └── forms/              # Componentes de formularios dinámicos
│   │
│   ├── contexts/               # Contextos de React
│   │   ├── LanguageContext.tsx # Traducciones EN/ES
│   │   └── AdminAuthContext.tsx# Autenticación admin
│   │
│   ├── i18n/                   # Internacionalización
│   │   └── translations.ts     # Diccionario EN/ES (~1065 líneas)
│   │
│   ├── lib/                    # Utilidades
│   │   └── firebase/
│   │       ├── config.ts       # Configuración Firebase
│   │       └── storage.ts      # Utilidades de Storage
│   │
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # Tipos TypeScript
│   │   └── forms.ts            # Tipos para formularios dinámicos
│   └── data/                   # Datos estáticos
│
├── public/                     # Assets estáticos
│   ├── logo.png                # Logo oficial (50x50px en header)
│   └── images/                 # Imágenes públicas
│
├── scripts/                    # Scripts de utilidad
│   ├── init-firestore.js       # Inicializar colecciones
│   ├── seed-firestore.js       # Seed de datos
│   ├── add-admin.js            # Agregar admin user
│   └── seed-blog-posts.js      # Seed de blog posts
│
├── .env.local                  # Variables de entorno
├── firebase.json               # Configuración Firebase
├── firestore.rules             # Reglas de seguridad Firestore
├── storage.rules               # Reglas de seguridad Storage
├── tailwind.config.ts          # Design tokens
├── tsconfig.json               # Configuración TypeScript
├── next.config.mjs             # Configuración Next.js
└── package.json                # Dependencias y scripts
```

---

## 🔧 COMANDOS DE DESARROLLO

```bash
# Instalación
npm install

# Desarrollo
npm run dev           # Servidor en http://localhost:3000

# Producción
npm run build         # Build de producción
npm run start         # Servidor de producción

# Linting
npm run lint          # ESLint check

# Scripts de Firebase (ejecutar con node)
node scripts/init-firestore.js
node scripts/seed-firestore.js
node scripts/add-admin.js
node scripts/seed-blog-posts.js
```

### Solución de Problemas de Caché
Si hay errores de caché en el build:
```bash
rmdir /s /q .next && npm run dev
```

---

## 🔐 VARIABLES DE ENTORNO (.env.local)

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vivaresource
NEXT_PUBLIC_FIREBASE_APP_ID=1:1082684651127:web:d07d2f326e6793515a3872
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vivaresource.firebasestorage.app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD59XavutZ5OnNBtgbbyCfgM5JqnwlhO5A
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vivaresource.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1082684651127

# Resend API Key
RESEND_API_KEY=re_i7Qyxk2c_2YfGJjpeCkjxJDwZqkRPa9xk

# Newsletter Admin Emails
NEWSLETTER_ADMIN_EMAILS=vivaresourcefoundation@gmail.com

# PayPal (opcional)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<client_id>
PAYPAL_CLIENT_SECRET=<secret>
PAYPAL_MODE=sandbox
```

---

## 🎨 DESIGN SYSTEM

### Colores Corporativos
| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#025689` | Azul confianza (botones, links) |
| `primary-container` | `#2e6fa3` | Fondos primarios |
| `primary-hover` | `#014a75` | Hover state |
| `secondary` | `#416900` | Verde esperanza (acciones secundarias) |
| `secondary-container` | `#b7f569` | Fondos secundarios |
| `surface` | `#f9f9f9` | Fondo principal |
| `on-surface` | `#1a1c1c` | Texto principal |

### Tipografía
| Fuente | Uso |
|--------|-----|
| Plus Jakarta Sans | Títulos y headlines |
| Public Sans | Cuerpo de texto |

### Sombras Personalizadas
```css
shadow-ambient: 0 2px 8px rgba(26, 28, 28, 0.04)
shadow-ambient-md: 0 4px 16px rgba(26, 28, 28, 0.06)
shadow-ambient-lg: 0 8px 24px rgba(26, 28, 28, 0.08)
shadow-glass: 0 4px 24px rgba(2, 86, 137, 0.08)
```

### Border Radius
- `sm`: 0.5rem
- `DEFAULT`: 0.75rem
- `lg`: 1rem
- `xl`: 1.25rem
- `2xl`: 1.5rem
- `full`: 9999px

---

## 🔥 FIREBASE CONFIGURATION

### Inicialización (Patrón Obligatorio)
```typescript
// src/lib/firebase/config.ts:15
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
```

### Colecciones de Firestore
| Colección | Propósito | Permisos |
|-----------|-----------|----------|
| `blog_posts` | Artículos del blog | Público leer published, editors CRUD |
| `events` | Eventos comunitarios | Público leer published, editors CRUD |
| `event_registrations` | Registros a eventos | Público crear, editors gestionar |
| `volunteer_registrations` | Registro voluntarios | Público crear, editors gestionar |
| `site_settings` | Configuración del sitio | Público leer, admin escribir |
| `admin_users` | Usuarios administrativos | Signed-in leer, admin escribir |
| `forms` | Formularios dinámicos | Público leer, editors CRUD |
| `form_submissions` | Respuestas de formularios | Público crear, editors gestionar |
| `newsletter_subscribers` | Suscriptores newsletter | Público crear, editors gestionar |
| `newsletter_history` | Historial de envíos | Editors CRUD |
| `donations` | Registro de donaciones | Editors leer, server escribir |
| `ai_generated_content` | Contenido IA | Editors CRUD |
| `help_requests` | Solicitudes de ayuda | Público crear, editors gestionar |

### Reglas de Seguridad (firestore.rules)
```javascript
// Helpers
function isSignedIn() { return request.auth != null; }
function isAdmin() {
  return isSignedIn() &&
    get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role == 'admin';
}
function isEditor() {
  return isSignedIn() &&
    get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role in ['admin', 'editor'];
}
```

### Storage Rules
| Path | Lectura | Escritura |
|------|---------|-----------|
| `/images/**` | Público | Editors |
| `/uploads/**` | Signed-in | Admins |

### Admin UID Hardcodeado
```
3TP4IksNrMOfTeEfmjrjiUq31nx2
```

---

## 🌐 SISTEMA DE TRADUCCIONES (EN/ES)

### LanguageContext
- **Hook**: `useLanguage()`
- **Provider**: `LanguageProvider` (envuelve toda la app)
- **Persistencia**: `localStorage` con key `viva-lang`
- **Fallback**: Inglés si no hay provider
- **SSR/CSR**: Usa `isHydrated` para evitar mismatches

### Uso en Componentes
```tsx
"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export function MyComponent() {
  const { language, translations } = useLanguage();
  
  return (
    <h1>{translations.home.heroTitle}</h1>
  );
}
```

### Diccionario
- **Archivo**: `src/i18n/translations.ts` (~1065 líneas, ~65KB)
- **Estructura**: Objeto anidado con claves descriptivas
- **Idiomas**: `en` (inglés), `es` (español)

---

## 📄 RUTAS PÚBLICAS

| Ruta | Propósito | Estado |
|------|-----------|--------|
| `/` | Home page con FAQ y CTAs | ✅ |
| `/about` | Sobre la organización | ✅ |
| `/resources` | 10 recursos de Colorado | ✅ |
| `/get-help` | Formulario de referencia | ✅ |
| `/get-involved` | Voluntariado y apoyo | ✅ |
| `/donate` | Donaciones con PayPal | ✅ |
| `/blog` | Artículos del blog | ✅ |
| `/events` | Eventos comunitarios | ✅ |
| `/contact` | Formulario de contacto | ✅ |
| `/privacy` | Política de privacidad | ✅ |
| `/forms/[id]` | Formularios dinámicos | ✅ |
| `/volunteer-portal` | Portal de voluntarios (auth) | ✅ |

---

## 🔐 RUTAS DE ADMINISTRACIÓN

| Ruta | Propósito | Estado |
|------|-----------|--------|
| `/admin` | Dashboard con estadísticas | ✅ |
| `/admin/blog` | Blog CRUD | ✅ |
| `/admin/events` | Eventos CRUD | ✅ |
| `/admin/volunteers` | Gestión de voluntarios | ✅ |
| `/admin/volunteers/[id]` | Detalle y mensajes | ✅ |
| `/admin/forms` | Formularios dinámicos | ✅ |
| `/admin/forms/new` | Crear formulario | ✅ |
| `/admin/forms/[id]` | Editar formulario | ✅ |
| `/admin/forms/[id]/responses` | Ver respuestas | ✅ |
| `/admin/newsletter` | Gestión de suscriptores | ✅ |
| `/admin/donations` | Configuración PayPal | ✅ |
| `/admin/settings` | Configuración del sitio | ✅ |
| `/admin/login` | Login de administradores | ✅ |

---

## 📝 CONVENCIONES DE CÓDIGO

### Naming Conventions
- **Componentes**: PascalCase (`ClientLayout.tsx`, `Header.tsx`)
- **Rutas**: kebab-case (`/volunteer-portal`, `/admin/login`)
- **Hooks**: camelCase con prefijo `use` (`useAuth`, `useLanguage`)
- **Tipos/Interfaces**: PascalCase (`BlogPost`, `EventRegistration`)
- **Constantes**: UPPER_SNAKE_CASE

### Estructura de Componentes
```tsx
"use client";  // Solo si usa hooks

import { useState } from "react";
import { SomeComponent } from "@/components/SomeComponent";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  title: string;
  count?: number;
}

export default function Component({ title, count = 0 }: Props): JSX.Element {
  const [state, setState] = useState(false);
  
  return <div>{title}</div>;
}
```

### Reglas de TypeScript
- **Return type**: Explícito `JSX.Element`
- **Error handling**: Catch blocks DEBEN usar `unknown` (nunca `any`)
- **Props interface**: Definida arriba del componente
- **Optional props**: Usar `?` con valores por defecto

### Orden de Imports
1. Librerías externas (`react`, `firebase`, etc.)
2. Imports internos con alias (`@/components`, `@/contexts`)
3. Imports relativos (`../`, `./`)

### Tailwind CSS
- Usar valores de `tailwind.config.ts`
- Orden de clases: `[width] [margin/padding] [flex/grid] [colors] [text] [effects]`
- Sombras personalizadas: `shadow-ambient`, `shadow-ambient-md`, `shadow-ambient-lg`

---

## ⚠️ GOTCHAS Y DEBUGGING

### Fallos Silenciosos de Auth
Los usuarios admin que NO están en la colección `admin_users` son automáticamente cerrados sin mensaje de error.

### Hydration Mismatches
El contexto de lenguaje usa `isHydrated` - verificar content mismatches entre SSR/CSR.

### Re-inicialización de Firebase
Múltiples instancias de Firebase causan errores - SIEMPRE verificar `getApps().length === 0`.

### Permisos de Storage
Dos paths con permisos diferentes: `/images/` (público lectura) vs `/uploads/` (solo admins).

### Fallos de Email
Resend API requiere `RESEND_API_KEY` válido. Sandbox usa `onboarding@resend.dev`.

### Form Validation
- Usar SIEMPRE Zod schemas con `@hookform/resolvers`
- Nunca validar manualmente
- El schema DEBE coincidir exactamente con los campos del formulario

### Image Uploads
- **Formatos permitidos**: JPG, PNG, WebP, GIF
- **Tamaño máximo**: 5MB
- **Naming**: `timestamp-randomString.extension`

### Colores No Definidos en Tailwind
El design system NO incluye colores `error-container` ni `on-error-container`. Usar en su lugar:
- `bg-red-50` + `text-red-900` para fondos de error/alerta
- `text-red-600` + `text-red-700` para textos secundarios
- `bg-red-600` para elementos primarios de alerta

### "Missing Error Components" en Desarrollo
El mensaje "missing required error components, refreshing..." indica un error de hidratación de React. Causas comunes:
- Colores de Tailwind no definidos en el config
- Componentes que se renderizan condicionalmente sin key única
- Hooks mal utilizados fuera del árbol de componentes

### Warnings de Imágenes Next.js
Para evitar warnings de Next.js Image:
- **LCP Images**: Agregar `priority` a imágenes above the fold
- **Fill Images**: El padre DEBE tener `position: relative`
- **Width/Height + CSS**: Si usas `className="w-full h-full"`, agregar `style={{ width: '100%', height: '100%' }}`
- **Sizes**: Siempre incluir `sizes` para optimización

### Permisos de Firestore
Si ves "Missing or insufficient permissions":
- Verificar `firestore.rules` permite lectura pública para `blog_posts` y `events`
- Regla: `allow read: if true;` para contenido público
- Regla: `allow create, update, delete: if isEditor();` para admins

---

## 📊 FEATURES IMPLEMENTADAS

### Sistema de Formularios Dinámicos
- ✅ 9 tipos de campos: text, email, textarea, select, radio, checkbox, number, date, phone
- ✅ Builder visual para crear formularios
- ✅ Configuración bilingüe EN/ES
- ✅ Página pública para llenar formularios
- ✅ Vinculación con eventos
- ✅ Estados: draft, published, closed

### Newsletter System
- ✅ Integración con Resend API
- ✅ Formulario público de suscripción
- ✅ Admin panel para gestionar suscriptores
- ✅ Envío de emails desde admin

### Volunteer Portal
- ✅ Portal con autenticación para voluntarios
- ✅ Vista de detalles de voluntario para admins
- ✅ Sistema de mensajes a voluntarios
- ✅ Exportación a CSV

### Events & Blog CRUD
- ✅ Crear, editar, eliminar eventos y posts
- ✅ Upload de imágenes con Firebase Storage
- ✅ Editor rich text (React Quill)
- ✅ Estados: draft, published

### Dashboard Admin
- ✅ Estadísticas en tiempo real
- ✅ Sidebar responsivo
- ✅ Navegación entre módulos
- ✅ Role-based access (admin, editor, viewer)

---

## 🧪 TESTING

**Estado**: No hay framework de testing configurado.

**Recomendado**:
- **Vitest**: Testing unitario
- **Playwright**: Testing E2E

**Testing Manual**: Requerido actualmente.

---

## 📈 PRÓXIMOS PASOS (Tier 4)

### Testing
- [ ] Configurar Vitest para testing unitario
- [ ] Configurar Playwright para testing E2E
- [ ] Escribir tests para componentes críticos
- [ ] Tests de integración para API routes

### Deployment
- [ ] Configurar Firebase Hosting
- [ ] Configurar dominio personalizado
- [ ] SSL/HTTPS
- [ ] CI/CD pipeline

### Optimización
- [ ] Lazy loading de imágenes
- [ ] Code splitting avanzado
- [ ] Optimización de bundle size
- [ ] Performance audit (Lighthouse)

---

## 📚 DOCUMENTACIÓN ADICIONAL

| Archivo | Propósito |
|---------|-----------|
| `AGENTS.md` | Guía para agentes de IA |
| `ESTADO_DEL_PROYECTO.md` | Estado detallado del proyecto |
| `SESSION_COMPLETADA_30_MARZO.md` | Resumen de sesión del 30 Mar |
| `PLAN_FORMS.md` | Plan del sistema de formularios |
| `TRABAJO_PENDIENTE.md` | Tareas pendientes |
| `ANALISIS_PROBLEMAS.md` | Análisis de problemas críticos |
| `CHANGELOG.md` | Historial de cambios |

---

## 🎯 CONTACTO Y ACCESO

### Admin Access
- **URL**: `/admin/login`
- **Email configurado**: `dongeeodev@gmail.com`
- **UID Admin**: `3TP4IksNrMOfTeEfmjrjiUq31nx2`

### Organización
- **Nombre**: Viva Resource Foundation
- **Tipo**: 501(c)(3) Nonprofit Organization
- **Enfoque**: Comunidades rurales de Colorado
- **Email**: `vivaresourcefoundation@gmail.com`

---

## 🚀 QUICK START

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (.env.local)
# Ver sección "VARIABLES DE ENTORNO" más arriba

# 3. Inicializar Firebase (opcional, para datos de prueba)
node scripts/init-firestore.js
node scripts/seed-firestore.js
node scripts/add-admin.js

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir navegador
# http://localhost:3000
# http://localhost:3000/admin/login
```

---

**Última sesión completada**: 30 de marzo de 2026 (03:00)
**Duración de última sesión**: ~5 horas
**Próxima sesión**: Testing y Deployment (Tier 4)
