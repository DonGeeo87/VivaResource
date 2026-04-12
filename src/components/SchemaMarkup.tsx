"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.org";

interface SchemaMarkupProps {
  type?: "organization" | "localBusiness" | "event" | "article" | "breadcrumb";
  data?: Record<string, unknown>;
}

/**
 * Organization Schema - Always included in root layout
 * Reads social media URLs from Firestore seo_settings collection
 */
function OrganizationSchema() {
  const [sameAs, setSameAs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSocialUrls() {
      try {
        const snapshot = await getDocs(collection(db, "seo_settings"));
        const settings: Record<string, string> = {};
        snapshot.forEach((doc) => {
          settings[doc.id] = doc.data().value as string;
        });

        const socialKeys = [
          "facebook_url",
          "twitter_url",
          "instagram_url",
          "linkedin_url",
          "youtube_url",
          "tiktok_url",
        ];
        const urls = socialKeys
          .map((key) => settings[key])
          .filter((url): url is string => !!url && url.startsWith("http"));
        setSameAs(urls);
      } catch {
        // Use empty array if fetch fails
      }
    }
    fetchSocialUrls();
  }, []);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    name: "Viva Resource Foundation",
    alternateName: "Viva Resource",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/logo-rectangular.png`,
    description:
      "Viva Resource Foundation provides essential immigrant resources, community services, and advocacy in Colorado, USA.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "13055 Bradshaw Drive #301",
      addressLocality: "Peyton",
      addressRegion: "CO",
      postalCode: "80831",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-000-000-0000",
      contactType: "customer service",
      availableLanguage: ["English", "Spanish"],
    },
    sameAs,
    foundingDate: "2008",
    areaServed: {
      "@type": "State",
      name: "Colorado",
    },
  };

  return (
    <Script
      id="schema-organization"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * LocalBusiness Schema - For Colorado location
 */
function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}#localbusiness`,
    name: "Viva Resource Foundation",
    image: `${siteUrl}/logo-rectangular.png`,
    url: siteUrl,
    telephone: "",
    address: {
      "@type": "PostalAddress",
      streetAddress: "13055 Bradshaw Drive #301",
      addressLocality: "Peyton",
      addressRegion: "CO",
      postalCode: "80831",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 39.0639,
      longitude: -104.4619,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    priceRange: "$$",
    areaServed: [
      {
        "@type": "City",
        name: "Peyton",
        sameAs: "https://en.wikipedia.org/wiki/Peyton,_Colorado",
      },
      {
        "@type": "City",
        name: "Denver",
        sameAs: "https://en.wikipedia.org/wiki/Denver",
      },
      {
        "@type": "State",
        name: "Colorado",
      },
    ],
    serviceType: [
      "Immigrant Resources",
      "Community Services",
      "Food Assistance",
      "Housing Support",
      "Legal Aid Referrals",
      "Healthcare Navigation",
      "Educational Workshops",
    ],
    availableLanguage: ["English", "Spanish"],
    isAcceptingNewCustomers: true,
  };

  return (
    <Script
      id="schema-localbusiness"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * WebSite Schema - For sitelinks search
 */
function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    url: siteUrl,
    name: "Viva Resource Foundation",
    description:
      "Immigrant resources and community services in Colorado, USA",
    publisher: {
      "@id": `${siteUrl}#organization`,
    },
    inLanguage: ["en", "es"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/resources?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="schema-website"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Event Schema - For individual event pages
 */
function EventSchema({ data }: { data: Record<string, unknown> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: (data.title as string) || "",
    description: (data.description as string) || "",
    startDate: (data.date as string) || "",
    location: {
      "@type": "Place",
      name: (data.location as string) || "Viva Resource Foundation",
      address: {
        "@type": "PostalAddress",
        streetAddress: "13055 Bradshaw Drive #301",
        addressLocality: "Peyton",
        addressRegion: "CO",
        postalCode: "80831",
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Viva Resource Foundation",
      url: siteUrl,
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
    },
  };

  return (
    <Script
      id="schema-event"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Article Schema - For blog posts
 */
function ArticleSchema({ data }: { data: Record<string, unknown> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: (data.title as string) || "",
    description: (data.excerpt as string) || "",
    image: (data.featured_image as string) || `${siteUrl}/logo-rectangular.png`,
    datePublished: (data.published_at as string) || new Date().toISOString(),
    dateModified: (data.updated_at as string) || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: (data.author as string) || "Viva Resource Foundation",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Viva Resource Foundation",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${data.slug as string}`,
    },
    keywords: (data.keywords as string) || "immigrant resources Colorado, community services",
    articleSection: (data.category as string) || "News",
    inLanguage: ["en", "es"],
  };

  return (
    <Script
      id="schema-article"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * BreadcrumbList Schema - For navigation structure
 */
function BreadcrumbSchema({ data }: { data?: { items: { name: string; url: string }[] } }) {
  const items = data?.items || [
    { name: "Home", url: siteUrl },
  ];

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

  return (
    <Script
      id="schema-breadcrumb"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Main SchemaMarkup Component
 * By default renders organization + localBusiness + website schemas
 * Can be customized with type and data props for specific pages
 */
export default function SchemaMarkup({ type, data }: SchemaMarkupProps): JSX.Element {
  // Always render base schemas in root layout
  if (!type) {
    return (
      <>
        <OrganizationSchema />
        <LocalBusinessSchema />
        <WebSiteSchema />
      </>
    );
  }

  // Render specific schema based on type
  switch (type) {
    case "event":
      return <EventSchema data={data || {}} />;
    case "article":
      return <ArticleSchema data={data || {}} />;
    case "breadcrumb":
      return <BreadcrumbSchema data={data as { items: { name: string; url: string }[] } | undefined} />;
    default:
      return <></>;
  }
}
