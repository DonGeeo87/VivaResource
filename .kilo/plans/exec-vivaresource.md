# Plan de ejecución: Cambios Viva Resource

## Tareas priorizadas (orden de ejecución)

### Onda 1 — Rebrand global + Herramientas admin
| # | Tarea | Archivos |
|---|-------|----------|
| 1a | Rebrand core (metadata, schemas, layout, footer, emails, SEO page) | `layout.tsx`, `metadata.ts`, `SchemaMarkup.tsx`, `Footer.tsx`, `notifications.ts`, `admin/seo/page.tsx` |
| 1b | Rebrand contenido + docs (traducciones, páginas públicas, newsletter, docs) | `translations.ts`, `blog/[slug]/page.tsx`, `page.tsx`, `events/page.tsx`, `NewsletterBuilder.tsx`, `README.md`, `CONTRIBUTING.md`, `TODO.md`, AGENTS.md |
| 1c | Script add-admin.js reutilizable por CLI | `scripts/add-admin.js` |

### Onda 2 — Reportes periódicos + Notificaciones inmediatas + Config de admin
| # | Tarea | Archivos |
|---|-------|----------|
| 2a | Sección “Reportes y Notificaciones” en admin/settings | `admin/settings/page.tsx` |
| 2b | Endpoint `/api/reports/send` y extensión `/api/email/notify` | `api/reports/send/route.ts` (new), `api/email/notify/route.ts` |
| 2c | Notificación inmediata help requests + integración get-help | `get-help/page.tsx`, `api/email/notify/route.ts` |
| 2d | Integración notificaciones event-registration y form-submission | `api/events/[id]/registrations/route.ts`, `api/forms/notify/route.ts` |

### Onda 3 — Tracking de usuarios + Certificado de voluntario
| # | Tarea | Archivos |
|---|-------|----------|
| 3a | Normalizar email + página admin/users con directorio público | `admin/users/page.tsx` |
| 3b | Perfil de usuario [email] con historial + notas admin | `admin/users/[email]/page.tsx` (new) |
| 3c | Solicitud de certificado en volunteer-portal y admin | `types/volunteer.ts`, `volunteer-portal/page.tsx`, `admin/volunteers/certificates/page.tsx` (new) |

### Onda 4 — Favicon + OG + Env docs
| # | Tarea | Archivos |
|---|-------|----------|
| 4a | Favicon + OG image absolutas | `layout.tsx` ya modificado en onda 1, verificar `metadata` |
| 4b | Agregar REPORT_SECRET a env y AGENTS.md | `.env.local` (instrucción), AGENTS.md |

### Post-deploy
- Configurar cron-job.org con `X-Report-Secret: 42ZQ7aVxVnxPNWzr1axtNyBR1CzsRJsLqM1d0ev77Ic=` (ya proporcionado por el usuario).
- Crear usuario admin `vivaresourcefoundation@gmail.com` en Firebase Auth, copiar UID y ejecutar script.
