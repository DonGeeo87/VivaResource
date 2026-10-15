// Metadata helper for public pages.
//
// El sitio es bilingue con URLs reales: el middleware reescribe /es/* a la ruta
// interna y deja el path publico en el header `x-public-path`. Este helper lee
// ese header para que cada pagina emita canonical, title y description en el
// idioma que realmente se sirve. Antes el canonical de /es/about apuntaba a
// /about, asi que Google lo tomaba como duplicado y solo indexaba el ingles.
import type { Metadata } from "next";
import { headers } from "next/headers";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com"
).replace(/\/+$/, "");

export interface LangContext {
  /** Idioma que se esta sirviendo en esta request. */
  lang: "en" | "es";
  /** Path publico tal como lo pidio el visitante (con prefijo /es si aplica). */
  publicPath: string;
  /** Path sin prefijo de idioma (el que usan las rutas internas). */
  barePath: string;
}

/** Idioma y paths de la request actual, derivados del header del middleware. */
export function langContext(): LangContext {
  let publicPath = "/";
  try {
    publicPath = headers().get("x-public-path") || "/";
  } catch {
    // Sin contexto de request (build): se asume ingles.
    publicPath = "/";
  }
  const lang: "en" | "es" =
    publicPath === "/es" || publicPath.startsWith("/es/") ? "es" : "en";
  const barePath = publicPath.replace(/^\/es(?=\/|$)/, "") || "/";
  return { lang, publicPath, barePath };
}

/** URL absoluta de una ruta interna en el idioma indicado. */
export function langUrl(path: string, lang: "en" | "es"): string {
  const clean =
    path === "/" || path === ""
      ? ""
      : (path.startsWith("/") ? path : `/${path}`).replace(/\/+$/, "");
  return lang === "es" ? `${SITE_URL}/es${clean}` : `${SITE_URL}${clean}`;
}

/**
 * Los slugs del blog ya codifican el idioma (foo-en / foo-es), asi que su
 * canonical no lleva prefijo /es: /blog/foo-es es la version en espanol.
 * Devuelve el slug base y el idioma, o null si la ruta no es un post.
 */
export function blogSlugLang(barePath: string): { base: string; lang: "en" | "es" } | null {
  const match = barePath.match(/^\/blog\/(.+)-(en|es)$/);
  if (!match) return null;
  return { base: match[1], lang: match[2] as "en" | "es" };
}

interface PageMetaProps {
  /** Ruta interna, sin prefijo de idioma (ej. "/about"). */
  path: string;
  title: string;
  description: string;
  /** Version en espanol del title/description, servida en /es/*. */
  titleEs?: string;
  descriptionEs?: string;
  keywords?: string[];
  image?: string;
  ogType?: "website" | "article";
  /** Override del canonical (los posts del blog no usan prefijo /es). */
  canonical?: string;
  /** Imagen de Open Graph absoluta (los posts guardan la URL completa). */
  ogImage?: string;
}

export function generatePageMeta({
  title,
  description,
  titleEs,
  descriptionEs,
  path,
  keywords = [],
  image,
  ogType = "website",
  canonical,
  ogImage,
}: PageMetaProps): Metadata {
  const { lang } = langContext();
  const isEs = lang === "es";

  const finalTitle = isEs ? titleEs || title : title;
  const finalDescription = isEs ? descriptionEs || description : description;

  const imageUrl = ogImage || (image ? `${SITE_URL}${image}` : `${SITE_URL}/og-viva.jpg`);
  const [imgW, imgH] = imageUrl.endsWith("logo-rectangular.png") ? [1400, 600] : [1200, 630];
  const canonicalUrl = canonical || langUrl(path, lang);

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: [
      ...keywords,
      "community resources Colorado",
      "recursos comunitarios Colorado",
      "rural Colorado nonprofit",
      "El Paso County community services",
    ],
    openGraph: {
      type: ogType,
      locale: isEs ? "es_US" : "en_US",
      alternateLocale: isEs ? "en_US" : "es_US",
      url: canonicalUrl,
      siteName: "Viva Resource",
      title: finalTitle,
      description: finalDescription,
      images: [
        {
          url: imageUrl,
          width: imgW,
          height: imgH,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
