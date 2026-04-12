"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Inbox, Send, Filter, ChevronDown, ChevronUp, Mail, User, Calendar, Bell } from "lucide-react";
import { collection, query, orderBy, getDocs, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import type { VolunteerMessage } from "@/types/volunteer";

interface VolunteerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminMessagesPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const isES = language === "es";

  const [messages, setMessages] = useState<VolunteerMessage[]>([]);
  const [volunteers, setVolunteers] = useState<Record<string, VolunteerInfo>>({});
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "sent" | "received">("all");
  const [filterVolunteer, setFilterVolunteer] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    // Set up real-time listener for messages
    const messagesQuery = query(
      collection(db, "volunteer_messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerMessage[];
      setMessages(msgs);

      // Update unread count
      const unread = msgs.filter(m => !m.read && !m.isReply).length;
      setUnreadCount(unread);

      // Check for new messages
      if (messages.length > 0 && msgs.length > messages.length) {
        setHasNewMessage(true);
        setTimeout(() => setHasNewMessage(false), 3000);
      }

      setLoading(false);
    }, (error) => {
      console.error("Error listening to messages:", error);
      setLoading(false);
    });

    // Fetch volunteers for lookup
    fetchVolunteers();

    return () => unsubscribe();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const volunteersQuery = query(collection(db, "volunteer_registrations"));
      const volunteersSnapshot = await getDocs(volunteersQuery);
      const volsMap: Record<string, VolunteerInfo> = {};
      volunteersSnapshot.forEach(doc => {
        const data = doc.data();
        volsMap[doc.id] = {
          id: doc.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        };
      });
      setVolunteers(volsMap);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    }
  };

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // Filter by type
      if (filterType === "sent" && msg.isReply) return false;
      if (filterType === "received" && !msg.isReply) return false;

      // Filter by volunteer
      if (filterVolunteer !== "all" && msg.volunteerId !== filterVolunteer) return false;

      // Search in content
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchIn = [
          msg.subject,
          msg.subjectEs,
          msg.body,
          msg.bodyEs,
          msg.fromName,
          volunteers[msg.volunteerId]?.firstName,
          volunteers[msg.volunteerId]?.lastName,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!searchIn.includes(query)) return false;
      }

      return true;
    });
  }, [messages, filterType, filterVolunteer, searchQuery, volunteers]);

  // Unique volunteers who have messages
  const volunteersWithMessages = useMemo(() => {
    const volIds = [...new Set(messages.map(m => m.volunteerId))];
    return volIds
      .map(id => volunteers[id])
      .filter(Boolean)
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [messages, volunteers]);

  // Stats
  const stats = useMemo(() => {
    const total = messages.length;
    const sent = messages.filter(m => !m.isReply).length;
    const received = messages.filter(m => m.isReply).length;
    const unread = messages.filter(m => !m.read && !m.isReply).length;
    return { total, sent, received, unread };
  }, [messages]);

  const formatDate = (value: unknown) => {
    try {
      let dateObj: Date;
      if (value instanceof Timestamp) {
        dateObj = value.toDate();
      } else if (value instanceof Date) {
        dateObj = value;
      } else {
        dateObj = new Date(value as string);
      }
      return dateObj.toLocaleDateString(isES ? "es-ES" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "-";
    }
  };

  const getVolunteerName = (volunteerId: string) => {
    const vol = volunteers[volunteerId];
    return vol ? `${vol.firstName} ${vol.lastName}` : "Unknown";
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      low: { bg: "bg-gray-100", text: "text-gray-700", label: isES ? "Baja" : "Low" },
      normal: { bg: "bg-blue-100", text: "text-blue-700", label: isES ? "Normal" : "Normal" },
      high: { bg: "bg-yellow-100", text: "text-yellow-700", label: isES ? "Alta" : "High" },
      urgent: { bg: "bg-red-100", text: "text-red-700", label: isES ? "Urgente" : "Urgent" },
    };
    const c = config[priority] || config.normal;
    return (
      <span className={`px-2 py-0.5 ${c.bg} ${c.text} text-xs rounded font-medium`}>
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* New Message Notification */}
      {hasNewMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <Bell className="w-5 h-5" />
          {isES ? "¡Nuevo mensaje recibido!" : "New message received!"}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/volunteers")}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {isES ? "Volver a Voluntarios" : "Back to Volunteers"}
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Inbox className="w-7 h-7" />
            {isES ? "Buzón de Mensajes" : "Message Inbox"}
            {unreadCount > 0 && (
              <span className="ml-2 px-3 py-1 bg-red-500 text-white text-sm rounded-full font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {isES ? "Ver todos los mensajes con voluntarios" : "View all messages with volunteers"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">{isES ? "Total" : "Total"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
          <p className="text-sm text-gray-600">{isES ? "Enviados" : "Sent"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{stats.received}</p>
          <p className="text-sm text-gray-600">{isES ? "Recibidos" : "Received"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">{stats.unread}</p>
          <p className="text-sm text-gray-600">{isES ? "Sin leer" : "Unread"}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isES ? "Buscar mensajes por contenido, nombre..." : "Search messages by content, name..."}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Filter className="w-4 h-4" />
          {isES ? "Filtros avanzados" : "Advanced filters"}
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isES ? "Tipo de mensaje" : "Message type"}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "all" | "sent" | "received")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">{isES ? "Todos" : "All"}</option>
                <option value="sent">{isES ? "Enviados por admin" : "Sent by admin"}</option>
                <option value="received">{isES ? "Respuestas de voluntario" : "Replies from volunteer"}</option>
              </select>
            </div>

            {/* Volunteer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isES ? "Voluntario" : "Volunteer"}
              </label>
              <select
                value={filterVolunteer}
                onChange={(e) => setFilterVolunteer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">{isES ? "Todos los voluntarios" : "All volunteers"}</option>
                {volunteersWithMessages.map(vol => (
                  <option key={vol.id} value={vol.id}>
                    {vol.firstName} {vol.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-600">
              {isES ? "No hay mensajes" : "No messages"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || filterType !== "all" || filterVolunteer !== "all"
                ? isES ? "Intenta ajustar los filtros" : "Try adjusting the filters"
                : isES ? "Los mensajes aparecerán aquí cuando envíes mensajes a voluntarios" : "Messages will appear here when you send messages to volunteers"
              }
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl shadow-sm border transition-colors ${
                msg.isReply
                  ? "border-l-4 border-l-green-500"
                  : msg.read
                  ? "border-gray-200"
                  : "border-l-4 border-l-blue-500"
              }`}
            >
              <button
                onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {msg.isReply ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          {isES ? "Respuesta" : "Reply"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {isES ? "Enviado" : "Sent"}
                        </span>
                      )}
                      {getPriorityBadge(msg.priority)}
                      {!msg.read && !msg.isReply && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                          {isES ? "Sin leer" : "Unread"}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {isES && msg.subjectEs ? msg.subjectEs : msg.subject}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {msg.isReply
                          ? getVolunteerName(msg.volunteerId)
                          : msg.fromName
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedMessage === msg.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedMessage === msg.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{isES ? "De:" : "From:"}</span>
                      <strong>{msg.fromName}</strong>
                      <span className="mx-1">→</span>
                      <span>{isES ? "Para:" : "To:"}</span>
                      <strong>{getVolunteerName(msg.volunteerId)}</strong>
                    </div>
                    <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {isES && msg.bodyEs ? msg.bodyEs : msg.body}
                    </div>
                  </div>
                  {msg.isReply && msg.replyTo && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {isES ? "↩ Respuesta al mensaje original" : "↩ Reply to original message"}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      {filteredMessages.length > 0 && (
        <p className="text-sm text-gray-500 text-center mt-4">
          {isES ? "Mostrando" : "Showing"} <strong>{filteredMessages.length}</strong> {isES ? "de" : "of"} <strong>{messages.length}</strong> {isES ? "mensajes" : "messages"}
          {searchQuery && ` "${searchQuery}"`}
        </p>
      )}
    </div>
  );
}
