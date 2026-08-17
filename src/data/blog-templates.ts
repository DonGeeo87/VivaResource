export interface BlogTemplate {
  category: string;
  slug: string;
  titleEn: string;
  titleEs: string;
  excerptEn: string;
  excerptEs: string;
  contentEn: string;
  contentEs: string;
  tags: string[];
}

const services = [
  {
    slug: "food-assistance",
    titleEn: "Food Assistance Programs in El Paso County",
    titleEs: "Programas de Asistencia Alimentaria en el Condado de El Paso",
    excerptEn: "Learn about food distribution programs, partnerships with local producers, and how to access healthy meals for your family in Peyton, Colorado Springs, and surrounding areas.",
    excerptEs: "Conozca los programas de distribución de alimentos, asociaciones con productores locales y cómo acceder a comidas saludables para su familia en Peyton, Colorado Springs y áreas circundantes.",
    contentEn: `<p>Viva Resource is committed to ensuring that no family in El Paso County goes without healthy meals. Our food assistance programs serve communities across Peyton, Colorado Springs, Pueblo, Fountain, and Monument.</p>
<h2>What We Offer</h2>
<ul>
<li><strong>Food Distribution Events:</strong> Regular distribution of fresh produce, non-perishable items, and essential groceries at multiple locations throughout the county.</li>
<li><strong>Partnership with Local Producers:</strong> We work directly with Colorado farmers and food producers to bring fresh, locally-sourced food to rural communities.</li>
<li><strong>Emergency Food Boxes:</strong> Available for families facing sudden hardship or crisis situations.</li>
<li><strong>SNAP Enrollment Assistance:</strong> Our team helps families navigate the application process for Supplemental Nutrition Assistance Program benefits.</li>
</ul>
<h2>Who Can Access These Services</h2>
<p>All residents of El Paso County are welcome. We do not require proof of income, immigration status, or any documentation. Services are available in both English and Spanish.</p>
<h2>How to Get Food Assistance</h2>
<p>Visit our <a href="/get-help">Get Help page</a> to submit a request, or contact us directly. You can also call 211 for immediate resource referrals.</p>`,
    contentEs: `<p>Viva Resource se compromete a garantizar que ninguna familia en el Condado de El Paso se quede sin comidas saludables. Nuestros programas de asistencia alimentaria sirven a comunidades en Peyton, Colorado Springs, Pueblo, Fountain y Monument.</p>
<h2>Qué Ofrecemos</h2>
<ul>
<li><strong>Eventos de Distribución de Alimentos:</strong> Distribución regular de productos frescos, artículos no perecederos y comestibles esenciales en múltiples ubicaciones del condado.</li>
<li><strong>Asociación con Productores Locales:</strong> Trabajamos directamente con agricultores y productores de alimentos de Colorado para llevar alimentos frescos y de origen local a las comunidades rurales.</li>
<li><strong>Cajas de Alimentos de Emergencia:</strong> Disponibles para familias que enfrentan dificultades repentinas o situaciones de crisis.</li>
<li><strong>Asistencia para Inscripción en SNAP:</strong> Nuestro equipo ayuda a las familias a navegar el proceso de solicitud de beneficios del Programa de Asistencia Nutricional Suplementaria.</li>
</ul>
<h2>Quién Puede Acceder a Estos Servicios</h2>
<p>Todos los residentes del Condado de El Paso son bienvenidos. No requerimos prueba de ingresos, estatus migratorio ni documentación. Los servicios están disponibles tanto en inglés como en español.</p>
<h2>Cómo Obtener Asistencia Alimentaria</h2>
<p>Visite nuestra página de <a href="/get-help">Obtener Ayuda</a> para enviar una solicitud, o contáctenos directamente. También puede llamar al 211 para referencias inmediatas de recursos.</p>`,
    tags: ["food assistance", "food security", "nutrition", "El Paso County", "Colorado"],
  },
  {
    slug: "housing-support",
    titleEn: "Housing Support Services for Rural Colorado Families",
    titleEs: "Servicios de Apoyo de Vivienda para Familias Rurales de Colorado",
    excerptEn: "Find rental assistance, housing navigation, and emergency shelter referrals for families in crisis across El Paso County.",
    excerptEs: "Encuentre asistencia de alquiler, navegación de vivienda y referencias de refugio de emergencia para familias en crisis en todo el Condado de El Paso.",
    contentEn: `<p>Stable housing is the foundation of a thriving community. Viva Resource provides comprehensive housing support services to families and individuals across El Paso County, Colorado.</p>
<h2>Our Housing Services</h2>
<ul>
<li><strong>Rental Assistance:</strong> Financial assistance for families at risk of eviction or facing temporary financial hardship.</li>
<li><strong>Housing Navigation:</strong> Guidance through the process of finding affordable housing, completing applications, and understanding tenant rights.</li>
<li><strong>Emergency Shelter Referrals:</strong> Connections to emergency shelters and temporary housing options for families in immediate crisis.</li>
<li><strong>Utility Assistance:</strong> Help with heating, electricity, and water bills to prevent service disconnection.</li>
</ul>
<h2>Service Areas</h2>
<p>We serve all of El Paso County, including Peyton (headquarters), Colorado Springs, Fountain, Monument, and surrounding rural communities.</p>
<h2>How to Apply</h2>
<p>Submit a help request through our <a href="/get-help">Get Help page</a> or contact us directly. Our team will work with you to find the best housing solution for your situation.</p>`,
    contentEs: `<p>La vivienda estable es la base de una comunidad próspera. Viva Resource proporciona servicios integrales de apoyo de vivienda a familias e individuos en todo el Condado de El Paso, Colorado.</p>
<h2>Nuestros Servicios de Vivienda</h2>
<ul>
<li><strong>Asistencia de Alquiler:</strong> Ayuda financiera para familias en riesgo de desalojo o que enfrentan dificultades económicas temporales.</li>
<li><strong>Navegación de Vivienda:</strong> Orientación en el proceso de encontrar vivienda asequible, completar solicitudes y comprender los derechos de los inquilinos.</li>
<li><strong>Referencias de Refugio de Emergencia:</strong> Conexiones con refugios de emergencia y opciones de vivienda temporal para familias en crisis inmediata.</li>
<li><strong>Asistencia de Servicios Públicos:</strong> Ayuda con facturas de calefacción, electricidad y agua para evitar la desconexión del servicio.</li>
</ul>
<h2>Áreas de Servicio</h2>
<p>Atendemos todo el Condado de El Paso, incluyendo Peyton (sede central), Colorado Springs, Fountain, Monument y las comunidades rurales circundantes.</p>
<h2>Cómo Solicitar</h2>
<p>Envíe una solicitud de ayuda a través de nuestra página de <a href="/get-help">Obtener Ayuda</a> o contáctenos directamente. Nuestro equipo trabajará con usted para encontrar la mejor solución de vivienda para su situación.</p>`,
    tags: ["housing", "rental assistance", "emergency shelter", "El Paso County", "Colorado"],
  },
  {
    slug: "immigrant-resources-colorado",
    titleEn: "Immigrant Resources and Legal Aid Referrals in Colorado",
    titleEs: "Recursos para Inmigrantes y Referencias Legales en Colorado",
    excerptEn: "Access know-your-rights workshops, immigration legal services, and documentation assistance for immigrant families in El Paso County.",
    excerptEs: "Acceda a talleres de conozca sus derechos, servicios legales de inmigración y asistencia con documentación para familias inmigrantes en el Condado de El Paso.",
    contentEn: `<p>Viva Resource is committed to supporting immigrant families across Colorado with essential resources, legal aid referrals, and educational programs. All services are confidential and available regardless of immigration status.</p>
<h2>Services for Immigrant Families</h2>
<ul>
<li><strong>Know Your Rights Workshops:</strong> Educational sessions covering constitutional rights, interactions with law enforcement, and what to do in various situations.</li>
<li><strong>Legal Aid Referrals:</strong> Connections to trusted immigration attorneys and accredited representatives for consultations and case assistance.</li>
<li><strong>Documentation Assistance:</strong> Help with forms, applications, and understanding legal processes.</li>
<li><strong>Community Navigation:</strong> Guidance on accessing healthcare, education, and other public services available to all residents.</li>
</ul>
<h2>Confidential and Safe</h2>
<p>We do not ask about immigration status to provide services. Your information is kept confidential and secure. Our team is bilingual and culturally competent.</p>
<h2>Get Started</h2>
<p>Visit our <a href="/get-help">Get Help page</a> or contact us to learn more about our immigrant resources and programs.</p>`,
    contentEs: `<p>Viva Resource se compromete a apoyar a las familias inmigrantes en todo Colorado con recursos esenciales, referencias legales y programas educativos. Todos los servicios son confidenciales y están disponibles independientemente del estatus migratorio.</p>
<h2>Servicios para Familias Inmigrantes</h2>
<ul>
<li><strong>Talleres de Conozca Sus Derechos:</strong> Sesiones educativas sobre derechos constitucionales, interacciones con las autoridades y qué hacer en diversas situaciones.</li>
<li><strong>Referencias Legales:</strong> Conexiones con abogados de inmigración de confianza y representantes acreditados para consultas y asistencia con casos.</li>
<li><strong>Asistencia con Documentación:</strong> Ayuda con formularios, solicitudes y comprensión de procesos legales.</li>
<li><strong>Navegación Comunitaria:</strong> Orientación sobre cómo acceder a servicios de salud, educación y otros servicios públicos disponibles para todos los residentes.</li>
</ul>
<h2>Confidencial y Seguro</h2>
<p>No preguntamos sobre el estatus migratorio para proporcionar servicios. Su información se mantiene confidencial y segura. Nuestro equipo es bilingüe y culturalmente competente.</p>
<h2>Cómo Empezar</h2>
<p>Visite nuestra página de <a href="/get-help">Obtener Ayuda</a> o contáctenos para obtener más información sobre nuestros recursos y programas para inmigrantes.</p>`,
    tags: ["immigrant resources", "legal aid", "know your rights", "Colorado", "immigration"],
  },
  {
    slug: "healthcare-navigation",
    titleEn: "Healthcare Navigation and Access in Rural Colorado",
    titleEs: "Navegación y Acceso a la Salud en el Colorado Rural",
    excerptEn: "Get help accessing preventive care, mental health resources, health insurance enrollment, and sliding-scale clinics across El Paso County.",
    excerptEs: "Obtenga ayuda para acceder a atención preventiva, recursos de salud mental, inscripción en seguros de salud y clínicas de escala variable en todo el Condado de El Paso.",
    contentEn: `<p>Accessing healthcare in rural areas can be challenging. Viva Resource helps families navigate the healthcare system and connect with the care they need.</p>
<h2>Healthcare Services We Facilitate</h2>
<ul>
<li><strong>Preventive Care:</strong> Connections to primary care providers, vaccinations, and regular health screenings.</li>
<li><strong>Mental Health Resources:</strong> Referrals to counselors, support groups, and crisis services including the 988 Suicide & Crisis Lifeline.</li>
<li><strong>Health Insurance Enrollment:</strong> Assistance with Medicaid, CHP+, and marketplace enrollment throughout the year.</li>
<li><strong>Sliding-Scale Clinics:</strong> Information about community health centers that offer care based on income.</li>
</ul>
<h2>Bilingual Support</h2>
<p>Our team provides navigation support in both English and Spanish. We can accompany you to appointments and help with translation if needed.</p>
<h2>Start Here</h2>
<p>Contact us through our <a href="/get-help">Get Help page</a> to speak with a healthcare navigator who can assess your needs and connect you with appropriate resources.</p>`,
    contentEs: `<p>Acceder a la atención médica en áreas rurales puede ser un desafío. Viva Resource ayuda a las familias a navegar el sistema de salud y conectarse con la atención que necesitan.</p>
<h2>Servicios de Salud que Facilitamos</h2>
<ul>
<li><strong>Atención Preventiva:</strong> Conexiones con proveedores de atención primaria, vacunas y exámenes de salud regulares.</li>
<li><strong>Recursos de Salud Mental:</strong> Referencias a consejeros, grupos de apoyo y servicios de crisis, incluyendo la Línea de Crisis 988.</li>
<li><strong>Inscripción en Seguros de Salud:</strong> Asistencia con Medicaid, CHP+ e inscripción en el mercado de seguros durante todo el año.</li>
<li><strong>Clínicas de Escala Variable:</strong> Información sobre centros de salud comunitarios que ofrecen atención según los ingresos.</li>
</ul>
<h2>Apoyo Bilingüe</h2>
<p>Nuestro equipo brinda apoyo de navegación tanto en inglés como en español. Podemos acompañarlo a las citas y ayudar con la traducción si es necesario.</p>
<h2>Comience Aquí</h2>
<p>Contáctenos a través de nuestra página de <a href="/get-help">Obtener Ayuda</a> para hablar con un navegador de salud que evaluará sus necesidades y lo conectará con los recursos adecuados.</p>`,
    tags: ["healthcare", "mental health", "health insurance", "preventive care", "Colorado"],
  },
  {
    slug: "educational-workshops",
    titleEn: "Free Educational Workshops and Community Programs",
    titleEs: "Talleres Educativos Gratuitos y Programas Comunitarios",
    excerptEn: "Join our free workshops on ESL, financial literacy, parenting skills, and job readiness training for community members in El Paso County.",
    excerptEs: "Únase a nuestros talleres gratuitos sobre ESL, alfabetización financiera, habilidades parentales y capacitación laboral para miembros de la comunidad en el Condado de El Paso.",
    contentEn: `<p>Education is a powerful tool for empowerment. Viva Resource offers free workshops and programs designed to build skills, knowledge, and confidence in our community.</p>
<h2>Workshop Categories</h2>
<ul>
<li><strong>ESL Classes:</strong> English as a Second Language classes for adults at beginner, intermediate, and advanced levels.</li>
<li><strong>Financial Literacy:</strong> Workshops on budgeting, credit building, banking, and financial planning for families.</li>
<li><strong>Parenting Skills:</strong> Support and strategies for parents navigating challenges in a new cultural context.</li>
<li><strong>Job Readiness Training:</strong> Resume writing, interview skills, job search strategies, and workplace communication.</li>
<li><strong>Digital Literacy:</strong> Basic computer skills, internet safety, and using online resources for daily life.</li>
</ul>
<h2>Who Can Attend</h2>
<p>All community members are welcome. Workshops are free and offered in both English and Spanish. Childcare may be available for some sessions.</p>
<h2>Upcoming Workshops</h2>
<p>Check our <a href="/events">Events page</a> for upcoming workshop schedules, or <a href="/contact">contact us</a> to be added to our notification list.</p>`,
    contentEs: `<p>La educación es una herramienta poderosa para el empoderamiento. Viva Resource ofrece talleres y programas gratuitos diseñados para desarrollar habilidades, conocimientos y confianza en nuestra comunidad.</p>
<h2>Categorías de Talleres</h2>
<ul>
<li><strong>Clases de ESL:</strong> Clases de inglés como segundo idioma para adultos en niveles principiante, intermedio y avanzado.</li>
<li><strong>Alfabetización Financiera:</strong> Talleres sobre presupuestos, construcción de crédito, banca y planificación financiera para familias.</li>
<li><strong>Habilidades Parentales:</strong> Apoyo y estrategias para padres que navegan desafíos en un nuevo contexto cultural.</li>
<li><strong>Capacitación Laboral:</strong> Redacción de currículums, habilidades para entrevistas, estrategias de búsqueda de empleo y comunicación en el lugar de trabajo.</li>
<li><strong>Alfabetización Digital:</strong> Habilidades básicas de computación, seguridad en internet y uso de recursos en línea para la vida diaria.</li>
</ul>
<h2>Quién Puede Asistir</h2>
<p>Todos los miembros de la comunidad son bienvenidos. Los talleres son gratuitos y se ofrecen tanto en inglés como en español. Puede haber cuidado de niños disponible para algunas sesiones.</p>
<h2>Próximos Talleres</h2>
<p>Consulte nuestra página de <a href="/events">Eventos</a> para ver los horarios de los próximos talleres, o <a href="/contact">contáctenos</a> para agregarse a nuestra lista de notificaciones.</p>`,
    tags: ["education", "ESL", "financial literacy", "job training", "workshops", "Colorado"],
  },
  {
    slug: "volunteer-opportunities",
    titleEn: "Volunteer Opportunities with Viva Resource in Colorado",
    titleEs: "Oportunidades de Voluntariado con Viva Resource en Colorado",
    excerptEn: "Make a difference in rural Colorado communities. Explore volunteer opportunities in food distribution, education, events, and community outreach.",
    excerptEs: "Haga la diferencia en las comunidades rurales de Colorado. Explore oportunidades de voluntariado en distribución de alimentos, educación, eventos y alcance comunitario.",
    contentEn: `<p>Volunteers are the heart of Viva Resource. Whether you have a few hours or want to make a long-term commitment, there are meaningful ways to contribute to our mission.</p>
<h2>Volunteer Roles</h2>
<ul>
<li><strong>Food Distribution:</strong> Help sort, pack, and distribute food at our community events across El Paso County.</li>
<li><strong>Event Support:</strong> Assist with health fairs, educational workshops, and community gatherings.</li>
<li><strong>Administrative Support:</strong> Help with office tasks, data entry, and community outreach from our Peyton headquarters.</li>
<li><strong>Translation & Interpretation:</strong> Use your bilingual skills to help community members access services.</li>
<li><strong>Driving & Transportation:</strong> Help transport supplies or community members to appointments and events.</li>
</ul>
<h2>How to Get Started</h2>
<p>Visit our <a href="/get-involved">Get Involved page</a> to fill out a volunteer application. We'll match you with opportunities that fit your skills and availability.</p>`,
    contentEs: `<p>Los voluntarios son el corazón de Viva Resource. Ya sea que tenga unas horas o quiera hacer un compromiso a largo plazo, hay formas significativas de contribuir a nuestra misión.</p>
<h2>Roles de Voluntariado</h2>
<ul>
<li><strong>Distribución de Alimentos:</strong> Ayude a clasificar, empacar y distribuir alimentos en nuestros eventos comunitarios en todo el Condado de El Paso.</li>
<li><strong>Apoyo en Eventos:</strong> Asista en ferias de salud, talleres educativos y reuniones comunitarias.</li>
<li><strong>Apoyo Administrativo:</strong> Ayude con tareas de oficina, entrada de datos y alcance comunitario desde nuestra sede en Peyton.</li>
<li><strong>Traducción e Interpretación:</strong> Use sus habilidades bilingües para ayudar a los miembros de la comunidad a acceder a los servicios.</li>
<li><strong>Conducción y Transporte:</strong> Ayude a transportar suministros o miembros de la comunidad a citas y eventos.</li>
</ul>
<h2>Cómo Empezar</h2>
<p>Visite nuestra página de <a href="/get-involved">Involúcrate</a> para completar una solicitud de voluntariado. Lo emparejaremos con oportunidades que se ajusten a sus habilidades y disponibilidad.</p>`,
    tags: ["volunteer", "community service", "Colorado", "El Paso County", "nonprofit"],
  },
  {
    slug: "emergency-response-rural",
    titleEn: "Emergency Response and Crisis Support in Rural Colorado",
    titleEs: "Respuesta de Emergencia y Apoyo en Crisis en el Colorado Rural",
    excerptEn: "Learn about emergency food, housing, and crisis intervention services available to rural families in El Paso County during times of crisis.",
    excerptEs: "Conozca los servicios de emergencia de alimentos, vivienda e intervención en crisis disponibles para familias rurales en el Condado de El Paso durante tiempos de crisis.",
    contentEn: `<p>When crisis strikes, rural families often face additional challenges due to geographic isolation and limited resources. Viva Resource provides emergency response services to help families navigate these difficult times.</p>
<h2>Emergency Services</h2>
<ul>
<li><strong>Emergency Food Boxes:</strong> Immediate food assistance for families facing sudden hardship.</li>
<li><strong>Crisis Housing:</strong> Temporary shelter referrals and rental assistance for families in emergency situations.</li>
<li><strong>Crisis Intervention:</strong> Support and referrals for mental health crises, including connection to the 988 Suicide & Crisis Lifeline.</li>
<li><strong>Disaster Relief Coordination:</strong> Assistance during natural disasters, including resource coordination and recovery support.</li>
</ul>
<h2>24/7 Crisis Resources</h2>
<p>If you or someone you know is in crisis: Call or text <strong>988</strong> for the Suicide & Crisis Lifeline. Text <strong>HOME to 741741</strong> for crisis support. Call <strong>211</strong> for resource referrals.</p>
<h2>Get Emergency Help</h2>
<p>Contact us through our <a href="/get-help">Get Help page</a> or call 211 for immediate assistance.</p>`,
    contentEs: `<p>Cuando llega una crisis, las familias rurales a menudo enfrentan desafíos adicionales debido al aislamiento geográfico y los recursos limitados. Viva Resource proporciona servicios de respuesta de emergencia para ayudar a las familias a navegar estos tiempos difíciles.</p>
<h2>Servicios de Emergencia</h2>
<ul>
<li><strong>Cajas de Alimentos de Emergencia:</strong> Asistencia alimentaria inmediata para familias que enfrentan dificultades repentinas.</li>
<li><strong>Vivienda de Crisis:</strong> Referencias de refugio temporal y asistencia de alquiler para familias en situaciones de emergencia.</li>
<li><strong>Intervención en Crisis:</strong> Apoyo y referencias para crisis de salud mental, incluyendo conexión con la Línea de Crisis 988.</li>
<li><strong>Coordinación de Ayuda en Desastres:</strong> Asistencia durante desastres naturales, incluyendo coordinación de recursos y apoyo de recuperación.</li>
</ul>
<h2>Recursos de Crisis 24/7</h2>
<p>Si usted o alguien que conoce está en crisis: Llame o envíe un mensaje de texto al <strong>988</strong> para la Línea de Crisis. Envíe <strong>HOME al 741741</strong> para apoyo en crisis. Llame al <strong>211</strong> para referencias de recursos.</p>
<h2>Obtenga Ayuda de Emergencia</h2>
<p>Contáctenos a través de nuestra página de <a href="/get-help">Obtener Ayuda</a> o llame al 211 para asistencia inmediata.</p>`,
    tags: ["emergency response", "crisis support", "disaster relief", "Colorado", "rural"],
  },
];

export const blogTemplates: BlogTemplate[] = services as BlogTemplate[];
