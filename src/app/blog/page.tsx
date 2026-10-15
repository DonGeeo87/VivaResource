import { getPosts } from "@/lib/db";
import { langContext } from "@/lib/metadata";
import BlogListClient, { type BlogListPost } from "@/components/BlogListClient";

/**
 * Listado del blog renderizado en el servidor.
 *
 * Antes esta pagina era un componente cliente que pedia todo por fetch: el HTML
 * que recibia Google eran 94 palabras y 51 skeletons, sin un solo enlace a los
 * posts (solo los descubria por el sitemap). Ahora el servidor entrega el HTML
 * completo con los enlaces y el cliente solo interviene en el buscador, los
 * filtros y el cambio de idioma.
 */
export default async function BlogPage() {
  const { lang } = langContext();

  let posts: BlogListPost[] = [];
  try {
    const rows = await getPosts({ lang, limit: 50 });
    posts = rows.map((post) => ({
      id: String(post.id),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      featured_image: post.featured_image || "",
      language: post.language === "es" ? "es" : "en",
      published_at: post.published_at ? new Date(post.published_at).toISOString() : null,
    }));
  } catch (error) {
    // Nunca romper la pagina publica por un fallo de la DB.
    console.error("[blog] No se pudieron cargar los posts:", error);
    posts = [];
  }

  return <BlogListClient initialPosts={posts} initialLang={lang} />;
}
