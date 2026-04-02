"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { BlogHeroSkeleton, BlogFeaturedSkeleton, BlogGridSkeleton } from "@/components/Skeleton";
import NewsletterForm from "@/components/NewsletterForm";

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

const categories = [
  { id: "all", label: "All / Todos" },
  { id: "news", label: "News / Noticias" },
  { id: "impact", label: "Impact / Impacto" },
  { id: "resources", label: "Resources / Recursos" },
  { id: "events", label: "Events / Eventos" },
];

export default function BlogPage() {
  const { translations, language } = useLanguage();
  const { blog: t } = translations;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      let snapshot;

      // Try ordering by published_at first
      try {
        const q = query(
          collection(db, "blog_posts"),
          orderBy("published_at", "desc")
        );
        snapshot = await getDocs(q);
      } catch {
        // Fallback to created_at if published_at doesn't exist or fails
        try {
          const q = query(
            collection(db, "blog_posts"),
            orderBy("created_at", "desc")
          );
          snapshot = await getDocs(q);
        } catch {
          // Final fallback: fetch without ordering
          console.log("Blog: Fetching without ordering (date fields may not exist)");
          const q = query(collection(db, "blog_posts"));
          snapshot = await getDocs(q);
        }
      }

      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];

      // Filter published posts on client side
      const publishedPosts = postsData.filter(post => post.status === "published");

      if (publishedPosts.length > 0) {
        setPosts(publishedPosts);
      } else {
        console.log(`Blog: Found ${postsData.length} total posts, ${publishedPosts.length} published`);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (post: BlogPost) => {
    if (language === "es" && post.title_es) return post.title_es;
    return post.title_en || post.title_es;
  };

  const getExcerpt = (post: BlogPost) => {
    if (language === "es" && post.excerpt_es) return post.excerpt_es;
    return post.excerpt_en || post.excerpt_es;
  };

  const getCategory = (post: BlogPost) => {
    const cats: Record<string, string> = {
      news: "News / Noticias",
      impact: "Impact / Impacto",
      resources: "Resources / Recursos",
      events: "Events / Eventos"
    };
    return cats[post.category] || post.category || "Uncategorized";
  };

  const filteredPosts = posts.filter(post => {
    const title = getTitle(post);
    const postCategory = post.category;
    
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || postCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Default placeholder image for posts without featured_image
  const placeholderImage = "https://images.unsplash.com/photo-1559027615-cd4628902d42";

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
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-container">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label text-xs font-bold mb-6">
            OUR STORIES / NUESTRAS HISTORIAS
          </span>
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-on-primary tracking-tighter mb-8 max-w-4xl">
            {t.title}
          </h1>
          <p className="font-body text-lg md:text-xl text-on-primary-container max-w-2xl opacity-90 leading-relaxed">
            {t.subtitle || "Explore our latest updates, community success stories, and critical insights into how we're building a stronger future together."}
          </p>
        </div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
      </section>

      {/* Featured Article - Only show if there are posts */}
      {!loading && posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 mb-24">
          <div className="bg-white rounded-xl shadow-ambient-lg overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-3/5 h-[400px] lg:h-auto overflow-hidden">
              <Image
                src={posts[0].featured_image || placeholderImage}
                alt={getTitle(posts[0])}
                width={800}
                height={600}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
            <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1 h-8 bg-secondary rounded-full"></span>
                <span className="text-secondary font-bold uppercase tracking-widest text-xs">
                  {getCategory(posts[0])}
                </span>
              </div>
              <h2 className="font-headline text-3xl font-bold text-on-surface leading-tight mb-6">
                {getTitle(posts[0])}
              </h2>
              <p className="text-on-surface-variant font-body mb-8 leading-relaxed line-clamp-4">
                {getExcerpt(posts[0])}
              </p>
              <div>
                <Link href={`/blog/${posts[0].slug}`} className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold text-sm tracking-wide hover:opacity-90 transition-all flex items-center gap-2 inline-flex">
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
                View all categories / Ver todas las categorías
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.map((post) => (
              <article key={post.id} className="group">
                <div className="aspect-[4/3] mb-6 overflow-hidden rounded-xl relative">
                  <Image
                    src={post.featured_image || placeholderImage}
                    alt={getTitle(post)}
                    width={600}
                    height={450}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-primary">
                    {getCategory(post)}
                  </div>
                </div>
                <div className="px-2">
                  <div className="text-outline text-xs font-bold mb-3 uppercase tracking-tighter">
                    {post.published_at && typeof post.published_at === 'object' && 'toDate' in post.published_at
                      ? (post.published_at as { toDate: () => Date }).toDate().toLocaleDateString()
                      : ""}
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">
                    {getTitle(post)}
                  </h3>
                  <p className="text-on-surface-variant font-body text-sm mb-6 line-clamp-3 leading-relaxed">
                    {getExcerpt(post)}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="text-primary font-bold text-sm flex items-center gap-2 group/btn">
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
              {t.subtitle || "Ready to Make a Difference?"}
            </h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl font-body">
              Your support fuels these stories. Join our volunteer network or donate today to help us continue our mission of community empowerment.
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
