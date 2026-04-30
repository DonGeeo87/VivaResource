const { initializeApp, cert } from 'firebase-admin/app';
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('../vivaresource-firebase-adminsdk-fbsvc-1c15e4d2ee.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const siteImages = [
  { key: 'hero-01', path: '/photo-bank/hero_01.jpg', descriptionEn: 'Home page hero background (slideshow)', descriptionEs: 'Hero de la página principal (presentación)', locations: ['home hero', 'about hero'] },
  { key: 'hero-02', path: '/photo-bank/hero_02.jpg', descriptionEn: 'Home page hero background (slideshow)', descriptionEs: 'Hero de la página principal (presentación)', locations: ['home hero'] },
  { key: 'hero-03', path: '/photo-bank/hero_03.jpg', descriptionEn: 'Home page hero background (slideshow)', descriptionEs: 'Hero de la página principal (presentación)', locations: ['home hero'] },
  { key: 'team-eva', path: '/eva.avif', descriptionEn: 'Team member: Eva photo on home and about', descriptionEs: 'Equipo: Foto de Eva en home y sobre nosotros', locations: ['home Eva', 'about Eva'] },
  { key: 'team-monserrat', path: '/monse.avif', descriptionEn: 'Team member: Monse photo on home and about', descriptionEs: 'Equipo: Foto de Monse en home y sobre nosotros', locations: ['home Monse', 'about Monse'] },
  { key: 'pathway-education', path: '/photo-bank/vivaresource (5).jpg', descriptionEn: 'Pathway section: Education card image', descriptionEs: 'Sección Pathways: Imagen de tarjeta Educación', locations: ['home pathway education'] },
  { key: 'pathway-food', path: '/photo-bank/vivaresource (6).jpg', descriptionEn: 'Pathway section: Food card image', descriptionEs: 'Sección Pathways: Imagen de tarjeta Comida', locations: ['home pathway food'] },
  { key: 'pathway-community', path: '/photo-bank/vivaresource (8).jpg', descriptionEn: 'Pathway section: Community card image', descriptionEs: 'Sección Pathways: Imagen de tarjeta Comunidad', locations: ['home pathway community'] },
  { key: 'get-help-cta', path: '/photo-bank/vivaresource (10).jpg', descriptionEn: 'Call-to-action section background', descriptionEs: 'Fondo de sección de llamado a la acción', locations: ['home get help CTA'] },
  { key: 'login-logo', path: '/logo.png', descriptionEn: 'Logo displayed on login page', descriptionEs: 'Logo mostrado en página de inicio de sesión', locations: ['login logo'] },
];

async function seed() {
  console.log('🌱 Seeding site_images...');
  for (const img of siteImages) {
    await db.collection('site_images').doc(img.key).set({
      ...img,
      updatedAt: Timestamp.now()
    });
    console.log(`✅ ${img.key}`);
  }
  console.log('🎉 Site images seeded!');
}

seed().catch(console.error);
