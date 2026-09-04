import subprocess

comment = """⚠️ El script en /tmp/send-report-detailed.js esta corrupto por el redactor de seguridad local. NO lo uses.

ESCRIBE EL SCRIPT DESDE CERO DENTRO DEL CONTAINER usando node -e con fs.writeFileSync:

1. docker exec -w /app vivaresource npm install nodemailer --prefix /tmp
2. Crea /tmp/send-detailed.js dentro del container
3. Ejecuta: docker exec -w /app vivaresource node /tmp/send-detailed.js

EL SCRIPT DEBE:
- Leer env vars del container (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, EMAIL_USER, EMAIL_APP_PASSWORD, NEWSLETTER_ADMIN_EMAILS)
- Obtener OAuth2 token via crypto.createPrivateKey + JWT
- Consultar Firestore REST API ultimos 7 dias (SIN limit, traer todos los registros)
- Colecciones y agrupacion:
  * form_submissions (submittedAt) -> agrupar por formName/formTitle, 1 email por grupo
  * event_registrations (created_at) -> agrupar por event_name/eventName, 1 email por evento
  * help_requests (createdAt) -> 1 email consolidado
  * volunteer_registrations (created_at) -> 1 email consolidado
- Cada email con tabla HTML de los inscritos (nombre, email, telefono, fecha)
- TO: vivaresourcefoundation@gmail.com + BCC ginterdonatop@gmail.com
- Usar nodemailer con Gmail SMTP
- Subject descriptivo: [Viva Resource] Formulario: X (N) / Evento: Y (N)
- Sin limite de registros, traer todos los del periodo"""

result = subprocess.run(
    ["hermes", "kanban", "comment", "t_255c3df9", comment],
    capture_output=True, text=True, timeout=30
)
print("OUT:", result.stdout.strip())
if result.stderr:
    print("ERR:", result.stderr.strip())