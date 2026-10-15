import { SITE_URL } from "@/lib/metadata";
import { getSeoSettings } from "@/lib/seo-settings";

/**
 * Structured data del sitio, renderizado en el SERVIDOR.
 *
 * Antes vivia en un componente cliente que inyectaba el JSON-LD con next/script
 * + useEffect: el HTML servido no tenia ni un bloque ld+json (verificado con
 * Googlebot y GPTBot), asi que ni Google ni los motores de respuesta (AI
 * Overviews, ChatGPT, Perplexity) podian leer la entidad. Tampoco habia que
 * inventar datos: se quitaron telefono placeholder, horario, priceRange y
 * Denver del area de servicio.
 */

interface ServiceOffer {
  name: string;
  description: string;
  serviceType: string;
}

const SERVICES: ServiceOffer[] = [
  {
    name: "Food Assistance",
    serviceType: "Food Assistance",
    description:
      "Food distribution events, emergency food boxes and enrollment help for SNAP benefits in El Paso County, Colorado.",
  },
  {
    name: "Housing Support",
    serviceType: "Housing Support",
    description:
      "Housing navigation, rental assistance referrals and emergency shelter referrals for families in crisis.",
  },
  {
    name: "Healthcare Navigation",
    serviceType: "Healthcare Navigation",
    description:
      "Help finding a clinic, applying for health coverage and connecting to mental health services.",
  },
  {
    name: "Legal Aid Referrals",
    serviceType: "Legal Aid Referrals",
    description:
      "Referrals to trusted legal services in Colorado and informational workshops for the community. Viva Resource is not a law firm and does not provide legal advice.",
  },
  {
    name: "Educational Workshops",
    serviceType: "Educational Workshops",
    description:
      "Free community workshops on family finances, school aid, nutrition and other topics requested by the community.",
  },
  {
    name: "Emergency Response",
    serviceType: "Emergency Response",
    description:
      "Crisis support and coordination for families facing a sudden hardship, disaster or unexpected transition.",
  },
  {
    name: "Volunteer and Community Engagement",
    serviceType: "Community Engagement",
    description:
      "Volunteer opportunities, community events and leadership development for residents of rural Colorado.",
  },
];

/** Ciudades que el propio sitio declara atender. */
const AREA_SERVED = [
  { "@type": "AdministrativeArea", name: "El Paso County, Colorado" },
  { "@type": "City", name: "Peyton, Colorado" },
  { "@type": "City", name: "Colorado Springs, Colorado" },
  { "@type": "City", name: "Pueblo, Colorado" },
  { "@type": "City", name: "Fountain, Colorado" },
  { "@type": "City", name: "Monument, Colorado" },
];

export default async function SiteSchema(): Promise<JSX.Element> {
  const settings = await getSeoSettings();
  const sameAs = [
    settings.facebook_url,
    settings.twitter_url,
    settings.instagram_url,
    settings.linkedin_url,
    settings.youtube_url,
    settings.tiktok_url,
  ].filter((url): url is string => typeof url === "string" && url.startsWith("http"));

  const organization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "NGO"],
    "@id": `${SITE_URL}#organization`,
    name: "Viva Resource",
    alternateName: "Viva Resource",
    legalName: "Viva Resource",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/logo-rectangular.png`,
    description:
      "Viva Resource is a 501(c)(3) nonprofit that connects rural Colorado communities with essential resources: food assistance, housing support, healthcare navigation, educational workshops, emergency response and legal aid referrals. Free and bilingual.",
    nonprofitStatus: "Nonprofit501c3",
    slogan: "Recursos comunitarios para el Colorado rural",
    knowsLanguage: ["en", "es"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "13055 Bradshaw Drive #301",
      addressLocality: "Peyton",
      addressRegion: "CO",
      postalCode: "80831",
      addressCountry: "US",
    },
    areaServed: AREA_SERVED,
    availableLanguage: ["English", "Spanish"],
    audience: {
      "@type": "Audience",
      audienceType: "Latino and Spanish-speaking families in rural Colorado",
      geographicArea: AREA_SERVED,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "community support",
      url: `${SITE_URL}/contact`,
      availableLanguage: ["English", "Spanish"],
    },
    // El catalogo de servicios va aqui: es lo que leen los motores de respuesta
    // cuando alguien pregunta que ofrece la organizacion.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios gratuitos de Viva Resource",
      itemListElement: SERVICES.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          serviceType: service.serviceType,
          description: service.description,
          provider: { "@id": `${SITE_URL}#organization` },
          areaServed: AREA_SERVED,
          availableLanguage: ["English", "Spanish"],
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: "Free of charge",
          },
        },
      })),
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: "Viva Resource",
    description:
      "Community resources and free bilingual support services in rural Colorado.",
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: ["en", "es"],
  };

  return (
    <script
      id="schema-site"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([organization, website]) }}
    />
  );
}
