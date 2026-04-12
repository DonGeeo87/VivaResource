"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, FileText, Users, MessageSquare, Star, PenTool } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TemplateOption {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  icon: React.ReactNode;
  color: string;
  fields: Array<{
    type: string;
    label: string;
    labelEs?: string;
    required: boolean;
    options?: Array<{ label: string; labelEs?: string; value: string }>;
  }>;
}

const availableTemplates: TemplateOption[] = [
  {
    id: 'event_registration',
    name: 'Event Registration',
    nameEs: 'Registro a Evento',
    description: 'Standard form for event registration',
    descriptionEs: 'Formulario estándar para eventos',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-blue-500',
    fields: [
      { type: 'text', label: 'Full Name', labelEs: 'Nombre Completo', required: true },
      { type: 'email', label: 'Email', labelEs: 'Correo Electrónico', required: true },
      { type: 'phone', label: 'Phone', labelEs: 'Teléfono', required: false },
      { type: 'number', label: 'Number of Attendees', labelEs: 'Número de Asistentes', required: true },
      { type: 'textarea', label: 'Special Accommodations', labelEs: 'Adaptaciones Especiales', required: false },
    ]
  },
  {
    id: 'workshop_registration',
    name: 'Workshop Registration',
    nameEs: 'Registro a Taller',
    description: 'Form with skill level assessment',
    descriptionEs: 'Formulario con evaluación de nivel',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-green-500',
    fields: [
      { type: 'text', label: 'Full Name', labelEs: 'Nombre Completo', required: true },
      { type: 'email', label: 'Email', labelEs: 'Correo Electrónico', required: true },
      { type: 'select', label: 'Skill Level', labelEs: 'Nivel de Habilidad', required: true, options: [
        { label: 'Beginner', labelEs: 'Principiante', value: 'beginner' },
        { label: 'Intermediate', labelEs: 'Intermedio', value: 'intermediate' },
        { label: 'Advanced', labelEs: 'Avanzado', value: 'advanced' },
      ]},
      { type: 'textarea', label: 'What do you hope to learn?', labelEs: '¿Qué esperas aprender?', required: false },
    ]
  },
  {
    id: 'feedback',
    name: 'Feedback Form',
    nameEs: 'Retroalimentación',
    description: 'Post-event satisfaction survey',
    descriptionEs: 'Encuesta de satisfacción post-evento',
    icon: <Star className="w-6 h-6" />,
    color: 'bg-yellow-500',
    fields: [
      { type: 'email', label: 'Email', labelEs: 'Correo Electrónico', required: true },
      { type: 'radio', label: 'Overall Satisfaction', labelEs: 'Satisfacción General', required: true, options: [
        { label: 'Very Satisfied', labelEs: 'Muy Satisfecho', value: '5' },
        { label: 'Satisfied', labelEs: 'Satisfecho', value: '4' },
        { label: 'Neutral', labelEs: 'Neutral', value: '3' },
        { label: 'Dissatisfied', labelEs: 'Insatisfecho', value: '2' },
        { label: 'Very Dissatisfied', labelEs: 'Muy Insatisfecho', value: '1' },
      ]},
      { type: 'textarea', label: 'What did you like most?', labelEs: '¿Qué fue lo que más te gustó?', required: false },
      { type: 'textarea', label: 'Suggestions for improvement', labelEs: 'Sugerencias de mejora', required: false },
    ]
  },
  {
    id: 'volunteer_application',
    name: 'Volunteer Application',
    nameEs: 'Solicitud de Voluntario',
    description: 'Comprehensive volunteer recruitment',
    descriptionEs: 'Reclutamiento de voluntarios',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-purple-500',
    fields: [
      { type: 'text', label: 'Full Name', labelEs: 'Nombre Completo', required: true },
      { type: 'email', label: 'Email', labelEs: 'Correo Electrónico', required: true },
      { type: 'phone', label: 'Phone', labelEs: 'Teléfono', required: true },
      { type: 'textarea', label: 'Why do you want to volunteer?', labelEs: '¿Por qué quieres ser voluntario?', required: true },
      { type: 'checkbox', label: 'Skills', labelEs: 'Habilidades', required: false, options: [
        { label: 'Communication', labelEs: 'Comunicación', value: 'communication' },
        { label: 'Organization', labelEs: 'Organización', value: 'organization' },
        { label: 'Technical', labelEs: 'Técnica', value: 'technical' },
        { label: 'Leadership', labelEs: 'Liderazgo', value: 'leadership' },
      ]},
    ]
  },
  {
    id: 'contact',
    name: 'Contact Form',
    nameEs: 'Formulario de Contacto',
    description: 'General inquiry form',
    descriptionEs: 'Formulario de consulta general',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'bg-pink-500',
    fields: [
      { type: 'text', label: 'Name', labelEs: 'Nombre', required: true },
      { type: 'email', label: 'Email', labelEs: 'Correo Electrónico', required: true },
      { type: 'text', label: 'Subject', labelEs: 'Asunto', required: true },
      { type: 'textarea', label: 'Message', labelEs: 'Mensaje', required: true },
    ]
  }
];

export default function FormTemplateSelectPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const isES = language === "es";

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [eventId] = useState(searchParams.get('eventId') || '');

  const handleStartFromScratch = () => {
    const params = new URLSearchParams();
    if (eventId) params.set('eventId', eventId);
    params.set('template', 'blank');
    router.push(`/admin/forms/new/builder?${params.toString()}`);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleConfirmTemplate = () => {
    if (!selectedTemplate) return;
    const params = new URLSearchParams();
    if (eventId) params.set('eventId', eventId);
    params.set('template', selectedTemplate);
    router.push(`/admin/forms/new/builder?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/admin/forms')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {isES ? 'Crear Nuevo Formulario' : 'Create New Form'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isES
              ? 'Elige una plantilla para comenzar o empieza desde cero'
              : 'Choose a template to get started or start from scratch'}
          </p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {availableTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template.id)}
            className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className={`${template.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
              {template.icon}
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {isES ? template.nameEs : template.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {isES ? template.descriptionEs : template.description}
            </p>
            <div className="text-xs text-gray-500">
              {template.fields.length} {isES ? 'campos' : 'fields'}
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Start from Scratch */}
      <div className="mb-8">
        <button
          onClick={handleStartFromScratch}
          className="w-full p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-gray-400 rounded-xl flex items-center justify-center text-white">
            <PenTool className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-gray-900">
              {isES ? 'Empezar desde Cero' : 'Start from Scratch'}
            </h3>
            <p className="text-sm text-gray-600">
              {isES
                ? 'Crea un formulario personalizado sin plantilla'
                : 'Create a custom form without a template'}
            </p>
          </div>
        </button>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleConfirmTemplate}
          disabled={!selectedTemplate}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isES ? 'Continuar' : 'Continue'} →
        </button>
      </div>
    </div>
  );
}
