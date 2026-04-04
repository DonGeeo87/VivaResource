"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Tag,
  MessageSquare,
} from "lucide-react";

interface HelpRequest {
  id: string;
  fullName: string;
  email: string;
  assistanceTypes: string[];
  contactMethod: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

type StatusFilter = "all" | "pending" | "in_progress" | "resolved" | "closed";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<string, { en: string; es: string }> = {
  pending: { en: "Pending", es: "Pendiente" },
  in_progress: { en: "In Progress", es: "En Progreso" },
  resolved: { en: "Resolved", es: "Resuelto" },
  closed: { en: "Closed", es: "Cerrado" },
};

const assistanceTypeLabels: Record<string, { en: string; es: string }> = {
  housing: { en: "Housing", es: "Vivienda" },
  food: { en: "Food", es: "Comida" },
  health: { en: "Health", es: "Salud" },
  education: { en: "Education", es: "Educación" },
  legalAid: { en: "Legal Aid", es: "Asistencia Legal" },
  other: { en: "Other", es: "Otro" },
};

export default function AdminHelpRequestsPage(): JSX.Element {
  const { language } = useLanguage();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "help_requests"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as HelpRequest[];
      setRequests(data);
    } catch (error) {
      console.error("Error fetching help requests:", error);
      // Fallback without ordering
      try {
        const snapshot = await getDocs(collection(db, "help_requests"));
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as HelpRequest[];
        data.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        setRequests(data);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: HelpRequest["status"]) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "help_requests", id), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus, updatedAt: Timestamp.now() } : r
        )
      );
      if (selectedRequest?.id === id) {
        setSelectedRequest((prev) => prev ? { ...prev, status: newStatus, updatedAt: Timestamp.now() } : null);
      }
    } catch (error) {
      console.error("Error updating request status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async (id: string, note: string) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "help_requests", id), {
        notes: note,
        updatedAt: Timestamp.now(),
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, notes: note, updatedAt: Timestamp.now() } : r
        )
      );
      if (selectedRequest?.id === id) {
        setSelectedRequest((prev) => prev ? { ...prev, notes: note, updatedAt: Timestamp.now() } : null);
      }
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
    closed: requests.filter((r) => r.status === "closed").length,
  };

  const formatDate = (date: Timestamp | Date) => {
    const locale = language === "es" ? "es-ES" : "en-US";
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const t = {
    title: language === "es" ? "Solicitudes de Apoyo" : "Help Requests",
    subtitle:
      language === "es"
        ? "Gestiona y da seguimiento a las solicitudes de ayuda"
        : "Manage and track help requests",
    search: language === "es" ? "Buscar solicitudes..." : "Search requests...",
    allStatus: language === "es" ? "Todos" : "All",
    noRequests:
      language === "es" ? "No se encontraron solicitudes" : "No requests found",
    status: language === "es" ? "Estado" : "Status",
    name: language === "es" ? "Nombre" : "Name",
    email: language === "es" ? "Email" : "Email",
    types: language === "es" ? "Tipos" : "Types",
    contact: language === "es" ? "Contacto" : "Contact",
    date: language === "es" ? "Fecha" : "Date",
    description: language === "es" ? "Descripción" : "Description",
    notes: language === "es" ? "Notas" : "Notes",
    addNote: language === "es" ? "Agregar nota" : "Add note",
    save: language === "es" ? "Guardar" : "Save",
    back: language === "es" ? "← Volver" : "← Back",
    caseDetails:
      language === "es" ? "Detalles del caso" : "Case Details",
    updateStatus:
      language === "es" ? "Actualizar estado" : "Update status",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">
            {language === "es" ? "Total" : "Total"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">
            {statusLabels.pending[language === "es" ? "es" : "en"]}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
          <p className="text-sm text-gray-600">
            {statusLabels.in_progress[language === "es" ? "es" : "en"]}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-sm text-gray-600">
            {statusLabels.resolved[language === "es" ? "es" : "en"]}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
          <p className="text-sm text-gray-600">
            {statusLabels.closed[language === "es" ? "es" : "en"]}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">{t.allStatus}</option>
              {Object.entries(statusLabels).map(([key, labels]) => (
                <option key={key} value={key}>
                  {labels[language === "es" ? "es" : "en"]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedRequest ? (
        /* Detail View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              {t.back}
            </button>
            <div className="flex items-center gap-3 mt-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedRequest.fullName}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[selectedRequest.status]
                }`}
              >
                {
                  statusLabels[selectedRequest.status][
                    language === "es" ? "es" : "en"
                  ]
                }
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{selectedRequest.email}</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {t.types}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.assistanceTypes.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {assistanceTypeLabels[type]?.[language === "es" ? "es" : "en"] || type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  {t.description}
                </h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedRequest.description || (language === "es" ? "Sin descripción" : "No description")}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {t.contact}
                </h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{selectedRequest.contactMethod}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Status & Notes */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t.updateStatus}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusLabels).map(([key, labels]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selectedRequest.id, key as HelpRequest["status"])}
                      disabled={updating || selectedRequest.status === key}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedRequest.status === key
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } disabled:opacity-50`}
                    >
                      {labels[language === "es" ? "es" : "en"]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t.notes}</h3>
                <textarea
                  defaultValue={selectedRequest.notes || ""}
                  placeholder={language === "es" ? "Agregar notas internas..." : "Add internal notes..."}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[120px]"
                  id="notes-input"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById("notes-input") as HTMLTextAreaElement;
                    if (input?.value) addNote(selectedRequest.id, input.value);
                  }}
                  disabled={updating}
                  className="mt-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.name}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.types}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.date}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "es" ? "Acciones" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-200 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t.noRequests}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{request.fullName}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {request.assistanceTypes.slice(0, 2).map((type) => (
                            <span
                              key={type}
                              className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                            >
                              {assistanceTypeLabels[type]?.[language === "es" ? "es" : "en"] || type}
                            </span>
                          ))}
                          {request.assistanceTypes.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{request.assistanceTypes.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            statusColors[request.status]
                          }`}
                        >
                          {
                            statusLabels[request.status][
                              language === "es" ? "es" : "en"
                            ]
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
                          title={t.caseDetails}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
