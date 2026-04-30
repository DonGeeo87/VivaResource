# Esquema Firestore - Viva Resource

## Colecciones Principales

### `admin_users/{uid}`
```ts
AdminUser {
  uid: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  // ...
}
```
**Permisos**: Read signed-in, write admin-only.

### `blog_posts/{id}`
```ts
BlogPost {
  title: string, titleEs?: string
  slug: string
  content: string, contentEs?: string
  status: 'draft'|'published'|'archived'
  // ...
}
```

### `events/{id}` & `event_registrations/{id}`
Events published readable, registrations create public.

### `forms/{id}` & `form_submissions/{id}`
Forms readable, submissions create public.

### `donations/{id}`
Server-side writes only, editors read.

### `volunteer_*` (users/tasks/messages)
Volunteer own data + editors.

### `site_settings/{doc}`
Config global, admin write.

**Ver `firestore.rules` para permisos detallados.**

