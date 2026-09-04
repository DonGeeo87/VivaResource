import subprocess

body = """EJECUTAR REPORTE DETALLADO VIVA RESOURCE.

El script ya está en /tmp/send-report-detailed.js
nodemailer ya está instalado en /tmp/nodemodules

INSTRUCCIONES:
1. Verificar que el script existe: ls -la /tmp/send-report-detailed.js
2. Instalar nodemailer si no está: npm install nodemailer --prefix /tmp
3. Ejecutar: NODE_PATH=/tmp/node_modules docker exec -w /app vivaresource node /tmp/send-report-detailed.js
4. Reportar el resultado completo

QUE HACE EL SCRIPT:
- Obtiene token OAuth2 de Google
- Consulta Firestore REST API para ultimos 7 dias
- Colecciones:
  * form_submissions -> agrupa por formName/formTitle, 1 email por formulario
  * event_registrations -> agrupa por event_name, 1 email por evento
  * help_requests -> 1 email consolidado
  * volunteer_registrations -> 1 email consolidado
- Envia a: vivaresourcefoundation@gmail.com + BCC ginterdonatop@gmail.com
- Subject por cada grupo: "[Viva Resource] Formulario: X (N respuestas)" etc.

IMPORTANTE: El script usa process.env.FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL,
EMAIL_USER, EMAIL_APP_PASSWORD, NEWSLETTER_ADMIN_EMAILS del container.
"""

result = subprocess.run(
    ["hermes", "kanban", "create",
     "Viva Resource: send DETAILED report (1 email per form/event)",
     "--assignee", "vps-worker",
     "--priority", "90",
     "--body", body],
    capture_output=True, text=True, timeout=30
)
print("OUT:", result.stdout.strip())
if result.stderr:
    print("ERR:", result.stderr.strip())