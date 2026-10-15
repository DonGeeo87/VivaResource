"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BlogHeroSkeleton, BlogFeaturedSkeleton, BlogGridSkeleton } from "@/components/Skeleton";
import NewsletterForm from "@/components/NewsletterForm";

export interface BlogListPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featured_image: string;
  language: "en" | "es";
  published_at: string | null;
}

interface BlogListClientProps {
  initialPosts: BlogListPost[];
  initialLang: "en" | "es";
}

const categories = [
  { id: "all", label: "All / Todos" },
  { id: "news", label: "News / Noticias" },
  { id: "impact", label: "Impact / Impacto" },
  { id: "resources", label: "Resources / Recursos" },
  { id: "events", label: "Events / Eventos" },
];

const MONTHS: Record<"en" | "es", string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};

/**
 * Fecha del post sin depender del locale del runtime: el servidor y el browser
 * tienen que producir el mismo string o React marca error de hidratacion.
 */
function formatPostDate(iso: string | null, lang: "en" | "es"): string {
  if (!iso) return "";
  const parts = iso.slice(0, 10).split("-");
  if (parts.length !== 3) return "";
  const [year, month, day] = parts;
  const monthName = MONTHS[lang][Number(month) - 1];
  if (!monthName) return "";
  return lang === "es"
    ? `${Number(day)} de ${monthName} de ${year}`
    : `${monthName} ${Number(day)}, ${year}`;
}

export default function BlogListClient({ initialPosts, initialLang }: BlogListClientProps) {
  const { translations, language } = useLanguage();
  const { blog: t } = translations;
  const [posts, setPosts] = useState<BlogListPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const handleImageError = (imageSrc: string) => {
    setBrokenImages((prev) => new Set(prev).add(imageSrc));
  };

  // El listado inicial viene renderizado del servidor (Google lo lee sin JS).
  // Solo se vuelve a pedir a la API si el visitante cambia de idioma en la
  // misma sesion.
  useEffect(() => {
    if (language === initialLang) return;
    let cancelled = false;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v2/blog/list?lang=${language}`);
        const data = await res.json();
        if (!cancelled && data.posts) {
          setPosts(
            (data.posts as BlogListPost[]).map((post) => ({
              ...post,
              language: post.language === "es" ? "es" : "en",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, [language, initialLang]);

  const getCategory = (post: BlogListPost) => {
    const isEs = language === "es";
    const cats: Record<string, string> = {
      news: isEs ? "Noticias" : "News",
      impact: isEs ? "Impacto" : "Impact",
      resources: isEs ? "Recursos" : "Resources",
      events: isEs ? "Eventos" : "Events",
    };
    return cats[post.category] || post.category || (isEs ? "Sin categoría" : "Uncategorized");
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = (post.title?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Default placeholder image for posts without featured_image
  const placeholderImage = "/photo-bank/hero_01.jpg";

  // Cada idioma tiene su propia URL de listado: /blog y /es/blog.
  const blogBase = language === "es" ? "/es/blog" : "/blog";
  const postHref = (post: BlogListPost) => `${blogBase}/${post.slug}`;

  if (loading) {
    return (
      <main className="bg-surface text-on-surface font-body">
        <BlogHeroSkeleton />
        <BlogFeaturedSkeleton />
        <BlogGridSkeleton />
      </main>
    );
  }

  return (
    <main className="bg-surface text-on-surface font-body">
      {/* Hero Header */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-container">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label text-xs font-bold mb-4 md:mb-6">
            {language === "es" ? "NUESTRAS HISTORIAS" : "OUR STORIES"}
          </span>
          <h1 className="font-headline font-extrabold text-3xl md:text-5xl lg:text-7xl text-on-primary tracking-tighter mb-6 md:mb-8 max-w-4xl">
            {t.title}
          </h1>
          <p className="font-body text-base md:text-lg text-on-primary-container max-w-2xl opacity-90 leading-relaxed">
            {t.subtitle || "Explore our latest updates, community success stories, and critical insights into how we're building a stronger future together."}
          </p>
        </div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
      </section>

      {/* Featured Article - Only show if there are posts */}
      {filteredPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 mb-24">
          <div className="bg-white rounded-xl shadow-ambient-lg overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-3/5 h-[400px] lg:h-[420px] overflow-hidden">
              <Image
                src={brokenImages.has(filteredPosts[0].featured_image) ? placeholderImage : filteredPosts[0].featured_image || placeholderImage}
                alt={filteredPosts[0].title}
                width={800}
                height={600}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                priority
                onError={() => handleImageError(filteredPosts[0].featured_image)}
              />
            </div>
            <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1 h-8 bg-secondary rounded-full"></span>
                <span className="text-secondary font-bold uppercase tracking-widest text-xs">
                  {getCategory(filteredPosts[0])}
                </span>
              </div>
              <h2 className="font-headline text-3xl font-bold text-on-surface leading-tight mb-6">
                {filteredPosts[0].title}
              </h2>
              <p className="text-on-surface-variant font-body mb-8 leading-relaxed line-clamp-4">
                {filteredPosts[0].excerpt}
              </p>
              <div>
                <Link href={postHref(filteredPosts[0])} className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold text-sm tracking-wide hover:opacity-90 transition-all flex items-center gap-2 inline-flex">
                  {t.readMore}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter Bar */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between border-b-4 border-primary/10 pb-8">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface-low border-none rounded-xl focus:ring-2 focus:ring-primary font-body text-on-surface"
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-label font-bold text-xs uppercase transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">{t.noResults || "No articles found"}</p>
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="mt-4 text-primary font-bold text-sm hover:underline"
              >
                {language === "es" ? "Ver todas las categorías" : "View all categories"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.map((post) => (
              <article key={post.id} className="group">
                <div className="aspect-[4/3] mb-6 overflow-hidden rounded-xl relative">
                  <Image
                    src={brokenImages.has(post.featured_image) ? placeholderImage : post.featured_image || placeholderImage}
                    alt={post.title}
                    width={600}
                    height={450}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => handleImageError(post.featured_image)}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-primary">
                    {getCategory(post)}
                  </div>
                </div>
                <div className="px-2">
                  <div className="text-outline text-xs font-bold mb-3 uppercase tracking-tighter">
                    {formatPostDate(post.published_at, post.language)}
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">
                    <Link href={postHref(post)}>{post.title}</Link>
                  </h3>
                  <p className="text-on-surface-variant font-body text-sm mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <Link href={postHref(post)} className="text-primary font-bold text-sm flex items-center gap-2 group/btn">
                    {t.readMore}
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Signup */}
      <section className="bg-surface-low py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-6">
            {t.newsletterTitle || "Stay Connected"}
          </h2>
          <p className="font-body text-on-surface-variant mb-10 text-lg">
            {t.newsletterDesc || "Join our newsletter to receive weekly stories of hope and impact directly in your inbox."}
          </p>
          <NewsletterForm variant="footer" />
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-7xl mx-auto bg-primary text-on-primary rounded-3xl p-12 md:p-20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-8">
              {t.ctaTitle || "Ready to Make a Difference?"}
            </h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl font-body">
              {t.ctaDesc || "Your support fuels these stories. Join our volunteer network or donate today to help us continue our mission of community empowerment."}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/get-involved" className="bg-secondary-container text-on-secondary-container px-10 py-4 rounded-full font-headline font-bold text-sm hover:scale-105 transition-transform inline-flex">
                {translations.getInvolved?.volunteer || "Volunteer"}
              </Link>
              <Link href="/donate" className="border-2 border-white/30 text-white px-10 py-4 rounded-full font-headline font-bold text-sm hover:bg-white hover:text-primary transition-all inline-flex">
                {translations.getInvolved?.donate || "Donate Now"}
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full -ml-48 -mb-48"></div>
        </div>
      </section>
    </main>
  );
}
