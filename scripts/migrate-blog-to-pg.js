const crypto = require("crypto");

async function migrate() {
  // Get Firestore token
  const k = process.env.FIREBASE_ADMIN_KEY;
  const sa = JSON.parse(Buffer.from(k, "base64").toString());

  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const b64h = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64c = Buffer.from(JSON.stringify(claim)).toString("base64url");
  const sign = crypto.createSign("RSA-SHA256");
  sign.write(b64h + "." + b64c);
  sign.end();
  const sig = sign.sign(sa.private_key, "base64url");
  const jwt = b64h + "." + b64c + "." + sig;
  const tres = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwt,
  });
  const tdata = await tres.json();
  const token = tdata.access_token;

  // Fetch all blog_posts from Firestore
  const res = await fetch(
    "https://firestore.googleapis.com/v1/projects/" +
      sa.project_id +
      "/databases/(default)/documents:runQuery",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "blog_posts" }],
        },
      }),
    }
  );

  const data = await res.json();
  const posts = data
    .filter((r) => r.document)
    .map((r) => {
      const f = r.document.fields || {};
      const gs = (field) => f[field]?.stringValue || "";
      const gb = (field) => f[field]?.booleanValue || false;
      const ga = (field) =>
        (f[field]?.arrayValue?.values || []).map((v) => v.stringValue || "");
      const gt = (field) => f[field]?.timestampValue || null;
      return {
        title: gs("title"),
        slug: gs("slug"),
        excerpt: gs("excerpt"),
        content: gs("content"),
        category: gs("category") || "news",
        featured_image: gs("featured_image"),
        author: gs("author") || "Viva Resource",
        language: gs("language") || "en",
        published: gb("published"),
        status: gs("status") || "draft",
        tags: ga("tags"),
        created_at: gt("created_at"),
        published_at: gt("published_at"),
      };
    });

  console.log("Posts to migrate:", posts.length);

  // Insert into PostgreSQL
  const postgres = require("postgres");
  const sql = postgres({
    host: "vivaresource-db",
    port: 5432,
    database: "vivaresource_blog",
    username: "vivaresource",
    password: "VrDBP4ss!2026",
  });

  let inserted = 0;
  let skipped = 0;
  for (const p of posts) {
    try {
      await sql`
        INSERT INTO blog_posts (title, slug, excerpt, content, category, featured_image, author, language, published, status, tags, created_at, published_at)
        VALUES (${p.title}, ${p.slug}, ${p.excerpt}, ${p.content}, ${p.category}, ${p.featured_image}, ${p.author}, ${p.language}, ${p.published}, ${p.status}, ${p.tags}, ${p.created_at ? new Date(p.created_at) : new Date()}, ${p.published_at ? new Date(p.published_at) : null})
        ON CONFLICT (slug) DO NOTHING
      `;
      inserted++;
    } catch (e) {
      skipped++;
    }
  }

  console.log("Inserted:", inserted, "Skipped:", skipped);

  const count = await sql`SELECT COUNT(*) as c FROM blog_posts`;
  console.log("Total in PG:", count[0].c);

  await sql.end();
}

migrate().catch((e) => console.log("Error:", e.message));
