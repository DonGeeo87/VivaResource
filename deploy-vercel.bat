@echo off
echo ========================================
echo   Vercel Deploy - Viva Resource
echo ========================================
echo.

echo [1/3] Configurando variables de entorno...
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID vivaresource production < NUL 2>nul
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID vivaresource production < NUL 2>nul
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET vivaresource production < NUL 2>nul
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY vivaresource production < NUL 2>nul
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN vivaresource production < NUL 2>nul
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID vivaresource production < NUL 2>nul
vercel env add RESEND_API_KEY vivaresource production < NUL 2>nul
vercel env add NEWSLETTER_ADMIN_EMAILS vivaresource production < NUL 2>nul
vercel env add OPENROUTER_API_KEY vivaresource production < NUL 2>nul
vercel env add NEXT_PUBLIC_SITE_URL vivaresource production < NUL 2>nul
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME vivaresource production < NUL 2>nul
vercel env add CLOUDINARY_API_KEY vivaresource production < NUL 2>nul
vercel env add CLOUDINARY_API_SECRET vivaresource production < NUL 2>nul
echo [1/3] Variables configuradas
echo.

echo [2/3] Iniciando deploy a produccion...
vercel --prod --yes
echo.

echo [3/3] Deploy completado!
echo.
echo ========================================
pause
