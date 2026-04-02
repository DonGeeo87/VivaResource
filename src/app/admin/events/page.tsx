"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Calendar, MapPin } from "lucide-react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

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
  created_at: unknown;
}

// Helper function to format dates
const formatDate = (date: string | Timestamp | Date | undefined, lang: string): string => {
  if (!date) return "-";
  
  let dateObj: Date;
  
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    return "-";
  }
  
  return dateObj.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

export default function AdminEventsPage(): JSX.Element {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, "events"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === "es" ? "¿Estás seguro de eliminar este evento?" : "Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", id));
        setEvents(events.filter(e => e.id !== id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
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
    fundraiser: "bg-orange-100 text-orange-700"
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
              <div className="h-32 bg-gradient-to-br from-primary to-primary-container relative">
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                </div>
              </div>
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
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="flex-1 text-center py-2 text-sm text-primary hover:bg-gray-50 rounded-lg border border-primary"
                  >
                    {language === "es" ? "Editar" : "Edit"}
                  </Link>
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
    </div>
  );
}
