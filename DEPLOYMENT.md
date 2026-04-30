# Guía Despliegue - Viva Resource

## 🚀 Vercel (Recomendado)

### Automático (Windows)
```bash
deploy-vercel.bat
```

### Manual
```bash
npm i -g vercel
vercel login
vercel --prod
```

**Config**: `vercel.json` (Next.js + security headers + AI function 60s)

## 🔥 Firebase Hosting (Alternativa)

```bash
npm i -g firebase-tools
firebase login
firebase use vivaresource
firebase deploy --only hosting
```

**Nota**: API routes solo Vercel (serverless functions).

## 🔄 CI/CD

Vercel auto-deploy on push to `main`.

## 📊 Monitoreo

- Vercel Analytics
- Firebase Console (Firestore/Storage)
- Cloudinary Dashboard

**Post-deploy**:
1. `firebase deploy --only firestore:rules`
2. Verificar `/admin` login
