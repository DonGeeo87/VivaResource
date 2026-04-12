// Metadata helper for public pages
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.org";

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}

export function generatePageMeta({ title, description, path, keywords = [], image }: PageMetaProps): Metadata {
  const fullTitle = `${title} | Viva Resource Foundation`;
  const imageUrl = image ? `${siteUrl}${image}` : `${siteUrl}/logo-rectangular.png`;

  return {
    title: fullTitle,
    description,
    keywords: [
      ...keywords,
      "immigrant resources Colorado",
      "ayuda inmigrante Denver",
      "community services Colorado",
      "nonprofit Colorado immigrant",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "es_ES",
      url: `${siteUrl}${path}`,
      siteName: "Viva Resource Foundation",
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${siteUrl}${path}`,
    },
  };
}
