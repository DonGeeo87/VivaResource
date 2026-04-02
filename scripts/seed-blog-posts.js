const admin = require('firebase-admin');

// Inicializar Firebase Admin con credenciales del CLI (firebase login)
admin.initializeApp({
  projectId: 'vivaresource',
});

const db = admin.firestore();

console.log('🔥 Iniciando blog posts seed...\n');

const blogPosts = [
  // Artículo 1: Bienvenidos
  {
    title_en: 'Welcome to Viva Resource Foundation',
    title_es: 'Bienvenidos a Viva Resource Foundation',
    excerpt_en: 'Discover our mission, vision, and commitment to empowering immigrant communities across the region.',
    excerpt_es: 'Descubre nuestra misión, visión y compromiso con el empoderamiento de las comunidades inmigrantes de la región.',
    content_en: `<p>We are proud to introduce <strong>Viva Resource Foundation</strong>, a nonprofit organization dedicated to empowering immigrant and underserved communities through education, resources, and meaningful connections. Our foundation was born from the belief that every person, regardless of their background or immigration status, deserves access to the tools they need to thrive.</p>

<p>Our mission is simple yet powerful: to bridge the gap between vulnerable communities and the resources that can transform their lives. We work alongside community partners, volunteers, and local organizations to provide information about healthcare, legal services, education, employment, and social support programs.</p>

<p>Through our various programs—including community events, resource fairs, workshops, and one-on-one assistance—we aim to create a welcoming space where families feel supported and informed. We believe that knowledge is power, and we are committed to making that knowledge accessible to everyone, in their own language.</p>

<p>As we launch this new chapter, we invite you to explore our website, attend our events, and join us as a volunteer or partner. Together, we can build stronger, more resilient communities. Welcome to Viva Resource Foundation—where hope meets action.</p>`,
    content_es: `<p>Nos enorgullece presentar <strong>Viva Resource Foundation</strong>, una organización sin fines de lucro dedicada a empoderar a las comunidades inmigrantes y desatendidas a través de la educación, los recursos y conexiones significativas. Nuestra fundación nació de la creencia de que cada persona, independientemente de su origen o estatus migratorio, merece acceso a las herramientas que necesita para prosperar.</p>

<p>Nuestra misión es simple pero poderosa: cerrar la brecha entre las comunidades vulnerables y los recursos que pueden transformar sus vidas. Trabajamos junto a socios comunitarios, voluntarios y organizaciones locales para brindar información sobre servicios de salud, asistencia legal, educación, empleo y programas de apoyo social.</p>

<p>A través de nuestros diversos programas—que incluyen eventos comunitarios, ferias de recursos, talleres y asistencia personalizada—buscamos crear un espacio acogedor donde las familias se sientan apoyadas e informadas. Creemos que el conocimiento es poder, y nos comprometemos a hacer que ese conocimiento sea accesible para todos, en su propio idioma.</p>

<p>Al iniciar este nuevo capítulo, te invitamos a explorar nuestro sitio web, asistir a nuestros eventos y unirte a nosotros como voluntario o socio. Juntos, podemos construir comunidades más fuertes y resilientes. Bienvenidos a Viva Resource Foundation—donde la esperanza se convierte en acción.</p>`,
    category: 'news',
    featured_image: 'https://images.unsplash.com/photo-1559027615-cd4628902d42?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    status: 'published',
    published: true,
    published_at: new Date(),
    slug: 'welcome-to-viva-resource',
    created_at: new Date(),
    updated_at: new Date(),
  },
  // Artículo 2: Programas transformando vidas
  {
    title_en: 'How Our Programs Are Transforming Lives',
    title_es: 'Cómo Nuestros Programas Están Transformando Vidas',
    excerpt_en: 'Real stories from community members whose lives have been changed through our programs and services.',
    excerpt_es: 'Historias reales de miembros de la comunidad cuyas vidas han sido transformadas por nuestros programas y servicios.',
    content_en: `<p>At Viva Resource Foundation, we measure our success not by numbers, but by the lives we touch. Today, we want to share the story of María, a mother of three who came to us seeking guidance on navigating the complex world of social services.</p>

<p>When María first arrived at our community center, she felt overwhelmed. She had recently immigrated, spoke limited English, and didn't know where to begin accessing healthcare for her children or finding stable employment. Through our <strong>Community Navigation Program</strong>, María was paired with a bilingual volunteer who helped her understand her options, complete necessary applications, and connect with local resources.</p>

<p>Within three months, María's children were enrolled in a free health insurance program, she had secured a job at a local business, and she was attending our weekly English language classes. "I came here feeling invisible," María told us. "Now I feel like I belong. Viva Resource didn't just give me information—they gave me hope."</p>

<p>María's story is just one of many. Our programs—including legal aid referrals, educational workshops, job readiness training, and family support services—have helped hundreds of families take their first steps toward stability and self-sufficiency. Every day, we witness the transformative power of community support, and we are grateful for the volunteers, donors, and partners who make this work possible.</p>`,
    content_es: `<p>En Viva Resource Foundation, medimos nuestro éxito no por números, sino por las vidas que tocamos. Hoy queremos compartir la historia de María, una madre de tres hijos que acudió a nosotros buscando orientación para navegar el complejo mundo de los servicios sociales.</p>

<p>Cuando María llegó por primera vez a nuestro centro comunitario, se sentía abrumada. Había inmigrado recientemente, hablaba poco inglés y no sabía por dónde empezar para acceder a la atención médica para sus hijos o encontrar un empleo estable. A través de nuestro <strong>Programa de Navegación Comunitaria</strong>, María fue emparejada con una voluntaria bilingüe que la ayudó a entender sus opciones, completar las solicitudes necesarias y conectarse con recursos locales.</p>

<p>En tres meses, los hijos de María estaban inscritos en un programa de seguro médico gratuito, ella había conseguido trabajo en un negocio local y asistía a nuestras clases semanales de inglés. "Vine aquí sintiéndome invisible", nos contó. "Ahora siento que pertenezco. Viva Resource no solo me dio información, me dio esperanza."</p>

<p>La historia de María es solo una de muchas. Nuestros programas—incluyendo referencias a asistencia legal, talleres educativos, capacitación laboral y servicios de apoyo familiar—han ayudado a cientos de familias a dar sus primeros pasos hacia la estabilidad y la autosuficiencia. Cada día, somos testigos del poder transformador del apoyo comunitario, y estamos agradecidos con los voluntarios, donantes y socios que hacen posible este trabajo.</p>`,
    category: 'impact-stories',
    featured_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    status: 'published',
    published: true,
    published_at: new Date(),
    slug: 'programs-transforming-lives',
    created_at: new Date(),
    updated_at: new Date(),
  },
  // Artículo 3: Recursos para la comunidad inmigrante
  {
    title_en: 'Resources Available for the Immigrant Community',
    title_es: 'Recursos Disponibles para la Comunidad Inmigrante',
    excerpt_en: 'A comprehensive guide to the services, programs, and support available through our foundation and partners.',
    excerpt_es: 'Una guía completa de los servicios, programas y apoyo disponibles a través de nuestra fundación y socios.',
    content_en: `<p>Navigating life in a new country can be challenging, but you don't have to do it alone. Viva Resource Foundation, along with our network of community partners, offers a wide range of services designed to support immigrant families at every stage of their journey.</p>

<p><strong>Healthcare Access:</strong> We help connect families with free and low-cost healthcare services, including primary care, dental care, mental health counseling, and pediatric services. Our team can assist with enrollment in community health programs and provide referrals to bilingual healthcare providers.</p>

<p><strong>Legal Services:</strong> Through partnerships with immigration attorneys and legal aid organizations, we offer information sessions, referral services, and know-your-rights workshops. While we do not provide direct legal representation, we can connect you with trusted professionals who can guide you through immigration processes, work permits, and other legal matters.</p>

<p><strong>Education & Employment:</strong> We offer English language classes, job readiness workshops, resume building assistance, and connections to local employers who value diverse talent. We also provide information about educational opportunities for children and adults, including GED preparation and scholarship resources.</p>

<p><strong>Community Support:</strong> From food assistance programs to housing resources and emergency financial aid, we work to ensure that no family faces a crisis alone. Visit our resource center or contact us directly to learn more about what's available in your area. All of our services are provided free of charge and are available regardless of immigration status.</p>`,
    content_es: `<p>Navegar la vida en un nuevo país puede ser un desafío, pero no tienes que hacerlo solo. Viva Resource Foundation, junto con nuestra red de socios comunitarios, ofrece una amplia gama de servicios diseñados para apoyar a las familias inmigrantes en cada etapa de su camino.</p>

<p><strong>Acceso a la Salud:</strong> Ayudamos a conectar a las familias con servicios de salud gratuitos o de bajo costo, que incluyen atención primaria, atención dental, consejería de salud mental y servicios pediátricos. Nuestro equipo puede asistir con la inscripción en programas de salud comunitarios y proporcionar referencias a proveedores de salud bilingües.</p>

<p><strong>Servicios Legales:</strong> A través de alianzas con abogados de inmigración y organizaciones de asistencia legal, ofrecemos sesiones informativas, servicios de referencia y talleres sobre sus derechos. Si bien no proporcionamos representación legal directa, podemos conectarlo con profesionales de confianza que pueden guiarlo a través de procesos migratorios, permisos de trabajo y otros asuntos legales.</p>

<p><strong>Educación y Empleo:</strong> Ofrecemos clases de inglés, talleres de preparación laboral, asistencia para crear currículums y conexiones con empleadores locales que valoran el talento diverso. También proporcionamos información sobre oportunidades educativas para niños y adultos, incluyendo preparación para el GED y recursos de becas.</p>

<p><strong>Apoyo Comunitario:</strong> Desde programas de asistencia alimentaria hasta recursos de vivienda y ayuda financiera de emergencia, trabajamos para asegurar que ninguna familia enfrente una crisis sola. Visite nuestro centro de recursos o contáctenos directamente para obtener más información sobre lo que está disponible en su área. Todos nuestros servicios se proporcionan de forma gratuita y están disponibles independientemente del estatus migratorio.</p>`,
    category: 'resources',
    featured_image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    status: 'published',
    published: true,
    published_at: new Date(),
    slug: 'resources-for-immigrant-community',
    created_at: new Date(),
    updated_at: new Date(),
  },
  // Artículo 4: Evento - Feria de Servicios Comunitarios
  {
    title_en: 'Upcoming Event: Community Services Fair',
    title_es: 'Próximo Evento: Feria de Servicios Comunitarios',
    excerpt_en: 'Join us for a day of connection, resources, and community celebration. Free admission for all families.',
    excerpt_es: 'Únase a nosotros para un día de conexión, recursos y celebración comunitaria. Entrada gratuita para todas las familias.',
    content_en: `<p>Mark your calendars! Viva Resource Foundation is excited to announce our upcoming <strong>Community Services Fair</strong>, a free event designed to connect families with essential resources, local organizations, and each other.</p>

<p><strong>When:</strong> Saturday, May 17, 2026 | 10:00 AM – 3:00 PM<br><strong>Where:</strong> Central Community Park, Denver, CO<br><strong>Admission:</strong> Free and open to all families</p>

<p>At the fair, you'll find information booths from dozens of local organizations offering services in healthcare, education, legal assistance, employment, housing, and more. Our bilingual volunteers will be on hand to help you navigate the event, answer questions, and make meaningful connections.</p>

<p>But this isn't just about resources—it's about community. Enjoy live music, children's activities, food trucks, and cultural performances that celebrate the rich diversity of our neighborhood. Bring your family, bring your friends, and come discover everything our community has to offer. No registration required. We hope to see you there!</p>`,
    content_es: `<p>¡Marquen sus calendarios! Viva Resource Foundation se complace anunciar nuestra próxima <strong>Feria de Servicios Comunitarios</strong>, un evento gratuito diseñado para conectar a las familias con recursos esenciales, organizaciones locales y entre sí.</p>

<p><strong>Cuándo:</strong> Sábado, 17 de mayo de 2026 | 10:00 AM – 3:00 PM<br><strong>Dónde:</strong> Parque Comunitario Central, Denver, CO<br><strong>Entrada:</strong> Gratuita y abierta a todas las familias</p>

<p>En la feria, encontrará stands informativos de decenas de organizaciones locales que ofrecen servicios en salud, educación, asistencia legal, empleo, vivienda y más. Nuestros voluntarios bilingües estarán disponibles para ayudarle a navegar el evento, responder preguntas y hacer conexiones significativas.</p>

<p>Pero esto no es solo sobre recursos—es sobre comunidad. Disfrute de música en vivo, actividades para niños, camiones de comida y presentaciones culturales que celebran la rica diversidad de nuestro vecindario. Traiga a su familia, traiga a sus amigos, y venga a descubrir todo lo que nuestra comunidad tiene para ofrecer. No se requiere registro. ¡Esperamos verle allí!</p>`,
    category: 'events',
    featured_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    status: 'published',
    published: true,
    published_at: new Date(),
    slug: 'community-services-fair',
    created_at: new Date(),
    updated_at: new Date(),
  },
  // Artículo 5: Cómo ser voluntario
  {
    title_en: 'How to Volunteer: A Complete Guide',
    title_es: 'Cómo Ser Voluntario: Una Guía Completa',
    excerpt_en: 'Everything you need to know about joining our volunteer team and making a difference in your community.',
    excerpt_es: 'Todo lo que necesitas saber para unirte a nuestro equipo de voluntarios y marcar la diferencia en tu comunidad.',
    content_en: `<p>Volunteers are the heart and soul of Viva Resource Foundation. Without the dedication and generosity of our volunteer team, we simply couldn't do the work we do. If you're interested in giving back to your community, we'd love to have you join us. Here's everything you need to know to get started.</p>

<p><strong>Step 1: Explore Opportunities.</strong> We have volunteer roles in many areas, including event support, translation and interpretation, community outreach, administrative assistance, and program facilitation. Think about your skills, interests, and availability, and consider where you might make the biggest impact.</p>

<p><strong>Step 2: Complete the Application.</strong> Visit our <a href="/get-involved">Get Involved</a> page and fill out the volunteer registration form. We ask for basic information about your background, language skills, and areas of interest. The form takes less than 10 minutes to complete.</p>

<p><strong>Step 3: Attend Orientation.</strong> Once your application is received, we'll invite you to a volunteer orientation session (available in English and Spanish). During orientation, you'll learn more about our mission, programs, and policies, and you'll have the chance to meet other volunteers and staff members.</p>

<p><strong>Step 4: Start Making a Difference.</strong> After orientation, we'll match you with opportunities that align with your skills and schedule. Whether you can commit a few hours a month or several hours a week, your contribution matters. No experience is necessary—we provide training and ongoing support to all our volunteers. Ready to get started? We can't wait to welcome you to the team!</p>`,
    content_es: `<p>Los voluntarios son el corazón y el alma de Viva Resource Foundation. Sin la dedicación y generosidad de nuestro equipo de voluntarios, simplemente no podríamos hacer el trabajo que hacemos. Si estás interesado en retribuir a tu comunidad, nos encantaría que te unas a nosotros. Aquí tienes todo lo que necesitas saber para comenzar.</p>

<p><strong>Paso 1: Explora las Oportunidades.</strong> Tenemos roles de voluntariado en muchas áreas, incluyendo apoyo en eventos, traducción e interpretación, alcance comunitario, asistencia administrativa y facilitación de programas. Piensa en tus habilidades, intereses y disponibilidad, y considera dónde podrías tener el mayor impacto.</p>

<p><strong>Paso 2: Completa la Solicitud.</strong> Visita nuestra página <a href="/get-involved">Participa</a> y llena el formulario de registro de voluntarios. Te pedimos información básica sobre tu experiencia, habilidades lingüísticas y áreas de interés. El formulario toma menos de 10 minutos en completarse.</p>

<p><strong>Paso 3: Asiste a la Orientación.</strong> Una vez que recibamos tu solicitud, te invitaremos a una sesión de orientación para voluntarios (disponible en inglés y español). Durante la orientación, aprenderás más sobre nuestra misión, programas y políticas, y tendrás la oportunidad de conocer a otros voluntarios y miembros del personal.</p>

<p><strong>Paso 4: Comienza a Marcar la Diferencia.</strong> Después de la orientación, te conectaremos con oportunidades que se alineen con tus habilidades y horario. Ya sea que puedas dedicar unas pocas horas al mes o varias horas a la semana, tu contribución importa. No se requiere experiencia—proporcionamos capacitación y apoyo continuo a todos nuestros voluntarios. ¿Listo para comenzar? ¡No podemos esperar para darte la bienvenida al equipo!</p>`,
    category: 'resources',
    featured_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    status: 'published',
    published: true,
    published_at: new Date(),
    slug: 'how-to-volunteer-guide',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function seedBlogPosts() {
  try {
    console.log('🌱 Iniciando seed de artículos del blog...\n');

    let created = 0;
    let skipped = 0;

    for (const post of blogPosts) {
      // Verificar si ya existe un post con este slug
      const existing = await db.collection('blog_posts')
        .where('slug', '==', post.slug)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`  ⏭️  Saltando: "${post.title_en}" (ya existe)`);
        skipped++;
        continue;
      }

      await db.collection('blog_posts').add(post);
      console.log(`  ✅ Creado: "${post.title_en}"`);
      created++;
    }

    console.log('\n🎉 ¡Seed de blog posts completado!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - Artículos creados: ${created}`);
    console.log(`   - Artículos saltados (ya existían): ${skipped}`);
    console.log(`   - Total de artículos en seed: ${blogPosts.length}`);
    console.log('\n✅ Puedes ver los artículos en /blog\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedBlogPosts();
