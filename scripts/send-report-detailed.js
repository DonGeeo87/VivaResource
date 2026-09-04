const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ── Env ──
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;
const NEWSLETTER_ADMIN_EMAILS = process.env.NEWSLETTER_ADMIN_EMAILS;
const PROJECT_ID = 'vivaresource';

// ── Period ──
const now = new Date();
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

function toISO(d) { return d.toISOString(); }

// ── Get OAuth2 token ──
async function getAccessToken() {
  const key = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const privateKey = crypto.createPrivateKey(key);
  const jwt = {
    iss: FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(JSON.stringify(jwt)).toString('base64url');
  const signature = crypto.sign('sha256', Buffer.from(header + '.' + claim), privateKey).toString('base64url');
  const assertion = header + '.' + claim + '.' + signature;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const data = await resp.json();
  if (!data.access_token) throw new Error('OAuth2 failed: ' + JSON.stringify(data));
  return data.access_token;
}

// ── Query Firestore collection (ALL items, no limit) ──
async function queryCollection(token, collection, dateField, since) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: dateField },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { timestampValue: since },
        },
      },
      orderBy: [{ field: { fieldPath: dateField }, direction: 'DESCENDING' }],
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`Firestore query error for ${collection}: ${err}`);
    return [];
  }

  const results = await resp.json();
  return results.filter(r => r.document).map(r => {
    const fields = r.document.fields || {};
    const toVal = (f) => {
      if (!f) return '';
      if (f.stringValue) return f.stringValue;
      if (f.timestampValue) return new Date(f.timestampValue).toLocaleString('es-CL', { timeZone: 'America/Santiago' });
      if (f.integerValue) return f.integerValue;
      if (f.booleanValue) return f.booleanValue ? 'Sí' : 'No';
      return JSON.stringify(f);
    };
    const obj = {};
    for (const [k, v] of Object.entries(fields)) {
      obj[k] = toVal(v);
    }
    obj._id = r.document.name.split('/').pop();
    return obj;
  });
}

// ── Build HTML for a single group ──
function buildGroupHTML(groupName, items, fields) {
  const period = `${sevenDaysAgo.toLocaleDateString('es-CL')} → ${now.toLocaleDateString('es-CL')}`;
  
  let headerRows = fields.map(f => `<th style="padding:8px;text-align:left;font-size:12px;background:#025689;color:white;">${f.label}</th>`).join('');
  let dataRows = items.map(item => {
    const cells = fields.map(f => `<td style="padding:6px;border:1px solid #ddd;font-size:12px;">${item[f.key] || '-'}</td>`).join('');
    return `<tr style="border-bottom:1px solid #ddd;">${cells}</tr>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
  <div style="max-width:640px;margin:auto;background:white;border-radius:8px;overflow:hidden;">
    <div style="background:#025689;padding:20px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:20px;">Viva Resource</h1>
      <p style="color:#b7f569;margin:4px 0 0;font-size:13px;">${groupName}</p>
    </div>
    <div style="padding:20px;">
      <p style="color:#666;font-size:12px;">Período: ${period} | Total: ${items.length} registro(s)</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <tr>${headerRows}</tr>
        ${dataRows}
      </table>
      <hr style="margin:24px 0;border:none;border-top:1px solid #ddd;">
      <p style="color:#999;font-size:11px;">Reporte automático Viva Resource — ${now.toLocaleDateString('es-CL')}</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Send email ──
async function sendEmail(transporter, to, subject, html) {
  await transporter.sendMail({
    from: '"Viva Resource" <' + EMAIL_USER + '>',
    to: to,
    bcc: 'ginterdonatop@gmail.com',
    subject: subject,
    html: html,
  });
  console.log('  ✅ Enviado: ' + subject);
}

// ── Main ──
async function main() {
  console.log('🔑 Obteniendo token OAuth2...');
  const token = await getAccessToken();
  console.log('✅ Token obtenido');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
  });

  const adminEmails = (NEWSLETTER_ADMIN_EMAILS || 'vivaresourcefoundation@gmail.com').split(',').map(e => e.trim()).filter(Boolean);

  // ── 1. FORM SUBMISSIONS ── Agrupar por formName/formTitle ──
  console.log('\n📋 Form Submissions...');
  const forms = await queryCollection(token, 'form_submissions', 'submittedAt', toISO(sevenDaysAgo));
  const formsByGroup = {};
  for (const f of forms) {
    const key = f.formName || f.formTitle || 'Formulario sin nombre';
    if (!formsByGroup[key]) formsByGroup[key] = [];
    formsByGroup[key].push(f);
  }
  for (const [groupName, items] of Object.entries(formsByGroup)) {
    const html = buildGroupHTML(groupName, items, [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'submittedAt', label: 'Fecha' },
    ]);
    for (const email of adminEmails) {
      await sendEmail(transporter, email,
        `📝 Nuevo Formulario: ${groupName} (${items.length} respuestas)`,
        html);
    }
  }

  // ── 2. EVENT REGISTRATIONS ── Agrupar por event_name ──
  console.log('\n📅 Event Registrations...');
  const events = await queryCollection(token, 'event_registrations', 'created_at', toISO(sevenDaysAgo));
  const eventsByGroup = {};
  for (const e of events) {
    const key = e.event_name || e.eventName || 'Evento sin nombre';
    if (!eventsByGroup[key]) eventsByGroup[key] = [];
    eventsByGroup[key].push(e);
  }
  for (const [groupName, items] of Object.entries(eventsByGroup)) {
    const html = buildGroupHTML(groupName, items, [
      { key: 'full_name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'created_at', label: 'Fecha' },
    ]);
    for (const email of adminEmails) {
      await sendEmail(transporter, email,
        `🎟️ Evento: ${groupName} (${items.length} inscritos)`,
        html);
    }
  }

  // ── 3. HELP REQUESTS ──
  console.log('\n🆘 Help Requests...');
  const help = await queryCollection(token, 'help_requests', 'createdAt', toISO(sevenDaysAgo));
  if (help.length > 0) {
    const html = buildGroupHTML('Solicitudes de Ayuda', help, [
      { key: 'fullName', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'assistanceTypes', label: 'Tipo de Ayuda' },
      { key: 'createdAt', label: 'Fecha' },
    ]);
    for (const email of adminEmails) {
      await sendEmail(transporter, email,
        `🆘 Solicitudes de Ayuda (${help.length} nuevas)`,
        html);
    }
  }

  // ── 4. VOLUNTEER REGISTRATIONS ──
  console.log('\n🤝 Volunteer Registrations...');
  const volunteers = await queryCollection(token, 'volunteer_registrations', 'created_at', toISO(sevenDaysAgo));
  if (volunteers.length > 0) {
    const html = buildGroupHTML('Registros de Voluntarios', volunteers, [
      { key: 'firstName', label: 'Nombre' },
      { key: 'lastName', label: 'Apellido' },
      { key: 'email', label: 'Email' },
      { key: 'program', label: 'Programa' },
      { key: 'created_at', label: 'Fecha' },
    ]);
    for (const email of adminEmails) {
      await sendEmail(transporter, email,
        `🤝 Nuevos Voluntarios (${volunteers.length} registros)`,
        html);
    }
  }

  // ── Summary ──
  const totalForms = Object.keys(formsByGroup).length;
  const totalEvents = Object.keys(eventsByGroup).length;
  console.log('\n' + '='.repeat(50));
  console.log('✅ REPORTE COMPLETADO');
  console.log('   Formularios: ' + totalForms + ' grupos (' + forms.length + ' respuestas)');
  console.log('   Eventos: ' + totalEvents + ' grupos (' + events.length + ' inscritos)');
  console.log('   Ayuda: ' + help.length + ' solicitudes');
  console.log('   Voluntarios: ' + volunteers.length + ' registros');
  console.log('   Emails enviados: ' + (totalForms + totalEvents + (help.length > 0 ? 1 : 0) + (volunteers.length > 0 ? 1 : 0)) + ' por admin');
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('❌ ERROR:', err.message);
  process.exit(1);
});