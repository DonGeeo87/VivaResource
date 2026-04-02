# 🚀 Deploy a Vercel - Guía Rápida

## ⚠️ PROBLEMA ACTUAL

**Vercel no tiene variables de entorno configuradas**

Todos los deployments fallan porque el build de Next.js necesita las variables de Firebase y Resend.

---

## ✅ SOLUCIÓN (5 minutos)

### Paso 1: Abrir Dashboard de Vercel
```bash
start https://vercel.com/dongeeo87s-projects/vivaresource/settings/environment-variables
```

### Paso 2: Agregar Variables de Entorno

Copia y pega cada una de estas variables en el dashboard de Vercel:

| Nombre | Valor | Environment |
|--------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `vivaresource` | Production |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1082684651127:web:d07d2f326e6793515a3872` | Production |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `vivaresource.firebasestorage.app` | Production |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyD59XavutZ5OnNBtgbbyCfgM5JqnwlhO5A` | Production |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `vivaresource.firebaseapp.com` | Production |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1082684651127` | Production |
| `RESEND_API_KEY` | `re_i7Qyxk2c_2YfGJjpeCkjxJDwZqkRPa9xk` | Production |
| `NEWSLETTER_ADMIN_EMAILS` | `vivaresourcefoundation@gmail.com` | Production |
| `OPENROUTER_API_KEY` | `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` | Production |

### Paso 3: Guardar y Redeploy

1. Haz clic en **"Save"** después de agregar cada variable
2. Cuando termines, ejecuta:
   ```bash
   vercel --prod
   ```

---

## 🎯 URLs Importantes

- **Dashboard de Variables**: https://vercel.com/dongeeo87s-projects/vivaresource/settings/environment-variables
- **Deployments**: https://vercel.com/dongeeo87s-projects/vivaresource/deployments
- **Preview más reciente**: https://vivaresource-o1bb87ikc-dongeeo87s-projects.vercel.app

---

## 🔍 Verificación

Después de configurar las variables y hacer deploy:

1. Abre: https://vercel.com/dongeeo87s-projects/vivaresource
2. Verifica que el estado sea **"Ready"** (no "Error")
3. Abre el preview y verifica que:
   - ✅ Home page carga
   - ✅ Blog page carga
   - ✅ Events page carga
   - ✅ Admin login funciona

---

## 📝 Notas Importantes

### ¿Por qué fallaba antes?
- Firebase Hosting requería Storage setup (que no pudimos activar)
- Por eso migramos a Vercel ✅
- **PERO** Vercel necesita las variables de entorno configuradas manualmente

### ¿Por qué las variables son necesarias?
- Next.js necesita las variables de Firebase **en el build**
- Sin ellas, el build falla con "exit code 1"
- Vercel NO importa automáticamente las variables de `.env.local`

### ¿Production vs Development?
- Configura las variables para **Production** (producción)
- Opcionalmente puedes agregarlas para **Preview** y **Development**

---

## 🆘 Si Algo Sale Mal

**Error: "Build failed"**
→ Verifica que TODAS las variables estén agregadas en Vercel

**Error: "Firebase: No Firebase App"**
→ Revisa que `NEXT_PUBLIC_FIREBASE_PROJECT_ID` esté correcta

**Error: "Resend API key invalid"**
→ Verifica que `RESEND_API_KEY` esté copiada correctamente

---

**Fecha**: 1 de abril de 2026
**Estado**: Pendiente configurar variables en Vercel
**Proyecto**: vivaresource
**Org**: dongeeo87s-projects
