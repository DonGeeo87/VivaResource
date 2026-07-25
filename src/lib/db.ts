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

  let query = sql`SELECT * FROM blog_posts WHERE 1=1`;

  if (status) {
    query = sql`${query} AND status = ${status}`;
  }
  if (lang && lang !== "all") {
    query = sql`${query} AND language = ${lang}`;
  }
  if (category && category !== "all") {
    query = sql`${query} AND category = ${category}`;
  }

  query = sql`${query} ORDER BY published_at DESC NULLS LAST, created_at DESC`;
  query = sql`${query} LIMIT ${limit} OFFSET ${offset}`;

  return query as unknown as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const [post] = await sql<BlogPost[]>`
    SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1
  `;
  return post || null;
}

export async function getPostById(id: number): Promise<BlogPost | null> {
  const [post] = await sql<BlogPost[]>`
    SELECT * FROM blog_posts WHERE id = ${id} LIMIT 1
  `;
  return post || null;
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
  const [post] = await sql<BlogPost[]>`
    INSERT INTO blog_posts (
      title, slug, excerpt, content, category, featured_image,
      author, language, published, status, tags,
      created_at, updated_at, published_at
    ) VALUES (
      ${data.title}, ${data.slug}, ${data.excerpt || ""}, ${data.content || ""},
      ${data.category || "news"}, ${data.featured_image || ""},
      ${data.author || "Viva Resource"}, ${data.language},
      ${data.published || false},
      ${data.published ? "published" : "draft"},
      ${data.tags || []},
      ${now}, ${now},
      ${data.published ? now : null}
    )
    RETURNING *
  `;
  return post;
}

export async function updatePost(
  id: number,
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
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sets.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (data.published !== undefined) {
    sets.push(`status = $${idx}`);
    values.push(data.published ? "published" : "draft");
    idx++;
    if (data.published) {
      sets.push(`published_at = $${idx}`);
      values.push(new Date());
      idx++;
    }
  }

  sets.push(`updated_at = $${idx}`);
  values.push(new Date());
  idx++;
  values.push(id);

  const query = `
    UPDATE blog_posts SET ${sets.join(", ")}
    WHERE id = $${idx - 1}
    RETURNING *
  `;

  const [post] = await sql.unsafe(query, values);
  return post || null;
}

export async function deletePost(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM blog_posts WHERE id = ${id}
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
