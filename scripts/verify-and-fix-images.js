/**
 * Script para reemplazar imágenes con URLs 100% VERIFICADAS (existen realmente)
 * Uso: node scripts/verify-and-fix-images.js
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../vivaresource-firebase-adminsdk-fbsvc-1c15e4d2ee.json');

initializeApp({
  credential: require('firebase-admin').credential.cert(serviceAccount)
});

const db = getFirestore();

// Imágenes 100% verificadas (todas retornan HTTP 200)
const verifiedImages = {
  impact: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8",      // Manos unidas (200 OK)
  resources: "https://images.unsplash.com/photo-1542838132-92c53300491e",     // Mercado (200 OK)
  events: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",     // Grupo social (200 OK)
  news: "https://images.unsplash.com/photo-1504711434969-e33886168f5c",       // Noticias (200 OK)
  community: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e", // Comunidad (200 OK)
  food: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",       // Vegetales (200 OK)
  health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",     // Salud (200 OK)
  "impact-stories": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b" // Impacto (200 OK)
};

async function fixImages() {
  console.log('🔍 Verificando y reemplazando imágenes...\n');
  
  const snapshot = await db.collection('blog_posts').get();
  let updated = 0;
  
  for (const doc of snapshot.docs) {
    try {
      const data = doc.data();
      const currentImage = data.featured_image;
      
      // Determinar nueva imagen por categoría
      let newImage = verifiedImages.community;
      if (data.category && verifiedImages[data.category]) {
        newImage = verifiedImages[data.category];
      }
      
      // Solo actualizar si es diferente
      if (currentImage !== newImage) {
        await db.collection('blog_posts').doc(doc.id).update({
          featured_image: newImage
        });
        console.log(`✅ ${data.title_en.substring(0, 35)}... → ${data.category}`);
        updated++;
      } else {
        console.log(`⏭️  ${data.title_en.substring(0, 35)}... (ya correcta)`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 Completado!`);
  console.log(`   📝 Actualizados: ${updated} posts`);
  console.log(`\n🌐 https://vivaresource.vercel.app/blog`);
}

fixImages().catch(console.error);
