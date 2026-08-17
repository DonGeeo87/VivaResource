"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Calendar, MapPin, Users, X, Download, Copy } from "lucide-react";
import { Timestamp, db } from "@/lib/db-client";
import { getCurrentUserId, getToken } from "@/lib/auth/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMountainDate } from "@/lib/timezone";
import { AdminButton, PageHeader, Pagination, EmptyState } from "@/components/admin";

interface Event {
  id: string;
  title_en: string;
  title_es: string;
  slug: string;
  date: string | Timestamp | Date;
  location: string;
  category: string;
  status: string;
  is_finished?: boolean;
  is_archived?: boolean;
  registration_required: boolean;
  image_url?: string;
  time?: string;
  formTemplate?: string;
  created_at: unknown;
  registrationCount?: number;
}

interface Registration {
  id: string;
  [key: string]: unknown;
}

// Helper function to format dates in Mountain Time (Peyton, CO)
const formatDate = (date: string | Timestamp | Date | undefined, lang: string): string => {
  return formatMountainDate(date, lang);
};

export default function AdminEventsPage(): JSX.Element {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Modal state for registrations
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Toggle action state
  const [toggling, setToggling] = useState<string | null>(null);

  const metadataFields = ['id', 'event_id', 'status', 'created_at', 'createdAt', 'updated_at'];

  const getDynamicColumns = (regs: Record<string, unknown>[]): string[] => {
    if (regs.length === 0) return [];
    const keys = new Set<string>();
    regs.forEach(reg => {
      Object.keys(reg).forEach(key => {
        if (!metadataFields.includes(key)) keys.add(key);
      });
    });
    return Array.from(keys);
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, [string, string]> = {
      full_name: ['Full Name', 'Nombre completo'],
      email: ['Email', 'Email'],
      phone: ['Phone', 'Teléfono'],
      attendees: ['Attendees', 'Asistentes'],
      guests: ['Guests', 'Invitados'],
      attendance: ['Attendance', 'Asistencia'],
      dietary_restrictions: ['Dietary Restrictions', 'Restricciones alimentarias'],
      how_hear: ['How did you hear?', '¿Cómo nos conociste?'],
      accommodations: ['Accommodations', 'Adaptaciones'],
      comments: ['Comments', 'Comentarios'],
      message: ['Message', 'Mensaje'],
    };
    if (labels[key]) return labels[key][language === 'es' ? 1 : 0];
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const renderFieldValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      try {
        return (value as { toDate: () => Date }).toDate().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');
      } catch { return '-'; }
    }
    return String(value);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = getCurrentUserId() ? getToken() : null;
      if (!token) {
        console.error("User not authenticated");
        return;
      }
      const response = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      
      // Fetch registration counts for each event
      const eventsWithCounts = await Promise.all(
        data.map(async (event: { id: string }) => {
          try {
            const regResponse = await fetch(`/api/events/${event.id}/registrations`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (regResponse.ok) {
              const regData = await regResponse.json();
              return { ...event, registrationCount: regData.count || 0 };
            }
          } catch (err) {
            console.error(`Error fetching registrations for event ${event.id}:`, err);
          }
          return { ...event, registrationCount: 0 };
        })
      );
      
      setEvents(eventsWithCounts);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      setLoadingRegistrations(true);
      const token = getToken();
      if (!token) return;
      const response = await fetch(`/api/events/${eventId}/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleViewRegistrations = async (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationsModal(true);
    await fetchRegistrations(event.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === "es" ? "¿Estás seguro de eliminar este evento?" : "Are you sure you want to delete this event?")) {
      try {
        const token = getCurrentUserId() ? getToken() : null;
      if (!token) {
        console.error("User not authenticated");
        return;
      }
        const response = await fetch(`/api/events/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        setEvents(events.filter(e => e.id !== id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleToggleFinish = async (event: Event) => {
    setToggling(event.id);
    try {
      const token = getToken();
      if (!token) return;
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_finished: !event.is_finished,
        }),
      });
      if (response.ok) {
        setEvents(events.map(e =>
          e.id === event.id ? { ...e, is_finished: !e.is_finished } : e
        ));
      } else {
        const errorData = await response.json();
        console.error("Error toggling finish:", errorData);
      }
    } catch (error) {
      console.error("Error toggling event finish:", error);
    } finally {
      setToggling(null);
    }
  };

  const handleToggleArchive = async (event: Event) => {
    setToggling(event.id);
    try {
      const token = getToken();
      if (!token) return;
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_archived: !event.is_archived,
        }),
      });
      if (response.ok) {
        setEvents(events.map(e =>
          e.id === event.id ? { ...e, is_archived: !e.is_archived } : e
        ));
      } else {
        const errorData = await response.json();
        console.error("Error toggling archive:", errorData);
      }
    } catch (error) {
      console.error("Error toggling event archive:", error);
    } finally {
      setToggling(null);
    }
  };

  const handleDuplicate = async (event: Event) => {
    const suffix = language === "es" ? " (copia)" : " (copy)";
    try {
      const token = getToken();
      if (!token) return;

      // Fecha: si viene como Date/Timestamp la formateamos a YYYY-MM-DD en Mountain Time
      let dateStr = "";
      if (typeof event.date === "string") {
        dateStr = event.date.slice(0, 10);
      } else {
        const d = event.date instanceof Date ? event.date : (event.date as { toDate?: () => Date })?.toDate?.();
        if (d && !isNaN(d.getTime())) {
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
          dateStr = local.toISOString().slice(0, 10);
        }
      }
      if (!dateStr) {
        alert(language === "es" ? "No se pudo duplicar: fecha inválida" : "Could not duplicate: invalid date");
        return;
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title_en: `${event.title_en || event.title_es || "Evento"}${suffix}`,
          title_es: `${event.title_es || event.title_en || "Evento"}${suffix}`,
          slug: `${event.slug || "evento"}-copia`,
          date: dateStr,
          time: event.time || "",
          location: event.location || "",
          category: event.category || "community",
          registration_required: event.registration_required,
          status: "draft",
          image_url: event.image_url || "",
          formTemplate: (event as { formTemplate?: string }).formTemplate || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate event");
      }

      await fetchEvents();
    } catch (error) {
      console.error("Error duplicating event:", error);
      alert(language === "es" ? "Error al duplicar el evento" : "Error duplicating event");
    }
  };

  const exportToCSV = () => {
    if (!selectedEvent || registrations.length === 0) return;

    const cols = getDynamicColumns(registrations as Record<string, unknown>[]);
    const headers = cols.map(col => getFieldLabel(col));
    const rows = registrations.map(reg =>
      cols.map(col => renderFieldValue(reg[col]))
    );

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedEvent.title_en}_registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.title_en || "").toLowerCase().includes(search.toLowerCase()) ||
      (event.title_es || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ||
      (filter === "finished" && event.is_finished) ||
      (filter === "archived" && event.is_archived) ||
      event.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700"
  };

  const categoryColors: Record<string, string> = {
    workshop: "bg-purple-100 text-purple-700",
    community: "bg-blue-100 text-blue-700",
    fundraiser: "bg-orange-100 text-orange-700",
    food: "bg-yellow-100 text-yellow-700"
  };

  return (
    <div>
      <PageHeader
        title={language === "es" ? "Eventos" : "Events"}
        description={language === "es" ? "Gestiona los eventos" : "Manage events"}
        actions={
          <Link href="/admin/events/new">
            <AdminButton size="md" icon={<Plus className="w-4 h-4" />}>
              {language === "es" ? "Nuevo Evento" : "New Event"}
            </AdminButton>
          </Link>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === "es" ? "Buscar eventos..." : "Search events..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">{language === "es" ? "Todos" : "All"}</option>
            <option value="draft">{language === "es" ? "Borrador" : "Draft"}</option>
            <option value="published">{language === "es" ? "Publicados" : "Published"}</option>
            <option value="cancelled">{language === "es" ? "Cancelados" : "Cancelled"}</option>
            <option value="finished">{language === "es" ? "Finalizados" : "Finished"}</option>
            <option value="archived">{language === "es" ? "Archivados" : "Archived"}</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
                    <div className="h-9 w-10 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center">
            {error ? (<div className="text-red-600"><p className="font-semibold mb-2">Error: {error}</p><p className="text-sm text-gray-500">Check server logs</p></div>) : (<p className="text-gray-500">{language === "es" ? "No se encontraron eventos" : "No events found"}</p>)}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-opacity ${
                event.is_archived ? "opacity-60" : ""
              }`}
            >
              {/* Event Image */}
              {event.image_url ? (
                <div className="h-32 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image_url}
                    alt={event.title_en}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                    {event.is_finished && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        {language === "es" ? "Finalizado" : "Finished"}
                      </span>
                    )}
                    {event.is_archived && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {language === "es" ? "Archivado" : "Archived"}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-primary to-primary-container relative">
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                    {event.is_finished && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        {language === "es" ? "Finalizado" : "Finished"}
                      </span>
                    )}
                    {event.is_archived && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {language === "es" ? "Archivado" : "Archived"}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="p-4">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${categoryColors[event.category]}`}>
                  {event.category}
                </span>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title_en || event.title_es || "Sin título"}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.date, language)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  )}
                  {/* Registration Count Badge */}
                  {event.registration_required && (
                    <div className="flex items-center gap-2 text-primary">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        {event.registrationCount || 0} {language === "es" ? "inscritos" : "registered"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="flex-1"
                  >
                    <AdminButton variant="outline" size="xs" fullWidth className="w-full">
                      {language === "es" ? "Detalles" : "Details"}
                    </AdminButton>
                  </Link>
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="flex-1"
                  >
                    <AdminButton variant="secondary" size="xs" fullWidth className="w-full">
                      {language === "es" ? "Editar" : "Edit"}
                    </AdminButton>
                  </Link>
                  {event.registration_required && (
                    <AdminButton
                      variant="outline"
                      size="xs"
                      icon={<Users className="w-3.5 h-3.5" />}
                      onClick={() => handleViewRegistrations(event)}
                      title={language === "es" ? "Ver inscritos" : "View registrations"}
                    >
                      {event.registrationCount || 0}
                    </AdminButton>
                  )}
                  <AdminButton
                    variant="ghost"
                    size="xs"
                    onClick={() => handleToggleFinish(event)}
                    disabled={toggling === event.id}
                    title={event.is_finished
                      ? (language === "es" ? "Marcar como activo" : "Mark as active")
                      : (language === "es" ? "Finalizar evento" : "Finish event")
                    }
                    className={event.is_finished ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                  >
                    {event.is_finished ? (language === "es" ? "Reactivar" : "Reopen") : (language === "es" ? "Finalizar" : "Finish")}
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="xs"
                    onClick={() => handleToggleArchive(event)}
                    disabled={toggling === event.id}
                    title={event.is_archived
                      ? (language === "es" ? "Desarchivar" : "Unarchive")
                      : (language === "es" ? "Archivar" : "Archive")
                    }
                    className={event.is_archived ? "text-gray-500" : "text-blue-600 hover:text-blue-700"}
                  >
                    {event.is_archived ? (language === "es" ? "Desarchivar" : "Unarchive") : (language === "es" ? "Archivar" : "Archive")}
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="xs"
                    icon={<Copy className="w-3.5 h-3.5" />}
                    onClick={() => handleDuplicate(event)}
                    disabled={toggling === event.id}
                    title={language === "es" ? "Duplicar evento" : "Duplicate event"}
                  />
                  <AdminButton
                    variant="ghost"
                    size="xs"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title={language === "es" ? "Eliminar evento" : "Delete event"}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Registrations Modal */}
      {showRegistrationsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {language === "es" ? "Inscritos" : "Registrations"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{selectedEvent.title_en}</p>
              </div>
              <div className="flex items-center gap-3">
                {registrations.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                )}
                <button
                  onClick={() => setShowRegistrationsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingRegistrations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{language === "es" ? "No hay inscritos aún" : "No registrations yet"}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {getDynamicColumns(registrations).map(col => (
                          <th key={col} className="text-left py-3 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                            {getFieldLabel(col)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                          {getDynamicColumns(registrations).map(col => (
                            <td key={col} className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                              {renderFieldValue(reg[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
