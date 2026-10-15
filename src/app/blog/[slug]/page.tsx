import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import SchemaMarkup from "@/components/SchemaMarkup";
import { getPostBySlug as getPostFromDb, getPosts } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vivaresource.com";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  author: string;
  language: "en" | "es";
  status: string;
  published_at: unknown;
  created_at: unknown;
}

/**
 * Detect user's preferred language from the viva-lang cookie OR the slug suffix.
 * Los slugs de blog ya codifican el idioma (foo-es, foo-en), así que el idioma
 * del post se deriva del slug, no de la cookie del visitante.
 */
function getPostLanguage(slug: string): "en" | "es" {
  // Si el slug termina en -es o -en, ese es el idioma del post (determinante)
  if (slug.endsWith("-es")) return "es";
  if (slug.endsWith("-en")) return "en";
  // Fallback: cookie viva-lang
  try {
    const cookieStore = cookies();
    const langCookie = cookieStore.get("viva-lang");
    if (langCookie && (langCookie.value === "es" || langCookie.value === "en")) {
      return langCookie.value as "en" | "es";
    }
  } catch {
    // Default to English if cookie not available
  }
  return "en";
}

/**
 * Fetch a published blog post by slug and user language.
 * Wrapped in React cache() to deduplicate calls within the same request
 * (called by both generateMetadata and BlogPostPage).
 */
const getPostBySlug = cache(async (slug: string, userLang: "en" | "es"): Promise<BlogPost | null> => {
  try {
    const post = await getPostFromDb(slug);
    if (!post || post.language !== userLang || post.status !== "published") {
      return null;
    }
    return post as BlogPost;
  } catch (error) {
    console.error(`Error fetching blog post "${slug}":`, error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const userLang = getPostLanguage(params.slug);
  const post = await getPostBySlug(params.slug, userLang);

  if (!post) {
    return {
      title: "Post Not Found | Viva Resource",
    };
  }

  const title = post.title;
  const excerpt = post.excerpt;
  // El slug ya lleva el idioma (foo-en / foo-es): esa es la URL canonica, sin
  // prefijo /es, y es la que el sitemap publica.
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title,
    description: excerpt || `Read about ${title.toLowerCase()} and community impact in Colorado.`,
    keywords: [
      title.toLowerCase(),
      "Colorado community stories",
      "community impact Colorado",
      post.category,
      "rural Colorado community",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      url: canonicalUrl,
      title: `${title} | Viva Resource`,
      description: excerpt || `Read about ${title.toLowerCase()} and community impact in Colorado.`,
      type: "article",
      locale: post.language === "es" ? "es_US" : "en_US",
      images: post.featured_image
        ? [{ url: post.featured_image, width: 1200, height: 630, alt: title }]
        : [{ url: `${siteUrl}/og-viva.jpg`, width: 1200, height: 630, alt: "Viva Resource" }],
    },
  };
}

function formatDate(timestamp: unknown, locale = "en-US"): string {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp as string | number);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function getCategoryLabel(category: string, isEs = false): string {
  const categories: Record<string, string> = {
    news: isEs ? "Noticias" : "News",
    impact: isEs ? "Impacto" : "Impact",
    resources: isEs ? "Recursos" : "Resources",
    events: isEs ? "Eventos" : "Events",
  };
  return categories[category] || category;
}

function sanitizeHtml(html: string): string {
  // NOTE: This is basic regex-based sanitization. It strips <script> tags
  // and on* event handlers but does NOT cover all XSS vectors (javascript: URLs,
  // <iframe>, <object>, <svg onload>, CSS expressions, etc.).
  // Since content originates from the authenticated admin BlogEditor (React Quill)
  // and not from untrusted user input, the attack surface is limited.
  // For production with external content authors, replace with DOMPurify
  // (isomorphic-dompurify for SSR compatibility).
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*\S+/gi, "");
  return sanitized;
}

function renderContent(content: string): JSX.Element {
  // Content from Quill.js is already HTML, so we render it directly
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div
      className="prose-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}): Promise<JSX.Element> {
  const userLang = getPostLanguage(params.slug);
  const post = await getPostBySlug(params.slug, userLang);

  if (!post) {
    notFound();
  }

  const title = post.title;
  const content = post.content;
  const excerpt = post.excerpt;
  const dateStr = formatDate(post.published_at || post.created_at, userLang === "es" ? "es-US" : "en-US");

  const isEs = userLang === "es";
  const blogBase = isEs ? "/es/blog" : "/blog";

  // Posts relacionados: mismo idioma y, primero, la misma categoria. Antes cada
  // post era una isla (cero enlaces internos) y Google solo los encontraba por
  // el sitemap.
  let related: Array<{ slug: string; title: string; excerpt: string; category: string }> = [];
  try {
    const all = await getPosts({ lang: userLang, limit: 50 });
    const others = all.filter((candidate) => candidate.slug !== post.slug);
    others.sort(
      (a, b) => Number(b.category === post.category) - Number(a.category === post.category)
    );
    related = others.slice(0, 3).map((candidate) => ({
      slug: candidate.slug,
      title: candidate.title,
      excerpt: candidate.excerpt,
      category: candidate.category,
    }));
  } catch {
    related = [];
  }

  // Parse published_at for schema
  let publishedDate = new Date().toISOString();
  if (post.published_at) {
    try {
      const date =
        typeof post.published_at === "object" && "toDate" in post.published_at
          ? (post.published_at as { toDate: () => Date }).toDate()
          : new Date(post.published_at as string | number);
      publishedDate = date.toISOString();
    } catch {
      // Use default date
    }
  }

  return (
    <main className="bg-surface text-on-surface font-body">
      {/* Schema Markup for Article */}
      <SchemaMarkup
        type="article"
        data={{
          title,
          excerpt,
          featured_image: post.featured_image,
          author: post.author,
          published_at: publishedDate,
          slug: post.slug,
          category: post.category,
          keywords: `${title}, Colorado community stories, community impact`,
        }}
      />
      <SchemaMarkup
        type="breadcrumb"
        data={{
          items: [
            { name: "Home", url: siteUrl },
            { name: "Blog", url: `${siteUrl}/blog` },
            { name: title, url: `${siteUrl}/blog/${post.slug}` },
          ],
        }}
      />
      {/* Back to Blog Link */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link
          href={blogBase}
          className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {userLang === "es" ? "Volver al Blog" : "Back to Blog"}
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-1 rounded-full bg-primary-container text-on-primary-container font-label text-xs font-bold">
            {getCategoryLabel(post.category, userLang === "es")}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tighter mb-6">
          {title}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
            {excerpt}
          </p>
        )}

        {/* Author and Date */}
        <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-sm mb-8">
          {post.author && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          )}
          {dateStr && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{dateStr}</span>
            </div>
          )}
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <section className="max-w-5xl mx-auto px-6 mb-12">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
            <Image
              src={post.featured_image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </section>
      )}

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="prose prose-lg max-w-none">
          {renderContent(content)}
        </div>
      </section>

      {/* Related posts: enlaces internos reales dentro del blog */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">
            {isEs ? "Sigue leyendo" : "Keep reading"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`${blogBase}/${item.slug}`}
                className="block p-6 rounded-xl bg-surface-low hover:bg-primary-container transition-colors"
              >
                <span className="text-secondary font-bold uppercase tracking-widest text-[10px]">
                  {getCategoryLabel(item.category, userLang === "es")}
                </span>
                <h3 className="font-headline text-lg font-bold text-on-surface mt-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-on-surface-variant text-sm line-clamp-3">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-surface-low py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">
            {isEs ? "¿Te sirvió este artículo?" : "Enjoyed this article?"}
          </h2>
          <p className="text-on-surface-variant mb-8">
            {isEs
              ? "Explora más guías y recursos para tu familia."
              : "Explore more stories of impact and community empowerment."}
          </p>
          <Link
            href={blogBase}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold text-sm hover:opacity-90 transition-all"
          >
            {isEs ? "Ver más artículos" : "Read More Articles"}
          </Link>
        </div>
      </section>
    </main>
  );
}
