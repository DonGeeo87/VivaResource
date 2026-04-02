import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import SchemaMarkup from "@/components/SchemaMarkup";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.org";

interface BlogPost {
  id: string;
  title_en: string;
  title_es: string;
  slug: string;
  excerpt_en: string;
  excerpt_es: string;
  content_en: string;
  content_es: string;
  category: string;
  featured_image: string;
  author: string;
  status: string;
  published_at: unknown;
  created_at: unknown;
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const q = query(
      collection(db, "blog_posts"),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as BlogPost;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

// Generate metadata for dynamic blog posts
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | Viva Resource Foundation",
    };
  }

  const title = post.title_en || post.title_es;
  const excerpt = post.excerpt_en || post.excerpt_es;

  return {
    title: `${title} | Viva Resource Foundation Blog - Colorado`,
    description: excerpt || `Read about ${title.toLowerCase()} and community impact in Colorado.`,
    keywords: [
      title.toLowerCase(),
      "Colorado immigrant stories",
      "community impact Colorado",
      post.category,
      "Denver community",
    ],
    openGraph: {
      title: `${title} | Viva Resource Foundation`,
      description: excerpt || `Read about ${title.toLowerCase()} and community impact in Colorado.`,
      type: "article",
      images: post.featured_image
        ? [{ url: post.featured_image, width: 1200, height: 630, alt: title }]
        : [{ url: `${siteUrl}/logo-rectangular.png`, width: 1400, height: 600, alt: "Viva Resource Foundation" }],
    },
  };
}

function formatDate(timestamp: unknown): string {
  if (!timestamp) return "";
  try {
    const date =
      typeof timestamp === "object" && "toDate" in timestamp
        ? (timestamp as { toDate: () => Date }).toDate()
        : new Date(timestamp as string | number);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function getCategoryLabel(category: string): string {
  const categories: Record<string, string> = {
    news: "News / Noticias",
    impact: "Impact / Impacto",
    resources: "Resources / Recursos",
    events: "Events / Eventos",
  };
  return categories[category] || category;
}

function sanitizeHtml(html: string): string {
  // Basic sanitization: remove script tags and event handlers
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
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Detect user language from cookie
  let userLang: "en" | "es" = "en";
  try {
    const cookieStore = cookies();
    const langCookie = cookieStore.get("viva-lang");
    if (langCookie && (langCookie.value === "es" || langCookie.value === "en")) {
      userLang = langCookie.value as "en" | "es";
    }
  } catch {
    // Default to English if cookie not available
  }

  // Use user's preferred language, fallback to available content
  const title = userLang === "es" && post.title_es ? post.title_es : post.title_en;
  const content = userLang === "es" && post.content_es ? post.content_es : post.content_en;
  const excerpt = userLang === "es" && post.excerpt_es ? post.excerpt_es : post.excerpt_en;
  const dateStr = formatDate(post.published_at || post.created_at);

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
          keywords: `${title}, Colorado immigrant stories, community impact`,
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
          href="/blog"
          className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog / Volver al Blog
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-1 rounded-full bg-primary-container text-on-primary-container font-label text-xs font-bold">
            {getCategoryLabel(post.category)}
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

      {/* Bottom CTA */}
      <section className="bg-surface-low py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">
            Enjoyed this article?
          </h2>
          <p className="text-on-surface-variant mb-8">
            Explore more stories of impact and community empowerment.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold text-sm hover:opacity-90 transition-all"
          >
            Read More Articles
          </Link>
        </div>
      </section>
    </main>
  );
}
