"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, Download, Calendar, Mail, User, BarChart3 } from "lucide-react";
import { collection, getDocs, doc, deleteDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  responses: Record<string, string | string[]>;
  createdAt: Timestamp | Date;
}

interface EventOption {
  id: string;
  title: string;
}

export default function EventRegistrationsPage(): JSX.Element {
  const { language } = useLanguage();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<EventRegistration | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [regsSnap, eventsSnap] = await Promise.all([
        getDocs(query(collection(db, "event_registrations"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "events")),
      ]);
      setRegistrations(regsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as EventRegistration[]);
      setEvents(eventsSnap.docs.map(d => ({ id: d.id, title: d.data().title_es || d.data().title_en || d.id })));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedEvent === "all" ? registrations : registrations.filter(r => r.eventId === selectedEvent);

  const handleDelete = async (id: string) => {
    const msg = language === "es" ? "¿Eliminar este registro?" : "Delete this registration?";
    if (!confirm(msg)) return;
    try {
      await deleteDoc(doc(db, "event_registrations", id));
      setRegistrations(registrations.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const exportCSV = () => {
    const headers = [language === "es" ? "Nombre" : "Name", "Email", language === "es" ? "Evento" : "Event", language === "es" ? "Fecha" : "Date"];
    const rows = filtered.map(r => [r.name, r.email, events.find(e => e.id === r.eventId)?.title || r.eventId, formatTs(r.createdAt)]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event_registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTs = (ts: Timestamp | Date): string => {
    const d = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(language === "es" ? "es-ES" : "en-US");
  };

  const getEventTitle = (eventId: string): string => events.find(e => e.id === eventId)?.title || eventId;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div><div className="h-8 w-48 bg-gray-200 rounded mb-2" /><div className="h-4 w-64 bg-gray-200 rounded" /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          {[1,2,3].map(i => <div key={i} className="flex gap-4"><div className="h-4 w-32 bg-gray-200 rounded" /><div className="h-4 w-40 bg-gray-200 rounded" /><div className="h-4 w-24 bg-gray-200 rounded" /></div>)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "es" ? "Registros a Eventos" : "Event Registrations"}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === "es" ? "Gestiona los registros de asistencia" : "Manage attendance registrations"}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
            <option value="all">{language === "es" ? "Todos los eventos" : "All events"}</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button onClick={exportCSV} disabled={filtered.length === 0} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg"><BarChart3 className="w-6 h-6 text-primary" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{filtered.length}</p><p className="text-sm text-gray-600">{language === "es" ? "Total registros" : "Total registrations"}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><Calendar className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{events.length}</p><p className="text-sm text-gray-600">{language === "es" ? "Eventos" : "Events"}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><Mail className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{filtered.filter(r => r.email).length}</p><p className="text-sm text-gray-600">{language === "es" ? "Con correo" : "With email"}</p></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{language === "es" ? "Sin registros" : "No registrations"}</h3>
            <p className="text-gray-500">{language === "es" ? "Los registros aparecerán aquí." : "Registrations will appear here."}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === "es" ? "Nombre" : "Name"}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === "es" ? "Evento" : "Event"}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === "es" ? "Fecha" : "Date"}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{language === "es" ? "Acciones" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div><span className="font-medium text-gray-900">{reg.name}</span></div></td>
                  <td className="px-6 py-4 text-gray-600">{reg.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getEventTitle(reg.eventId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTs(reg.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelectedReg(reg)} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(reg.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{language === "es" ? "Detalle de Registro" : "Registration Detail"}</h2>
              <button onClick={() => setSelectedReg(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">{language === "es" ? "Nombre" : "Name"}</p>
                <p className="font-medium">{selectedReg.name}</p>
                <p className="text-sm text-gray-500 mt-2 mb-1">Email</p>
                <p className="font-medium">{selectedReg.email}</p>
                {selectedReg.phone && <><p className="text-sm text-gray-500 mt-2 mb-1">{language === "es" ? "Teléfono" : "Phone"}</p><p className="font-medium">{selectedReg.phone}</p></>}
              </div>
              {Object.entries(selectedReg.responses || {}).map(([key, value]) => (
                <div key={key} className="border-b border-gray-100 pb-3 mb-3 last:border-0">
                  <p className="text-sm font-medium text-gray-700">{key}</p>
                  <p className="text-gray-900">{Array.isArray(value) ? value.join(", ") : String(value)}</p>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setSelectedReg(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{language === "es" ? "Cerrar" : "Close"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
