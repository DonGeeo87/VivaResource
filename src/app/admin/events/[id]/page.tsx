"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import EventForm, { EventFormData } from "@/components/forms/EventForm";
import { FileText, Plus, ExternalLink, MessageSquare } from "lucide-react";
import type { DocumentSnapshot, DocumentData } from "firebase/firestore";
import { useLanguage } from "@/contexts/LanguageContext";

interface LinkedForm {
  id: string;
  title: string;
  titleEs?: string;
  published: boolean;
  status: string;
}

export default function EditEventPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const eventId = params.id as string;
  const [event, setEvent] = useState<(EventFormData & { id: string; createdAt: Timestamp }) | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkedForms, setLinkedForms] = useState<LinkedForm[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "events", eventId);
        const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError(language === "es" ? "Evento no encontrado" : "Event not found");
          return;
        }

        const data = docSnap.data();
        setEvent({
          id: eventId,
          title_en: data.title_en || "",
          title_es: data.title_es || "",
          slug: data.slug || "",
          description_en: data.description_en || "",
          description_es: data.description_es || "",
          date: data.date ? new Date(data.date.toDate()).toISOString().split("T")[0] : "",
          time: data.time || "",
          location: data.location || "",
          category: data.category || "community",
          registration_required: data.registration_required || false,
          status: data.status || "draft",
          image_url: data.image_url || "",
          createdAt: data.created_at || Timestamp.now(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : language === "es" ? "Error al cargar evento" : "Error loading event");
      } finally {
        setLoading(false);
      }
    };

    const fetchLinkedForms = async () => {
      try {
        const q = query(collection(db, "forms"), where("linkedEventId", "==", eventId));
        const querySnapshot = await getDocs(q);
        const forms: LinkedForm[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || "",
          titleEs: doc.data().titleEs,
          published: doc.data().published ?? false,
          status: doc.data().status || "draft",
        }));
        setLinkedForms(forms);
      } catch (err) {
        console.error("Error fetching linked forms:", err);
      }
    };

    if (eventId) {
      fetchEvent();
      fetchLinkedForms();
    }
  }, [eventId, language]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 animate-pulse">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><div className="h-4 w-20 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
                <div><div className="h-4 w-20 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
              </div>
              <div><div className="h-4 w-16 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><div className="h-4 w-24 bg-gray-200 rounded mb-2" /><div className="h-20 w-full bg-gray-200 rounded-lg" /></div>
                <div><div className="h-4 w-24 bg-gray-200 rounded mb-2" /><div className="h-20 w-full bg-gray-200 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><div className="h-4 w-28 bg-gray-200 rounded mb-2" /><div className="h-40 w-full bg-gray-200 rounded-lg" /></div>
                <div><div className="h-4 w-28 bg-gray-200 rounded mb-2" /><div className="h-40 w-full bg-gray-200 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><div className="h-4 w-20 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
                <div><div className="h-4 w-16 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
                <div><div className="h-4 w-24 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
              </div>
              <div className="flex justify-end gap-3">
                <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                <div className="h-10 w-32 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="flex gap-2">
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-10 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
          {language === "es" ? "Evento no encontrado" : "Event not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-2">{language === "es" ? "Editar Evento" : "Edit Event"}</h1>
        <p className="text-gray-600">{language === "es" ? "Actualiza los detalles del evento" : "Update the event details"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Event Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <EventForm initialData={event} />
          </div>
        </div>

        {/* Sidebar - Linked Forms */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {language === "es" ? "Formularios Asociados" : "Associated Forms"}
            </h3>
            
            {/* Create New Form Button */}
            <button
              onClick={() => router.push('/admin/forms/new')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover mb-4 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {language === "es" ? "Crear Nuevo Formulario" : "Create New Form"}
            </button>

            {/* Linked Forms List */}
            {linkedForms.length > 0 ? (
              <div className="space-y-3">
                {linkedForms.map((form) => (
                  <div
                    key={form.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {form.titleEs || form.title}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            form.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {form.published ? (language === "es" ? "Publicado" : "Published") : (language === "es" ? "Borrador" : "Draft")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <a
                        href={`/admin/forms/${form.id}`}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
                      >
                        <FileText className="w-3 h-3" />
                        {language === "es" ? "Editar" : "Edit"}
                      </a>
                      <a
                        href={`/admin/forms/${form.id}/responses`}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {language === "es" ? "Respuestas" : "Responses"}
                      </a>
                      <a
                        href={`/forms/${form.id}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {language === "es" ? "Ver" : "View"}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {language === "es" ? "No hay formularios asociados a este evento" : "No forms associated with this event"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {language === "es" ? "Crea un formulario y asócialo desde el editor" : "Create a form and link it from the editor"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
