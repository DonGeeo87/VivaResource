// Firebase Admin via REST API - native crypto, no external deps
let cachedToken = null;
function getSA() {
  if (!process.env.FIREBASE_ADMIN_KEY) return null;
  try { return JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_KEY, "base64").toString()); }
  catch { return null; }
}
async function getAccessToken() {
  if (cachedToken && cachedToken.expires > Date.now() + 300000) return cachedToken.token;
  const sa = getSA(); if (!sa) return null;
  const crypto = await import("crypto");
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const header = b64({ alg: "RS256", typ: "JWT" });
  const claim = b64({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now });
  const payload = header + "." + claim;
  const key = crypto.createPrivateKey(sa.private_key);
  const sig = crypto.sign("RSA-SHA256", Buffer.from(payload), key).toString("base64url");
  const jwt = payload + "." + sig;
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) });
  if (!res.ok) { return null; }
  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}
export async function adminDb() {
  const sa = getSA(); if (!sa) return null;
  const token = await getAccessToken(); if (!token) return null;
  const base = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents`;
const b = "Bearer ";

  return {
    collection: (name) => ({
      add: async (data) => {
        const fields = {};
        for (const [k, v] of Object.entries(data)) {
          if (v === null || v === undefined) fields[k] = { nullValue: null };
          else if (typeof v === "boolean") fields[k] = { booleanValue: v };
          else if (Array.isArray(v)) fields[k] = { arrayValue: { values: v.map(x => ({ stringValue: String(x) })) } };
          else if (v instanceof Date) fields[k] = { timestampValue: v.toISOString() };
          else fields[k] = { stringValue: String(v) };
        }
        const res = await fetch(base + "/" + name, {
          method: "POST",
          headers: { Authorization: b + token, "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        });
        if (!res.ok) { const err = await res.text(); console.error("[Admin] Firestore error:", err); throw new Error("Write failed: " + res.status); }
        const json = await res.json();
        return { id: json.name.split("/").pop() || "" };
      },
    }),
  };
}
