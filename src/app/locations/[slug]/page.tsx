import { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight, HeartHandshake, Users, Home, Utensils, Stethoscope, GraduationCap, AlertTriangle, Phone, Globe } from "lucide-react";
import { locations, Location } from "@/data/locations";
import { generatePageMeta, langContext } from "@/lib/metadata";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com";

export async function generateStaticParams() {
  return locations.map((loc) => ({
    slug: loc.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const loc = locations.find((l) => l.slug === params.slug);
  if (!loc) return { title: "Location Not Found" };

  return generatePageMeta({
    path: `/locations/${loc.slug}`,
    title: `${loc.name}, CO: Community Resources and Support`,
    description: loc.description,
    titleEs: `${loc.nameEs}, CO: recursos y apoyo para la comunidad`,
    descriptionEs: loc.descriptionEs,
    keywords: [
      `${loc.name} Colorado`,
      `${loc.name} community resources`,
      `${loc.name} community services`,
      `${loc.county} nonprofit`,
      `ayuda comunitaria ${loc.name}`,
      `${loc.name} food assistance`,
      `${loc.name} housing support`,
    ],
  });
}

const serviceIcons: Record<string, React.ReactNode> = {
  "Food Assistance": <Utensils className="w-5 h-5" />,
  "Asistencia Alimentaria": <Utensils className="w-5 h-5" />,
  "Food Distribution": <Utensils className="w-5 h-5" />,
  "Distribución de Alimentos": <Utensils className="w-5 h-5" />,
  "Food Security": <Utensils className="w-5 h-5" />,
  "Seguridad Alimentaria": <Utensils className="w-5 h-5" />,
  "Food Assistance Network": <Utensils className="w-5 h-5" />,
  "Red de Asistencia Alimentaria": <Utensils className="w-5 h-5" />,
  "Housing Support": <Home className="w-5 h-5" />,
  "Apoyo de Vivienda": <Home className="w-5 h-5" />,
  "Housing Assistance": <Home className="w-5 h-5" />,
  "Asistencia de Vivienda": <Home className="w-5 h-5" />,
  "Healthcare Navigation": <Stethoscope className="w-5 h-5" />,
  "Navegación de Salud": <Stethoscope className="w-5 h-5" />,
  "Healthcare Access": <Stethoscope className="w-5 h-5" />,
  "Acceso a Salud": <Stethoscope className="w-5 h-5" />,
  "Health Resources": <Stethoscope className="w-5 h-5" />,
  "Recursos de Salud": <Stethoscope className="w-5 h-5" />,
  "Educational Workshops": <GraduationCap className="w-5 h-5" />,
  "Talleres Educativos": <GraduationCap className="w-5 h-5" />,
  "Educational Programs": <GraduationCap className="w-5 h-5" />,
  "Programas Educativos": <GraduationCap className="w-5 h-5" />,
  "Emergency Response": <AlertTriangle className="w-5 h-5" />,
  "Respuesta de Emergencia": <AlertTriangle className="w-5 h-5" />,
  "Emergency Aid": <AlertTriangle className="w-5 h-5" />,
  "Ayuda de Emergencia": <AlertTriangle className="w-5 h-5" />,
  "Emergency Support": <AlertTriangle className="w-5 h-5" />,
  "Apoyo de Emergencia": <AlertTriangle className="w-5 h-5" />,
  "Emergency Preparedness": <AlertTriangle className="w-5 h-5" />,
  "Preparación para Emergencias": <AlertTriangle className="w-5 h-5" />,
  "Legal Aid Referrals": <Globe className="w-5 h-5" />,
  "Referencias Legales": <Globe className="w-5 h-5" />,
  "Legal Referrals": <Globe className="w-5 h-5" />,
  "Community Engagement": <Users className="w-5 h-5" />,
  "Participación Comunitaria": <Users className="w-5 h-5" />,
  "Community Events": <Users className="w-5 h-5" />,
  "Eventos Comunitarios": <Users className="w-5 h-5" />,
  "Community Workshops": <Users className="w-5 h-5" />,
  "Talleres Comunitarios": <Users className="w-5 h-5" />,
  "Community Programs": <Users className="w-5 h-5" />,
  "Programas Comunitarios": <Users className="w-5 h-5" />,
  "Volunteer Opportunities": <HeartHandshake className="w-5 h-5" />,
  "Oportunidades de Voluntariado": <HeartHandshake className="w-5 h-5" />,
  "Volunteer Programs": <HeartHandshake className="w-5 h-5" />,
  "Programas de Voluntariado": <HeartHandshake className="w-5 h-5" />,
  "Family Programs": <Users className="w-5 h-5" />,
  "Programas Familiares": <Users className="w-5 h-5" />,
  "Youth Activities": <Users className="w-5 h-5" />,
  "Actividades Juveniles": <Users className="w-5 h-5" />,
  "Senior Support": <Users className="w-5 h-5" />,
  "Apoyo para Adultos Mayores": <Users className="w-5 h-5" />,
  "County-wide Resources": <MapPin className="w-5 h-5" />,
  "Recursos en Todo el Condado": <MapPin className="w-5 h-5" />,
};

function LocationSchema({ loc }: { loc: Location }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/locations/${loc.slug}#localbusiness`,
        name: `Viva Resource — ${loc.name}`,
        image: `${siteUrl}/logo-rectangular.png`,
        url: `${siteUrl}/locations/${loc.slug}`,
        parentOrganization: { "@id": `${siteUrl}#organization` },
        address: {
          "@type": "PostalAddress",
          ...(loc.slug === "peyton" ? { streetAddress: "13055 Bradshaw Drive #301" } : {}),
          addressLocality: loc.name,
          addressRegion: "CO",
          ...(loc.slug === "peyton" ? { postalCode: "80831" } : {}),
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
        areaServed: [
          { "@type": "City", name: loc.name },
          { "@type": "County", name: loc.county },
        ],
        serviceType: loc.services,
        availableLanguage: ["English", "Spanish"],
        isAcceptingNewCustomers: true,
      },
      {
        "@type": "Service",
        name: `Community Services — ${loc.name}`,
        provider: { "@type": "Organization", name: "Viva Resource", url: siteUrl },
        areaServed: { "@type": "City", name: loc.name },
        serviceType: loc.services.join(", "),
        audience: { "@type": "Audience", name: "Rural community members" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const loc = locations.find((l) => l.slug === params.slug);
  if (!loc) {
    return (
      <main className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Location Not Found</h1>
          <Link href="/locations" className="text-primary hover:underline">View all locations</Link>
        </div>
      </main>
    );
  }

  const { lang } = langContext();
  const isEs = lang === "es";
  const prefix = isEs ? "/es" : "";

  return (
    <>
      <LocationSchema loc={loc} />
      <main className="bg-surface text-on-surface font-body">
        {/* Hero */}
        <section className="relative min-h-[350px] flex items-center py-20 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-container">
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-secondary-container/20 border border-secondary-container/30 px-4 py-1.5 rounded-full mb-4">
                <MapPin className="w-4 h-4 text-secondary-container" />
                <span className="text-secondary-container text-sm font-bold tracking-wider uppercase">
                  {isEs ? loc.countyEs : loc.county}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-white leading-tight tracking-tighter mb-4">
                {loc.name}, Colorado
              </h1>
              <p className="text-xl text-on-primary-container font-body leading-relaxed max-w-2xl">
                {isEs ? loc.descriptionEs : loc.description}
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <a
                  href={`${prefix}/get-help`}
                  className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition-all"
                >
                  {isEs ? "Obtener Ayuda" : "Get Help"}
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={`${prefix}/contact`}
                  className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30"
                >
                  {isEs ? "Contáctenos" : "Contact Us"}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4">
                {isEs ? `Servicios en ${loc.name}` : `Services in ${loc.name}`}
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                {isEs
                  ? `Ofrecemos los siguientes servicios a la comunidad de ${loc.name} y sus alrededores.`
                  : `We provide the following services to the ${loc.name} community and surrounding areas.`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loc.services.map((service, i) => {
                const esService = loc.servicesEs[i] || service;
                const primary = isEs ? esService : service;
                const secondary = isEs ? service : esService;
                return (
                  <div
                    key={service}
                    className="bg-surface-low p-6 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      {serviceIcons[service] || serviceIcons[esService] || <HeartHandshake className="w-5 h-5 text-primary" />}
                    </div>
                    <h3 className="font-headline font-bold text-lg text-on-surface mb-2">{primary}</h3>
                    <p className="text-sm text-on-surface-variant">{secondary}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="bg-surface-low py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-headline font-bold text-lg mb-2">{isEs ? "Ubicación" : "Location"}</h3>
              <p className="text-on-surface-variant text-sm">
                {loc.slug === "peyton"
                  ? "13055 Bradshaw Drive #301, Peyton, CO 80831"
                  : isEs
                    ? `Sirviendo el área de ${loc.name}`
                    : `Serving the ${loc.name} area`}
              </p>
              <p className="text-on-surface-variant text-sm mt-1">{isEs ? loc.countyEs : loc.county}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-headline font-bold text-lg mb-2">{isEs ? "Distancia" : "Distance"}</h3>
              <p className="text-on-surface-variant text-sm">
                {loc.distanceFromPeyton === "0 mi"
                  ? isEs ? "Sede Central" : "Headquarters"
                  : isEs ? `${loc.distanceFromPeyton} de Peyton` : `${loc.distanceFromPeyton} from Peyton`}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-headline font-bold text-lg mb-2">{isEs ? "Idiomas" : "Languages"}</h3>
              <p className="text-on-surface-variant text-sm">{isEs ? "Inglés y Español" : "English & Spanish"}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <HeartHandshake className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4">
              {isEs ? `¿Necesitas ayuda en ${loc.name}?` : `Need Help in ${loc.name}?`}
            </h2>
            <p className="text-on-surface-variant text-lg mb-8 max-w-2xl mx-auto">
              {isEs
                ? "Nuestro equipo está listo para ayudarte con recursos, referencias y apoyo. Contáctanos hoy."
                : "Our team is ready to assist you with resources, referrals, and support. Reach out today."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={`${prefix}/get-help`}
                className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all"
              >
                {isEs ? "Obtener Ayuda" : "Get Help"}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={`tel:211`}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all"
              >
                <Phone className="w-5 h-5" />
                {isEs ? "Llame al 211" : "Call 211"}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
