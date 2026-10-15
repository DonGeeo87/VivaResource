import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Utensils, Home, Stethoscope, GraduationCap, Languages, Scale, MapPin } from "lucide-react";
import FaqBlock from "@/components/FaqBlock";
import SchemaMarkup from "@/components/SchemaMarkup";
import { generatePageMeta, langContext, SITE_URL } from "@/lib/metadata";

/**
 * Hub de recursos gratis / ayuda en espanol.
 *
 * Pagina pensada para la grilla de busquedas reales de la comunidad:
 * "ayuda para latinos", "ayuda en espanol", "recursos gratis", "cursos gratis",
 * "talleres en espanol", "ayuda en Peyton / Colorado Springs / Colorado".
 * Identidad de idioma y geografia, nunca estatus migratorio (regla de la
 * fundacion). Cada seccion apunta a un grupo de consultas y enlaza a las paginas
 * que si resuelven la necesidad.
 */

export function generateMetadata(): Metadata {
  return generatePageMeta({
    path: "/free-resources",
    title: "Free Help in Colorado for Spanish-Speaking Families",
    description:
      "Free resources in El Paso County, Colorado: food, rent and housing help, clinics, free English classes and workshops, and legal referrals. Bilingual team, no cost.",
    titleEs: "Recursos gratis y ayuda en español en Colorado",
    descriptionEs:
      "Recursos gratis en el Condado de El Paso, Colorado: alimentos, ayuda con la renta y la vivienda, clínicas, clases de inglés y talleres gratis, y referencias legales. Equipo bilingüe, sin costo.",
    keywords: [
      "ayuda para latinos Colorado",
      "ayuda en español Colorado",
      "recursos gratis Colorado",
      "cursos gratis en español",
      "talleres en español Colorado",
      "ayuda para familias en Colorado",
      "ayuda en Peyton CO",
      "ayuda en Colorado Springs",
      "free resources Colorado",
      "Spanish speaking help Colorado",
      "free English classes Colorado Springs",
      "free workshops Colorado Springs",
    ],
  });
}

interface SectionLink {
  href: string;
  label: string;
}

interface Section {
  title: string;
  body: string;
  links: SectionLink[];
}

const FREE_OF_COST = {
  es: "Todo lo que ofrecemos es gratis: no se paga nada por pedir ayuda, por los talleres ni por las referencias.",
  en: "Everything we offer is free: there is no cost to ask for help, to attend a workshop or to get a referral.",
};

export default function FreeResourcesPage(): JSX.Element {
  const { lang } = langContext();
  const isEs = lang === "es";
  const prefix = isEs ? "/es" : "";

  const sections: Array<Section & { icon: JSX.Element }> = isEs
    ? [
        {
          icon: <Utensils className="w-6 h-6" />,
          title: "Despensas y ayuda con alimentos",
          body: "Distribución de alimentos, despensas comunitarias y apoyo para inscribirte en programas de asistencia alimentaria en el Condado de El Paso.",
          links: [
            { href: `${prefix}/get-help`, label: "Pedir ayuda con alimentos" },
            { href: `${prefix}/blog/food-assistance-es`, label: "Cómo funciona nuestra asistencia alimentaria" },
          ],
        },
        {
          icon: <Home className="w-6 h-6" />,
          title: "Ayuda con la renta y la vivienda",
          body: "Orientación de vivienda, referencias para asistencia de renta y apoyo en emergencias cuando la familia está en riesgo de quedarse sin techo.",
          links: [
            { href: `${prefix}/get-help`, label: "Solicitar apoyo de vivienda" },
            { href: `${prefix}/blog/housing-support-es`, label: "Programas de apoyo de vivienda" },
          ],
        },
        {
          icon: <Stethoscope className="w-6 h-6" />,
          title: "Clínicas y salud sin seguro",
          body: "Te ayudamos a encontrar una clínica de bajo costo, a solicitar cobertura de salud y a llegar a servicios de salud mental.",
          links: [
            { href: `${prefix}/resources`, label: "Buscar clínica en el directorio" },
            { href: `${prefix}/blog/healthcare-navigation-es`, label: "Cómo navegar el sistema de salud" },
          ],
        },
        {
          icon: <GraduationCap className="w-6 h-6" />,
          title: "Cursos y talleres gratis",
          body: "Talleres comunitarios gratuitos: clases de inglés (ESL), finanzas familiares, crianza, preparación laboral y los temas que la comunidad pida. También hay apoyo para entender la ayuda financiera escolar.",
          links: [
            { href: `${prefix}/events`, label: "Ver talleres y eventos con fecha" },
            { href: `${prefix}/blog/educational-workshops-es`, label: "Talleres educativos y programas" },
          ],
        },
        {
          icon: <Scale className="w-6 h-6" />,
          title: "Referencias legales y trámites",
          body: "Te conectamos con servicios legales de confianza en Colorado y organizamos talleres informativos para la comunidad. Viva Resource no es un despacho de abogados y no da asesoría legal: te referimos con quien sí puede ayudarte.",
          links: [
            { href: `${prefix}/blog/legal-aid-referrals-colorado-es`, label: "Asistencia legal en Colorado" },
            { href: `${prefix}/get-help`, label: "Pedir una referencia legal" },
          ],
        },
        {
          icon: <Languages className="w-6 h-6" />,
          title: "Atención en español, siempre",
          body: "Nuestro equipo es bilingüe: cada familia recibe atención en el idioma que prefiere, en persona, por teléfono y por correo electrónico.",
          links: [
            { href: `${prefix}/contact`, label: "Escribir al equipo" },
            { href: `${prefix}/blog/volunteer-opportunities-es`, label: "Sumarse como voluntario bilingüe" },
          ],
        },
      ]
    : [
        {
          icon: <Utensils className="w-6 h-6" />,
          title: "Food pantries and food assistance",
          body: "Food distributions, community pantries and enrollment help for food assistance programs across El Paso County.",
          links: [
            { href: `${prefix}/get-help`, label: "Ask for food help" },
            { href: `${prefix}/blog/food-assistance-en`, label: "How our food assistance works" },
          ],
        },
        {
          icon: <Home className="w-6 h-6" />,
          title: "Rent and housing help",
          body: "Housing navigation, rental assistance referrals and emergency support when a family is at risk of losing their home.",
          links: [
            { href: `${prefix}/get-help`, label: "Request housing support" },
            { href: `${prefix}/blog/housing-support-en`, label: "Housing support programs" },
          ],
        },
        {
          icon: <Stethoscope className="w-6 h-6" />,
          title: "Clinics and health coverage",
          body: "Help finding a low-cost clinic, applying for health coverage and connecting to mental health services.",
          links: [
            { href: `${prefix}/resources`, label: "Find a clinic in the directory" },
            { href: `${prefix}/blog/healthcare-navigation-en`, label: "How to navigate healthcare" },
          ],
        },
        {
          icon: <GraduationCap className="w-6 h-6" />,
          title: "Free classes and workshops",
          body: "Free community workshops: English classes (ESL), family finances, parenting, job readiness and the topics the community asks for. We also help families understand school financial aid.",
          links: [
            { href: `${prefix}/events`, label: "See workshops and dates" },
            { href: `${prefix}/blog/educational-workshops-en`, label: "Educational workshops and programs" },
          ],
        },
        {
          icon: <Scale className="w-6 h-6" />,
          title: "Legal referrals and paperwork",
          body: "We connect families with trusted legal services in Colorado and run informational workshops for the community. Viva Resource is not a law firm and does not give legal advice: we refer you to someone who can help.",
          links: [
            { href: `${prefix}/blog/legal-aid-referrals-colorado-en`, label: "Legal aid in Colorado" },
            { href: `${prefix}/get-help`, label: "Ask for a legal referral" },
          ],
        },
        {
          icon: <Languages className="w-6 h-6" />,
          title: "Support in Spanish, always",
          body: "Our team is bilingual: every family is served in the language they prefer, in person, by phone and by email. This page exists because Spanish-speaking families asked for it.",
          links: [
            { href: `${prefix}/contact`, label: "Write to the team" },
            { href: `${prefix}/blog/volunteer-opportunities-en`, label: "Volunteer as a bilingual neighbor" },
          ],
        },
      ];

  const cities = [
    { slug: "peyton", en: "Peyton", es: "Peyton" },
    { slug: "colorado-springs", en: "Colorado Springs", es: "Colorado Springs" },
    { slug: "pueblo", en: "Pueblo", es: "Pueblo" },
    { slug: "fountain", en: "Fountain", es: "Fountain" },
    { slug: "monument", en: "Monument", es: "Monument" },
  ];

  const faqItems = isEs
    ? [
        { question: "¿Dónde encuentro ayuda en español en Colorado?", answer: "En Viva Resource. Nuestro equipo es bilingüe y atiende en español en Peyton, Colorado Springs, Pueblo, Fountain, Monument y todo el Condado de El Paso. Puedes pedir ayuda desde la página de Obtener Ayuda o escribirnos desde Contacto." },
        { question: "¿Hay recursos gratis para familias latinas en Colorado?", answer: "Sí, y no se paga nada por pedirlos: asistencia alimentaria, apoyo de vivienda, navegación de salud, talleres educativos gratuitos, apoyo en emergencias y referencias a servicios legales de confianza." },
        { question: "¿Dónde tomo cursos o talleres gratis en español?", answer: "Publicamos los talleres con fecha en la página de Eventos: clases de inglés (ESL), finanzas familiares, crianza, preparación laboral y otros temas que la comunidad pide. La atención es en español y la entrada es gratuita." },
        { question: "¿Hay ayuda financiera para la escuela o la universidad?", answer: "Sí. Acompañamos a las familias para entender las opciones de ayuda financiera escolar y universitaria, y realizamos talleres sobre el tema. Escríbenos desde la página de Contacto para el próximo taller." },
        { question: "¿Necesito documentos o una cita para pedir ayuda?", answer: "Puedes enviar tu solicitud desde la página de Obtener Ayuda en cualquier momento. Una persona del equipo te contacta para coordinar qué necesitas y qué información hace falta en tu caso." },
        { question: "¿Viva Resource cobra por estos servicios?", answer: "No. Todos los servicios de Viva Resource son gratuitos, incluidos los talleres, las referencias y el acompañamiento." },
      ]
    : [
        { question: "Where can Spanish-speaking families get help in Colorado?", answer: "At Viva Resource. Our team is bilingual and serves families in Spanish across Peyton, Colorado Springs, Pueblo, Fountain, Monument and El Paso County. Submit a request on the Get Help page or write to us from the Contact page." },
        { question: "Are there free resources for Latino families in Colorado?", answer: "Yes, and there is no cost to use them: food assistance, housing support, healthcare navigation, free educational workshops, emergency support and referrals to trusted legal services." },
        { question: "Where can I take free classes or workshops in Spanish?", answer: "Upcoming workshops are listed on the Events page: English classes (ESL), family finances, parenting, job readiness and other topics the community asks for. Support is available in Spanish and attendance is free." },
        { question: "Is there financial help for school or college?", answer: "Yes. We walk families through school and college financial aid options and run workshops on the topic. Write to us from the Contact page for the next workshop." },
        { question: "Do I need documents or an appointment to ask for help?", answer: "You can send your request from the Get Help page at any time. A team member contacts you to coordinate what you need and what information your case requires." },
        { question: "Does Viva Resource charge for these services?", answer: "No. Every Viva Resource service is free, including workshops, referrals and one-on-one support." },
      ];

  return (
    <main className="bg-surface text-on-surface font-body">
      <SchemaMarkup
        type="webpage"
        data={{
          url: `${SITE_URL}${prefix}/free-resources`,
          title: isEs
            ? "Recursos gratis y ayuda en español en Colorado"
            : "Free help in Colorado for Spanish-speaking families",
          description: isEs
            ? "Recursos gratuitos para familias latinas e hispanohablantes en el Condado de El Paso, Colorado."
            : "Free resources for Latino and Spanish-speaking families in El Paso County, Colorado.",
          language: lang,
        }}
      />
      <SchemaMarkup
        type="breadcrumb"
        data={{
          items: [
            { name: isEs ? "Inicio" : "Home", url: `${SITE_URL}${prefix}` },
            { name: isEs ? "Recursos gratis" : "Free resources", url: `${SITE_URL}${prefix}/free-resources` },
          ],
        }}
      />

      <section className="relative py-16 md:py-24 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-container">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label text-xs font-bold mb-6">
            {isEs ? "AYUDA EN ESPAÑOL · SIN COSTO" : "BILINGUAL HELP · FREE OF CHARGE"}
          </span>
          <h1 className="font-headline font-extrabold text-3xl md:text-5xl text-on-primary tracking-tighter mb-6">
            {isEs
              ? "Recursos gratis y ayuda en español para familias en Colorado"
              : "Free resources and help in Spanish for families in Colorado"}
          </h1>
          <p className="text-on-primary-container text-lg leading-relaxed max-w-2xl mx-auto">
            {isEs
              ? "Viva Resource es una organización sin fines de lucro 501(c)(3) que acompaña a familias latinas e hispanohablantes del Condado de El Paso: alimentos, vivienda, salud, talleres y referencias legales. Todo gratis y en tu idioma."
              : "Viva Resource is a 501(c)(3) nonprofit that walks with Latino and Spanish-speaking families in El Paso County: food, housing, healthcare, workshops and legal referrals. Everything free, in the language you prefer."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href={`${prefix}/get-help`}
              className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-headline font-bold text-sm hover:scale-105 transition-transform inline-flex items-center justify-center gap-2"
            >
              {isEs ? "Pedir ayuda ahora" : "Get help now"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`${prefix}/resources`}
              className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-headline font-bold text-sm hover:bg-white hover:text-primary transition-all inline-flex items-center justify-center"
            >
              {isEs ? "Ver el directorio de recursos" : "See the resource directory"}
            </Link>
          </div>
          <p className="text-on-primary-container/80 text-sm mt-6">{isEs ? FREE_OF_COST.es : FREE_OF_COST.en}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mb-4 text-center">
          {isEs ? "¿Qué ayuda puedes pedir hoy?" : "What help can you ask for today?"}
        </h2>
        <p className="text-on-surface-variant text-center max-w-3xl mx-auto mb-12">
          {isEs
            ? "Estos son los servicios que ofrecemos en el Condado de El Paso. Si tu caso no aparece aquí, escríbenos igual: buscamos el recurso contigo y sin costo."
            : "These are the services we provide across El Paso County. If your situation is not listed here, write to us anyway: we search the resource with you, at no cost."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <article key={section.title} className="bg-surface-low rounded-2xl p-7 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-5">
                {section.icon}
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-3">{section.title}</h3>
              <p className="text-on-surface-variant leading-relaxed mb-5 flex-1">{section.body}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-primary font-bold text-sm inline-flex items-center gap-2 hover:underline">
                      {link.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface-low py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-4 text-center">
            {isEs ? "Dónde atendemos en Colorado" : "Where we serve in Colorado"}
          </h2>
          <p className="text-on-surface-variant text-center mb-10">
            {isEs
              ? "Nuestra sede está en Peyton y los programas llegan a todo el Condado de El Paso."
              : "Our headquarters is in Peyton and our programs reach across El Paso County."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`${prefix}/locations/${city.slug}`}
                className="inline-flex items-center gap-2 bg-white border border-outline-variant rounded-full px-5 py-2 text-sm font-bold text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {isEs ? `Ayuda en ${city.es}` : `Help in ${city.en}`}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-8 text-center">
          {isEs ? "Cómo pedir ayuda en 3 pasos" : "How to ask for help in 3 steps"}
        </h2>
        <ol className="space-y-6">
          {(isEs
            ? [
                "Completa el formulario de la página Obtener Ayuda: cuéntanos qué necesita tu familia y cómo contactarte.",
                "Una persona bilingüe del equipo revisa tu solicitud y te contacta para coordinar los detalles.",
                "Si necesitas algo hoy mismo, llama al 211 para una referencia inmediata en tu código postal.",
              ]
            : [
                "Fill out the form on the Get Help page: tell us what your family needs and how to reach you.",
                "A bilingual team member reviews your request and contacts you to coordinate the details.",
                "If you need something today, call 211 for an immediate referral for your ZIP code.",
              ]
          ).map((step, index) => (
            <li key={step} className="flex gap-5 items-start">
              <span className="w-10 h-10 shrink-0 rounded-full bg-primary text-on-primary font-headline font-extrabold flex items-center justify-center">
                {index + 1}
              </span>
              <p className="text-on-surface-variant leading-relaxed pt-2">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <FaqBlock lang={lang} items={faqItems} title={isEs ? "Preguntas frecuentes" : "Frequently asked questions"} />

      <section className="py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-primary text-on-primary rounded-3xl p-10 md:p-16">
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">
            {isEs ? "¿Listo para pedir ayuda o sumarte?" : "Ready to get help or join in?"}
          </h2>
          <p className="text-lg opacity-90 mb-10">
            {isEs
              ? "Escríbenos y te responde una persona bilingüe del equipo. También puedes ser voluntario o donar."
              : "Write to us and a bilingual team member answers. You can also volunteer or donate."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`${prefix}/get-help`} className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-headline font-bold text-sm hover:scale-105 transition-transform">
              {isEs ? "Pedir ayuda" : "Get help"}
            </Link>
            <Link href={`${prefix}/get-involved`} className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-headline font-bold text-sm hover:bg-white hover:text-primary transition-all">
              {isEs ? "Ser voluntario" : "Volunteer"}
            </Link>
            <Link href={`${prefix}/donate`} className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-headline font-bold text-sm hover:bg-white hover:text-primary transition-all">
              {isEs ? "Donar" : "Donate"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
