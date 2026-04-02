/**
 * Script para actualizar URLs de imágenes en posts existentes
 * Elimina parámetros conflictivos de las URLs de Unsplash
 * Uso: node scripts/update-blog-images.js
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../vivaresource-firebase-adminsdk-fbsvc-1c15e4d2ee.json');

// Inicializar Firebase Admin
initializeApp({
  credential: require('firebase-admin').credential.cert(serviceAccount)
});

const db = getFirestore();

// Mapeo de imágenes limpias por categoría
const categoryImages = {
  impact: "https://images.unsplash.com/photo-1559027615-cd4628902d42?w=1200",
  resources: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200",
  events: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
  news: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200"
};

async function updateBlogImages() {
  console.log('🔄 Actualizando imágenes de blog posts...\n');
  
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
      let newImageUrl = data.featured_image;
      
      // Si la URL tiene parámetros conflictivos, la reemplazamos
      if (data.featured_image && data.featured_image.includes('auto=format')) {
        // Extraer el ID de la foto de Unsplash
        const photoId = data.featured_image.match(/photo-([a-zA-Z0-9_-]+)/);
        
        if (photoId) {
          // Usar URL simple
          newImageUrl = `https://images.unsplash.com/${photoId[0]}?w=1200`;
        }
      }
      
      // Si no hay imagen, usar placeholder por categoría
      if (!data.featured_image) {
        newImageUrl = categoryImages[data.category] || categoryImages.news;
      }
      
      // Actualizar el documento
      await db.collection('blog_posts').doc(doc.id).update({
        featured_image: newImageUrl
      });
      
      console.log(`✅ "${data.title_en}" - Imagen actualizada`);
      updated++;
      
    } catch (error) {
      console.error(`❌ Error actualizando "${data.title_en}":`, error.message);
      errors++;
    }
  }
  
  console.log(`\n🎉 Actualización completa!`);
  console.log(`   ✅ Actualizados: ${updated} posts`);
  console.log(`   ❌ Errores: ${errors} posts`);
  console.log(`\n🌐 Visita https://vivaresource.vercel.app/blog para ver los cambios`);
}

// Ejecutar actualización
updateBlogImages().catch(console.error);
