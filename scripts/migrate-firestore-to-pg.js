/**
 * Script de migración: Firestore → PostgreSQL
 * 
 * Lee TODAS las colecciones de Firestore via REST API
 * y las escribe en PostgreSQL en la tabla 'collections'.
 * 
 * Uso: node scripts/migrate-firestore-to-pg.js
 * 
 * Requiere: FIREBASE_ADMIN_KEY en el entorno
 */

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// --- Firestore REST client ---

let cachedToken = null;

async function getFirestoreClient() {
  const sa = getSA();
  if (!sa) throw new Error("FIREBASE_ADMIN_KEY not configured");

  const token = await getAccessToken(sa);
  const base = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents`;

  return { base, token };
}

function getSA() {
  const key = process.env.FIREBASE_ADMIN_KEY;
  if (!key) return null;
  return JSON.parse(Buffer.from(key, "base64").toString());
}

async function getAccessToken(sa) {
  if (cachedToken && cachedToken.expires > Date.now() + 300000)
    return cachedToken.token;

  // Use Firebase Auth REST API to get a token for the service account
  // We need to create a JWT and exchange it for an access token
  const { privateKey, clientEmail } = sa;

  // Sign a JWT using crypto
  const crypto = await import("crypto");
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const payload = `${b64(header)}.${b64(claim)}`;

  // Convert PKCS#1 to PKCS#8 if needed
  let key = privateKey;
  if (key.includes("BEGIN RSA PRIVATE KEY")) {
    // Use node-forge to convert
    const forge = await import("node-forge");
    const pk = forge.pki.privateKeyFromPem(key);
    key = forge.pki.privateKeyToPem(pk);
  }

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(payload);
  sign.end();
  const sig = sign.sign(key, "base64url");
  const jwt = `${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OAuth error: ${err}`);
  }

  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function listCollections(base, token) {
  const collections = [];
  let pageToken = null;

  do {
    let url = `${base}:listCollectionIds`;
    if (pageToken) url += `?pageToken=${pageToken}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pageSize: 100 }),
    });

    if (!res.ok) {
      console.error("Error listing collections:", await res.text());
      break;
    }

    const data = await res.json();
    collections.push(...(data.collectionIds || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return collections;
}

async function getAllDocuments(base, token, collectionName) {
  const docs = [];
  let pageToken = null;

  do {
    let url = `${base}/${collectionName}?pageSize=500`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`  Error reading ${collectionName}:`, await res.text());
      break;
    }

    const data = await res.json();
    if (data.documents) {
      for (const doc of data.documents) {
        const id = doc.name.split("/").pop();
        const fields = doc.fields || {};
        const dataObj = {};
        for (const [k, v] of Object.entries(fields)) {
          dataObj[k] = fromFirestoreValue(v);
        }
        docs.push({ id, data: dataObj });
      }
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return docs;
}

function fromFirestoreValue(v) {
  if (v === null || v === undefined) return null;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.nullValue !== undefined) return null;
  if (v.arrayValue !== undefined) {
    return (v.arrayValue.values || []).map(fromFirestoreValue);
  }
  if (v.mapValue !== undefined) {
    const obj = {};
    for (const [k, f] of Object.entries(v.mapValue.fields || {})) {
      obj[k] = fromFirestoreValue(f);
    }
    return obj;
  }
  return JSON.stringify(v);
}

// --- PostgreSQL client ---

async function getPgClient() {
  const postgres = (await import("postgres")).default;
  return postgres({
    host: process.env.PGHOST || "viva-migracion-db",
    port: parseInt(process.env.PGPORT || "5432"),
    database: process.env.PGDATABASE || "vivaresource_blog",
    username: process.env.PGUSER || "vivaresource",
    password: process.env.PGPASSWORD,
  });
}

async function ensureTable(sql) {
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

// --- Main ---

async function main() {
  console.log("=== Firestore → PostgreSQL Migration ===\n");

  // 1. Connect to Firestore
  console.log("Connecting to Firestore...");
  const { base, token } = await getFirestoreClient();
  console.log("✅ Connected to Firestore\n");

  // 2. List all collections
  console.log("Listing collections...");
  const collections = await listCollections(base, token);
  console.log(`Found ${collections.length} collections: ${collections.join(", ")}\n`);

  // 3. Connect to PostgreSQL
  console.log("Connecting to PostgreSQL...");
  const sql = await getPgClient();
  await ensureTable(sql);
  console.log("✅ Connected to PostgreSQL\n");

  // 4. Migrate each collection
  let totalDocs = 0;
  for (const collectionName of collections) {
    console.log(`Migrating ${collectionName}...`);
    const docs = await getAllDocuments(base, token, collectionName);
    console.log(`  Found ${docs.length} documents`);

    if (docs.length === 0) continue;

    // Batch insert
    let inserted = 0;
    for (const doc of docs) {
      try {
        await sql`
          INSERT INTO collections (id, name, data)
          VALUES (${doc.id}, ${collectionName}, ${sql.json(doc.data)})
          ON CONFLICT (name, id) DO UPDATE
          SET data = ${sql.json(doc.data)}, updated_at = NOW()
        `;
        inserted++;
      } catch (err) {
        console.error(`  Error inserting ${collectionName}/${doc.id}:`, err.message);
      }
    }
    console.log(`  ✅ Inserted ${inserted}/${docs.length} documents`);
    totalDocs += inserted;
  }

  console.log(`\n=== Migration complete: ${totalDocs} documents migrated ===`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
