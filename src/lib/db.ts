import postgres from "postgres";

const sql = postgres({
  host: process.env.PGHOST || "vivaresource-db",
  port: parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE || "vivaresource_blog",
  username: process.env.PGUSER || "vivaresource",
  password: process.env.PGPASSWORD || "VrDBP4ss!2026",
  ssl: false,
});

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  author: string;
  language: "en" | "es";
  published: boolean;
  status: "draft" | "published";
  tags: string[];
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export async function getPosts(options?: {
  lang?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<BlogPost[]> {
  const { lang, category, status = "published", limit = 50, offset = 0 } = options || {};

  const rows = await sql`
    SELECT id, data FROM collections
    WHERE name = 'blog_posts'
  `;

  let posts = rows.map((r: any) => mapBlogPost(r));

  if (status) {
    posts = posts.filter(p => (p.status || (p.published ? "published" : "draft")) === status);
  }
  if (lang && lang !== "all") {
    posts = posts.filter(p => p.language === lang);
  }
  if (category && category !== "all") {
    posts = posts.filter(p => p.category === category);
  }

  // Sort by published_at desc (nulls last), then created_at desc
  posts.sort((a, b) => {
    const pa = a.published_at ? a.published_at.getTime() : 0;
    const pb = b.published_at ? b.published_at.getTime() : 0;
    if (pb !== pa) return pb - pa;
    return (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0);
  });

  return posts.slice(offset, offset + limit);
}

function mapBlogPost(r: { id: string; data: Record<string, any> }): BlogPost {
  const d = r.data || {};
  const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === "string") {
      const t = new Date(v);
      return isNaN(t.getTime()) ? null : t;
    }
    if (typeof v === "object" && typeof v.toDate === "function") {
      const t = v.toDate();
      return t instanceof Date ? t : null;
    }
    return null;
  };
  return {
    id: d.id ?? r.id,
    title: d.title || d.title_en || "",
    slug: d.slug || "",
    excerpt: d.excerpt || d.excerpt_en || "",
    content: d.content || d.content_en || "",
    category: d.category || "news",
    featured_image: d.featured_image || "",
    author: d.author || "Viva Resource",
    language: (d.language || "en") as "en" | "es",
    published: d.published ?? d.status === "published",
    status: (d.status || (d.published ? "published" : "draft")) as "draft" | "published",
    tags: Array.isArray(d.tags) ? d.tags : [],
    created_at: toDate(d.created_at) || new Date(),
    updated_at: toDate(d.updated_at) || new Date(),
    published_at: toDate(d.published_at),
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const rows = await sql`
    SELECT id, data FROM collections WHERE name = 'blog_posts'
  `;
  const found = rows.map((r: any) => mapBlogPost(r)).find(p => p.slug === slug);
  return found || null;
}

export async function getPostById(id: number | string): Promise<BlogPost | null> {
  const rows = await sql`
    SELECT id, data FROM collections WHERE name = 'blog_posts' AND id = ${String(id)}
  `;
  if (!rows.length) return null;
  return mapBlogPost(rows[0] as any);
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  featured_image?: string;
  author?: string;
  language: "en" | "es";
  published?: boolean;
  tags?: string[];
}): Promise<BlogPost> {
  const now = new Date();
  const id = crypto.randomUUID();
  const doc = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || "",
    content: data.content || "",
    category: data.category || "news",
    featured_image: data.featured_image || "",
    author: data.author || "Viva Resource",
    language: data.language,
    published: data.published || false,
    status: data.published ? "published" : "draft",
    tags: data.tags || [],
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    published_at: data.published ? now.toISOString() : null,
  };
  await sql`
    INSERT INTO collections (id, name, data)
    VALUES (${id}, 'blog_posts', ${sql.json(doc)})
  `;
  return mapBlogPost({ id, data: { id, ...doc } });
}

export async function updatePost(
  id: number | string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    featured_image: string;
    author: string;
    language: "en" | "es";
    published: boolean;
    status: "draft" | "published";
    tags: string[];
  }>
): Promise<BlogPost | null> {
  const [existing] = await sql`
    SELECT data FROM collections WHERE name = 'blog_posts' AND id = ${String(id)}
  `;
  if (!existing) return null;
  const current = existing.data || {};
  const merged: Record<string, any> = { ...current, ...data, updated_at: new Date().toISOString() };
  if (data.published !== undefined) {
    merged.status = data.published ? "published" : "draft";
    if (data.published && !current.published_at) {
      merged.published_at = new Date().toISOString();
    }
  }
  await sql`
    UPDATE collections SET data = ${sql.json(merged)}, updated_at = NOW()
    WHERE name = 'blog_posts' AND id = ${String(id)}
  `;
  return mapBlogPost({ id: String(id), data: { id: String(id), ...merged } });
}

export async function deletePost(id: number | string): Promise<boolean> {
  const result = await sql`
    DELETE FROM collections WHERE name = 'blog_posts' AND id = ${String(id)}
  `;
  return result.count > 0;
}

export async function publishFromTemplate(data: {
  titleEn: string;
  titleEs: string;
  slug: string;
  excerptEn: string;
  excerptEs: string;
  contentEn: string;
  contentEs: string;
  category?: string;
  tags?: string[];
}): Promise<{ en: BlogPost; es: BlogPost }> {
  const en = await createPost({
    title: data.titleEn,
    slug: `${data.slug}-en`,
    excerpt: data.excerptEn,
    content: data.contentEn,
    category: data.category || "resources",
    author: "Viva Resource",
    language: "en",
    published: true,
    tags: data.tags,
  });

  const es = await createPost({
    title: data.titleEs,
    slug: `${data.slug}-es`,
    excerpt: data.excerptEs,
    content: data.contentEs,
    category: data.category || "resources",
    author: "Viva Resource",
    language: "es",
    published: true,
    tags: data.tags,
  });

  return { en, es };
}

export default sql;
