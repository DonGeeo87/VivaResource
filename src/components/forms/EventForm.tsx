"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import type { Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase/config";
import ImageUpload from "@/components/ImageUpload";

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
});

export type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: EventFormData & { id?: string; createdAt?: Timestamp };
  onSubmit?: (data: EventFormData) => Promise<void>;
  template?: string | null;
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

export default function EventForm({ initialData, onSubmit, template }: EventFormProps) {
  const router = useRouter();
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
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || getDefaultValues(),
  });

  const title_en = watch("title_en");

  // Auto-generate slug when title_en changes
  const handleTitleChange = () => {
    if (title_en && !initialData) {
      setValue("slug", generateSlug(title_en));
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
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50 transition"
        >
          {isLoading ? "Guardando..." : initialData?.id ? "Actualizar Evento" : "Crear Evento"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
