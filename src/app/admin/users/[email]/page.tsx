"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { db, Timestamp, collection, doc, getDoc, getDocs, query, setDoc, where } from "@/lib/db-client";
import {
  Mail,
  Calendar,
  ClipboardList,
  Users,
  HeartHandshake,
  FileText,
  HelpCircle,
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface TimelineItem {
  id: string;
  type: "help_request" | "event_registration" | "form_submission" | "volunteer_registration";
  date: Date | null;
  title: string;
  summary: string;
  raw: Record<string, unknown>;
}

interface UserNotes {
  notes: string;
  updatedAt: Timestamp | Date | null;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function formatDate(date: Date | null, locale: string): string {
  if (!date) return "-";
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const typeConfig: Record<
  string,
  {
    label: string;
    labelEs: string;
    icon: typeof HelpCircle;
    color: string;
  }
> = {
  help_request: {
    label: "Help Request",
    labelEs: "Solicitud de Ayuda",
    icon: HeartHandshake,
    color: "bg-amber-100 text-amber-700",
  },
  event_registration: {
    label: "Event Registration",
    labelEs: "Registro a Evento",
    icon: Calendar,
    color: "bg-blue-100 text-blue-700",
  },
  form_submission: {
    label: "Form Submission",
    labelEs: "Respuesta de Formulario",
    icon: FileText,
    color: "bg-purple-100 text-purple-700",
  },
  volunteer_registration: {
    label: "Volunteer Registration",
    labelEs: "Registro de Voluntario",
    icon: Users,
    color: "bg-green-100 text-green-700",
  },
};

export default function AdminUserProfilePage(): JSX.Element {
  const params = useParams();
  const { language } = useLanguage();
  const isES = language === "es";

  const emailParam = params.email as string;
  const email = useMemo(() => decodeURIComponent(emailParam).toLowerCase().trim(), [emailParam]);

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    fetchData();
  }, [email]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        helpSnap,
        eventSnap,
        formSnap,
        volSnap,
        notesSnap,
      ] = await Promise.all([
        getDocs(
          query(collection(db, "help_requests"), where("email", "==", email))
        ),
        getDocs(
          query(
            collection(db, "event_registrations"),
            where("email", "==", email)
          )
        ),
        getDocs(
          query(
            collection(db, "form_submissions"),
            where("email", "==", email)
          )
        ),
        getDocs(
          query(
            collection(db, "volunteer_registrations"),
            where("email", "==", email)
          )
        ),
        getDoc(doc(db, "user_notes", email)),
      ]);

      const items: TimelineItem[] = [];

      helpSnap.docs.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          type: "help_request",
          date: parseDate(data?.createdAt),
          title: String(data?.fullName || "Help Request"),
          summary: [
            (data?.assistanceTypes as string[])?.join(", "),
            data?.status ? `Status: ${data.status}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
          raw: data || {},
        });
      });

      eventSnap.docs.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          type: "event_registration",
          date: parseDate(data?.created_at),
          title: String(data?.name || data?.full_name || "Event Registration"),
          summary: [
            data?.event_id ? `Event: ${data.event_id}` : "",
            data?.phone ? `Phone: ${data.phone}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
          raw: data || {},
        });
      });

      formSnap.docs.forEach((d) => {
        const data = d.data();
        const responses = data?.responses as Record<string, string> | undefined;
        const firstFieldValue = responses ? Object.values(responses).find((v) => v) : "";
        items.push({
          id: d.id,
          type: "form_submission",
          date: parseDate(data?.submittedAt),
          title: firstFieldValue || "Form Submission",
          summary: data?.formId ? `Form: ${data.formId}` : "",
          raw: data || {},
        });
      });

      volSnap.docs.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          type: "volunteer_registration",
          date: parseDate(data?.created_at),
          title: `${data?.firstName || ""} ${data?.lastName || ""}`.trim() || "Volunteer Registration",
          summary: [
            data?.program ? `Program: ${data.program}` : "",
            data?.status ? `Status: ${data.status}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
          raw: data || {},
        });
      });

      items.sort((a, b) => {
        const aTime = a.date ? a.date.getTime() : 0;
        const bTime = b.date ? b.date.getTime() : 0;
        return bTime - aTime;
      });

      setTimeline(items);

      if (notesSnap.exists) {
        const data = notesSnap.data() as UserNotes;
        setNotes(data.notes || "");
      } else {
        setNotes("");
      }
    } catch (error: unknown) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!email) return;
    setNotesLoading(true);
    setSaveStatus("saving");
    try {
      await setDoc(doc(db, "user_notes", email), {
        notes,
        updatedAt: Timestamp.now(),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error: unknown) {
      console.error("Error saving notes:", error);
      setSaveStatus("error");
    } finally {
      setNotesLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: timeline.length,
      help: timeline.filter((t) => t.type === "help_request").length,
      events: timeline.filter((t) => t.type === "event_registration").length,
      forms: timeline.filter((t) => t.type === "form_submission").length,
      volunteers: timeline.filter((t) => t.type === "volunteer_registration").length,
    };
  }, [timeline]);

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {isES ? "Volver a Usuarios" : "Back to Users"}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{email}</h1>
              <p className="text-gray-500 text-sm">
                {isES ? "Perfil de usuario público" : "Public user profile"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">{isES ? "Total" : "Total"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-amber-600">{stats.help}</p>
          <p className="text-sm text-gray-600">{isES ? "Ayuda" : "Help"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-blue-600">{stats.events}</p>
          <p className="text-sm text-gray-600">{isES ? "Eventos" : "Events"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-purple-600">{stats.forms}</p>
          <p className="text-sm text-gray-600">{isES ? "Formularios" : "Forms"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{stats.volunteers}</p>
          <p className="text-sm text-gray-600">{isES ? "Voluntarios" : "Volunteers"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {isES ? "Historial de Interacciones" : "Interaction History"}
          </h2>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
              {isES
                ? "No se encontraron interacciones para este usuario."
                : "No interactions found for this user."}
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{item.title}</span>
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                            {isES ? config.labelEs : config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{
                          item.summary
                        }</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date, language)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Notes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isES ? "Notas de Admin" : "Admin Notes"}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isES
                  ? "Escribe notas internas sobre este usuario..."
                  : "Write internal notes about this user..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[200px] resize-y mb-4"
            />
            <button
              onClick={handleSaveNotes}
              disabled={notesLoading || saveStatus === "saving"}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saveStatus === "saved"
                ? isES
                  ? "Guardado"
                  : "Saved"
                : isES
                ? "Guardar Notas"
                : "Save Notes"}
            </button>
            {saveStatus === "error" && (
              <p className="text-sm text-red-600 mt-2">
                {isES ? "Error al guardar" : "Failed to save"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
