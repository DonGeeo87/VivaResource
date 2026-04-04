const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'vivaresource',
});

const db = admin.firestore();

const blogPosts = [
  // ── Article 1: Welcome ──────────────────────────────────────────────
  {
    title: 'Welcome to Viva Resource Foundation',
    slug: 'welcome-to-viva-resource',
    excerpt: 'Discover our mission, vision, and commitment to empowering immigrant communities across rural Colorado.',
    content: `<p>We are proud to introduce <strong>Viva Resource Foundation</strong>, a 501(c)(3) nonprofit organization dedicated to empowering immigrant and underserved communities across rural Colorado through education, resources, and meaningful connections. Our foundation was born from the belief that every person, regardless of their background or immigration status, deserves access to the tools they need to thrive.</p>

<p>Our mission is simple yet powerful: to bridge the gap between vulnerable communities and the resources that can transform their lives. Based in Peyton, Colorado, we work alongside community partners, volunteers, and local organizations to provide information about healthcare, legal services, education, employment, and social support programs—delivered in both English and Spanish to ensure no one is left behind.</p>

<p>Through our various programs—including community events, resource fairs, workshops, and one-on-one navigation assistance—we aim to create a welcoming space where families feel supported and informed. We believe that knowledge is power, and we are committed to making that knowledge accessible to everyone in the communities we serve.</p>

<p>As we launch this new chapter, we invite you to explore our website, attend our events, and join us as a volunteer or partner. Together, we can build stronger, more resilient communities across Colorado's Eastern Plains. Welcome to Viva Resource Foundation—where hope meets action.</p>`,
    category: 'news',
    featured_image: 'https://images.unsplash.com/photo-1559027615-cd4628902d42?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'en',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    title: 'Bienvenidos a Viva Resource Foundation',
    slug: 'welcome-to-viva-resource',
    excerpt: 'Descubre nuestra misión, visión y compromiso con el empoderamiento de las comunidades inmigrantes en la Colorado rural.',
    content: `<p>Nos enorgullece presentar <strong>Viva Resource Foundation</strong>, una organización sin fines de lucro 501(c)(3) dedicada a empoderar a las comunidades inmigrantes y desatendidas de la Colorado rural a través de la educación, los recursos y conexiones significativas. Nuestra fundación nació de la creencia de que cada persona, independientemente de su origen o estatus migratorio, merece acceso a las herramientas que necesita para prosperar.</p>

<p>Nuestra misión es simple pero poderosa: cerrar la brecha entre las comunidades vulnerables y los recursos que pueden transformar sus vidas. Con base en Peyton, Colorado, trabajamos junto a socios comunitarios, voluntarios y organizaciones locales para brindar información sobre servicios de salud, asistencia legal, educación, empleo y programas de apoyo social—entregados en inglés y español para asegurar que nadie quede atrás.</p>

<p>A través de nuestros diversos programas—incluyendo eventos comunitarios, ferias de recursos, talleres y asistencia personalizada de navegación—buscamos crear un espacio acogedor donde las familias se sientan apoyadas e informadas. Creemos que el conocimiento es poder, y nos comprometemos a hacer que ese conocimiento sea accesible para todos en las comunidades que servimos.</p>

<p>Al iniciar este nuevo capítulo, te invitamos a explorar nuestro sitio web, asistir a nuestros eventos y unirte a nosotros como voluntario o socio. Juntos, podemos construir comunidades más fuertes y resilientes en las Llanuras Orientales de Colorado. Bienvenidos a Viva Resource Foundation—donde la esperanza se convierte en acción.</p>`,
    category: 'news',
    featured_image: 'https://images.unsplash.com/photo-1559027615-cd4628902d42?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'es',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },

  // ── Article 2: Programs Impact ──────────────────────────────────────
  {
    title: 'How Our Programs Are Transforming Lives',
    slug: 'programs-transforming-lives',
    excerpt: 'Real stories from community members whose lives have been changed through our community navigation and referral programs.',
    content: `<p>At Viva Resource Foundation, we measure our success not by numbers, but by the lives we touch. Today, we want to share the story of María, a mother of three who came to us seeking guidance on navigating the complex world of social services in rural Colorado.</p>

<p>When María first arrived at our resource center, she felt overwhelmed. She had recently relocated to a small town east of Colorado Springs, spoke limited English, and did not know where to begin accessing healthcare for her children or finding stable employment. Through our <strong>Community Navigation Program</strong>, María was paired with a bilingual volunteer who helped her understand her options, complete necessary applications, and connect with local resources including a community health clinic and workforce development center.</p>

<p>Within three months, María's children were enrolled in a free health insurance program, she had secured a job at a local business, and she was attending our weekly English language classes. "I came here feeling invisible," María told us. "Now I feel like I belong. Viva Resource did not just give me information—they gave me hope."</p>

<p>María's story is just one of many. Our programs—including legal aid referrals, educational workshops, job readiness training, and family support services—have helped hundreds of families across Colorado's Eastern Plains take their first steps toward stability and self-sufficiency. Every day, we witness the transformative power of community support, and we are grateful for the volunteers, donors, and partners who make this work possible.</p>`,
    category: 'impact',
    featured_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'en',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    title: 'Cómo Nuestros Programas Están Transformando Vidas',
    slug: 'programs-transforming-lives',
    excerpt: 'Historias reales de miembros de la comunidad cuyas vidas han sido transformadas a través de nuestros programas de navegación y referencias.',
    content: `<p>En Viva Resource Foundation, medimos nuestro éxito no por números, sino por las vidas que tocamos. Hoy queremos compartir la historia de María, una madre de tres hijos que acudió a nosotros buscando orientación para navegar el complejo mundo de los servicios sociales en la Colorado rural.</p>

<p>Cuando María llegó por primera vez a nuestro centro de recursos, se sentía abrumada. Se había reubicado recientemente en un pequeño pueblo al este de Colorado Springs, hablaba poco inglés y no sabía por dónde empezar para acceder a la atención médica para sus hijos o encontrar un empleo estable. A través de nuestro <strong>Programa de Navegación Comunitaria</strong>, María fue emparejada con una voluntaria bilingüe que la ayudó a entender sus opciones, completar las solicitudes necesarias y conectarse con recursos locales, incluyendo una clínica de salud comunitaria y un centro de desarrollo laboral.</p>

<p>En tres meses, los hijos de María estaban inscritos en un programa de seguro médico gratuito, ella había conseguido trabajo en un negocio local y asistía a nuestras clases semanales de inglés. "Vine aquí sintiéndome invisible", nos contó. "Ahora siento que pertenezco. Viva Resource no solo me dio información—me dio esperanza."</p>

<p>La historia de María es solo una de muchas. Nuestros programas—incluyendo referencias a asistencia legal, talleres educativos, capacitación laboral y servicios de apoyo familiar—han ayudado a cientos de familias en las Llanuras Orientales de Colorado a dar sus primeros pasos hacia la estabilidad y la autosuficiencia. Cada día, somos testigos del poder transformador del apoyo comunitario, y estamos agradecidos con los voluntarios, donantes y socios que hacen posible este trabajo.</p>`,
    category: 'impact',
    featured_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'es',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },

  // ── Article 3: Resources Guide ──────────────────────────────────────
  {
    title: 'Resources Available for the Immigrant Community',
    slug: 'resources-for-immigrant-community',
    excerpt: 'A comprehensive guide to healthcare, legal services, education, and food assistance available through our foundation and partners.',
    content: `<p>Navigating life in a new community can be challenging, especially in rural areas where services may be harder to find. You do not have to do it alone. Viva Resource Foundation, along with our network of community partners across Colorado's Eastern Plains, offers a wide range of services designed to support immigrant families at every stage of their journey.</p>

<p><strong>Healthcare Access:</strong> We help connect families with free and low-cost healthcare services, including primary care, dental care, mental health counseling, and pediatric services. Our team assists with enrollment in community health programs, Medicaid, and CHP+ (Child Health Plan Plus), and provides referrals to bilingual healthcare providers in the region.</p>

<p><strong>Legal Services:</strong> Through partnerships with immigration attorneys and legal aid organizations, we offer information sessions, referral services, and know-your-rights workshops. While we do not provide direct legal representation, we can connect you with trusted professionals who can guide you through immigration processes, work permits, family law, and other legal matters.</p>

<p><strong>Education and Employment:</strong> We offer English language classes, job readiness workshops, resume building assistance, and connections to local employers who value diverse talent. We also provide information about educational opportunities for children and adults, including GED preparation, scholarship resources, and school enrollment support.</p>

<p><strong>Food Assistance:</strong> From food bank referrals to nutrition education programs, we work to ensure that no family goes hungry. We partner with local food banks, USDA commodity distribution sites, and community gardens to improve food access in rural areas. Visit our resource center or contact us directly to learn more about what is available in your area. All services are free regardless of immigration status.</p>`,
    category: 'resources',
    featured_image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'en',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    title: 'Recursos Disponibles para la Comunidad Inmigrante',
    slug: 'resources-for-immigrant-community',
    excerpt: 'Una guía completa de servicios de salud, asistencia legal, educación y apoyo alimentario disponibles a través de nuestra fundación y socios.',
    content: `<p>Navegar la vida en una nueva comunidad puede ser un desafío, especialmente en áreas rurales donde los servicios pueden ser más difíciles de encontrar. No tienes que hacerlo solo. Viva Resource Foundation, junto con nuestra red de socios comunitarios en las Llanuras Orientales de Colorado, ofrece una amplia gama de servicios diseñados para apoyar a las familias inmigrantes en cada etapa de su camino.</p>

<p><strong>Acceso a la Salud:</strong> Ayudamos a conectar a las familias con servicios de salud gratuitos o de bajo costo, incluyendo atención primaria, atención dental, consejería de salud mental y servicios pediátricos. Nuestro equipo asiste con la inscripción en programas de salud comunitarios, Medicaid y CHP+ (Plan de Salud para Niños), y proporciona referencias a proveedores de salud bilingües en la región.</p>

<p><strong>Servicios Legales:</strong> A través de alianzas con abogados de inmigración y organizaciones de asistencia legal, ofrecemos sesiones informativas, servicios de referencia y talleres sobre sus derechos. Si bien no proporcionamos representación legal directa, podemos conectarlo con profesionales de confianza que pueden guiarlo a través de procesos migratorios, permisos de trabajo, derecho familiar y otros asuntos legales.</p>

<p><strong>Educación y Empleo:</strong> Ofrecemos clases de inglés, talleres de preparación laboral, asistencia para crear currículums y conexiones con empleadores locales que valoran el talento diverso. También proporcionamos información sobre oportunidades educativas para niños y adultos, incluyendo preparación para el GED, recursos de becas y apoyo para inscripción escolar.</p>

<p><strong>Asistencia Alimentaria:</strong> Desde referencias a bancos de alimentos hasta programas de educación nutricional, trabajamos para asegurar que ninguna familia pase hambre. Nos asociamos con bancos de alimentos locales, sitios de distribución de alimentos del USDA y huertos comunitarios para mejorar el acceso a alimentos en áreas rurales. Visite nuestro centro de recursos o contáctenos para obtener más información. Todos los servicios son gratuitos sin importar el estatus migratorio.</p>`,
    category: 'resources',
    featured_image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'es',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },

  // ── Article 4: Community Event ──────────────────────────────────────
  {
    title: 'Community Resource Fair 2026',
    slug: 'community-resource-fair-2026',
    excerpt: 'Join us for a day of connection, resources, and community celebration. Free admission for all families in the Colorado Springs area.',
    content: `<p>Mark your calendars! Viva Resource Foundation is excited to announce our upcoming <strong>Community Resource Fair 2026</strong>, a free event designed to connect families with essential resources, local organizations, and each other. Whether you are looking for healthcare information, legal guidance, educational opportunities, or simply want to connect with your neighbors, this event is for you.</p>

<p><strong>When:</strong> Saturday, May 17, 2026 | 10:00 AM – 3:00 PM<br><strong>Where:</strong> Central Community Park, Colorado Springs, CO<br><strong>Admission:</strong> Free and open to all families</p>

<p>At the fair, you will find information booths from dozens of local organizations offering services in healthcare, education, legal assistance, employment, housing, food assistance, and more. Our bilingual volunteers will be on hand to help you navigate the event, answer questions in English and Spanish, and make meaningful connections with service providers. Free health screenings will be available on a first-come, first-served basis.</p>

<p>But this is not just about resources—it is about community. Enjoy live music, children's activities, food trucks, and cultural performances that celebrate the rich diversity of our region. Bring your family, bring your friends, and come discover everything our community has to offer. No registration or ID required. We hope to see you there!</p>`,
    category: 'events',
    featured_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'en',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    title: 'Feria de Recursos Comunitarios 2026',
    slug: 'community-resource-fair-2026',
    excerpt: 'Únase a nosotros para un día de conexión, recursos y celebración comunitaria. Entrada gratuita para todas las familias del área de Colorado Springs.',
    content: `<p>¡Marquen sus calendarios! Viva Resource Foundation se complace en anunciar nuestra próxima <strong>Feria de Recursos Comunitarios 2026</strong>, un evento gratuito diseñado para conectar a las familias con recursos esenciales, organizaciones locales y entre sí. Ya sea que busque información de salud, orientación legal, oportunidades educativas o simplemente desee conectarse con sus vecinos, este evento es para usted.</p>

<p><strong>Cuándo:</strong> Sábado, 17 de mayo de 2026 | 10:00 AM – 3:00 PM<br><strong>Dónde:</strong> Parque Comunitario Central, Colorado Springs, CO<br><strong>Entrada:</strong> Gratuita y abierta a todas las familias</p>

<p>En la feria, encontrará stands informativos de decenas de organizaciones locales que ofrecen servicios en salud, educación, asistencia legal, empleo, vivienda, asistencia alimentaria y más. Nuestros voluntarios bilingües estarán disponibles para ayudarle a navegar el evento, responder preguntas en inglés y español, y hacer conexiones significativas con proveedores de servicios. Exámenes de salud gratuitos estarán disponibles por orden de llegada.</p>

<p>Pero esto no es solo sobre recursos—es sobre comunidad. Disfrute de música en vivo, actividades para niños, camiones de comida y presentaciones culturales que celebran la rica diversidad de nuestra región. Traiga a su familia, traiga a sus amigos, y venga a descubrir todo lo que nuestra comunidad tiene para ofrecer. No se requiere registro ni identificación. ¡Esperamos verle allí!</p>`,
    category: 'events',
    featured_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'es',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },

  // ── Article 5: Volunteer Guide ──────────────────────────────────────
  {
    title: 'How to Volunteer: A Complete Guide',
    slug: 'how-to-volunteer-guide',
    excerpt: 'Everything you need to know about joining our volunteer team and making a difference in rural Colorado communities.',
    content: `<p>Volunteers are the heart and soul of Viva Resource Foundation. Without the dedication and generosity of our volunteer team, we simply could not do the work we do. If you are interested in giving back to your community, we would love to have you join us. Here is everything you need to know to get started.</p>

<p><strong>Step 1: Explore Opportunities.</strong> We have volunteer roles in many areas, including event support, translation and interpretation, community outreach, administrative assistance, and program facilitation. Think about your skills, interests, and availability, and consider where you might make the biggest impact. Bilingual volunteers are especially needed, but all are welcome.</p>

<p><strong>Step 2: Complete the Application.</strong> Visit our <a href="/get-involved">Get Involved</a> page and fill out the volunteer registration form. We ask for basic information about your background, language skills, and areas of interest. The form takes less than 10 minutes to complete and can be filled out in English or Spanish.</p>

<p><strong>Step 3: Attend Orientation.</strong> Once your application is received, we will invite you to a volunteer orientation session (available in English and Spanish). During orientation, you will learn more about our mission, programs, and policies, and you will have the chance to meet other volunteers and staff members. Orientations are held monthly at our Peyton office or via video call.</p>

<p><strong>Step 4: Start Making a Difference.</strong> After orientation, we will match you with opportunities that align with your skills and schedule. Whether you can commit a few hours a month or several hours a week, your contribution matters. No experience is necessary—we provide training and ongoing support to all our volunteers. Ready to get started? We cannot wait to welcome you to the team!</p>`,
    category: 'resources',
    featured_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'en',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    title: 'Cómo Ser Voluntario: Una Guía Completa',
    slug: 'how-to-volunteer-guide',
    excerpt: 'Todo lo que necesitas saber para unirte a nuestro equipo de voluntarios y marcar la diferencia en las comunidades rurales de Colorado.',
    content: `<p>Los voluntarios son el corazón y el alma de Viva Resource Foundation. Sin la dedicación y generosidad de nuestro equipo de voluntarios, simplemente no podríamos hacer el trabajo que hacemos. Si estás interesado en retribuir a tu comunidad, nos encantaría que te unas a nosotros. Aquí tienes todo lo que necesitas saber para comenzar.</p>

<p><strong>Paso 1: Explora las Oportunidades.</strong> Tenemos roles de voluntariado en muchas áreas, incluyendo apoyo en eventos, traducción e interpretación, alcance comunitario, asistencia administrativa y facilitación de programas. Piensa en tus habilidades, intereses y disponibilidad, y considera dónde podrías tener el mayor impacto. Los voluntarios bilingües son especialmente necesarios, pero todos son bienvenidos.</p>

<p><strong>Paso 2: Completa la Solicitud.</strong> Visita nuestra página <a href="/get-involved">Participa</a> y llena el formulario de registro de voluntarios. Te pedimos información básica sobre tu experiencia, habilidades lingüísticas y áreas de interés. El formulario toma menos de 10 minutos en completarse y puede llenarse en inglés o español.</p>

<p><strong>Paso 3: Asiste a la Orientación.</strong> Una vez que recibamos tu solicitud, te invitaremos a una sesión de orientación para voluntarios (disponible en inglés y español). Durante la orientación, aprenderás más sobre nuestra misión, programas y políticas, y tendrás la oportunidad de conocer a otros voluntarios y miembros del personal. Las orientaciones se realizan mensualmente en nuestra oficina de Peyton o por videollamada.</p>

<p><strong>Paso 4: Comienza a Marcar la Diferencia.</strong> Después de la orientación, te conectaremos con oportunidades que se alineen con tus habilidades y horario. Ya sea que puedas dedicar unas pocas horas al mes o varias horas a la semana, tu contribución importa. No se requiere experiencia—proporcionamos capacitación y apoyo continuo a todos nuestros voluntarios. ¿Listo para comenzar? ¡No podemos esperar para darte la bienvenida al equipo!</p>`,
    category: 'resources',
    featured_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'es',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },

  // ── Article 6: Food Security ────────────────────────────────────────
  {
    title: 'Addressing Food Security in Rural Colorado Communities',
    slug: 'food-security-rural-communities',
    excerpt: 'How food bank partnerships and nutrition programs are helping families overcome food insecurity across Colorado\'s Eastern Plains.',
    content: `<p>Food insecurity remains one of the most pressing challenges facing rural communities across Colorado's Eastern Plains. Limited transportation, sparse grocery options, and economic hardship create barriers that leave many families struggling to put nutritious food on the table. At Viva Resource Foundation, we are committed to changing that reality—one family at a time.</p>

<p>Through our partnerships with regional food banks, USDA commodity distribution programs, and local farmers, we have built a network of food access points that reach communities often overlooked by traditional services. Our <strong>Community Food Program</strong> connects families with monthly food distributions in El Paso, Elbert, and Lincoln counties, ensuring that fresh produce, proteins, and pantry staples reach those who need them most.</p>

<p>Beyond emergency food assistance, we invest in long-term food security through nutrition education and community gardening initiatives. Our workshops teach families how to prepare healthy meals on a budget, preserve seasonal produce, and start small home gardens—even in Colorado's challenging climate. We partner with local Extension offices and Master Gardener programs to provide seeds, soil testing, and hands-on guidance throughout the growing season.</p>

<p>Food security is not just about access—it is about dignity and choice. We believe every family deserves the ability to nourish their loved ones with culturally appropriate, nutritious food. If you or someone you know is facing food insecurity, please reach out to us. Our services are free, confidential, and available regardless of immigration status. Together, we can ensure that no one in our community goes hungry.</p>`,
    category: 'impact',
    featured_image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'en',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    title: 'Abordando la Seguridad Alimentaria en Comunidades Rurales de Colorado',
    slug: 'food-security-rural-communities',
    excerpt: 'Cómo las alianzas con bancos de alimentos y programas de nutrición están ayudando a las familias a superar la inseguridad alimentaria en las Llanuras Orientales de Colorado.',
    content: `<p>La inseguridad alimentaria sigue siendo uno de los desafíos más urgentes que enfrentan las comunidades rurales de las Llanuras Orientales de Colorado. El transporte limitado, la escasez de opciones de supermercado y las dificultades económicas crean barreras que dejan a muchas familias luchando por poner alimentos nutritivos en la mesa. En Viva Resource Foundation, estamos comprometidos a cambiar esa realidad—una familia a la vez.</p>

<p>A través de nuestras alianzas con bancos de alimentos regionales, programas de distribución de alimentos del USDA y agricultores locales, hemos construido una red de puntos de acceso a alimentos que llegan a comunidades a menudo desatendidas por los servicios tradicionales. Nuestro <strong>Programa de Alimentos Comunitarios</strong> conecta a las familias con distribuciones mensuales de alimentos en los condados de El Paso, Elbert y Lincoln, asegurando que productos frescos, proteínas y alimentos básicos lleguen a quienes más los necesitan.</p>

<p>Más allá de la asistencia alimentaria de emergencia, invertimos en seguridad alimentaria a largo plazo a través de educación nutricional e iniciativas de huertos comunitarios. Nuestros talleres enseñan a las familias cómo preparar comidas saludables con un presupuesto limitado, conservar productos de temporada y comenzar pequeños huertos caseros—incluso en el clima desafiante de Colorado. Nos asociamos con oficinas de Extensión local y programas de Maestros Jardineros para proporcionar semillas, pruebas de suelo y orientación práctica durante la temporada de cultivo.</p>

<p>La seguridad alimentaria no se trata solo de acceso—se trata de dignidad y elección. Creemos que toda familia merece la capacidad de alimentar a sus seres queridos con alimentos nutritivos y culturalmente apropiados. Si usted o alguien que conoce enfrenta inseguridad alimentaria, por favor contáctenos. Nuestros servicios son gratuitos, confidenciales y están disponibles sin importar el estatus migratorio. Juntos, podemos asegurar que nadie en nuestra comunidad pase hambre.</p>`,
    category: 'impact',
    featured_image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=400&fit=crop',
    author: 'Viva Resource Foundation',
    language: 'es',
    published: true,
    status: 'published',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function seedBlogPosts() {
  try {
    console.log('🔥 Blog posts seed starting...\n');

    // Only delete if --clean flag is passed
    const shouldClean = process.argv.includes('--clean');

    if (shouldClean) {
      console.log('🗑️  --clean flag: Deleting existing blog_posts...');
      const snapshot = await db.collection('blog_posts').get();
      if (!snapshot.empty) {
        // Split into batches of 500 (Firestore batch limit)
        const docs = snapshot.docs;
        let deleted = 0;
        for (let i = 0; i < docs.length; i += 500) {
          const batch = db.batch();
          docs.slice(i, i + 500).forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
          deleted += docs.slice(i, i + 500).length;
        }
        console.log(`   Deleted ${deleted} document(s).\n`);
      } else {
        console.log('   No existing documents found.\n');
      }
    } else {
      console.log('ℹ️  Skipping existing posts. Use --clean flag to delete all first.\n');
    }

    // 2. Create new posts
    console.log('🌱 Creating blog posts...\n');
    let created = 0;

    for (const post of blogPosts) {
      const doc = await db.collection('blog_posts').add(post);
      console.log(`   ✅ [${post.language.toUpperCase()}] "${post.title}" (${doc.id})`);
      created++;
    }

    console.log(`\n🎉 Seed complete!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Documents created: ${created}`);
    console.log(`   - Unique slugs: ${new Set(blogPosts.map((p) => p.slug)).size}`);
    console.log(`   - EN posts: ${blogPosts.filter((p) => p.language === 'en').length}`);
    console.log(`   - ES posts: ${blogPosts.filter((p) => p.language === 'es').length}`);
    console.log('\n✅ View posts at /blog\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedBlogPosts();
