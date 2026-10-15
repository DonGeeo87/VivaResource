import { getPosts } from "@/lib/db";
import { langContext } from "@/lib/metadata";
import HomeContent from "@/components/HomeContent";
import type { FeaturedPost } from "@/components/FeaturedPosts";

/**
 * Home renderizada en el servidor: trae los posts destacados para que el HTML
 * servido ya incluya los enlaces a los articulos (Google y los bots sin JS los
 * leen) y delega el resto del markup animado a HomeContent (client). Antes toda
 * la pagina era cliente y los posts se pedian por fetch, asi que el HTML salia
 * con skeletons.
 */
export default async function Home(): Promise<JSX.Element> {
  const { lang } = langContext();

  let featuredPosts: FeaturedPost[] = [];
  try {
    const rows = await getPosts({ lang, limit: 3 });
    featuredPosts = rows.slice(0, 3).map((post) => ({
      id: String(post.id),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      language: post.language === "es" ? "es" : "en",
      published_at: post.published_at ? new Date(post.published_at).toISOString() : "",
      featured_image: post.featured_image || undefined,
    }));
  } catch (error) {
    console.error("[home] No se pudieron cargar los posts destacados:", error);
    featuredPosts = [];
  }

  return <HomeContent featuredPosts={featuredPosts} initialLang={lang} />;
}
