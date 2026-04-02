/**
 * Plantillas de Formularios para Viva Resource Foundation
 * Estas plantillas se pueden cargar desde el admin panel
 * para crear formularios rápidamente.
 */

// Tipos de campos disponibles
const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  NUMBER: 'number',
  DATE: 'date',
  PHONE: 'phone'
};

// Plantillas predefinidas
const formTemplates = {
  // 1. REGISTRO A EVENTO
  event_registration: {
    title: "Event Registration Form",
    titleEs: "Formulario de Registro a Evento",
    description: "Standard form for event registration with basic attendee information",
    descriptionEs: "Formulario estándar para registro a eventos con información básica del asistente",
    fields: [
      {
        id: "full_name",
        type: FIELD_TYPES.TEXT,
        label: "Full Name",
        labelEs: "Nombre Completo",
        required: true,
        placeholder: "Jane Doe"
      },
      {
        id: "email",
        type: FIELD_TYPES.EMAIL,
        label: "Email Address",
        labelEs: "Correo Electrónico",
        required: true,
        placeholder: "jane@example.com"
      },
      {
        id: "phone",
        type: FIELD_TYPES.PHONE,
        label: "Phone Number",
        labelEs: "Número de Teléfono",
        required: false,
        placeholder: "(555) 123-4567"
      },
      {
        id: "attendance",
        type: FIELD_TYPES.SELECT,
        label: "Will you attend?",
        labelEs: "¿Asistirás?",
        required: true,
        options: [
          { label: "Yes, I will attend", labelEs: "Sí, asistiré", value: "yes" },
          { label: "No, I cannot attend", labelEs: "No, no puedo asistir", value: "no" },
          { label: "Maybe", labelEs: "Tal vez", value: "maybe" }
        ]
      },
      {
        id: "guests",
        type: FIELD_TYPES.NUMBER,
        label: "Number of additional guests",
        labelEs: "Número de invitados adicionales",
        required: false,
        description: "Maximum 2 guests per person"
      },
      {
        id: "dietary_restrictions",
        type: FIELD_TYPES.TEXTAREA,
        label: "Dietary restrictions or allergies",
        labelEs: "Restricciones dietéticas o alergias",
        required: false,
        placeholder: "Vegetarian, gluten-free, nut allergy, etc."
      },
      {
        id: "how_hear",
        type: FIELD_TYPES.RADIO,
        label: "How did you hear about this event?",
        labelEs: "¿Cómo te enteraste de este evento?",
        required: false,
        options: [
          { label: "Social Media", labelEs: "Redes Sociales", value: "social" },
          { label: "Email Newsletter", labelEs: "Newsletter por Email", value: "email" },
          { label: "Friend/Family", labelEs: "Amigo/Familiar", value: "referral" },
          { label: "Website", labelEs: "Sitio Web", value: "website" },
          { label: "Other", labelEs: "Otro", value: "other" }
        ]
      }
    ],
    settings: {
      allowMultipleSubmissions: true,
      showProgressBar: true,
      requireEmail: true
    },
    thankYouMessage: "Thank you for registering! We'll send you a confirmation email shortly.",
    thankYouMessageEs: "¡Gracias por registrarte! Te enviaremos un correo de confirmación pronto."
  },

  // 2. REGISTRO A TALLER/WORKSHOP
  workshop_registration: {
    title: "Workshop Registration Form",
    titleEs: "Formulario de Registro a Taller",
    description: "Form for workshop registration with skill level and learning goals",
    descriptionEs: "Formulario para registro a talleres con nivel de habilidad y objetivos de aprendizaje",
    fields: [
      {
        id: "full_name",
        type: FIELD_TYPES.TEXT,
        label: "Full Name",
        labelEs: "Nombre Completo",
        required: true
      },
      {
        id: "email",
        type: FIELD_TYPES.EMAIL,
        label: "Email Address",
        labelEs: "Correo Electrónico",
        required: true
      },
      {
        id: "phone",
        type: FIELD_TYPES.PHONE,
        label: "Phone Number",
        labelEs: "Número de Teléfono",
        required: true
      },
      {
        id: "experience_level",
        type: FIELD_TYPES.SELECT,
        label: "Your experience level",
        labelEs: "Tu nivel de experiencia",
        required: true,
        options: [
          { label: "Beginner", labelEs: "Principiante", value: "beginner" },
          { label: "Intermediate", labelEs: "Intermedio", value: "intermediate" },
          { label: "Advanced", labelEs: "Avanzado", value: "advanced" }
        ]
      },
      {
        id: "learning_goals",
        type: FIELD_TYPES.TEXTAREA,
        label: "What do you hope to learn?",
        labelEs: "¿Qué esperas aprender?",
        required: false,
        placeholder: "Tell us about your learning goals..."
      },
      {
        id: "accessibility",
        type: FIELD_TYPES.TEXTAREA,
        label: "Accessibility needs or accommodations",
        labelEs: "Necesidades de accesibilidad o acomodos",
        required: false
      },
      {
        id: "newsletter",
        type: FIELD_TYPES.CHECKBOX,
        label: "I want to receive updates about future workshops",
        labelEs: "Quiero recibir actualizaciones sobre futuros talleres",
        required: false
      }
    ],
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      requireEmail: true
    }
  },

  // 3. FORMULARIO DE FEEDBACK
  feedback: {
    title: "Feedback Form",
    titleEs: "Formulario de Retroalimentación",
    description: "Collect feedback from participants after events or workshops",
    descriptionEs: "Recopila retroalimentación de participantes después de eventos o talleres",
    fields: [
      {
        id: "name",
        type: FIELD_TYPES.TEXT,
        label: "Your Name (Optional)",
        labelEs: "Tu Nombre (Opcional)",
        required: false
      },
      {
        id: "email",
        type: FIELD_TYPES.EMAIL,
        label: "Email (Optional)",
        labelEs: "Correo (Opcional)",
        required: false
      },
      {
        id: "event_name",
        type: FIELD_TYPES.TEXT,
        label: "Event/Workshop Name",
        labelEs: "Nombre del Evento/Taller",
        required: true
      },
      {
        id: "overall_rating",
        type: FIELD_TYPES.RADIO,
        label: "Overall satisfaction",
        labelEs: "Satisfacción general",
        required: true,
        options: [
          { label: "⭐⭐⭐⭐⭐ Excellent", labelEs: "⭐⭐⭐⭐⭐ Excelente", value: "5" },
          { label: "⭐⭐⭐⭐ Very Good", labelEs: "⭐⭐⭐⭐ Muy Bueno", value: "4" },
          { label: "⭐⭐⭐ Good", labelEs: "⭐⭐⭐ Bueno", value: "3" },
          { label: "⭐⭐ Fair", labelEs: "⭐⭐ Regular", value: "2" },
          { label: "⭐ Poor", labelEs: "⭐ Malo", value: "1" }
        ]
      },
      {
        id: "content_rating",
        type: FIELD_TYPES.RADIO,
        label: "Content quality",
        labelEs: "Calidad del contenido",
        required: true,
        options: [
          { label: "Excellent", labelEs: "Excelente", value: "5" },
          { label: "Very Good", labelEs: "Muy Bueno", value: "4" },
          { label: "Good", labelEs: "Bueno", value: "3" },
          { label: "Fair", labelEs: "Regular", value: "2" },
          { label: "Poor", labelEs: "Malo", value: "1" }
        ]
      },
      {
        id: "what_liked",
        type: FIELD_TYPES.TEXTAREA,
        label: "What did you enjoy most?",
        labelEs: "¿Qué fue lo que más disfrutaste?",
        required: false
      },
      {
        id: "improvements",
        type: FIELD_TYPES.TEXTAREA,
        label: "What could we improve?",
        labelEs: "¿Qué podríamos mejorar?",
        required: false
      },
      {
        id: "recommend",
        type: FIELD_TYPES.RADIO,
        label: "Would you recommend us?",
        labelEs: "¿Nos recomendarías?",
        required: true,
        options: [
          { label: "Yes, definitely!", labelEs: "¡Sí, definitivamente!", value: "yes" },
          { label: "Maybe", labelEs: "Tal vez", value: "maybe" },
          { label: "No", labelEs: "No", value: "no" }
        ]
      },
      {
        id: "additional_comments",
        type: FIELD_TYPES.TEXTAREA,
        label: "Additional comments",
        labelEs: "Comentarios adicionales",
        required: false
      }
    ],
    settings: {
      allowMultipleSubmissions: true,
      showProgressBar: true,
      requireEmail: false
    },
    thankYouMessage: "Thank you for your feedback! It helps us improve our services.",
    thankYouMessageEs: "¡Gracias por tu retroalimentación! Nos ayuda a mejorar nuestros servicios."
  },

  // 4. SOLICITUD DE VOLUNTARIOS
  volunteer_application: {
    title: "Volunteer Application Form",
    titleEs: "Formulario de Solicitud de Voluntarios",
    description: "Comprehensive form for volunteer recruitment",
    descriptionEs: "Formulario completo para reclutamiento de voluntarios",
    fields: [
      {
        id: "full_name",
        type: FIELD_TYPES.TEXT,
        label: "Full Name",
        labelEs: "Nombre Completo",
        required: true
      },
      {
        id: "email",
        type: FIELD_TYPES.EMAIL,
        label: "Email Address",
        labelEs: "Correo Electrónico",
        required: true
      },
      {
        id: "phone",
        type: FIELD_TYPES.PHONE,
        label: "Phone Number",
        labelEs: "Número de Teléfono",
        required: true
      },
      {
        id: "availability",
        type: FIELD_TYPES.CHECKBOX,
        label: "Availability",
        labelEs: "Disponibilidad",
        required: true,
        options: [
          { label: "Weekdays", labelEs: "Días de semana", value: "weekdays" },
          { label: "Weekends", labelEs: "Fines de semana", value: "weekends" },
          { label: "Evenings", labelEs: "Noches", value: "evenings" },
          { label: "Flexible", labelEs: "Flexible", value: "flexible" }
        ]
      },
      {
        id: "interests",
        type: FIELD_TYPES.CHECKBOX,
        label: "Areas of Interest",
        labelEs: "Áreas de Interés",
        required: true,
        options: [
          { label: "Event Support", labelEs: "Apoyo en Eventos", value: "events" },
          { label: "Administrative", labelEs: "Administrativo", value: "admin" },
          { label: "Community Outreach", labelEs: "Alcance Comunitario", value: "outreach" },
          { label: "Translation", labelEs: "Traducción", value: "translation" },
          { label: "Social Media", labelEs: "Redes Sociales", value: "social" }
        ]
      },
      {
        id: "skills",
        type: FIELD_TYPES.TEXTAREA,
        label: "Relevant Skills or Experience",
        labelEs: "Habilidades o Experiencia Relevante",
        required: false
      },
      {
        id: "why_volunteer",
        type: FIELD_TYPES.TEXTAREA,
        label: "Why do you want to volunteer?",
        labelEs: "¿Por qué quieres ser voluntario?",
        required: true
      },
      {
        id: "referral",
        type: FIELD_TYPES.TEXT,
        label: "How did you hear about us?",
        labelEs: "¿Cómo te enteraste de nosotros?",
        required: false
      }
    ],
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      requireEmail: true
    }
  },

  // 5. CONTACTO GENERAL
  contact: {
    title: "Contact Form",
    titleEs: "Formulario de Contacto",
    description: "General contact form for inquiries",
    descriptionEs: "Formulario de contacto general para consultas",
    fields: [
      {
        id: "name",
        type: FIELD_TYPES.TEXT,
        label: "Your Name",
        labelEs: "Tu Nombre",
        required: true
      },
      {
        id: "email",
        type: FIELD_TYPES.EMAIL,
        label: "Email Address",
        labelEs: "Correo Electrónico",
        required: true
      },
      {
        id: "subject",
        type: FIELD_TYPES.SELECT,
        label: "Subject",
        labelEs: "Asunto",
        required: true,
        options: [
          { label: "General Inquiry", labelEs: "Consulta General", value: "general" },
          { label: "Volunteer", labelEs: "Voluntariado", value: "volunteer" },
          { label: "Donation", labelEs: "Donación", value: "donation" },
          { label: "Partnership", labelEs: "Alianza", value: "partnership" },
          { label: "Media/Press", labelEs: "Prensa", value: "media" },
          { label: "Other", labelEs: "Otro", value: "other" }
        ]
      },
      {
        id: "message",
        type: FIELD_TYPES.TEXTAREA,
        label: "Message",
        labelEs: "Mensaje",
        required: true,
        placeholder: "How can we help you?"
      }
    ],
    settings: {
      allowMultipleSubmissions: true,
      showProgressBar: false,
      requireEmail: true
    }
  }
};

import type { FormField } from "@/types/forms";

interface FormTemplateDefinition {
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  fields: FormField[];
  settings: {
    allowMultipleSubmissions: boolean;
    showProgressBar: boolean;
    requireEmail: boolean;
  };
  thankYouMessage?: string;
  thankYouMessageEs?: string;
}

const typedFormTemplates = formTemplates as unknown as Record<string, FormTemplateDefinition>;

export { typedFormTemplates as formTemplates };
export type { FormTemplateDefinition };

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formTemplates, FIELD_TYPES };
}
