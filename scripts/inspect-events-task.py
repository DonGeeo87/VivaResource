import subprocess

body = "INSPECCIONAR ESTRUCTURA DE EVENTOS Y FORMS EN FIRESTORE.\n\n"
body += "Objetivo: entender como se relacionan event_registrations con events, y form_submissions con forms.\n\n"
body += "INSTRUCCIONES:\n"
body += "1. Obtener token OAuth2 de Google con JWT (usando FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL del container)\n"
body += "2. Consultar Firestore REST API para entender la estructura:\n\n"
body += "PASO 1 - Listar colecciones disponibles:\n"
body += "  GET https://firestore.googleapis.com/v1/projects/vivaresource/databases/(default)/documents\n"
body += "  (esto da error pero muestra las colecciones en el mensaje)\n\n"
body += "PASO 2 - Para CADA coleccion sospechosa, traer 1 documento y mostrar sus fields:\n"
body += "  POST https://firestore.googleapis.com/v1/projects/vivaresource/databases/(default)/documents:runQuery\n"
body += "  Con body: { structuredQuery: { from: [{ collectionId: 'NOMBRE' }], limit: 1 } }\n\n"
body += "Colecciones a revisar:\n"
body += "  - events (si existe, con status, date, active, etc)\n"
body += "  - event_registrations (para ver si tiene event_id reference)\n"
body += "  - forms (si existe, con status, published, etc)\n"
body += "  - form_submissions (para ver si tiene form_id reference)\n"
body += "  - site_settings (para ver settings de reportes)\n"
body += "  - help_requests\n"
body += "  - volunteer_registrations\n\n"
body += "PASO 3 - Si existe coleccion events, traer TODOS los eventos:\n"
body += "  POST :runQuery con structuredQuery SIN where, SIN limit\n"
body += "  Mostrar: id, name, status, date, startDate, endDate, active, published, etc\n\n"
body += "PASO 4 - Si existe coleccion forms, traer TODOS los forms:\n"
body += "  Mostrar: id, name, title, status, active, published, etc\n\n"
body += "PASO 5 - Reportar los resultados COMPLETOS para que pueda decidir como filtrar.\n\n"
body += "Usar node.js con fetch y crypto (stdlib). No necesita npm.\n"
body += "Escribir script en /tmp/inspect-events.js dentro del container.\n"
body += "Ejecutar: docker exec vivaresource node /tmp/inspect-events.js\n"

result = subprocess.run(
    ["hermes", "kanban", "create",
     "Inspect Firestore structure: events & forms collections",
     "--assignee", "vps-worker",
     "--priority", "99",
     "--body", body],
    capture_output=True, text=True, timeout=30
)
print("OUT:", result.stdout.strip())
if result.stderr:
    print("ERR:", result.stderr.strip())