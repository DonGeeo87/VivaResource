"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import EventForm, { EventFormData } from "@/components/forms/EventForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase/config";

interface EventData {
  title_en: string;
  title_es: string;
  slug: string;
  description_en?: string;
  description_es?: string;
  date: unknown;
  time?: string;
  location?: string;
  category?: string;
  status: string;
  image_url?: string;
  registration_required?: boolean;
  formId?: string;
  formTemplate?: string;
  customFormFields?: string;
  maxParticipants?: number | null;
  generateQR?: boolean;
  showQROnPage?: boolean;
}

export default function EventEditPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { language } = useLanguage();
  const isES = language === "es";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<EventFormData | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError(isES ? "ID de evento no proporcionado" : "Event ID not provided");
        setLoading(false);
        return;
      }

      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (!eventDoc.exists()) {
          setError(isES ? "Evento no encontrado" : "Event not found");
          setLoading(false);
          return;
        }

        const data = eventDoc.data() as EventData;

        // Convert Firestore data to EventFormData
        // Handle date field: might be Timestamp, Date, or string
        let dateStr = "";
        if (data.date) {
          if (typeof data.date === "string") {
            dateStr = data.date;
          } else if (data.date instanceof Date) {
            dateStr = data.date.toISOString().split("T")[0];
          } else if (typeof (data.date as { toDate: () => Date }).toDate === "function") {
            dateStr = (data.date as { toDate: () => Date }).toDate().toISOString().split("T")[0];
          }
        }

        const formData: EventFormData = {
          title_en: data.title_en || "",
          title_es: data.title_es || "",
          slug: data.slug || "",
          description_en: data.description_en || "",
          description_es: data.description_es || "",
          date: dateStr,
          time: data.time || "",
          location: data.location || "",
          category: (data.category as "workshop" | "community" | "fundraiser") || "community",
          status: (data.status as "draft" | "published" | "cancelled") || "draft",
          registration_required: data.registration_required ?? false,
          image_url: data.image_url || "",
          formId: data.formId || "",
          formTemplate: data.formTemplate || "",
          customFormFields: data.customFormFields || "",
          maxParticipants: data.maxParticipants ?? null,
          generateQR: data.generateQR ?? false,
          showQROnPage: data.showQROnPage ?? false,
        };

        setInitialData(formData);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(isES ? "Error al cargar el evento" : "Error loading event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, isES]);

  const handleSubmit = async (data: EventFormData): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error(isES ? "Debes iniciar sesión" : "You must be logged in");
    }

    const token = await user.getIdToken();
    const response = await fetch(`/api/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("[EventEdit] Update response:", responseData);
  };

  if (loading) {
    return (
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-error-container rounded-lg p-6 text-error">
          <h1 className="font-bold text-lg mb-2">{isES ? "Error" : "Error"}</h1>
          <p>{error}</p>
          <button
            onClick={() => router.push("/admin/events")}
            className="mt-4 text-primary hover:underline"
          >
            ← {isES ? "Volver a Eventos" : "Back to Events"}
          </button>
        </div>
      </main>
    );
  }

  if (!initialData) {
    return (
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <p className="text-gray-500">{isES ? "Cargando..." : "Loading..."}</p>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/admin/events/${eventId}`)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {isES ? "Volver a Detalles" : "Back to Details"}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isES ? "Editar Evento" : "Edit Event"}
        </h1>
      </div>

      <EventForm
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
