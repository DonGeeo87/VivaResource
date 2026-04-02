/**
 * Script para seedear posts de ejemplo en Firestore
 * Uso: node scripts/seed-blog-posts.js
 * 
 * Este script crea 3 posts de ejemplo bilingües (EN/ES)
 * para probar el blog correctamente.
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('../vivaresource-firebase-adminsdk-fbsvc-1c15e4d2ee.json');

// Inicializar Firebase Admin
initializeApp({
  credential: require('firebase-admin').credential.cert(serviceAccount)
});

const db = getFirestore();

// Posts de ejemplo
const samplePosts = [
  {
    title_en: "Building Community Resilience in Rural Colorado",
    title_es: "Construyendo Resiliencia Comunitaria en el Colorado Rural",
    excerpt_en: "How local organizations are coming together to support immigrant families through sustainable programs and shared resources.",
    excerpt_es: "Cómo las organizaciones locales se unen para apoyar a familias inmigrantes a través de programas sostenibles y recursos compartidos.",
    content_en: `
      <p>In rural Colorado, communities are facing unique challenges. Rising costs, limited access to services, and language barriers can make it difficult for immigrant families to thrive.</p>
      <h2>Our Approach</h2>
      <p>At Viva Resource Foundation, we believe in the power of community-led solutions. Our programs focus on:</p>
      <ul>
        <li>Emergency response and crisis intervention</li>
        <li>Food security through local partnerships</li>
        <li>Health and safety education</li>
        <li>Community engagement and leadership development</li>
      </ul>
      <h2>Real Impact</h2>
      <p>Over the past year, we've helped over 500 families access essential services, from food assistance to healthcare navigation. But our work goes beyond immediate aid—we're building long-term resilience.</p>
      <blockquote>"Viva Resource helped us find everything we needed when we first arrived. Now we give back as volunteers." - Maria S., Peyton, CO</blockquote>
      <h2>Get Involved</h2>
      <p>Whether you need support or want to volunteer, we're here to help. Contact us today to learn more about our programs.</p>
    `,
    content_es: `
      <p>En el Colorado rural, las comunidades enfrentan desafíos únicos. El aumento de costos, el acceso limitado a servicios y las barreras del idioma pueden dificultar que las familias inmigrantes prosperen.</p>
      <h2>Nuestro Enfoque</h2>
      <p>En Viva Resource Foundation, creemos en el poder de las soluciones lideradas por la comunidad. Nuestros programas se enfocan en:</p>
      <ul>
        <li>Respuesta a emergencias e intervención en crisis</li>
        <li>Seguridad alimentaria a través de asociaciones locales</li>
        <li>Educación en salud y seguridad</li>
        <li>Participación comunitaria y desarrollo de liderazgo</li>
      </ul>
      <h2>Impacto Real</h2>
      <p>En el último año, hemos ayudado a más de 500 familias a acceder a servicios esenciales, desde asistencia alimentaria hasta navegación en el sistema de salud. Pero nuestro trabajo va más allá de la ayuda inmediata: estamos construyendo resiliencia a largo plazo.</p>
      <blockquote>"Viva Resource nos ayudó a encontrar todo lo que necesitábamos cuando llegamos. Ahora devolvemos como voluntarios." - María S., Peyton, CO</blockquote>
      <h2>Involúcrate</h2>
      <p>Ya sea que necesites apoyo o quieras ser voluntario, estamos aquí para ayudarte. Contáctanos hoy para obtener más información sobre nuestros programas.</p>
    `,
    slug: "building-community-resilience-colorado",
    category: "impact",
    featured_image: "https://images.unsplash.com/photo-1559027615-cd4628902d42",
    author: "Viva Resource Team",
    status: "published",
    published_at: Timestamp.now(),
    created_at: Timestamp.now()
  },
  {
    title_en: "Food Security Programs Expand to Serve More Families",
    title_es: "Programas de Seguridad Alimentaria se Expanden para Servir a Más Familias",
    excerpt_en: "New partnerships with local food banks and farms ensure no rural family goes hungry.",
    excerpt_es: "Nuevas asociaciones con bancos de alimentos y granjas locales aseguran que ninguna familia rural pase hambre.",
    content_en: `
      <p>Food insecurity affects 1 in 8 households in rural Colorado. That's why we're expanding our food security programs to reach more families in need.</p>
      <h2>New Partnerships</h2>
      <p>We've partnered with:</p>
      <ul>
        <li>Food Bank of the Rockies</li>
        <li>Local organic farms</li>
        <li>Community gardens in Peyton and surrounding areas</li>
      </ul>
      <h2>What We Provide</h2>
      <p>Our food security programs include:</p>
      <ul>
        <li>Weekly food box deliveries</li>
        <li>School meal program enrollment assistance</li>
        <li>Nutritional education workshops</li>
        <li>Community garden plots</li>
      </ul>
      <h2>How to Access</h2>
      <p>If you or someone you know needs food assistance, contact us at vivaresourcefoundation@gmail.com or call us at (000) 000-0000.</p>
    `,
    content_es: `
      <p>La inseguridad alimentaria afecta a 1 de cada 8 hogares en el Colorado rural. Por eso estamos expandiendo nuestros programas de seguridad alimentaria para llegar a más familias necesitadas.</p>
      <h2>Nuevas Asociaciones</h2>
      <p>Nos hemos asociado con:</p>
      <ul>
        <li>Banco de Alimentos de las Rocosas</li>
        <li>Granjas orgánicas locales</li>
        <li>Huertos comunitarios en Peyton y áreas circundantes</li>
      </ul>
      <h2>Lo Que Proporcionamos</h2>
      <p>Nuestros programas de seguridad alimentaria incluyen:</p>
      <ul>
        <li>Entregas semanales de cajas de alimentos</li>
        <li>Asistencia para inscripción en programas de comidas escolares</li>
        <li>Talleres de educación nutricional</li>
        <li>Parcelas de huertos comunitarios</li>
      </ul>
      <h2>Cómo Acceder</h2>
      <p>Si tú o alguien que conoces necesita asistencia alimentaria, contáctanos en vivaresourcefoundation@gmail.com o llámanos al (000) 000-0000.</p>
    `,
    slug: "food-security-programs-expand",
    category: "resources",
    featured_image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
    author: "Viva Resource Team",
    status: "published",
    published_at: Timestamp.now(),
    created_at: Timestamp.now()
  },
  {
    title_en: "Community Health Workshop Series Launches This Spring",
    title_es: "Serie de Talleres de Salud Comunitaria se Lanza Esta Primavera",
    excerpt_en: "Free bilingual health education workshops coming to Peyton and surrounding communities.",
    excerpt_es: "Talleres gratuitos de educación en salud bilingüe llegan a Peyton y comunidades circundantes.",
    content_en: `
      <p>We're excited to announce our new Community Health Workshop Series, launching this spring in Peyton, Colorado.</p>
      <h2>Workshop Topics</h2>
      <p>Our free, bilingual workshops will cover:</p>
      <ul>
        <li>Navigating the U.S. healthcare system</li>
        <li>Preventive care and wellness</li>
        <li>Mental health resources</li>
        <li>Nutrition and healthy cooking on a budget</li>
      </ul>
      <h2>Schedule</h2>
      <p>Workshops will be held monthly at the Peyton Community Center. All sessions are free and open to the public. Childcare will be provided.</p>
      <h2>Register Today</h2>
      <p>To reserve your spot, contact us at vivaresourcefoundation@gmail.com or call (000) 000-0000.</p>
    `,
    content_es: `
      <p>Nos complace anunciar nuestra nueva Serie de Talleres de Salud Comunitaria, que se lanza esta primavera en Peyton, Colorado.</p>
      <h2>Temas de los Talleres</h2>
      <p>Nuestros talleres gratuitos y bilingües cubrirán:</p>
      <ul>
        <li>Cómo navegar el sistema de salud de EE.UU.</li>
        <li>Atención preventiva y bienestar</li>
        <li>Recursos de salud mental</li>
        <li>Nutrición y cocina saludable con presupuesto limitado</li>
      </ul>
      <h2>Calendario</h2>
      <p>Los talleres se realizarán mensualmente en el Centro Comunitario de Peyton. Todas las sesiones son gratuitas y abiertas al público. Se proporcionará cuidado de niños.</p>
      <h2>Regístrate Hoy</h2>
      <p>Para reservar tu lugar, contáctanos en vivaresourcefoundation@gmail.com o llama al (000) 000-0000.</p>
    `,
    slug: "community-health-workshop-series",
    category: "events",
    featured_image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
    author: "Viva Resource Team",
    status: "published",
    published_at: Timestamp.now(),
    created_at: Timestamp.now()
  }
];

async function seedBlogPosts() {
  console.log('🌱 Starting blog posts seed...\n');
  
  let created = 0;
  let updated = 0;
  
  for (const post of samplePosts) {
    try {
      // Check if post with this slug already exists
      const existingPost = await db.collection('blog_posts')
        .where('slug', '==', post.slug)
        .limit(1)
        .get();
      
      if (!existingPost.empty) {
        console.log(`⏭️  Skipping "${post.title_en}" (already exists)`);
        updated++;
        continue;
      }
      
      // Create new post
      await db.collection('blog_posts').add(post);
      console.log(`✅ Created "${post.title_en}"`);
      created++;
      
    } catch (error) {
      console.error(`❌ Error creating "${post.title_en}":`, error.message);
    }
  }
  
  console.log(`\n🎉 Seed complete!`);
  console.log(`   📝 Created: ${created} posts`);
  console.log(`   🔄 Skipped: ${updated} posts (already exist)`);
  console.log(`\n🌐 Visit https://vivaresource.vercel.app/blog to see your posts!`);
}

// Run the seed function
seedBlogPosts().catch(console.error);
