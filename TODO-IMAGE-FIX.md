# TODO - Dynamic Site Images Admin

**Objetivo**: Imágenes site (hero, team, pathways) editables desde /admin/images sin rebuild.

## Plan:
- [x] 1. src/lib/site-images.ts ✅
- [x] 2. scripts/seed-site-images.js ✅
- [ ] 3. Update src/app/admin/images/page.tsx (fetch + ImageUpload)
- [ ] 4. src/app/page.tsx + about/page.tsx (dynamic images)
- [ ] 5. Test

**Colección**: `site_images/{key}` { key: 'hero-01', path: '/photo...', url: Cloudinary, updatedAt }

Siguiente: lib util.
