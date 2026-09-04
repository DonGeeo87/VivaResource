import subprocess

body = "ENVIAR REPORTE DETALLADO VIVA RESOURCE - SOLO EVENTOS Y FORMS ACTIVOS.\n\n"
body += "Escribe el script desde cero dentro del container.\n\n"
body += "INSTRUCCIONES:\n"
body += "1. docker exec -w /app vivaresource sh -c 'npm install nodemailer --prefix /tmp'\n"
body += "2. Escribe /tmp/send-smart-report.js dentro del container\n"
body += "3. Ejecuta: docker exec -w /app vivaresource NODE_PATH=/tmp/node_modules node /tmp/send-smart-report.js\n"
body += "4. Reporta el resultado completo\n\n"
body += "ESTRUCTURA DE FIRESTORE (confirmada por inspeccion previa):\n"
body += "  events: formId(string), event_name, status(published), is_finished(bool), is_archived(bool), startDate, date\n"
body += "  event_registrations: event_id(string), full_name, email, phone, created_at, status(registered)\n"
body += "  forms: formTitle, formName, status(published), linkedEventId(string), fields, updatedAt\n"
body += "  form_submissions: formId(string), name, email, phone, submittedAt, status(pending)\n"
body += "  help_requests: fullName, email, assistanceTypes, createdAt\n"
body += "  volunteer_registrations: firstName, lastName, email, program, created_at\n\n"
body += "FILTROS:\n"
body += "  - EVENTS: SOLO incluir eventos con status=published, is_finished!=true, is_archived!=true\n"
body += "  - SKELETON EVENTS: eventos sin event_name (solo formId+status) NO incluirlos\n"
body += "  - FORMS: SOLO incluir forms con formTitle definido (NO skeleton forms)\n"
body += "  - PERIODO: ultimos 7 dias desde now()\n\n"
body += "AGRUPACION:\n"
body += "  - event_registrations: agrupar por event_id -> lookup event_name en events, 1 email por evento activo\n"
body += "  - form_submissions: agrupar por formId -> lookup formTitle en forms, 1 email por form activo\n"
body += "  - help_requests: 1 email consolidado\n"
body += "  - volunteer_registrations: 1 email consolidado\n\n"
body += "CADA EMAIL:\n"
body += "  - Header Viva Resource azul #025689\n"
body += "  - Tabla HTML con todos los registros (nombre, email, telefono, fecha)\n"
body += "  - Subject: [Viva Resource] Evento: NOMBRE (N) o [Viva Resource] Formulario: NOMBRE (N)\n\n"
body += "ENVIO:\n"
body += "  - TO: vivaresourcefoundation@gmail.com\n"
body += "  - BCC: ginterdonatop@gmail.com\n"
body += "  - nodemailer con Gmail SMTP\n"

result = subprocess.run(
    ["hermes", "kanban", "create",
     "Viva Resource: SMART report - only active events/forms",
     "--assignee", "vps-worker",
     "--priority", "99",
     "--body", body],
    capture_output=True, text=True, timeout=30
)
print("OUT:", result.stdout.strip())
if result.stderr:
    print("ERR:", result.stderr.strip())