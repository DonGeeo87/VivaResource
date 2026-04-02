import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Cargar credenciales de servicio
const serviceAccount = JSON.parse(
  readFileSync('./firebase-service-account.json', 'utf-8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function initializeCollections() {
  console.log('🚀 Inicializando colecciones de Firestore...');

  // 1. Configuraciones iniciales del sitio
  const settings = {
    'organization_name': {
      value: 'Viva Resource Foundation',
      category: 'general',
      description: 'Nombre de la organización',
      updated_at: new Date()
    },
    'organization_email': {
      value: 'vivaresourcefoundation@gmail.com',
      category: 'general',
      description: 'Email de contacto',
      updated_at: new Date()
    },
    'organization_phone': {
      value: '(719) 555-0123',
      category: 'general',
      description: 'Teléfono de contacto',
      updated_at: new Date()
    },
    'organization_address': {
      value: '13055 Bradshaw Drive #301, Peyton, CO 80831',
      category: 'general',
      description: 'Dirección física',
      updated_at: new Date()
    },
    'paypal_email': {
      value: '',
      category: 'payments',
      description: 'Email de PayPal para donaciones',
      updated_at: new Date()
    },
    'paypal_mode': {
      value: 'sandbox',
      category: 'payments',
      description: 'Modo de PayPal: sandbox o live',
      updated_at: new Date()
    },
    'facebook_url': {
      value: 'https://facebook.com/vivaresource',
      category: 'social',
      description: 'URL de Facebook',
      updated_at: new Date()
    },
    'instagram_url': {
      value: 'https://instagram.com/vivaresource',
      category: 'social',
      description: 'URL de Instagram',
      updated_at: new Date()
    },
    'default_meta_title': {
      value: 'Viva Resource Foundation - Building Hope in Rural Communities',
      category: 'seo',
      description: 'Título por defecto para SEO',
      updated_at: new Date()
    },
    'default_meta_description': {
      value: 'Empowering rural communities through sustainable resources and collective action.',
      category: 'seo',
      description: 'Descripción por defecto para SEO',
      updated_at: new Date()
    }
  };

  console.log('📝 Creando configuraciones iniciales...');
  for (const [id, data] of Object.entries(settings)) {
    await db.collection('site_settings').doc(id).set(data);
    console.log(`  ✅ ${id}`);
  }

  // 2. Crear documento placeholder para admin_users (para evitar errores)
  console.log('📝 Verificando colección admin_users...');
  const adminDoc = await db.collection('admin_users').doc('_placeholder').get();
  if (!adminDoc.exists) {
    await db.collection('admin_users').doc('_placeholder').set({
      _placeholder: true,
      created_at: new Date(),
      note: 'No eliminar - usado para validaciones'
    });
    console.log('  ✅ Colección admin_users inicializada');
  }

  // 3. Revisar colecciones existentes
  console.log('\n📊 Estado de colecciones:');
  const collections = await db.listCollections();
  console.log(`  Colecciones encontradas: ${collections.map(c => c.id).join(', ')}`);

  console.log('\n✅ Inicialización completada!');
}

initializeCollections().catch(console.error);
