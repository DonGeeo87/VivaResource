import type { Metadata } from "next";
import { headers } from "next/headers";
import { Plus_Jakarta_Sans, Public_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageDir from "@/components/LanguageDir";
import ClientLayout from "@/components/ClientLayout";
import SchemaMarkup from "@/components/SchemaMarkup";
import { SiteImageProvider } from "@/contexts/SiteImageContext";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com";

/** Path publico (con prefijo /es si aplica), inyectado por el middleware. */
function currentPath(): string {
  try {
    return headers().get("x-public-path") || "/";
  } catch {
    return "/";
  }
}

/** Idioma activo segun la cookie que marca el middleware. */
function currentLang(): "en" | "es" {
  try {
    const h = headers();
    // El middleware inyecta x-public-path EN LA REQUEST de esta misma peticion,
    // asi que es la fuente fiable. La cookie viva-lang se marca en la RESPUESTA
    // y todavia no existe cuando el layout se renderiza.
    const path = h.get("x-public-path") || "";
    if (path === "/es" || path.startsWith("/es/")) return "es";
    // Peticiones internas sin middleware: caer a la cookie.
    const cookie = h.get("cookie") || "";
    const m = cookie.match(/(?:^|;\s*)viva-lang=(en|es)/);
    return m && m[1] === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

/** El canonical debe incluir el prefijo de idioma cuando la URL lo tiene. */
function canonicalForLang(canonical: string, path: string): string {
  const base = canonical.replace(/\/$/, "");
  if (path === "/" || path === "/es" || path === "/es/") {
    return path.startsWith("/es") ? `${base}/es` : base;
  }
  return `${base}${path}`;
}

/**
 * Metadata global. Los valores SEO editables se leen de `seo_settings` (panel
 * /admin/seo); si la DB no responde se usan los defaults de abajo.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { getSeoSettings } = await import("@/lib/seo-settings");
  const s = await getSeoSettings();

  const defaultTitle = "Viva Resource | Community Resources in Rural Colorado";
  const defaultDescription =
    "Viva Resource is a 501(c)(3) nonprofit connecting rural Colorado communities with essential resources: food assistance, housing support, healthcare navigation, educational workshops, emergency response, and legal aid referrals. Free bilingual support for all residents of El Paso County, Colorado.";

  const title = s.site_title || defaultTitle;
  const description = s.site_description || defaultDescription;
  const canonical = s.canonical_url || siteUrl;
  const ogImage = s.og_default_image || `${siteUrl}/og-viva.jpg`;
  const ogImageAlt = s.og_image_alt || "Viva Resource — Community Resources in Rural Colorado";
  const keywords = s.site_keywords
    ? s.site_keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : defaultKeywords;

  return {
    metadataBase: new URL(canonical),
    title: {
      default: title,
      template: "%s | Viva Resource",
    },
    description,
    alternates: {
      canonical: canonicalForLang(canonical, currentPath()),
    },
    keywords,
    authors: [{ name: "Viva Resource", url: canonical }],
    creator: "Viva Resource",
    publisher: "Viva Resource",
    icons: {
      icon: "/favicon-vivaresource.png",
      apple: "/apple-touch-icon.png",
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "es_US",
      url: canonical,
      siteName: s.og_site_name || "Viva Resource",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: ogImage.endsWith("logo-rectangular.png") ? 1400 : 1200,
          height: ogImage.endsWith("logo-rectangular.png") ? 600 : 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: (s.twitter_card_type as "summary_large_image") || "summary_large_image",
      title,
      description,
      images: [ogImage],
      ...(s.twitter_handle ? { site: s.twitter_handle, creator: s.twitter_handle } : {}),
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
      ...(s.google_verification_code ? { google: s.google_verification_code } : {}),
      ...(s.bing_verification_code ? { other: { "msvalidate.01": s.bing_verification_code } } : {}),
    },
    category: "Nonprofit Organization",
    // Preconnect y DNS prefetch para mejorar performance
    other: {
      preconnect: [
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://firestore.googleapis.com",
        "https://www.google.com",
        "https://www.gstatic.com",
      ],
      "dns-prefetch": "https://res.cloudinary.com",
    },
  };
}

const defaultKeywords = [
  "community resources Colorado",
  "recursos comunitarios Colorado",
  "food assistance El Paso County",
  "housing support Peyton CO",
  "rural Colorado nonprofit",
  "501c3 nonprofit Colorado",
  "healthcare navigation Colorado",
  "ayuda comunitaria Colorado Springs",
  "emergency assistance rural Colorado",
  "legal aid referrals Colorado",
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // El middleware marca la cookie al entrar a /es/*. Leerla aqui hace que el
  // HTML salga ya en espanol desde el servidor (Google no ejecuta JS ni tiene
  // localStorage, asi que antes solo veia la version en ingles).
  const lang = currentLang();

  return (
    <html lang={lang} className="scroll-smooth">
      {/*
        Facebook exige `property="fb:app_id"`; el objeto metadata de Next solo
        emite `name=`, que Meta ignora (aviso "Faltan propiedades obligatorias").
        Se define en build-time porque las paginas son estaticas.
      */}
      <head>
        {process.env.NEXT_PUBLIC_FB_APP_ID ? (
          <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FB_APP_ID} />
        ) : null}
        {/* hreflang: Next descarta alternates.languages cuando el canonical es
            dinamico, asi que se declaran a mano para que Google indexe ambas
            versiones del sitio. */}
        {(() => {
          const base = canonicalForLang(siteUrl, "/");
          const withoutEs = currentPath().replace(/^\/es(?=\/|$)/, "") || "/";
          const enUrl = canonicalForLang(siteUrl, withoutEs);
          const esUrl = canonicalForLang(siteUrl, `/es${withoutEs === "/" ? "" : withoutEs}`);
          return (
            <>
              <link rel="alternate" hrefLang="en" href={enUrl} />
              <link rel="alternate" hrefLang="es" href={esUrl} />
              <link rel="alternate" hrefLang="x-default" href={base} />
            </>
          );
        })()}
      </head>
      <body
        className={`${plusJakarta.variable} ${publicSans.variable} font-body antialiased bg-surface text-on-surface`}
      >
        <SchemaMarkup />
          <LanguageProvider initialLanguage={lang}>
          <SiteImageProvider>
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
          </SiteImageProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
