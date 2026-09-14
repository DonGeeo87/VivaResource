// Metadata helper for public pages
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com";

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}

export function generatePageMeta({ title, description, path, keywords = [], image }: PageMetaProps): Metadata {
  const imageUrl = image ? `${siteUrl}${image}` : `${siteUrl}/logo-rectangular.png`;

  return {
    title,
    description,
    keywords: [
      ...keywords,
      "community resources Colorado",
      "recursos comunitarios Colorado",
      "rural Colorado nonprofit",
      "El Paso County community services",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "es_US",
      url: `${siteUrl}${path}`,
      siteName: "Viva Resource",
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1400,
          height: 600,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${siteUrl}${path}`,
    },
  };
}
