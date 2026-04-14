import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Public_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageDir from "@/components/LanguageDir";
import ClientLayout from "@/components/ClientLayout";
import SchemaMarkup from "@/components/SchemaMarkup";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Viva Resource Foundation | Immigrant Resources in Colorado, USA",
    template: "%s | Viva Resource Foundation",
  },
  description:
    "Viva Resource Foundation provides essential immigrant resources, community services, and advocacy in Colorado, USA. Free bilingual support for housing, food, legal aid, healthcare, and education in Denver, Peyton, and rural Colorado communities.",
  // Canonical URL para evitar contenido duplicado
  alternates: {
    canonical: siteUrl,
  },
  keywords: [
    "immigrant resources Colorado",
    "ayuda inmigrante Denver",
    "community services Colorado",
    "immigrant support Peyton CO",
    "bilingual services Colorado",
    "nonprofit Colorado immigrant",
    "recursos para inmigrantes Colorado",
    "Colorado community foundation",
    "immigrant advocacy Denver",
    "rural community services Colorado",
  ],
  authors: [{ name: "Viva Resource Foundation", url: siteUrl }],
  creator: "Viva Resource Foundation",
  publisher: "Viva Resource Foundation",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_ES",
    url: siteUrl,
    siteName: "Viva Resource Foundation",
    title: "Viva Resource Foundation | Immigrant Resources in Colorado, USA",
    description:
      "Essential immigrant resources and community services in Colorado. Free bilingual support for housing, food, legal aid, healthcare, and education.",
    images: [
      {
        url: "/logo-rectangular.png",
        width: 1400,
        height: 600,
        alt: "Viva Resource Foundation Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viva Resource Foundation | Immigrant Resources in Colorado",
    description:
      "Essential immigrant resources and community services in Colorado. Free bilingual support.",
    images: ["/logo-rectangular.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification here when available
    // google: "your-verification-code",
  },
  category: "Nonprofit Organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect a orígenes externos para reducir latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch para orígenes adicionales */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${plusJakarta.variable} ${publicSans.variable} font-body antialiased bg-surface text-on-surface`}
      >
        <SchemaMarkup />
          <LanguageProvider>
          <LanguageDir />
          {/* Skip Link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-white focus:rounded-full focus:font-bold focus:outline-none focus:ring-4 focus:ring-primary/50"
          >
            Skip to main content
          </a>
          <ClientLayout>
            {children}
          </ClientLayout>
        </LanguageProvider>
      </body>
    </html>
  );
}
