const admin = require('firebase-admin');

// Inicializar Firebase Admin con credenciales del CLI (firebase login)
admin.initializeApp({
  projectId: 'vivaresource',
});

const db = admin.firestore();

console.log('🔥 Iniciando Firestore seed...\n');

const blogPosts = [
  {
    title_en: 'Empowering Rural Communities: Our 2024 Impact Report',
    title_es: 'Empoderando Comunidades Rurales: Nuestro Informe de Impacto 2024',
    slug: 'empowering-rural-communities-2024',
    excerpt_en: 'Discover how we connected over 500 families with essential resources this year.',
    excerpt_es: 'Descubre cómo conectamos a más de 500 familias con recursos esenciales este año.',
    content_en: '<p>In 2024, we\'ve made significant strides in supporting rural communities across Colorado...</p>',
    content_es: '<p>En 2024, hemos hecho avances significativos en el apoyo a las comunidades rurales en todo Colorado...</p>',
    category: 'impact',
    featured_image: 'https://via.placeholder.com/800x400',
    author: 'Eva Leon',
    status: 'published',
    published_at: admin.firestore.Timestamp.now(),
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title_en: 'Food Security Program Expands to Three New Counties',
    title_es: 'Programa de Seguridad Alimentaria Se Expande a Tres Nuevos Condados',
    slug: 'food-security-program-expands',
    excerpt_en: 'Thanks to our partners, we can now serve more families in need.',
    excerpt_es: 'Gracias a nuestros socios, ahora podemos servir a más familias necesitadas.',
    content_en: '<p>We\'re excited to announce the expansion of our food security program...</p>',
    content_es: '<p>Nos complace anunciar la expansión de nuestro programa de seguridad alimentaria...</p>',
    category: 'news',
    featured_image: 'https://via.placeholder.com/800x400',
    author: 'Monserrat Mendoza',
    status: 'published',
    published_at: admin.firestore.Timestamp.now(),
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  },
];

const events = [
  {
    title_en: 'Fresh Harvest Distribution',
    title_es: 'Distribución de Cosecha Fresca',
    description_en: 'Supporting our neighbors with nutritional security. All families are welcome.',
    description_es: 'Apoyando a nuestros vecinos con seguridad nutricional. Todas las familias son bienvenidas.',
    date: admin.firestore.Timestamp.fromDate(new Date(2026, 3, 15, 10, 0, 0)),
    end_date: admin.firestore.Timestamp.fromDate(new Date(2026, 3, 15, 12, 0, 0)),
    slug: 'fresh-harvest-distribution',
    location_address: 'Central Community Hub, Main Hall, Denver, CO',
    location: 'Central Community Hub',
    image: 'https://via.placeholder.com/800x400',
    category: 'community',
    capacity: 100,
    registration_required: true,
    registration_link: '',
    status: 'published',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title_en: 'Community Yoga',
    title_es: 'Yoga Comunitario',
    description_en: 'Free bilingual session for all levels.',
    description_es: 'Sesión bilingüe gratuita para todos los niveles.',
    date: admin.firestore.Timestamp.fromDate(new Date(2026, 3, 22, 17, 30, 0)),
    end_date: admin.firestore.Timestamp.fromDate(new Date(2026, 3, 22, 19, 0, 0)),
    slug: 'community-yoga',
    location_address: 'Community Center, Boulder, CO',
    location: 'Community Center',
    image: 'https://via.placeholder.com/800x400',
    category: 'workshop',
    capacity: 50,
    registration_required: false,
    registration_link: '',
    status: 'published',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title_en: 'Financial Wellness Workshop',
    title_es: 'Taller de Bienestar Financiero',
    description_en: 'Expert advice on budgeting and saving.',
    description_es: 'Consejos expertos sobre presupuesto y ahorro.',
    date: admin.firestore.Timestamp.fromDate(new Date(2026, 3, 25, 18, 0, 0)),
    end_date: admin.firestore.Timestamp.fromDate(new Date(2026, 3, 25, 20, 0, 0)),
    slug: 'financial-wellness-workshop',
    location_address: 'Virtual Event',
    location: 'Online',
    image: 'https://via.placeholder.com/800x400',
    category: 'workshop',
    capacity: 75,
    registration_required: true,
    registration_link: '',
    status: 'published',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de base de datos...\n');

    // Site settings
    console.log('📝 Creando site_settings...');
    await db.collection('site_settings').doc('main_config').set({
      paypal: {
        client_id: '',
        enabled: false
      },
      email: {
        from: 'noreply@vivaresource.org',
        support_email: 'support@vivaresource.org'
      },
      social: {
        facebook: 'https://facebook.com/vivaresource',
        instagram: 'https://instagram.com/vivaresource',
        linkedin: 'https://linkedin.com/company/vivaresource'
      },
      organization: {
        name: 'Viva Resource Foundation',
        description: 'Empowering Rural Communities',
        founded_year: 2024
      },
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ site_settings creado\n');

    // Seed blog posts
    console.log('📝 Agregando blog posts...');
    for (const post of blogPosts) {
      await db.collection('blog_posts').add(post);
      console.log(`  ✅ ${post.title_en}`);
    }

    // Seed events
    console.log('\n📅 Agregando eventos...');
    for (const event of events) {
      await db.collection('events').add(event);
      console.log(`  ✅ ${event.title_en}`);
    }

    console.log('\n🎉 ¡Database seed completado!');
    console.log('\n📊 Resumen:');
    console.log(`   - Blog posts: ${blogPosts.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log('\n✅ Ya puedes loguear en /admin/login\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedDatabase();
