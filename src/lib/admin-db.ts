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

// --- Query builder (encadenable: where + orderBy + limit + get) ---

interface WhereClause {
  field: string;
  op: string;
  value: unknown;
}

interface QueryState {
  name: string;
  wheres: WhereClause[];
  orderByField: string | null;
  orderByDir: "asc" | "desc";
  limit: number | null;
}

async function runQuery(state: QueryState) {
  const rows = await sql`
    SELECT id, data FROM collections WHERE name = ${state.name} ORDER BY created_at DESC
  `;

  // Tipar como any[] porque el wrapper de `postgres` devuelve RowList<Row[]>,
  // y aquí lo reasignamos a arrays filtrados/sorteados.
  let filtered: any[] = rows as any[];
  // Apply where clauses (in-memory filtering)
  for (const w of state.wheres) {
    const wv: any = w.value;
    filtered = filtered.filter((r: any) => {
      const val = r.data[w.field];
      if (w.op === "==") return val == wv;
      if (w.op === ">") return val > wv;
      if (w.op === ">=") return val >= wv;
      if (w.op === "<") return val < wv;
      if (w.op === "<=") return val <= wv;
      if (w.op === "!=") return val != wv;
      if (w.op === "array-contains") return Array.isArray(val) && val.includes(wv);
      return false;
    });
  }

  // Apply orderBy
  if (state.orderByField) {
    const dir = state.orderByDir === "desc" ? -1 : 1;
    filtered = filtered.sort((a: any, b: any) => {
      const va = a.data[state.orderByField as string];
      const vb = b.data[state.orderByField as string];
      if (va === vb) return 0;
      // Handle Date/Timestamp-like values
      const ta = va instanceof Date ? va.getTime() : typeof va === "object" && va?.toDate ? va.toDate().getTime() : va;
      const tb = vb instanceof Date ? vb.getTime() : typeof vb === "object" && vb?.toDate ? vb.toDate().getTime() : vb;
      if (ta === undefined || ta === null) return 1;
      if (tb === undefined || tb === null) return -1;
      return (ta > tb ? 1 : -1) * dir;
    });
  }

  // Apply limit
  if (state.limit != null) {
    filtered = filtered.slice(0, state.limit);
  }

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
}

function makeQuery(state: QueryState) {
  return {
    get: async () => runQuery(state),
    where: (field: string, op: string, value: unknown) =>
      makeQuery({
        ...state,
        wheres: [...state.wheres, { field, op, value }],
      }),
    orderBy: (field: string, dir: "asc" | "desc" = "asc") =>
      makeQuery({ ...state, orderByField: field, orderByDir: dir }),
    limit: (n: number) => makeQuery({ ...state, limit: n }),
  };
}

export async function adminDb() {
  await init();

  return {
    collection: (name: string) => ({
      // read query API (encadenable)
      get: async () => runQuery({ name, wheres: [], orderByField: null, orderByDir: "asc", limit: null }),
      where: (field: string, op: string, value: unknown) =>
        makeQuery({ name, wheres: [{ field, op, value }], orderByField: null, orderByDir: "asc", limit: null }),
      orderBy: (field: string, dir: "asc" | "desc" = "asc") =>
        makeQuery({ name, wheres: [], orderByField: field, orderByDir: dir, limit: null }),
      limit: (n: number) =>
        makeQuery({ name, wheres: [], orderByField: null, orderByDir: "asc", limit: n }),

      add: async (data: Record<string, unknown>) => {
        const id = crypto.randomUUID();
        await sql`
          INSERT INTO collections (id, name, data)
          VALUES (${id}, ${name}, ${sql.json(data)})
        `;
        // Retorna un docRef compatible con Firestore: tiene .id y .update()
        return {
          id,
          update: async (patchData: Record<string, unknown>) => {
            const [existing] = await sql`
              SELECT data FROM collections WHERE name = ${name} AND id = ${id}
            `;
            if (existing) {
              const merged = { ...existing.data, ...patchData };
              await sql`
                UPDATE collections SET data = ${sql.json(merged)}, updated_at = NOW()
                WHERE name = ${name} AND id = ${id}
              `;
            }
          },
        };
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
    return { uid: data.users[0].localId, email: data.users[0].email || "" };
  } catch {
    throw new Error("Token verification failed");
  }
}
