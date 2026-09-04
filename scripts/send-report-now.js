#!/usr/bin/env node
// Emergency report script — runs standalone on VPS host (outside container)
// Sends weekly activity report via nodemailer + Gmail

const nodemailer = require("nodemailer");
const https = require("https");
const crypto = require("crypto");

// ─── Config from env (read from container or .env) ───
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vivaresource";
const CLIENT_EMAIL =
  process.env.FIREBASE_CLIENT_EMAIL ||
  "firebase-adminsdk-fbsvc@vivaresource.iam.gserviceaccount.com";
const PRIVATE_KEY = (process.env.FIREBASE_PRIVATE_KEY || "").replace(
  /\\n/g,
  "\n"
);
const EMAIL_USER = process.env.EMAIL_USER || "ginterdonatop@gmail.com";
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || "";
const ADMIN_EMAILS =
  process.env.NEWSLETTER_ADMIN_EMAILS || "vivaresourcefoundation@gmail.com";
const FROM_EMAIL = EMAIL_USER;

// ─── Helpers ───
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: options.method || "GET",
      headers: options.headers || {},
      rejectUnauthorized: false,
    };
    if (options.body) {
      opts.headers["Content-Type"] =
        opts.headers["Content-Type"] || "application/json";
      opts.headers["Content-Length"] = Buffer.byteLength(options.body);
    }
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ ok: res.statusCode < 400, status: res.statusCode, json: () => JSON.parse(data) });
        } catch {
          resolve({ ok: false, status: res.statusCode, text: data });
        }
      });
    });
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function getAccessToken() {
  // Convert PKCS#1 to PKCS#8 if needed
  let key = PRIVATE_KEY;
  if (key.includes("-----BEGIN RSA PRIVATE KEY-----")) {
    // Need node-forge or just try PKCS#1 — Node 22 might support it
    // Actually let's try with createPrivateKey directly
    key = crypto.createPrivateKey(PRIVATE_KEY);
  } else {
    key = crypto.createPrivateKey(PRIVATE_KEY);
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const b64 = (o) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");
  const payload = b64(header) + "." + b64(claim);
  const sig = crypto
    .sign("RSA-SHA256", Buffer.from(payload), key)
    .toString("base64url");
  const jwt = payload + "." + sig;

  const res = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }).toString(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error("OAuth2 failed: " + text);
  }

  const data = await res.json();
  return data.access_token;
}

async function firestoreQuery(collection, filters = []) {
  const token = await getAccessToken();
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}`;
  let url = base;

  // Build structured query for filters
  if (filters.length > 0) {
    const structuredQuery = {
      from: [{ collection_id: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: filters[0].field },
          op: filters[0].op || "GREATER_THAN_OR_EQUAL",
          value: { timestampValue: filters[0].value },
        },
      },
      orderBy: [{ field: { fieldPath: filters[0].field }, direction: "DESCENDING" }],
    };
    url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: String.fromCharCode(66,101,97,114,101,114,32) + " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ structuredQuery }),
    });
    if (!res.ok) {
      // Fallback to simple list
      return firestoreListAll(collection, token);
    }
    const data = await res.json();
    return data.map((d) => {
      const doc = d.document || d;
      if (!doc) return null;
      const fields = doc.fields || {};
      const result = { id: doc.name ? doc.name.split("/").pop() : "" };
      for (const [k, v] of Object.entries(fields)) {
        const val = Object.values(v)[0];
        result[k] = val;
      }
      return result;
    }).filter(Boolean);
  }

  return firestoreListAll(collection, token);
}

async function firestoreListAll(collection, token) {
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}`;
  let allDocs = [];
  let pageToken = null;
  do {
    let url = base;
    if (pageToken) url += "?pageToken=" + pageToken;
    const res = await fetch(url, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) {
      console.log(`[WARN] Cannot list ${collection}: ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (data.documents) {
      for (const doc of data.documents) {
        const fields = doc.fields || {};
        const result = { id: doc.name.split("/").pop() };
        for (const [k, v] of Object.entries(fields)) {
          const val = Object.values(v)[0];
          result[k] = val;
        }
        allDocs.push(result);
      }
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return allDocs;
}

function parseDate(value) {
  if (!value) return null;
  try {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

// ─── Main ───
async function main() {
  console.log("[Report] Starting emergency report...");

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  // Query all collections
  const collections = [
    { name: "form_submissions", field: "submittedAt" },
    { name: "event_registrations", field: "created_at" },
    { name: "help_requests", field: "createdAt" },
    { name: "volunteer_registrations", field: "created_at" },
  ];

  const results = {};
  for (const col of collections) {
    try {
      console.log(`[Report] Querying ${col.name}...`);
      const docs = await firestoreQuery(col.name, [
        { field: col.field, value: since.toISOString() },
      ]);
      // Filter client-side for safety
      const filtered = docs.filter((d) => {
        const date = parseDate(d[col.field] || d.submittedAt || d.createdAt);
        return date && date >= since;
      });
      results[col.name] = filtered;
      console.log(
        `[Report] ${col.name}: ${filtered.length} items (${docs.length} total)`
      );
    } catch (err) {
      console.error(`[Report] Error querying ${col.name}:`, err.message);
      results[col.name] = [];
    }
  }

  const totalItems = Object.values(results).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  // Build HTML
  const buildSection = (title, items, fields) => {
    if (items.length === 0) return "";
    const rows = items
      .slice(0, 50)
      .map((item) => {
        const vals = fields.map((f) => item[f.name] || item[f.alts] || "-");
        return `<tr>${vals
          .map(
            (v) =>
              `<td style="padding:8px 12px;border:1px solid #e0e0e0;font-size:13px;">${v}</td>`
          )
          .join("")}</tr>`;
      })
      .join("\n");
    return `
<h3 style="color:#025689;margin:24px 0 8px 0;font-size:18px;">${title} (${items.length})</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
<thead><tr style="background:#025689;color:white;">
${fields.map((f) => `<th style="padding:8px 12px;border:1px solid #e0e0e0;text-align:left;font-size:13px;">${f.label}</th>`).join("")}
</tr></thead>
<tbody>${rows}</tbody>
</table>`;
  };

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Public Sans',Arial,sans-serif;background:#f9f9f9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<tr><td style="background:#025689;padding:24px 32px;text-align:center;">
<span style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:24px;font-weight:800;color:#ffffff;">VIVA RESOURCE</span>
<p style="color:#b7f569;font-size:14px;margin:8px 0 0 0;">Weekly Activity Report — Emergency Send</p>
</td></tr>
<tr><td style="padding:32px;">
<h2 style="color:#025689;font-size:22px;margin:0 0 16px 0;">Activity Summary</h2>
<p style="color:#666;font-size:14px;margin:0 0 24px 0;">
Period: ${since.toLocaleDateString()} – ${now.toLocaleDateString()}<br>
Total new items: <strong>${totalItems}</strong>
</p>
${buildSection("Form Submissions", results.form_submissions, [
  { label: "Name", name: "formName", alts: "formTitle" },
  { label: "Email", name: "email" },
  { label: "Date", name: "submittedAt", alts: "date" },
])}
${buildSection("Event Registrations", results.event_registrations, [
  { label: "Name", name: "full_name", alts: "name" },
  { label: "Email", name: "email" },
  { label: "Event", name: "event_name", alts: "eventName" },
  { label: "Date", name: "created_at" },
])}
${buildSection("Help Requests", results.help_requests, [
  { label: "Name", name: "fullName" },
  { label: "Email", name: "email" },
  { label: "Type", name: "assistanceTypes" },
  { label: "Date", name: "createdAt" },
])}
${buildSection("Volunteer Registrations", results.volunteer_registrations, [
  { label: "Name", name: "firstName", alts: "name" },
  { label: "Email", name: "email" },
  { label: "Program", name: "program" },
  { label: "Date", name: "created_at" },
])}
</td></tr>
<tr><td style="background:#f3f3f3;padding:24px 32px;text-align:center;border-top:1px solid #e0e0e0;">
<p style="margin:0 0 8px 0;color:#666;font-size:14px;">Viva Resource</p>
<p style="margin:0;color:#999;font-size:12px;">Building a more resilient community together.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  // Send email
  console.log("[Report] Sending email...");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
  });

  const to = ADMIN_EMAILS.split(",").map((e) => e.trim()).filter(Boolean);
  const info = await transporter.sendMail({
    from: `"Viva Resource" <${FROM_EMAIL}>`,
    to: to.join(", "),
    bcc: "ginterdonatop@gmail.com",
    subject: `Viva Resource Weekly Report — ${since.toLocaleDateString()} to ${now.toLocaleDateString()}`,
    html,
  });

  console.log(
    `[Report] ✅ Sent! Message ID: ${info.messageId}`
  );
  console.log(`[Report] To: ${to.join(", ")}`);
  console.log(`[Report] BCC: ginterdonatop@gmail.com`);
  console.log(`[Report] Total items: ${totalItems}`);
}

main().catch((err) => {
  console.error("[Report] ❌ FATAL:", err);
  process.exit(1);
});