# Despliegue - Viva Resource

> **Este documento reemplaza la guía vieja de Vercel.** El sitio **no** se despliega en
> Vercel ni en Firebase Hosting: corre en un VPS propio como contenedor Docker.

Producción: **https://www.vivaresource.com** (el apex `vivaresource.com` hace 308 → www).
Staging: `viva.codigoguerrero.dev`.

## Arquitectura

| Pieza | Valor |
|---|---|
| VPS | `62.146.227.146` (clave `~/.ssh/vps_dongeeo87_new`) |
| Directorio | `/opt/codigo-guerrero/viva-migracion` |
| Compose | `docker-compose.migracion.yml` |
| App | contenedor `viva-migracion` (Next.js 14 standalone, `expose: 3000`, sin `ports:`) |
| Base de datos | contenedor `viva-migracion-db` (PostgreSQL, DB `vivaresource_blog`, user `vivaresource`) |
| Reverse proxy | nginx-proxy-manager (NPM); red externa `proxy-network`; vhost `proxy_host/52.conf` |
| TLS | Let's Encrypt vía NPM, cert `npm-52` (los 3 nombres en un solo server block) |
| Repo / rama | `DonGeeo87/VivaResource`, rama de trabajo **`migracion-vps`** |

Verificado 30/09/2026: **`www.vivaresource.com` lo sirve `viva-migracion`** (rama
`migracion-vps`). El único contenedor legado que sigue arriba es `vivaresource-db`
(PostgreSQL viejo) — no lo confundas con `viva-migracion-db`, que es el de producción.

El vhost y el cert viven **dentro** del contenedor de NPM (y su volumen), no en una ruta
del host: para verlos o editarlos hay que entrar con `docker exec`.

## Deploy por CI (camino preferido)

Push a la rama `migracion-vps` dispara `.github/workflows/deploy-migracion.yml`
("Deploy Viva Migracion to VPS"):

1. Checkout del repo.
2. Reconstruye el `.env` **completo** desde los GitHub Secrets (no se copia del repo ni se
   depende del `.env` del VPS). Si falta `JWT_SECRET`, el workflow **aborta**.
3. SCP del código al VPS.
4. SSH → `docker compose build --no-cache && down && up -d`.

### Secrets requeridos (Settings → Secrets and variables → Actions)

Infraestructura: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

Proyecto: `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`,
`NEXT_PUBLIC_CLOUDINARY_*`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_FB_APP_ID`,
`FIREBASE_ADMIN_KEY`, `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `NEWSLETTER_ADMIN_EMAILS`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RECAPTCHA_SECRET_KEY`, `PAYPAL_CLIENT_SECRET`,
`OPENROUTER_API_KEY`, `REPORT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `PGPASSWORD`,
**`JWT_SECRET`**.

## Deploy manual (cuando la cuota de GitHub Actions está agotada)

Procedimiento validado el 30/09/2026. Regla de oro: **el `.env` y el
`docker-compose.migracion.yml` del VPS NO se sobreescriben nunca** — el compose del VPS
tiene variables que el repo no tiene (`LLM_URL`, `COMMANDCODE_API_KEY`) y el `.env` guarda
los secretos reales. Por eso se excluyen del paquete.

```bash
# 1) Empaquetar el working tree SIN .env ni compose
cd /e/Projects/Coding/vivaresource
tar -czf "$TMPDIR/viva-code.tar.gz" --exclude=node_modules --exclude=.next \
  --exclude=.git --exclude='.env*' --exclude=docker-compose.migracion.yml .

# 2) Subir y desplegar
scp "$TMPDIR/viva-code.tar.gz" root@62.146.227.146:/tmp/
ssh root@62.146.227.146
cd /opt/codigo-guerrero/viva-migracion
tar -xzf /tmp/viva-code.tar.gz && rm -f /tmp/viva-code.tar.gz
docker compose -f docker-compose.migracion.yml build --no-cache    # ~4-5 min
docker compose -f docker-compose.migracion.yml up -d               # recrea solo la app
```

Notas confirmadas:

- El **build no tumba el sitio**: el contenedor viejo sigue sirviendo. El corte real es el
  swap (`up -d`), de segundos.
- `up -d` es más suave que `down && up -d`: no reinicia el contenedor de la DB.
- `docker compose up -d` puede quedar **colgado** en la sesión SSH después de recrear el
  contenedor. El deploy ya está hecho igual: verificá contra producción antes de insistir.
- Al arrancar, el log muestra `relation "idx_collections_name" already exists, skipping`
  — es benigno (el schema ya existe), no es un error de arranque.
- Si hay que agregar una variable al compose, se parchea **en el VPS** (por ejemplo con
  `sed`) y además en el repo para que el CI lo mantenga. Backups con sufijo `.bak-<motivo>.<ts>`.

## `JWT_SECRET` (obligatorio)

Las sesiones del panel se firman con este secreto (`src/lib/auth/jwt.ts`). **En producción
la app no cae al valor por defecto del repo**: si la variable falta, `signToken()` lanza y
`verifyToken()` rechaza todo — el panel no deja iniciar sesión. Es a propósito (fail closed):
el default está publicado en el repo y permitiría fabricarse un token de admin.

- Vive en el `.env` del VPS + `environment` del `docker-compose.migracion.yml` + el secret
  `JWT_SECRET` de GitHub.
- **Cambiarlo invalida todas las sesiones activas**: los usuarios del panel deben
  re-loguearse (`localStorage['viva_admin_token']` queda inválido).

## Verificación post-deploy

```bash
# páginas públicas y endpoints públicos de lectura (200)
for u in / /about /blog /get-help /donate /es /api/db/events /api/db/site_settings; do
  printf '%-26s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' https://www.vivaresource.com$u)"; done

# colecciones privadas (401)
for u in /api/db/admin_users /api/db/participants; do
  printf '%-26s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' https://www.vivaresource.com$u)"; done
```

En el VPS: `docker ps --filter name=viva-migracion`,
`docker exec viva-migracion printenv JWT_SECRET | wc -c` (no debe ser 0) y
`docker logs viva-migracion | grep -c 'JWT_SECRET no configurado'` (debe ser 0).

## Rollback

No hay rollback automático. Para volver a la versión anterior: `git checkout <commit>`,
volver a empaquetar y repetir el deploy manual. Los backups que deja cada deploy del `.env`
y del compose quedan como `.env.bak-<motivo>.<ts>` y `docker-compose.migracion.yml.bak-<motivo>.<ts>`.

## Certificados TLS

El cert lo emite NPM (Let's Encrypt). La renovación propia de NPM está desincronizada en
este VPS (pide ids de certificados que ya no existen), así que la de Viva la hace
**`/root/.hermes/scripts/viva-cert-guard.sh`** (cron 05:30 diario): renueva con
`certbot renew` sin depender de NPM, recarga nginx, verifica el certificado realmente
servido por internet y avisa por Telegram (`notify.sh`) solo si hay problema.

Pitfall del reto ACME: el vhost debe tener `root /data/letsencrypt-acme-challenge;`.
`/tmp/letsencrypt-lib` es el `--work-dir` de certbot, **no** un webroot válido.

## Monitoreo

- Avisos internos por Telegram: `bash /root/.hermes/scripts/notify.sh "TITULO" "cuerpo"`
  (los scripts que leen `TELEGRAM_BOT_TOKEN` del entorno quedan mudos bajo cron).
- Log del guardián de cert: `/root/viva_cert_guard.log`.
- Cloudinary Dashboard (imágenes), Google Search Console (SEO).
