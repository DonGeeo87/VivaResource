"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import type { Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase/config";
import ImageUpload from "@/components/ImageUpload";
import { formTemplates } from "@/data/formTemplates";
import { useLanguage } from "@/contexts/LanguageContext";
import EmbeddedAIGenerator from "./EmbeddedAIGenerator";
import { FileText, Check, ChevronRight, ChevronLeft, Plus, Copy, Send } from "lucide-react";

// Validación schema
export const eventSchema = z.object({
  title_en: z.string().min(3, "Título en inglés debe tener al menos 3 caracteres").max(100),
  title_es: z.string().min(3, "Título en español debe tener al menos 3 caracteres").max(100),
  slug: z.string().optional(),
  description_en: z.string().min(10, "Descripción debe tener al menos 10 caracteres").max(2000),
  description_es: z.string().min(10, "Descripción debe tener al menos 10 caracteres").max(2000),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().optional(),
  location: z.string().min(3, "Ubicación requerida").max(200),
  category: z.enum(["workshop", "community", "fundraiser"]),
  registration_required: z.boolean(),
  status: z.enum(["draft", "published", "cancelled"]),
  image_url: z.string().optional(),
  // Nuevos campos para integración con formularios
  formId: z.string().optional(),
  formTemplate: z.string().optional(),
  maxParticipants: z.number().optional().nullable(),
  generateQR: z.boolean().optional(),
  showQROnPage: z.boolean().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: EventFormData & { id?: string; createdAt?: Timestamp };
  onSubmit?: (data: EventFormData) => Promise<void>;
  template?: string | null;
  formTemplate?: string | null;
  skipForm?: boolean;
}

const eventTemplates: Record<string, Partial<EventFormData>> = {
  workshop: {
    category: "workshop",
    registration_required: true,
    title_en: "Community Workshop",
    title_es: "Taller Comunitario",
    description_en: "Interactive learning session with hands-on activities for the community.",
    description_es: "Sesión de aprendizaje interactiva con actividades prácticas para la comunidad.",
  },
  community_gathering: {
    category: "community",
    registration_required: false,
    title_en: "Community Gathering",
    title_es: "Reunión Comunitaria",
    description_en: "Casual meet-and-greet for community members to connect and share.",
    description_es: "Encuentro informal para miembros de la comunidad para conectar y compartir.",
  },
  fundraiser: {
    category: "fundraiser",
    registration_required: true,
    title_en: "Fundraising Event",
    title_es: "Evento de Recaudación de Fondos",
    description_en: "Join us to support our mission and raise funds for community programs.",
    description_es: "Únase a nosotros para apoyar nuestra misión y recaudar fondos para programas comunitarios.",
  },
  webinar: {
    category: "workshop",
    registration_required: true,
    title_en: "Online Webinar",
    title_es: "Seminario Web",
    description_en: "Online educational presentation with Q&A session.",
    description_es: "Presentación educativa en línea con sesión de preguntas y respuestas.",
  },
};

export default function EventForm({ initialData, onSubmit, template, formTemplate, skipForm }: EventFormProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-generate slug from titleEN
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const templateData = template && template !== "blank" ? eventTemplates[template] : null;

  const getDefaultValues = (): EventFormData => {
    if (templateData) {
      return {
        title_en: templateData.title_en || "",
        title_es: templateData.title_es || "",
        slug: "",
        description_en: templateData.description_en || "",
        description_es: templateData.description_es || "",
        date: "",
        time: "",
        location: "",
        category: templateData.category || "community",
        status: "draft",
        registration_required: templateData.registration_required ?? false,
        image_url: "",
        formId: "",
        formTemplate: "",
        maxParticipants: null,
        generateQR: false,
        showQROnPage: false,
      };
    }
    return {
      title_en: "",
      title_es: "",
      slug: "",
      description_en: "",
      description_es: "",
      date: "",
      time: "",
      location: "",
      category: "community",
      status: "draft",
      registration_required: false,
      image_url: "",
      formId: "",
      formTemplate: "",
      maxParticipants: null,
      generateQR: false,
      showQROnPage: false,
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || getDefaultValues(),
  });

  const [currentStep, setCurrentStep] = useState(1);
  const registrationRequired = watch("registration_required");
  const selectedFormTemplate = watch("formTemplate");
  
  // Apply pre-selected form template from event creation flow
  useEffect(() => {
    if (formTemplate && !skipForm) {
      setValue("formTemplate", formTemplate);
      setValue("registration_required", true);
    }
    if (skipForm) {
      setValue("registration_required", false);
      setValue("formTemplate", "");
    }
  }, [formTemplate, skipForm, setValue]);
  
  const totalSteps = 3;
  const steps = [
    { num: 1, label: "Evento", labelEs: "Event" },
    { num: 2, label: "Registro", labelEs: "Registration" },
    { num: 3, label: "Publicar", labelEs: "Publish" },
  ];

  const formTemplateOptions = Object.entries(formTemplates).map(([key, template]) => ({
    id: key,
    title: template.title,
    titleEs: template.titleEs,
    description: template.description,
    descriptionEs: template.descriptionEs,
    fieldCount: template.fields.length,
  }));

  const isES = language === "es";
  const title_en = watch("title_en");

  const handleNext = async () => {
    // Validate current step fields
    if (currentStep === 1) {
      const valid = await trigger(["title_en", "title_es", "date", "location", "description_en", "description_es"]);
      if (!valid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Auto-generate slug when title_en changes
  const handleTitleChange = () => {
    if (title_en && !initialData) {
      setValue("slug", generateSlug(title_en));
    }
  };

  // Handle AI content generation - apply both languages independently
  const handleAIApply = (en: Record<string, unknown>, es: Record<string, unknown>) => {
    if (en.title) {
      setValue("title_en", en.title as string);
      setValue("slug", generateSlug(en.title as string));
    }
    if (es.title) {
      setValue("title_es", es.title as string);
    }
    if (en.content || en.excerpt) {
      setValue("description_en", (en.content || en.excerpt || "") as string);
    }
    if (es.content || es.excerpt) {
      setValue("description_es", (es.content || es.excerpt || "") as string);
    }
  };

  const onFormSubmit = async (data: EventFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Auto-generate slug if not provided
      if (!data.slug) {
        data.slug = generateSlug(data.title_en);
      }

      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default submit logic
        const method = initialData?.id ? "PUT" : "POST";
        const endpoint = initialData?.id ? `/api/events/${initialData.id}` : "/api/events";

        // Get Firebase auth token
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Debes iniciar sesión para realizar esta acción");
        }

        const token = await user.getIdToken();

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error: ${response.statusText}`);
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/events");
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar evento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-2xl">
      {/* Step Indicator */}
      {registrationRequired && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                  currentStep >= step.num 
                    ? "bg-primary text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className={`ml-2 text-sm hidden sm:block ${
                  currentStep >= step.num ? "text-gray-900 font-medium" : "text-gray-400"
                }`}>
                  {isES ? step.labelEs : step.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step.num ? "bg-primary" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Errores globales */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Éxito */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          ¡Evento guardado exitosamente! Redirigiendo...
        </div>
      )}

      {/* Título EN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título (Inglés) *
        </label>
        <input
          {...register("title_en")}
          onBlur={handleTitleChange}
          placeholder="Event Title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
        {errors.title_en && <p className="text-red-600 text-sm mt-1">{errors.title_en.message}</p>}
      </div>

      {/* Título ES */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título (Español) *
        </label>
        <input
          {...register("title_es")}
          placeholder="Título del Evento"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
        {errors.title_es && <p className="text-red-600 text-sm mt-1">{errors.title_es.message}</p>}
      </div>

      {/* Slug (auto-generated) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
        <input
          {...register("slug")}
          placeholder="auto-generated-slug"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none"
          readOnly
        />
        <p className="text-gray-500 text-xs mt-1">Auto-generado desde el título en inglés</p>
      </div>

      {/* Descripción EN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (Inglés) *
        </label>
        <textarea
          {...register("description_en")}
          placeholder="Event description in English..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
        {errors.description_en && (
          <p className="text-red-600 text-sm mt-1">{errors.description_en.message}</p>
        )}
      </div>

      {/* Descripción ES */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (Español) *
        </label>
        <textarea
          {...register("description_es")}
          placeholder="Descripción del evento en español..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
        {errors.description_es && (
          <p className="text-red-600 text-sm mt-1">{errors.description_es.message}</p>
        )}
      </div>

      {/* AI Generator */}
      <div>
        <EmbeddedAIGenerator
          onApplySeparate={handleAIApply}
          defaultLanguage="both"
        />
      </div>

      {/* Fecha */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            type="date"
            {...register("date")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
          <input
            type="time"
            {...register("time")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
        <input
          {...register("location")}
          placeholder="123 Main St, City, State"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
        {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>}
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
        <select
          {...register("category")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="workshop">Taller (Workshop)</option>
          <option value="community">Comunidad (Community)</option>
          <option value="fundraiser">Recaudación (Fundraiser)</option>
        </select>
        {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
        <select
          {...register("status")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>}
      </div>

      {/* Requiere Registro */}
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("registration_required")}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Requiere registro de asistentes
        </label>
      </div>

      {/* Paso 2: Configuración de Registro */}
      {currentStep >= 2 && registrationRequired && (
        <div className="border-t pt-6 mt-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configuración de Registro
          </h3>

          {/* Seleccionar formulario */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              ¿Qué formulario usarás para el registro?
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Opción: Crear nuevo formulario */}
              <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedFormTemplate ? "border-gray-200 bg-gray-50 opacity-60" : "border-primary bg-primary/5"
              }`}>
                <input
                  type="radio"
                  {...register("formTemplate")}
                  value=""
                  className="sr-only"
                  onChange={() => {
                    setValue("formTemplate", "");
                    setValue("formId", "");
                  }}
                />
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium text-gray-900">
                      {isES ? "Crear formulario desde cero" : "Create form from scratch"}
                    </span>
                    <p className="text-xs text-gray-500">
                      {isES ? "Personaliza los campos del formulario" : "Customize form fields"}
                    </p>
                  </div>
                </div>
              </label>

              {/* Opciones de templates */}
              {formTemplateOptions.slice(0, 3).map((template) => (
                <label key={template.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedFormTemplate === template.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30"
                }`}>
                  <input
                    type="radio"
                    {...register("formTemplate")}
                    value={template.id}
                    className="sr-only"
                    onChange={() => setValue("formTemplate", template.id)}
                  />
                  <div className="flex items-start gap-3">
                    <Copy className="w-5 h-5 text-primary mt-0.5" />
                    <div>
<span className="font-medium text-gray-900">
                      {isES ? template.titleEs : template.title}
                    </span>
                    <p className="text-xs text-gray-500">
                      {template.fieldCount} {isES ? "campos" : "fields"}
                    </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Límite de participantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Límite de participantes (opcional)
            </label>
            <input
              type="number"
              {...register("maxParticipants", { valueAsNumber: true })}
              placeholder={isES ? "Sin límite" : "No limit"}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
            <p className="text-gray-500 text-xs mt-1">
              {isES ? "Deja vacío para ilimitado" : "Leave empty for unlimited"}
            </p>
          </div>

          {/* Opciones de QR */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Código QR para compartir
            </label>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("generateQR")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  {isES ? "Generar código QR" : "Generate QR code"}
                </span>
              </label>
            </div>

            {watch("generateQR") && (
              <div className="flex items-center gap-4 pl-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("showQROnPage")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {isES ? "Mostrar QR en la página del evento" : "Show QR on event page"}
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Imagen Upload */}
      <div>
        <ImageUpload
          value={watch("image_url")}
          onChange={(url) => setValue("image_url", url)}
          path="events"
          label="Imagen del Evento"
        />
        <p className="text-gray-500 text-xs mt-1">
          Sube una imagen para el evento (JPG, PNG, WebP - max 5MB)
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        {registrationRequired && currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            {isES ? "Anterior" : "Previous"}
          </button>
        )}
        
        {registrationRequired && currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition"
          >
            {isES ? "Siguiente" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50 transition"
          >
            {isLoading ? (
              isES ? "Guardando..." : "Saving..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                {initialData?.id 
                  ? (isES ? "Actualizar Evento" : "Update Event") 
                  : (isES ? "Crear Evento" : "Create Event")}
              </>
            )}
          </button>
        )}
        
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition"
        >
          {isES ? "Cancelar" : "Cancel"}
        </button>
      </div>
    </form>
  );
}
