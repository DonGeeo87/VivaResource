import subprocess, json

body = "EMERGENCIA: Enviar reporte semanal de Viva Resource AHORA.\n\n"
body += "El container se llama vivaresource.\n\n"
body += "INSTRUCCIONES:\n"
body += "1. docker exec vivaresource sh -c 'cd /app && npm install nodemailer'\n"
body += "2. Escribe /tmp/send-report.js con node.js (fs.writeFileSync)\n"
body += "3. Ejecuta: docker exec -w /app vivaresource node /tmp/send-report.js\n"
body += "4. Reporta el resultado completo\n\n"
body += "EL SCRIPT DEBE:\n"
body += "- Usar process.env.FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, EMAIL_USER, EMAIL_APP_PASSWORD, NEWSLETTER_ADMIN_EMAILS\n"
body += "- Obtener OAuth2 token via JWT + crypto.createPrivateKey\n"
body += "- Consultar Firestore REST API v1 colecciones (ultimos 7 dias):\n"
body += "  * form_submissions (submittedAt)\n"
body += "  * event_registrations (created_at)\n"
body += "  * help_requests (createdAt)\n"
body += "  * volunteer_registrations (created_at)\n"
body += "- Construir HTML email con branding Viva Resource (header azul #025689)\n"
body += "- Enviar con nodemailer via Gmail SMTP\n"
body += "- TO: vivaresourcefoundation@gmail.com\n"
body += "- BCC: ginterdonatop@gmail.com\n\n"
body += "LOGICA:\n"
body += "- Periodo: ultimos 7 dias desde now()\n"
body += "- Para cada coleccion: contar y listar ultimos 10 (name, email, date)\n"
body += "- Si count=0, omitir seccion\n"
body += "- Total de items al inicio\n"
body += "- Si OK, notificar exito con conteo\n"

result = subprocess.run(
    ["hermes", "kanban", "create",
     "Viva Resource: send weekly report NOW (emergency)",
     "--assignee", "vps-worker",
     "--priority", "99",
     "--body", body],
    capture_output=True, text=True, timeout=30
)
print("OUT:", result.stdout.strip())
if result.stderr:
    print("ERR:", result.stderr.strip())