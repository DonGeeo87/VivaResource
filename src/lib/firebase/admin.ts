// Firebase Admin via REST API - no firebase-admin dependency needed
// Uses service account to generate access tokens, then calls Firestore REST API

let cachedToken: { token: string; expires: number } | null = null;

interface ServiceAccount {
  project_id: string;
  private_key: string;
  client_email: string;
}

function getServiceAccount(): ServiceAccount | null {
  if (!process.env.FIREBASE_ADMIN_KEY) return null;
  try {
    const decoded = Buffer.from(process.env.FIREBASE_ADMIN_KEY, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expires > Date.now() + 300000) return cachedToken.token;

  const sa = getServiceAccount();
  if (!sa) return null;

  const crypto = await import("crypto");
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const b64 = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(`${b64(header)}.${b64(claim)}`)
    .sign(sa.private_key.replace(/\\n/g, "\n"), "base64url");

  const jwt = `${b64(header)}.${b64(claim)}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    console.error("[Admin] Token request failed:", await res.text());
    return null;
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export async function adminDb() {
  const sa = getServiceAccount();
  if (!sa) return null;

  const projectId = sa.project_id;
  const token = await getAccessToken();
  if (!token) return null;

  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  return {
    collection: (name: string) => ({
      add: async (data: Record<string, unknown>) => {
        const fields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
          if (value === null || value === undefined) {
            fields[key] = { nullValue: null };
          } else if (typeof value === "boolean") {
            fields[key] = { booleanValue: value };
          } else if (Array.isArray(value)) {
            fields[key] = { arrayValue: { values: value.map((v: unknown) => ({ stringValue: String(v) })) } };
          } else if (value instanceof Date) {
            fields[key] = { timestampValue: value.toISOString() };
          } else {
            fields[key] = { stringValue: String(value) };
          }
        }

        const res = await fetch(`${baseUrl}/${name}`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        });

        if (!res.ok) {
          const err = await res.text();
          console.error("[Admin] Firestore write error:", err);
          throw new Error("Firestore write failed: " + res.status);
        }

        const json = (await res.json()) as { name: string };
        const id = json.name.split("/").pop() || "";
        return { id };
      },
    }),
  };
}