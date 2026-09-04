import subprocess

body = "ENVIAR REPORTE DETALLADO VIVA RESOURCE - 1 EMAIL POR FORMULARIO Y POR EVENTO\n\n"
body += "NO uses el script en /tmp/send-report-detailed.js - esta corrupto.\n"
body += "Escribe el script desde cero dentro del container.\n\n"
body += "INSTRUCCIONES:\n"
body += "1. docker exec -w /app vivaresource sh -c 'npm install nodemailer --prefix /tmp'\n"
body += "2. Escribe /tmp/send-detailed.js dentro del container usando node -e con fs.writeFileSync\n"
body += "3. Ejecuta: docker exec -w /app vivaresource NODE_PATH=/tmp/node_modules node /tmp/send-detailed.js\n"
body += "4. Reporta el resultado completo\n\n"
body += "QUE HACE EL SCRIPT:\n"
body += "- Leer env vars del container: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, EMAIL_USER, EMAIL_APP_PASSWORD, NEWSLETTER_ADMIN_EMAILS\n"
body += "- Obtener OAuth2 token via crypto.createPrivateKey + JWT + fetch\n"
body += "- Consultar Firestore REST API v1/projects/vivaresource/databases/(default)/documents:runQuery\n"
body += "- Periodo: ultimos 7 dias desde now()\n"
body += "- SIN LIMITE de registros - traer todos\n\n"
body += "COLECCIONES y AGRUPACION:\n"
body += "  * form_submissions (campo submittedAt) -> agrupar por formName/formTitle, 1 email por grupo\n"
body += "  * event_registrations (campo created_at) -> agrupar por event_name/eventName, 1 email por evento\n"
body += "  * help_requests (campo createdAt) -> 1 email consolidado\n"
body += "  * volunteer_registrations (campo created_at) -> 1 email consolidado\n\n"
body += "CADA EMAIL debe tener:\n"
body += "- Header Viva Resource (azul #025689)\n"
body += "- Tabla HTML con todos los registros del grupo (nombre, email, telefono, fecha)\n"
body += "- Total de registros en el asunto\n\n"
body += "ENVIO:\n"
body += "- TO: vivaresourcefoundation@gmail.com\n"
body += "- BCC: ginterdonatop@gmail.com\n"
body += "- Usar nodemailer con Gmail SMTP (smtp.gmail.com:587)\n"
body += "- Subject: [Viva Resource] Formulario: NOMBRE (N) o [Viva Resource] Evento: NOMBRE (N)\n"

result = subprocess.run(
    ["hermes", "kanban", "create",
     "Viva Resource: DETAILED report - 1 email per form/event",
     "--assignee", "vps-worker",
     "--priority", "95",
     "--body", body],
    capture_output=True, text=True, timeout=30
)
print("OUT:", result.stdout.strip())
if result.stderr:
    print("ERR:", result.stderr.strip())