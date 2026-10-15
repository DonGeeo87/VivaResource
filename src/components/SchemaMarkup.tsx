import { SITE_URL } from "@/lib/site-url";

/**
 * Structured data por pagina (article, breadcrumb, event, faq, service).
 *
 * Se renderiza con <script type="application/ld+json"> normal, NO con
 * next/script: asi el bloque sale en el HTML del servidor y lo leen tanto
 * Google como los bots que no ejecutan JavaScript (GPTBot, PerplexityBot,
 * ClaudeBot). Antes este archivo usaba next/script + useEffect y el HTML
 * servido no tenia ningun ld+json.
 *
 * Sin hooks ni "use client": se puede importar desde paginas de servidor o de
 * cliente. El schema base del sitio (Organization, WebSite, catalogo de
 * servicios) vive en SiteSchema.tsx, dentro del layout raiz.
 */

interface SchemaMarkupProps {
  type?: "event" | "eventList" | "article" | "breadcrumb" | "faq" | "service" | "webpage";
  data?: Record<string, unknown>;
}

interface FaqItem {
  question: string;
  answer: string;
}

function scriptTag(id: string, schema: Record<string, unknown>): JSX.Element {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function EventSchema({ data }: { data: Record<string, unknown> }): JSX.Element {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: (data.title as string) || "",
    description: (data.description as string) || "",
    startDate: (data.date as string) || "",
    ...(data.endDate ? { endDate: (data.endDate as string) } : {}),
    location: {
      "@type": "Place",
      name: (data.location as string) || "Viva Resource",
      address: {
        "@type": "PostalAddress",
        streetAddress: (data.streetAddress as string) || undefined,
        addressLocality: (data.city as string) || "Colorado Springs",
        addressRegion: "CO",
        addressCountry: "US",
      },
    },
    organizer: { "@type": "Organization", "@id": `${SITE_URL}#organization`, name: "Viva Resource", url: SITE_URL },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(data.image ? { image: (data.image as string) } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    inLanguage: [(data.language as string) || "en"],
  };
  return scriptTag("schema-event", schema);
}

function EventListSchema({ data }: { data?: { events?: Record<string, unknown>[] } }): JSX.Element {
  const events = data?.events || [];
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: (event.name as string) || "",
        ...(event.description ? { description: event.description as string } : {}),
        startDate: (event.startDate as string) || "",
        ...(event.endDate ? { endDate: event.endDate as string } : {}),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: (event.location as string) || "Viva Resource",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Peyton",
            addressRegion: "CO",
            addressCountry: "US",
          },
        },
        organizer: { "@id": `${SITE_URL}#organization` },
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        ...(event.url ? { url: event.url as string } : {}),
        ...(event.image ? { image: event.image as string } : {}),
      },
    })),
  };
  return scriptTag("schema-event-list", schema);
}

function ArticleSchema({ data }: { data: Record<string, unknown> }): JSX.Element {
  const lang = (data.language as string) === "es" ? "es" : "en";
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Article", "BlogPosting"],
    headline: (data.title as string) || "",
    description: (data.excerpt as string) || "",
    image: (data.featured_image as string) || `${SITE_URL}/logo-rectangular.png`,
    datePublished: (data.published_at as string) || new Date().toISOString(),
    dateModified: (data.updated_at as string) || (data.published_at as string) || new Date().toISOString(),
    author: { "@type": "Organization", "@id": `${SITE_URL}#organization`, name: "Viva Resource", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "Viva Resource",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${data.slug as string}` },
    keywords: (data.keywords as string) || "community resources Colorado, community services",
    articleSection: (data.category as string) || "Resources",
    isAccessibleForFree: true,
    inLanguage: lang,
  };
  return scriptTag("schema-article", schema);
}

function BreadcrumbSchema({ data }: { data?: { items: { name: string; url: string }[] } }): JSX.Element {
  const items = data?.items || [{ name: "Home", url: SITE_URL }];
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return scriptTag("schema-breadcrumb", schema);
}

function FAQPageSchema({ data }: { data: { questions: FaqItem[] } }): JSX.Element | null {
  const items = data?.questions || [];
  if (items.length === 0) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return scriptTag("schema-faqpage", schema);
}

function ServiceSchema({ data }: { data: Record<string, unknown> }): JSX.Element {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}#service-${(data.slug as string) || "default"}`,
    name: (data.name as string) || "",
    description: (data.description as string) || "",
    provider: { "@type": "Organization", "@id": `${SITE_URL}#organization`, name: "Viva Resource", url: SITE_URL },
    areaServed: { "@type": "AdministrativeArea", name: "El Paso County, Colorado" },
    audience: { "@type": "Audience", name: "Residents of rural Colorado" },
    serviceType: (data.serviceType as string) || "Community Service",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    availableLanguage: ["English", "Spanish"],
  };
  return scriptTag(`schema-service-${(data.slug as string) || "default"}`, schema);
}

function WebPageSchema({ data }: { data: Record<string, unknown> }): JSX.Element {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": (data.url as string) || SITE_URL,
    url: (data.url as string) || SITE_URL,
    name: (data.title as string) || "Viva Resource",
    description: (data.description as string) || "",
    isPartOf: { "@id": `${SITE_URL}#website` },
    about: { "@id": `${SITE_URL}#organization` },
    inLanguage: (data.language as string) === "es" ? "es" : "en",
  };
  return scriptTag("schema-webpage", schema);
}

export default function SchemaMarkup({ type, data }: SchemaMarkupProps): JSX.Element {
  switch (type) {
    case "event":
      return <EventSchema data={data || {}} />;
    case "eventList":
      return <EventListSchema data={data as { events: Record<string, unknown>[] } | undefined} />;
    case "article":
      return <ArticleSchema data={data || {}} />;
    case "breadcrumb":
      return <BreadcrumbSchema data={data as { items: { name: string; url: string }[] } | undefined} />;
    case "faq":
      return <FAQPageSchema data={(data as { questions: FaqItem[] }) || { questions: [] }} />;
    case "service":
      return <ServiceSchema data={data || {}} />;
    case "webpage":
      return <WebPageSchema data={data || {}} />;
    default:
      return <></>;
  }
}
