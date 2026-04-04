"use client";

import { useState, useEffect } from "react";
import { Download, Mail, Trash2, Search, Send, History, Users, Eye, Clock } from "lucide-react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscribed_at: Timestamp | Date;
  status: string;
  source: string;
}

interface NewsletterHistoryEntry {
  id: string;
  subject: string;
  content: string;
  sent_at: Timestamp | Date;
  total_sent: number;
  total_failed: number;
  total_subscribers: number;
  status: string;
}

type Tab = "subscribers" | "send" | "history";

export default function AdminNewsletterPage(): JSX.Element {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("subscribers");

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Send newsletter state
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // History state
  const [history, setHistory] = useState<NewsletterHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchSubscribers = async () => {
    try {
      const q = query(
        collection(db, "newsletter_subscribers"),
        orderBy("subscribed_at", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscriber[];
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      // Fallback: try fetching without ordering (works even without indexes)
      try {
        const snapshot = await getDocs(collection(db, "newsletter_subscribers"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subscriber[];
        // Sort client-side
        data.sort((a, b) => {
          const dateA = a.subscribed_at instanceof Timestamp ? a.subscribed_at.toDate() : new Date(a.subscribed_at);
          const dateB = b.subscribed_at instanceof Timestamp ? b.subscribed_at.toDate() : new Date(b.subscribed_at);
          return dateB.getTime() - dateA.getTime();
        });
        setSubscribers(data);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
        setSubscribers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch("/api/newsletter/history");
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === "es" ? "¿Estás seguro de eliminar este subscriber?" : "Are you sure you want to delete this subscriber?")) {
      try {
        await deleteDoc(doc(db, "newsletter_subscribers", id));
        setSubscribers(subscribers.filter(s => s.id !== id));
      } catch (error) {
        console.error("Error deleting subscriber:", error);
      }
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (confirm(language === "es" ? "¿Estás seguro de eliminar este registro del historial?" : "Are you sure you want to delete this history entry?")) {
      try {
        const response = await fetch(`/api/newsletter/history?id=${id}`, { method: "DELETE" });
        const data = await response.json();
        if (data.success) {
          setHistory(history.filter(h => h.id !== id));
        }
      } catch (error) {
        console.error("Error deleting history entry:", error);
      }
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !content.trim()) {
      setSendResult({ success: false, message: language === "es" ? "El asunto y contenido son requeridos" : "Subject and content are required" });
      return;
    }

    if (subscribers.filter(s => s.status === "active").length === 0) {
      setSendResult({ success: false, message: language === "es" ? "No hay suscriptores activos para enviar" : "No active subscribers to send to" });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({ success: true, message: data.message });
        setSubject("");
        setContent("");
        fetchHistory();
      } else {
        setSendResult({ success: false, message: data.error || (language === "es" ? "Error al enviar" : "Error sending") });
      }
    } catch {
      setSendResult({ success: false, message: language === "es" ? "Error de conexión. Intenta nuevamente." : "Connection error. Please try again." });
    } finally {
      setSending(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Email", "Name", "Status", "Source", "Date"];
    const rows = filteredSubscribers.map(s => [
      s.email,
      s.name || "",
      s.status,
      s.source,
      s.subscribed_at instanceof Timestamp
        ? s.subscribed_at.toDate().toLocaleDateString()
        : new Date(s.subscribed_at).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name && s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (date: Timestamp | Date) => {
    const locale = language === "es" ? "es-ES" : "en-US";
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatDateTime = (date: Timestamp | Date) => {
    const locale = language === "es" ? "es-ES" : "en-US";
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    return new Date(date).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const activeSubscribers = subscribers.filter(s => s.status === "active").length;
  const recentSubscribers = subscribers.filter(s =>
    s.subscribed_at instanceof Timestamp
      ? s.subscribed_at.toDate() > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : new Date(s.subscribed_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600 mt-1">{language === "es" ? "Gestiona los suscriptores y envía newsletters" : "Manage subscribers and send newsletters"}</p>
        </div>
        {activeTab === "subscribers" && (
          <button
            onClick={exportCSV}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            {language === "es" ? "Exportar CSV" : "Export CSV"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "subscribers"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          {language === "es" ? "Suscriptores" : "Subscribers"}
        </button>
        <button
          onClick={() => setActiveTab("send")}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "send"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Send className="w-4 h-4" />
          {language === "es" ? "Enviar Newsletter" : "Send Newsletter"}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className="w-4 h-4" />
          {language === "es" ? "Historial" : "History"}
        </button>
      </div>

      {/* Stats - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
              <p className="text-sm text-gray-600">{language === "es" ? "Total Suscriptores" : "Total Subscribers"}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">{activeSubscribers}</p>
            <p className="text-sm text-gray-600">{language === "es" ? "Activos" : "Active"}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">{recentSubscribers}</p>
            <p className="text-sm text-gray-600">{language === "es" ? "Últimos 30 días" : "Last 30 days"}</p>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "subscribers" && (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === "es" ? "Buscar suscriptores..." : "Search subscribers..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === "es" ? "Nombre" : "Name"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === "es" ? "Estado" : "Status"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === "es" ? "Fuente" : "Source"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === "es" ? "Fecha" : "Date"}
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
                        <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-200 rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {language === "es" ? "No se encontraron suscriptores" : "No subscribers found"}
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{subscriber.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{subscriber.name || "-"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            subscriber.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">{subscriber.source}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">{formatDate(subscriber.subscribed_at)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(subscriber.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "send" && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              {language === "es" ? `Enviar Newsletter a ${activeSubscribers} suscriptores` : `Send Newsletter to ${activeSubscribers} subscribers`}
            </h2>

            {sendResult && (
              <div className={`mb-6 p-4 rounded-lg ${
                sendResult.success
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {sendResult.message}
              </div>
            )}

            <form onSubmit={handleSendNewsletter} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "es" ? "Asunto / Subject" : "Subject"} *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Monthly Update - November 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "es" ? "Contenido / Content" : "Content"} *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  {language === "es" ? "Puedes usar HTML para dar formato al contenido." : "You can use HTML to format the content."}
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={language === "es"
                    ? "Escribe el contenido del newsletter aquí...\n\nPuedes usar HTML: <h2>Título</h2>, <p>Párrafo</p>, <a href='...'>Enlace</a>"
                    : "Write the newsletter content here...\n\nYou can use HTML: <h2>Title</h2>, <p>Paragraph</p>, <a href='...'>Link</a>"
                  }
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {sending
                    ? (language === "es" ? "Enviando..." : "Sending...")
                    : (language === "es" ? "Enviar Newsletter" : "Send Newsletter")}
                </button>
                <button
                  type="button"
                  onClick={() => { setSubject(""); setContent(""); setSendResult(null); }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {language === "es" ? "Limpiar" : "Clear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              {language === "es" ? "Historial de Newsletters Enviados" : "Sent Newsletter History"}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {loadingHistory ? (
              <div className="px-6 py-12 text-center text-gray-500">
                {language === "es" ? "Cargando historial..." : "Loading history..."}
              </div>
            ) : history.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                {language === "es" ? "No hay newsletters enviados aún" : "No newsletters sent yet"}
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">{entry.subject}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(entry.sent_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {entry.total_sent} {language === "es" ? "enviados" : "sent"}
                        </span>
                        {entry.total_failed > 0 && (
                          <span className="text-red-600">
                            {entry.total_failed} {language === "es" ? "fallidos" : "failed"}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {entry.status === "completed"
                            ? (language === "es" ? "Completado" : "Completed")
                            : (language === "es" ? "Con errores" : "With errors")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHistory(entry.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
