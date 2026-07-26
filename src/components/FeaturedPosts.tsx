"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  language: string;
  published_at: string;
}

export default function FeaturedPosts() {
  const { language } = useLanguage();
  const isES = language === "es";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v2/blog/list?lang=" + language + "&limit=3")
      .then((r) => r.json())
      .then((data) => {
        if (data.posts) setPosts(data.posts.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-48 bg-gray-200 rounded-xl mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded-full mb-4" />
                <div className="h-6 w-full bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-surface-low">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-secondary text-sm font-bold uppercase tracking-widest">
              {isES ? "BLOG" : "BLOG"}
            </span>
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mt-2">
              {isES ? "Últimos Artículos" : "Latest Articles"}
            </h2>
            <p className="text-on-surface-variant mt-2">
              {isES
                ? "Historias, recursos y novedades de nuestra comunidad"
                : "Stories, resources, and news from our community"}
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline"
          >
            {isES ? "Ver todos" : "View All"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/5 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                {post.published_at && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-on-surface-variant line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                {isES ? "Leer más" : "Read More"}
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            {isES ? "Ver todos los artículos" : "View All Articles"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
