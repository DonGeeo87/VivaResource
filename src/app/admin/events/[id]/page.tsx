"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMountainDate } from "@/lib/timezone";
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  User,
  Send,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

interface EventData {
  id: string;
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
}

interface Registration {
  id: string;
  name: string;
  email: string;
  phone?: string;
  responses?: Record<string, string | string[]>;
  createdAt: Timestamp | Date;
}

interface LinkedForm {
  id: string;
  title: string;
  published: boolean;
  responseCount: number;
}

type View = "overview" | "registrations";

export default function EventDetailsPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [linkedForms, setLinkedForms] = useState<LinkedForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("overview");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [sendingSummary, setSendingSummary] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch event
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (!eventDoc.exists()) {
          setError(language === "es" ? "Evento no encontrado" : "Event not found");
          setLoading(false);
          return;
        }
        const eventData = { id: eventDoc.id, ...eventDoc.data() } as EventData;
        setEvent(eventData);

        // Fetch registrations for this event
        // Note: registrations use "event_id" (snake_case) as stored by the registration form
        const regQuery = query(
          collection(db, "event_registrations"),
          where("event_id", "==", eventId)
        );
        const regSnap = await getDocs(regQuery);
        const regs = regSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Registration[];
        setRegistrations(regs);

        // Fetch linked forms and their response counts
        const formQuery = query(
          collection(db, "forms"),
          where("linkedEventId", "==", eventId)
        );
        const formSnap = await getDocs(formQuery);
        const forms: LinkedForm[] = [];
        for (const formDoc of formSnap.docs) {
          const formData = formDoc.data();
          const subQuery = query(
            collection(db, "form_submissions"),
            where("formId", "==", formDoc.id)
          );
          const subSnap = await getDocs(subQuery);
          forms.push({
            id: formDoc.id,
            title: formData.title || "",
            published: formData.published ?? false,
            responseCount: subSnap.size,
          });
        }
        setLinkedForms(forms);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(err instanceof Error ? err.message : "Error loading event");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId, language]);

  const handleDelete = async () => {
    const msg = language === "es" ? "¿Eliminar este evento?" : "Delete this event?";
    if (!confirm(msg)) return;
    try {
      await deleteDoc(doc(db, "events", eventId));
      router.push("/admin/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err instanceof Error ? err.message : "Error deleting");
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    const msg = language === "es" ? "¿Eliminar este registro?" : "Delete this registration?";
    if (!confirm(msg)) return;
    try {
      await deleteDoc(doc(db, "event_registrations", id));
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      if (selectedReg?.id === id) setSelectedReg(null);
    } catch (err) {
      console.error("Error deleting registration:", err);
    }
  };

  const sendSummaryEmail = async () => {
    if (!event) return;

    setShowConfirmModal(false);
    setSendingSummary(true);
    try {
      const response = await fetch("/api/email/send-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          id: eventId,
          data: { language },
        }),
      });

      if (response.ok) {
        alert(language === "es" ? "¡Resumen enviado exitosamente!" : "Summary sent successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send summary");
      }
    } catch (error) {
      console.error("Error sending summary:", error);
      alert(language === "es" ? "Error al enviar el resumen: " + (error instanceof Error ? error.message : "") : "Error sending summary");
    } finally {
      setSendingSummary(false);
    }
  };

  const formatDate = (date: unknown): string => {
    return formatMountainDate(date, language);
  };

  const title = event
    ? (language === "es" && event.title_es ? event.title_es : event.title_en || "")
    : "";

  if (loading) {
    return (
      <div className="p-6 md:p-8 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-medium">Error</p>
          <p>{error || "Event not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <button
            onClick={() => router.push("/admin/events")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "es" ? "Volver a Eventos" : "Back to Events"}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(event.date)}
            {event.time ? ` · ${event.time}` : ""}
            {event.location ? ` · ${event.location}` : ""}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={registrations.length === 0}
            className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {language === "es" ? "Enviar Resumen" : "Send Summary"}
          </button>
          <Link
            href={`/admin/events/${eventId}/edit`}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            <Edit className="w-4 h-4" />
            {language === "es" ? "Editar" : "Edit"}
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {language === "es" ? "Eliminar" : "Delete"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setView("overview")}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            view === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          {language === "es" ? "Resumen" : "Overview"}
        </button>
        <button
          onClick={() => setView("registrations")}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            view === "registrations"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          {language === "es" ? "Registrados" : "Registrations"}
          <span className="ml-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
            {registrations.length}
          </span>
        </button>
      </div>

      {view === "overview" ? (
        /* Overview Tab */
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
                  <p className="text-sm text-gray-600">
                    {language === "es" ? "Registrados" : "Registrations"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{linkedForms.length}</p>
                  <p className="text-sm text-gray-600">
                    {language === "es" ? "Formularios" : "Linked Forms"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {linkedForms.reduce((sum, f) => sum + f.responseCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === "es" ? "Respuestas totales" : "Total Responses"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === "es" ? "Detalles del Evento" : "Event Details"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{language === "es" ? "Estado" : "Status"}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      event.status === "published"
                        ? "bg-green-100 text-green-700"
                        : event.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{language === "es" ? "Categoría" : "Category"}</p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize bg-primary/10 text-primary">
                    {event.category || "-"}
                  </span>
                </div>
                {event.registration_required && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {language === "es" ? "Requiere registro" : "Registration required"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === "es" ? "Descripción" : "Description"}
                </p>
                <p className="text-gray-700">
                  {language === "es"
                    ? event.description_es || event.description_en || "-"
                    : event.description_en || event.description_es || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Linked Forms */}
          {linkedForms.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {language === "es" ? "Formularios Asociados" : "Linked Forms"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linkedForms.map((form) => (
                  <div
                    key={form.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{form.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              form.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {form.published
                              ? language === "es"
                                ? "Publicado"
                                : "Published"
                              : language === "es"
                              ? "Borrador"
                              : "Draft"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {form.responseCount}{" "}
                            {language === "es" ? "respuestas" : "responses"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/admin/forms/${form.id}/responses`}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        {language === "es" ? "Ver Respuestas" : "View Responses"}
                      </Link>
                      <Link
                        href={`/admin/forms/${form.id}`}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        <Edit className="w-3 h-3" />
                        {language === "es" ? "Editar Formulario" : "Edit Form"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Registrations Tab */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {registrations.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === "es" ? "Sin registros" : "No registrations"}
              </h3>
              <p className="text-gray-500">
                {language === "es"
                  ? "Aún no hay registros para este evento"
                  : "No registrations for this event yet"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === "es" ? "Nombre" : "Name"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === "es" ? "Fecha" : "Date"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {language === "es" ? "Acciones" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-gray-900">{reg.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{reg.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(() => {
                        const regRecord = reg as unknown as Record<string, unknown>;
                        const rawDate = regRecord.createdAt || regRecord.created_at;
                        if (!rawDate) return "-";
                        try {
                          if (typeof (rawDate as { toDate: () => Date }).toDate === "function") {
                            return (rawDate as { toDate: () => Date }).toDate().toLocaleDateString(language === "es" ? "es-ES" : "en-US");
                          }
                          return new Date(rawDate as string).toLocaleDateString(language === "es" ? "es-ES" : "en-US");
                        } catch {
                          return "-";
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRegistration(reg.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Registration Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {language === "es" ? "Detalle de Registro" : "Registration Detail"}
              </h2>
              <button
                onClick={() => setSelectedReg(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  {language === "es" ? "Nombre" : "Name"}
                </p>
                <p className="font-medium">{selectedReg.name}</p>
                <p className="text-sm text-gray-500 mt-2 mb-1">Email</p>
                <p className="font-medium">{selectedReg.email}</p>
                {selectedReg.phone && (
                  <>
                    <p className="text-sm text-gray-500 mt-2 mb-1">
                      {language === "es" ? "Teléfono" : "Phone"}
                    </p>
                    <p className="font-medium">{selectedReg.phone}</p>
                  </>
                )}
              </div>
              {Object.entries(selectedReg.responses || {}).map(([key, value]) => (
                <div key={key} className="border-b border-gray-100 pb-3 mb-3 last:border-0">
                  <p className="text-sm font-medium text-gray-700">{key}</p>
                  <p className="text-gray-900">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {language === "es" ? "Cerrar" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title={language === "es" ? "Enviar Resumen por Email" : "Send Summary Email"}
        message={language === "es"
          ? "Se enviará un resumen completo de todos los registros de este evento a los administradores configurados."
          : "A complete summary of all event registrations will be sent to the configured administrators."}
        confirmText={language === "es" ? "Enviar Resumen" : "Send Summary"}
        cancelText={language === "es" ? "Cancelar" : "Cancel"}
        onConfirm={sendSummaryEmail}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={sendingSummary}
      />
    </div>
  );
}
