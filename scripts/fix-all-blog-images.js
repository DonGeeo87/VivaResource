/**
 * Script para reemplazar TODAS las imágenes con URLs 100% confiables
 * Usa imágenes de Unsplash que sabemos que funcionan
 * Uso: node scripts/fix-all-blog-images.js
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../vivaresource-firebase-adminsdk-fbsvc-1c15e4d2ee.json');

// Inicializar Firebase Admin
initializeApp({
  credential: require('firebase-admin').credential.cert(serviceAccount)
});

const db = getFirestore();

// Imágenes 100% confiables de Unsplash (SIN parámetros)
const reliableImages = {
  impact: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8",
  resources: "https://images.unsplash.com/photo-1542838132-92c53300491e",
  events: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
  news: "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
  community: "https://images.unsplash.com/photo-1559027615-cd4628902d42",
  food: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
  health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
  "impact-stories": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b"
};

async function fixAllBlogImages() {
  console.log('🔧 Reemplazando TODAS las imágenes con URLs confiables...\n');
  
  const snapshot = await db.collection('blog_posts').get();
  
  if (snapshot.empty) {
    console.log('❌ No se encontraron posts en Firestore');
    return;
  }
  
  let updated = 0;
  let errors = 0;
  
  for (const doc of snapshot.docs) {
    try {
      const data = doc.data();
      
      // Seleccionar imagen basada en categoría
      let newImageUrl = reliableImages.community; // default
      
      if (data.category === 'impact') {
        newImageUrl = reliableImages.impact;
      } else if (data.category === 'resources') {
        newImageUrl = reliableImages.resources;
      } else if (data.category === 'events') {
        newImageUrl = reliableImages.events;
      } else if (data.category === 'news') {
        newImageUrl = reliableImages.news;
      }
      
      // Actualizar el documento
      await db.collection('blog_posts').doc(doc.id).update({
        featured_image: newImageUrl
      });
      
      console.log(`✅ "${data.title_en}" → ${data.category}`);
      updated++;
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n🎉 ¡Todas las imágenes han sido reemplazadas!`);
  console.log(`   ✅ Actualizados: ${updated} posts`);
  console.log(`   ❌ Errores: ${errors} posts`);
  console.log(`\n🌐 Visita https://vivaresource.vercel.app/blog`);
}

// Ejecutar
fixAllBlogImages().catch(console.error);
