"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Users, Star, HeartHandshake, PenTool, FileText, HelpCircle, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EventTemplate {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  requiresRegistration: boolean;
  suggestedFormTemplate?: string;
  suggestedFormTemplateEs?: string;
  formFields?: string[];
}

const eventTemplates: EventTemplate[] = [
  {
    id: "workshop",
    name: "Workshop",
    nameEs: "Taller",
    description: "Interactive learning session with hands-on activities",
    descriptionEs: "Sesión de aprendizaje interactiva con actividades prácticas",
    icon: <Calendar className="w-6 h-6" />,
    color: "bg-blue-500",
    category: "workshop",
    requiresRegistration: true,
    suggestedFormTemplate: "workshop_registration",
    suggestedFormTemplateEs: "Formulario de Registro a Taller",
    formFields: ["full_name", "email", "phone", "experience_level", "learning_goals", "accessibility"],
  },
  {
    id: "community_gathering",
    name: "Community Gathering",
    nameEs: "Reunión Comunitaria",
    description: "Casual meet-and-greet for community members",
    descriptionEs: "Encuentro informal para miembros de la comunidad",
    icon: <Users className="w-6 h-6" />,
    color: "bg-green-500",
    category: "community",
    requiresRegistration: false,
    suggestedFormTemplate: "event_registration",
    suggestedFormTemplateEs: "Formulario de Registro a Evento",
    formFields: ["full_name", "email", "guests", "dietary_restrictions"],
  },
  {
    id: "fundraiser",
    name: "Fundraiser",
    nameEs: "Recaudación de Fondos",
    description: "Event to raise funds for the foundation",
    descriptionEs: "Evento para recaudación de fondos para la fundación",
    icon: <HeartHandshake className="w-6 h-6" />,
    color: "bg-amber-500",
    category: "fundraiser",
    requiresRegistration: true,
    suggestedFormTemplate: "event_registration",
    suggestedFormTemplateEs: "Formulario de Registro a Evento",
    formFields: ["full_name", "email", "phone", "attendance", "guests", "dietary_restrictions"],
  },
  {
    id: "webinar",
    name: "Webinar",
    nameEs: "Seminario Web",
    description: "Online educational presentation",
    descriptionEs: "Presentación educativa en línea",
    icon: <Star className="w-6 h-6" />,
    color: "bg-purple-500",
    category: "webinar",
    requiresRegistration: true,
    suggestedFormTemplate: "workshop_registration",
    suggestedFormTemplateEs: "Formulario de Registro a Taller",
    formFields: ["full_name", "email", "phone", "experience_level", "learning_goals"],
  },
];

export default function EventTemplateSelectPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const isES = language === "es";
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [needsForm, setNeedsForm] = useState<boolean | null>(null);

  const handleStartFromScratch = () => {
    router.push("/admin/events/new/builder?template=blank");
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setNeedsForm(null);
  };

  const handleConfirmTemplate = () => {
    if (!selectedTemplate) return;
    
    const template = eventTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const params = new URLSearchParams();
    params.set("template", selectedTemplate);
    
    if (needsForm === true && template.suggestedFormTemplate) {
      params.set("formTemplate", template.suggestedFormTemplate);
      router.push(`/admin/events/new/builder?${params.toString()}`);
    } else if (needsForm === false) {
      params.set("noForm", "true");
      router.push(`/admin/events/new/builder?${params.toString()}`);
    } else {
      setShowFormModal(true);
    }
  };

  const handleFormDecision = (needsForm: boolean) => {
    setNeedsForm(needsForm);
    setShowFormModal(false);
    
    if (!selectedTemplate) return;
    
    const template = eventTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const params = new URLSearchParams();
    params.set("template", selectedTemplate);
    
    if (needsForm && template.suggestedFormTemplate) {
      params.set("formTemplate", template.suggestedFormTemplate);
    } else {
      params.set("noForm", "true");
    }
    
    router.push(`/admin/events/new/builder?${params.toString()}`);
  };

  const selectedTemplateData = eventTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/admin/events")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-on-surface">
            {isES ? "Crear Nuevo Evento" : "Create New Event"}
          </h1>
          <p className="text-on-surface-variant mt-1">
            {isES
              ? "Elige una plantilla para comenzar o empieza desde cero"
              : "Choose a template to get started or start from scratch"}
          </p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {eventTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template.id)}
            className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
              selectedTemplate === template.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-outline-variant/20 bg-surface-lowest hover:border-primary/30 hover:shadow-md"
            }`}
          >
            <div className={`${template.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
              {template.icon}
            </div>
            <h3 className="font-bold text-lg text-on-surface mb-1">
              {isES ? template.nameEs : template.name}
            </h3>
            <p className="text-sm text-on-surface-variant mb-3">
              {isES ? template.descriptionEs : template.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant/60">
              <span>
                {isES ? "Categoría:" : "Category:"} {template.category}
              </span>
              <span>
                {template.requiresRegistration
                  ? (isES ? "Requiere registro" : "Requires registration")
                  : (isES ? "Sin registro" : "No registration")}
              </span>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
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
          className="w-full p-6 bg-surface-low rounded-xl border-2 border-dashed border-outline hover:border-outline-variant hover:bg-surface-lowest transition-all flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-outline rounded-xl flex items-center justify-center text-white">
            <PenTool className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-on-surface">
              {isES ? "Empezar desde Cero" : "Start from Scratch"}
            </h3>
            <p className="text-sm text-on-surface-variant">
              {isES
                ? "Crea un evento personalizado sin plantilla"
                : "Create a custom event without a template"}
            </p>
          </div>
        </button>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleConfirmTemplate}
          disabled={!selectedTemplate}
          className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isES ? "Continuar" : "Continue"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Form Modal */}
      {showFormModal && selectedTemplateData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isES ? "¿Necesitas un formulario de registro?" : "Do you need a registration form?"}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedTemplateData.name} - {isES ? selectedTemplateData.nameEs : selectedTemplateData.name}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  {isES 
                    ? "Recomendamos crear un formulario para este tipo de evento. Puedes personalizar los campos después."
                    : "We recommend creating a form for this event type. You can customize the fields afterwards."}
                </p>
              </div>
            </div>

            {selectedTemplateData.suggestedFormTemplate && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {isES ? "Formulario sugerido:" : "Suggested form:"}
                </p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-medium text-gray-900">
                    {isES ? selectedTemplateData.suggestedFormTemplateEs : selectedTemplateData.suggestedFormTemplate.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isES 
                      ? `${selectedTemplateData.formFields?.length || 0} campos incluidos`
                      : `${selectedTemplateData.formFields?.length || 0} fields included`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleFormDecision(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {isES ? "No, gracias" : "No, thanks"}
              </button>
              <button
                onClick={() => handleFormDecision(true)}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {isES ? "Sí, crear formulario" : "Yes, create form"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
