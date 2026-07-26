/**
 * Script de migración v2: Firestore → PostgreSQL
 * Usa COPY con archivo temporal para evitar problemas de escapes
 * 
 * Uso: node scripts/migrate-firestore-to-pg.js
 * Requiere: FIREBASE_ADMIN_KEY en el entorno
 */

const https = require('https');
const { execSync, exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');

const FIREBASE_ADMIN_KEY = process.env.FIREBASE_ADMIN_KEY;
if (!FIREBASE_ADMIN_KEY) { console.error('FIREBASE_ADMIN_KEY not set'); process.exit(1); }

const sa = JSON.parse(Buffer.from(FIREBASE_ADMIN_KEY, 'base64').toString());
const PROJECT_ID = sa.project_id;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function psql(cmd) {
  return execSync(
    `docker exec -i viva-migracion-db psql -U vivaresource -d vivaresource_blog -c "${cmd.replace(/"/g, '\\"')}"`,
    { encoding: 'utf8', timeout: 30000 }
  );
}

function psqlFile(sqlFile) {
  return execSync(
    `docker exec -i viva-migracion-db psql -U vivaresource -d vivaresource_blog -f /tmp/migrate_data.sql`,
    { encoding: 'utf8', timeout: 60000 }
  );
}

function getToken() {
  return new Promise((resolve, reject) => {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const claim = Buffer.from(JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, iat: now
    })).toString('base64url');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${claim}`);
    sign.end();
    const sig = sign.sign(sa.private_key, 'base64url');
    const jwt = `${header}.${claim}.${sig}`;

    const data = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString();

    return new Promise((resolve, reject) => {
      const req = https.request('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try { resolve(JSON.parse(body).access_token); }
          catch(e) { reject(new Error(`OAuth error: ${body}`)); }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  });
}

function firestorePost(url, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({});
    const req = https.request(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(new Error(`Firestore POST error: ${body}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function firestoreGet(url, token) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(new Error(`Firestore error: ${body}`)); }
      });
    }).on('error', reject);
  });
}

function fromVal(v) {
  if (!v) return null;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return parseInt(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.nullValue !== undefined) return null;
  if (v.arrayValue !== undefined) return (v.arrayValue.values || []).map(fromVal);
  if (v.mapValue !== undefined) {
    const o = {};
    for (const [k, f] of Object.entries(v.mapValue.fields || {})) o[k] = fromVal(f);
    return o;
  }
  return String(v);
}

async function main() {
  console.log('=== Firestore → PostgreSQL Migration v2 ===\n');

  console.log('Getting OAuth token...');
  const token = await getToken();
  console.log('✅ Token OK\n');

  // List collections
  console.log('Listing collections...');
  const listRes = await firestorePost(`${BASE}:listCollectionIds`, token);
  const collections = listRes.collectionIds || [];
  console.log(`Found ${collections.length} collections: ${collections.join(', ')}\n`);

  // Create table
  console.log('Creating table...');
  psql(`CREATE TABLE IF NOT EXISTS collections (
    id TEXT NOT NULL, name TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (name, id)
  )`);
  psql(`CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(name)`);
  console.log('✅ Table ready\n');

  let total = 0;
  let errors = 0;

  for (const col of collections) {
    process.stdout.write(`Migrating ${col}... `);
    const data = await firestoreGet(`${BASE}/${col}?pageSize=500`, token);
    const docs = (data.documents || []).map(d => ({
      id: d.name.split('/').pop(),
      data: Object.fromEntries(
        Object.entries(d.fields || {}).map(([k, v]) => [k, fromVal(v)])
      )
    }));
    console.log(`${docs.length} documents`);

    // Build SQL file with proper JSON escaping using dollar-quoted strings
    let sqlLines = [];
    for (const doc of docs) {
      const dataJson = JSON.stringify(doc.data);
      // Use dollar-quoted string $$...$$ to avoid any escape issues
      sqlLines.push(
        `INSERT INTO collections (id, name, data) VALUES ('${doc.id.replace(/'/g, "''")}', '${col.replace(/'/g, "''")}', '${dataJson.replace(/'/g, "''")}'::jsonb) ON CONFLICT (name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();`
      );
    }

    // Write SQL to temp file
    const sqlContent = sqlLines.join('\n');
    fs.writeFileSync('/tmp/migrate_batch.sql', sqlContent, 'utf8');

    // Copy to container and execute
    try {
      execSync(
        `docker cp /tmp/migrate_batch.sql viva-migracion-db:/tmp/migrate_batch.sql && docker exec viva-migracion-db psql -U vivaresource -d vivaresource_blog -f /tmp/migrate_batch.sql`,
        { encoding: 'utf8', timeout: 60000 }
      );
      total += docs.length;
      console.log(`  ✅ All ${docs.length} inserted`);
    } catch (e) {
      // Fall back to individual inserts with error handling
      console.log(`  Batch failed, trying individually...`);
      let ok = 0;
      for (const doc of docs) {
        const dataJson = JSON.stringify(doc.data).replace(/'/g, "''");
        const idEscaped = doc.id.replace(/'/g, "''");
        const colEscaped = col.replace(/'/g, "''");
        try {
          psql(
            `INSERT INTO collections (id, name, data) VALUES ('${idEscaped}', '${colEscaped}', '${dataJson}'::jsonb) ON CONFLICT (name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`
          );
          ok++;
        } catch (e2) {
          errors++;
          console.error(`  ❌ ${col}/${doc.id}: ${e2.message.slice(0, 100)}`);
        }
      }
      total += ok;
      console.log(`  ${ok}/${docs.length} inserted`);
    }
  }

  console.log(`\n=== Migration complete: ${total} documents, ${errors} errors ===`);
}

main().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
