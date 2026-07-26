/**
 * PostgreSQL-backed admin database.
 * Replaces Firestore REST API with direct PostgreSQL queries.
 * Maintains the same API: collection().get(), .doc().get(), .add(), .set(), .where()
 */

import postgres from "postgres";

const sql = postgres({
  host: process.env.PGHOST || "viva-migracion-db",
  port: parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE || "vivaresource_blog",
  username: process.env.PGUSER || "vivaresource",
  password: process.env.PGPASSWORD,
});

// Ensure the collections table exists
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (name, id)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(name)
  `;
}

// Lazy init
let tableEnsured = false;
async function init() {
  if (!tableEnsured) {
    await ensureTable();
    tableEnsured = true;
  }
}

// --- Document helpers ---

function docToObj(doc: any) {
  if (!doc) return null;
  return {
    id: doc.id,
    exists: true,
    data: () => ({ id: doc.id, ...doc.data }),
  };
}

// --- Public API ---

export async function adminDb() {
  await init();

  return {
    collection: (name: string) => ({
      get: async () => {
        const rows = await sql`
          SELECT id, data FROM collections WHERE name = ${name} ORDER BY created_at DESC
        `;
        const docs = rows.map((r: any) => ({
          id: r.id,
          exists: true,
          data: () => ({ id: r.id, ...r.data }),
        }));
        return {
          size: docs.length,
          docs,
          forEach: (fn: (doc: any) => void) => docs.forEach(fn),
        };
      },

      add: async (data: Record<string, unknown>) => {
        const id = crypto.randomUUID();
        await sql`
          INSERT INTO collections (id, name, data)
          VALUES (${id}, ${name}, ${sql.json(data)})
        `;
        return { id };
      },

      doc: (id: string) => ({
        get: async () => {
          const [row] = await sql`
            SELECT id, data FROM collections WHERE name = ${name} AND id = ${id}
          `;
          if (!row) return { exists: false, data: () => null, id };
          return {
            id: row.id,
            exists: true,
            data: () => ({ id: row.id, ...row.data }),
          };
        },

        set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
          const { id: _id, ...cleanData } = data;
          if (options?.merge) {
            // Check if doc exists
            const [existing] = await sql`
              SELECT data FROM collections WHERE name = ${name} AND id = ${id}
            `;
            if (existing) {
              const merged = { ...existing.data, ...cleanData };
              await sql`
                UPDATE collections SET data = ${sql.json(merged)}, updated_at = NOW()
                WHERE name = ${name} AND id = ${id}
              `;
            } else {
              await sql`
                INSERT INTO collections (id, name, data)
                VALUES (${id}, ${name}, ${sql.json(cleanData)})
              `;
            }
          } else {
            await sql`
              INSERT INTO collections (id, name, data)
              VALUES (${id}, ${name}, ${sql.json(cleanData)})
              ON CONFLICT (name, id) DO UPDATE SET data = ${sql.json(cleanData)}, updated_at = NOW()
            `;
          }
        },

        update: async (data: Record<string, unknown>) => {
          const [existing] = await sql`
            SELECT data FROM collections WHERE name = ${name} AND id = ${id}
          `;
          if (existing) {
            const merged = { ...existing.data, ...data };
            await sql`
              UPDATE collections SET data = ${sql.json(merged)}, updated_at = NOW()
              WHERE name = ${name} AND id = ${id}
            `;
          }
        },

        delete: async () => {
          await sql`
            DELETE FROM collections WHERE name = ${name} AND id = ${id}
          `;
        },
      }),

      where: (field: string, op: string, value: unknown) => ({
        get: async () => {
          // We fetch all docs and filter in-memory (simple approach)
          const rows = await sql`
            SELECT id, data FROM collections WHERE name = ${name} ORDER BY created_at DESC
          `;

          const filtered = rows.filter((r: any) => {
            const val = r.data[field];
            if (op === "==") return val == value;
            if (op === ">") return val > value;
            if (op === ">=") return val >= value;
            if (op === "<") return val < value;
            if (op === "<=") return val <= value;
            if (op === "array-contains") return Array.isArray(val) && val.includes(value);
            return false;
          });

          const docs = filtered.map((r: any) => ({
            id: r.id,
            exists: true,
            data: () => ({ id: r.id, ...r.data }),
          }));

          return {
            size: docs.length,
            docs,
            forEach: (fn: (doc: any) => void) => docs.forEach(fn),
          };
        },
      }),
    }),
  };
}

/**
 * Verify a Firebase ID token using the REST API.
 * This still uses Firebase Auth (no PostgreSQL replacement for auth).
 */
export async function verifyIdToken(token: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) throw new Error("Firebase API key not configured");

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!res.ok) throw new Error("Token invalid");
    const data = await res.json();
    return { uid: data.users[0].localId };
  } catch {
    throw new Error("Token verification failed");
  }
}
