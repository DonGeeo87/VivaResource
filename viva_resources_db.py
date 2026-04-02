# viva_resource_db.py
# Base de datos estructurada para importar al backend

DIRECTORIO_VIVA_RESOURCE = {
    "emergency": [
        {
            "nombre": "Call 2-1-1",
            "telefono": "*Dial 2-1-1",
            "email": None,
            "web": "www.211.org",
            "descripcion": "Servicio gratuito 24/7. Refiere recursos locales.",
            "condado": "Todos",
            "idiomas": ["Inglés", "Español", "Multilingüe"]
        },
        {
            "nombre": "United Way Help Line",
            "telefono": "303-433-8381",
            "email": None,
            "web": "www.unitedwaydenver.org",
            "descripcion": "Ayuda financiera, empleo, vivienda.",
            "condado": "Todos",
            "horario": "L-V 8am-5pm"
        }
        # ... añadir todas las instituciones aquí
    ],
    "housing": [...],
    "food": [...],
    "health_mental": [...],
    "clothing": [...],
    "employment": [...],
    "utilities": [...],
    "transportation": [...],
    "free_activities": [...]
}