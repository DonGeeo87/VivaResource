"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Calendar, MapPin, Users, X, Download } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMountainDate } from "@/lib/timezone";

interface Event {
  id: string;
  title_en: string;
  title_es: string;
  slug: string;
  date: string | Timestamp | Date;
  location: string;
  category: string;
  status: string;
  registration_required: boolean;
  image_url?: string;
  created_at: unknown;
  registrationCount?: number;
}

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  attendees: number;
  comments?: string;
  status: string;
  created_at: Timestamp | Date;
}

// Helper function to format dates in Mountain Time (Peyton, CO)
const formatDate = (date: string | Timestamp | Date | undefined, lang: string): string => {
  return formatMountainDate(date, lang);
};

export default function AdminEventsPage(): JSX.Element {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Modal state for registrations
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      setLoadingRegistrations(true);
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
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
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const token = await user.getIdToken();
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

  const exportToCSV = () => {
    if (!selectedEvent || registrations.length === 0) return;

    const headers = ["Name", "Email", "Phone", "Attendees", "Comments", "Status", "Date"];
    const rows = registrations.map(reg => [
      reg.full_name,
      reg.email,
      reg.phone || "",
      reg.attendees,
      reg.comments || "",
      reg.status,
      formatDate(reg.created_at as Timestamp | Date | undefined, language)
    ]);

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
    const matchesSearch = event.title_en.toLowerCase().includes(search.toLowerCase()) ||
      event.title_es?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || event.status === filter;
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{language === "es" ? "Eventos" : "Events"}</h1>
          <p className="text-gray-600 mt-1">{language === "es" ? "Gestiona los eventos" : "Manage events"}</p>
        </div>
        <Link
          href="/admin/events/new"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          {language === "es" ? "Nuevo Evento" : "New Event"}
        </Link>
      </div>

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
          <div className="col-span-full bg-white rounded-xl p-12 text-center text-gray-500">
            {language === "es" ? "No se encontraron eventos" : "No events found"}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Event Image */}
              {event.image_url ? (
                <div className="h-32 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image_url}
                    alt={event.title_en}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-primary to-primary-container relative">
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${categoryColors[event.category]}`}>
                  {event.category}
                </span>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title_en}</h3>
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
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="flex-1 text-center py-2 text-sm text-primary hover:bg-gray-50 rounded-lg border border-primary"
                  >
                    {language === "es" ? "Detalles" : "Details"}
                  </Link>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="flex-1 text-center py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-300"
                  >
                    {language === "es" ? "Editar" : "Edit"}
                  </Link>
                  {event.registration_required && (
                    <button
                      onClick={() => handleViewRegistrations(event)}
                      className="flex-1 text-center py-2 text-sm text-secondary hover:bg-secondary/5 rounded-lg border border-secondary"
                      title={language === "es" ? "Ver inscritos" : "View registrations"}
                    >
                      <Users className="w-4 h-4 inline mr-1" />
                      {event.registrationCount || 0}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          {language === "es" ? "Nombre" : "Name"}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          {language === "es" ? "Teléfono" : "Phone"}
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                          {language === "es" ? "Asistentes" : "Attendees"}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          {language === "es" ? "Comentarios" : "Comments"}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          {language === "es" ? "Fecha" : "Date"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{reg.full_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{reg.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{reg.phone || "-"}</td>
                          <td className="py-3 px-4 text-sm text-center text-gray-600">{reg.attendees}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                            {reg.comments || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(reg.created_at as Timestamp | Date | undefined, language)}
                          </td>
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
