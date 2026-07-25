// Firebase Admin via REST API - full Firestore REST wrapper
/* eslint-disable @typescript-eslint/no-require-imports */
let cachedToken: { token: string; expires: number } | null = null;

function getSA(): Record<string, string> | null {
  if (!process.env.FIREBASE_ADMIN_KEY) return null;
  try {
    return JSON.parse(
      Buffer.from(process.env.FIREBASE_ADMIN_KEY, "base64").toString()
    );
  } catch {
    return null;
  }
}

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expires > Date.now() + 300000)
    return cachedToken.token;
  const sa = getSA();
  if (!sa) return null;
  const forge = require("node-forge");
  const pk = forge.pki.privateKeyFromPem(sa.private_key);
  const pem8 = forge.pki.privateKeyToPem(pk);
  const crypto = await import("crypto");
  const key = crypto.createPrivateKey(pem8);
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");
  const header = b64({ alg: "RS256", typ: "JWT" });
  const claim = b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  });
  const payload = header + "." + claim;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(payload), key).toString("base64url");
  const jwt = payload + "." + sig;
  const res = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

function toFields(data: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) fields[k] = { nullValue: null };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else if (Array.isArray(v))
      fields[k] = {
        arrayValue: { values: v.map((x) => ({ stringValue: String(x) })) },
      };
    else if (v instanceof Date)
      fields[k] = { timestampValue: v.toISOString() };
    else fields[k] = { stringValue: String(v) };
  }
  return fields;
}

function fromFields(
  fields: Record<string, unknown>
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    const f = v as Record<string, unknown>;
    if (f.stringValue !== undefined) obj[k] = f.stringValue;
    else if (f.integerValue !== undefined) obj[k] = parseInt(f.integerValue as string, 10);
    else if (f.booleanValue !== undefined) obj[k] = f.booleanValue;
    else if (f.timestampValue !== undefined) obj[k] = new Date(f.timestampValue as string);
    else if (f.nullValue !== undefined) obj[k] = null;
    else if (f.arrayValue !== undefined) {
      const arr = (f.arrayValue as Record<string, unknown>).values as Record<string, unknown>[] | undefined;
      obj[k] = arr ? arr.map((x) => x.stringValue || "") : [];
    } else if (f.mapValue !== undefined) {
      obj[k] = fromFields(
        (f.mapValue as Record<string, unknown>).fields as Record<string, unknown> || {}
      );
    } else {
      obj[k] = JSON.stringify(f);
    }
  }
  return obj;
}

function docRef(name: string) {
  return {
    get: async () => {
      const token = await getAccessToken();
      if (!token) return { exists: false, data: () => null };
      const res = await fetch(
        `https://firestore.googleapis.com/v1/${name}`,
        { headers: { Authorization: "Bearer " + token } }
      );
      if (!res.ok) {
        if (res.status === 404) return { exists: false, data: () => null };
        console.error("[Admin] Firestore get error:", await res.text());
        return { exists: false, data: () => null };
      }
      const data = await res.json();
      return {
        exists: true,
        id: data.name.split("/").pop(),
        data: () => fromFields(data.fields || {}),
      };
    },
    set: async (
      data: Record<string, unknown>,
      options?: { merge?: boolean }
    ) => {
      const token = await getAccessToken();
      if (!token) throw new Error("No access token");
      const fields = toFields(data);
      const url =
        `https://firestore.googleapis.com/v1/${name}` +
        (options?.merge ? "?updateMask.fieldPaths=value&updateMask.fieldPaths=updated_at" : "");
      const method = options?.merge ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });
      if (!res.ok) {
        console.error("[Admin] Firestore set error:", await res.text());
        throw new Error("Write failed: " + res.status);
      }
      return { id: (await res.json()).name.split("/").pop() || "" };
    },
    delete: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("No access token");
      const res = await fetch(
        `https://firestore.googleapis.com/v1/${name}`,
        { method: "DELETE", headers: { Authorization: "Bearer " + token } }
      );
      if (!res.ok) {
        console.error("[Admin] Firestore delete error:", await res.text());
        throw new Error("Delete failed: " + res.status);
      }
    },
  };
}

function queryRef(name: string) {
  return {
    get: async () => {
      const token = await getAccessToken();
      if (!token) return { size: 0, docs: [], forEach: () => {} };
      const res = await fetch(
        `https://firestore.googleapis.com/v1/${name}:runQuery`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: name.split("/").pop() }],
            },
          }),
        }
      );
      if (!res.ok) {
        console.error("[Admin] Firestore query error:", await res.text());
        return { size: 0, docs: [], forEach: () => {} };
      }
      const results = await res.json();
      const docs = results
        .filter((r: Record<string, unknown>) => r.document)
        .map((r: Record<string, unknown>) => {
          const doc = r.document as Record<string, unknown>;
          return {
            id: (doc.name as string).split("/").pop(),
            data: () => fromFields((doc.fields as Record<string, unknown>) || {}),
            exists: true,
          };
        });
      return {
        size: docs.length,
        docs,
        forEach: (fn: (doc: unknown) => void) => docs.forEach(fn),
      };
    },
  };
}

export async function adminDb() {
  const sa = getSA();
  if (!sa) return null;
  const projectId = sa.project_id;
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  return {
    collection: (name: string) => ({
      add: async (data: Record<string, unknown>) => {
        const token = await getAccessToken();
        if (!token) throw new Error("No access token");
        const fields = toFields(data);
        const res = await fetch(base + "/" + name, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        });
        if (!res.ok) {
          console.error("[Admin] Firestore error:", await res.text());
          throw new Error("Write failed: " + res.status);
        }
        return { id: (await res.json()).name.split("/").pop() || "" };
      },
      doc: (id: string) => docRef(base + "/" + name + "/" + id),
      where: (field: string, op: string, value: unknown) => {
        // Build a query with a single where filter
        let opStr = "EQUAL";
        if (op === ">=") opStr = "GREATER_THAN_OR_EQUAL";
        if (op === "==") opStr = "EQUAL";
        if (op === ">") opStr = "GREATER_THAN";
        if (op === "<") opStr = "LESS_THAN";
        if (op === "<=") opStr = "LESS_THAN_OR_EQUAL";
        if (op === "array-contains") opStr = "ARRAY_CONTAINS";

        let val: Record<string, unknown>;
        if (value instanceof Date) val = { timestampValue: value.toISOString() };
        else if (typeof value === "string") val = { stringValue: value };
        else if (typeof value === "number") val = { integerValue: String(value) };
        else if (typeof value === "boolean") val = { booleanValue: value };
        else val = { stringValue: String(value) };

        const filter = {
          fieldFilter: {
            field: { fieldPath: field },
            op: opStr,
            value: val,
          },
        };

        return {
          get: async () => {
            const token = await getAccessToken();
            if (!token) return { size: 0, docs: [], forEach: () => {} };
            const res = await fetch(base + "/" + name + ":runQuery", {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                structuredQuery: {
                  from: [{ collectionId: name }],
                  where: { compositeFilter: { op: "AND", filters: [filter] } },
                },
              }),
            });
            if (!res.ok) {
              console.error("[Admin] Firestore where error:", await res.text());
              return { size: 0, docs: [], forEach: () => {} };
            }
            const results = await res.json();
            const docs = results
              .filter((r: Record<string, unknown>) => r.document)
              .map((r: Record<string, unknown>) => {
                const doc = r.document as Record<string, unknown>;
                return {
                  id: (doc.name as string).split("/").pop(),
                  data: () =>
                    fromFields(
                      (doc.fields as Record<string, unknown>) || {}
                    ),
                  exists: true,
                };
              });
            return {
              size: docs.length,
              docs,
              forEach: (fn: (doc: unknown) => void) => docs.forEach(fn),
            };
          },
        };
      },
    }),
  };
}

export async function verifyIdToken(token: string) {
  try {
    const sa = getSA();
    if (!sa) throw new Error("No service account");
    const projectId = sa.project_id;
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
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
