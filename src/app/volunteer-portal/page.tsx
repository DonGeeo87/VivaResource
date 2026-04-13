"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVolunteerAuth } from "@/contexts/VolunteerAuthContext";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Calendar,
  Mail,
  Clock,
  CheckCircle,
  MessageSquare,
  User,
  LogOut,
  Bell,
  ArrowRight,
  MapPin,
  Star,
  TrendingUp,
  Send,
  Reply,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import type { VolunteerTask, VolunteerMessage } from "@/types/volunteer";

export default function VolunteerPortalPage() {
  const { user, loading: authLoading, logout } = useVolunteerAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const isES = language === "es";

  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [messages, setMessages] = useState<VolunteerMessage[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    unreadMessages: 0,
    hoursVolunteered: 0,
    eventsAttended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "messages">("dashboard");

  // Reply message state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyBodyEs, setReplyBodyEs] = useState("");
  const [replySending, setReplySending] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/volunteer-portal/login");
    }
  }, [user, authLoading, router]);

  // Fetch data with real-time listeners
  useEffect(() => {
    if (!user) return;

    // Fetch tasks
    const tasksQuery = query(
      collection(db, "volunteer_tasks"),
      where("volunteerId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerTask[];
      setTasks(tasksData);

      // Update stats
      const completed = tasksData.filter(t => t.status === "completed").length;
      const pending = tasksData.filter(t => t.status === "pending").length;
      setStats(prev => ({
        ...prev,
        totalTasks: tasksData.length,
        completedTasks: completed,
        pendingTasks: pending,
      }));
    }, (error) => {
      // Silently handle missing index error - will show empty state
      if (error.code === "failed-precondition") {
        console.warn("Firestore index needed for volunteer_tasks. Creating index...");
      } else {
        console.error("Error fetching tasks:", error);
      }
      setTasks([]);
    });

    // Fetch messages
    const messagesQuery = query(
      collection(db, "volunteer_messages"),
      where("volunteerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerMessage[];
      setMessages(messagesData);

      const unread = messagesData.filter(m => !m.read).length;
      setStats(prev => ({
        ...prev,
        unreadMessages: unread,
      }));
    }, (error) => {
      // Silently handle missing index error - will show empty state
      if (error.code === "failed-precondition") {
        console.warn("Firestore index needed for volunteer_messages. Creating index...");
      } else {
        console.error("Error fetching messages:", error);
      }
      setMessages([]);
    });

    setLoading(false);

    return () => {
      unsubscribeTasks();
      unsubscribeMessages();
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/volunteer-portal/login");
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "volunteer_messages", messageId), {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const sendReply = async () => {
    if (!replyBody.trim() || !user || !replyingTo) return;

    setReplySending(true);
    try {
      await addDoc(collection(db, "volunteer_messages"), {
        volunteerId: user.uid,
        from: user.uid,
        fromName: `${user.firstName} ${user.lastName}`,
        subject: "Re: ",
        subjectEs: "Re: ",
        body: replyBody,
        bodyEs: replyBodyEs || replyBody,
        read: false,
        createdAt: new Date(),
        priority: "normal",
        replyTo: replyingTo, // Reference to the original message
        isReply: true,
      });

      setReplyBody("");
      setReplyBodyEs("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setReplySending(false);
    }
  };

  const markTaskAsComplete = async (taskId: string) => {
    try {
      await updateDoc(doc(db, "volunteer_tasks", taskId), {
        status: "completed"
      });
    } catch (error) {
      console.error("Error marking task as complete:", error);
    }
  };

  const formatDate = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const locale = isES ? "es-ES" : "en-US";
    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "error" | "default"; label: string }> = {
      approved: { variant: "success", label: isES ? "Aprobado" : "Approved" },
      pending: { variant: "warning", label: isES ? "Pendiente" : "Pending" },
      active: { variant: "success", label: isES ? "Activo" : "Active" },
      inactive: { variant: "default", label: isES ? "Inactivo" : "Inactive" },
      rejected: { variant: "error", label: isES ? "Rechazado" : "Rejected" },
      completed: { variant: "success", label: isES ? "Completada" : "Completed" },
      in_progress: { variant: "warning", label: isES ? "En progreso" : "In Progress" },
    };
    const c = config[status] || { variant: "default", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { variant: "success" | "warning" | "error" | "default"; label: string }> = {
      low: { variant: "default", label: isES ? "Baja" : "Low" },
      normal: { variant: "default", label: isES ? "Normal" : "Normal" },
      high: { variant: "warning", label: isES ? "Alta" : "High" },
      urgent: { variant: "error", label: isES ? "Urgente" : "Urgent" },
    };
    const c = config[priority] || config.normal;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (authLoading || loading || !user) {
    return <LoadingSpinner size="lg" text={isES ? "Cargando..." : "Loading..."} fullScreen />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold flex items-center gap-3">
              <Star className="w-8 h-8" />
              {isES ? "Portal de Voluntarios" : "Volunteer Portal"}
            </h1>
            <p className="text-primary-100 mt-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              {user.firstName} {user.lastName}
              {getStatusBadge(user.status)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              {stats.unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {stats.unreadMessages}
                </span>
              )}
            </button>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              {isES ? "Salir" : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-surface-lowest border-b border-outline-variant/10 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "dashboard" as const, icon: TrendingUp, label: isES ? "Dashboard" : "Dashboard" },
              { id: "tasks" as const, icon: Calendar, label: isES ? "Tareas" : "Tasks" },
              { id: "messages" as const, icon: MessageSquare, label: isES ? "Mensajes" : "Messages" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.id === "messages" && stats.unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Calendar, label: isES ? "Tareas Totales" : "Total Tasks", value: stats.totalTasks, color: "bg-blue-500" },
                { icon: CheckCircle, label: isES ? "Completadas" : "Completed", value: stats.completedTasks, color: "bg-green-500" },
                { icon: Clock, label: isES ? "Pendientes" : "Pending", value: stats.pendingTasks, color: "bg-yellow-500" },
                { icon: MessageSquare, label: isES ? "Mensajes Nuevos" : "New Messages", value: stats.unreadMessages, color: "bg-purple-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
                  <p className="text-sm text-on-surface-variant">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Tasks */}
            <div className="bg-surface-lowest rounded-xl shadow-ambient border border-outline-variant/10 overflow-hidden">
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="text-xl font-headline font-bold text-on-surface">
                  {isES ? "Tareas Recientes" : "Recent Tasks"}
                </h2>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {isES ? "Ver todas" : "View all"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">{isES ? "No hay tareas aún" : "No tasks yet"}</p>
                    <p className="text-sm mt-1">{isES ? "El administrador te asignará tareas pronto" : "The admin will assign tasks to you soon"}</p>
                  </div>
                ) : (
                  tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-4 md:p-6 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-on-surface truncate">
                          {isES && task.titleEs ? task.titleEs : task.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(task.date)}
                          </span>
                          {task.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {task.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        {task.status === "pending" && (
                          <button
                            onClick={() => markTaskAsComplete(task.id)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title={isES ? "Marcar como completada" : "Mark as complete"}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-surface-lowest rounded-xl shadow-ambient border border-outline-variant/10 overflow-hidden">
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {isES ? "Mensajes Recientes" : "Recent Messages"}
                </h2>
                <button
                  onClick={() => setActiveTab("messages")}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {isES ? "Ver todos" : "View all"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">{isES ? "No hay mensajes" : "No messages"}</p>
                    <p className="text-sm mt-1">{isES ? "Los administradores te enviarán mensajes aquí" : "Admins will send messages to you here"}</p>
                  </div>
                ) : (
                  messages.slice(0, 3).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 md:p-6 cursor-pointer transition-colors hover:bg-surface-low ${
                        !msg.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => markMessageAsRead(msg.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {!msg.read && <Bell className="w-4 h-4 text-blue-600" />}
                            <h3 className={`truncate ${!msg.read ? "font-bold" : "font-medium"}`}>
                              {isES && msg.subjectEs ? msg.subjectEs : msg.subject}
                            </h3>
                            {getPriorityBadge(msg.priority)}
                          </div>
                          <p className="text-sm text-on-surface-variant truncate">
                            {isES && msg.bodyEs ? msg.bodyEs : msg.body}
                          </p>
                          <p className="text-xs text-on-surface-variant/60 mt-1">
                            {msg.fromName} · {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-headline font-bold text-on-surface">
              {isES ? "Mis Tareas" : "My Tasks"}
            </h2>
            {tasks.length === 0 ? (
              <div className="bg-surface-lowest rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-on-surface-variant">
                  {isES ? "No tienes tareas asignadas" : "You have no assigned tasks"}
                </p>
                <p className="text-sm text-on-surface-variant mt-2">
                  {isES ? "El administrador te asignará tareas pronto" : "The admin will assign tasks to you soon"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/10">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-on-surface mb-1">
                          {isES && task.titleEs ? task.titleEs : task.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {isES && task.descriptionEs ? task.descriptionEs : task.description}
                        </p>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(task.date)}
                      </span>
                      {task.startTime && task.endTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.startTime} - {task.endTime}
                        </span>
                      )}
                      {task.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {task.location}
                        </span>
                      )}
                    </div>
                    {task.notes && (
                      <div className="mt-4 p-3 bg-surface-low rounded-lg text-sm text-on-surface-variant">
                        <strong>{isES ? "Notas:" : "Notes:"}</strong> {task.notes}
                      </div>
                    )}
                    {task.status === "pending" && (
                      <button
                        onClick={() => markTaskAsComplete(task.id)}
                        className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {isES ? "Marcar como completada" : "Mark as Complete"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-headline font-bold text-on-surface flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              {isES ? "Mensajes" : "Messages"}
            </h2>
            {messages.length === 0 ? (
              <div className="bg-surface-lowest rounded-xl p-12 text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-on-surface-variant">
                  {isES ? "No tienes mensajes" : "You have no messages"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/10 transition-colors ${
                      !msg.read ? "border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-on-surface">
                            {isES && msg.subjectEs ? msg.subjectEs : msg.subject}
                          </h3>
                          {getPriorityBadge(msg.priority)}
                          {!msg.read && <Badge variant="warning">{isES ? "Nuevo" : "New"}</Badge>}
                          {msg.isReply && <Badge variant="default">{isES ? "Respuesta" : "Reply"}</Badge>}
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          {isES ? "De:" : "From:"} <strong>{msg.fromName}</strong> · {formatDate(msg.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <button
                            onClick={() => markMessageAsRead(msg.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            {isES ? "Marcar como leído" : "Mark as read"}
                          </button>
                        )}
                        {!msg.isReply && (
                          <button
                            onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            <Reply className="w-4 h-4" />
                            {isES ? "Responder" : "Reply"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none text-on-surface-variant">
                      <p className="whitespace-pre-line">
                        {isES && msg.bodyEs ? msg.bodyEs : msg.body}
                      </p>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === msg.id && (
                      <div className="mt-4 pt-4 border-t border-outline-variant/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Reply className="w-4 h-4 text-primary" />
                          <h4 className="font-medium text-on-surface">
                            {isES ? "Responder mensaje" : "Reply to message"}
                          </h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">
                              {isES ? "Tu respuesta (EN)" : "Your reply (EN)"} *
                            </label>
                            <textarea
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              rows={3}
                              placeholder={isES ? "Escribe tu respuesta aquí..." : "Type your reply here..."}
                              className="w-full px-4 py-3 border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface-lowest"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">
                              {isES ? "Tu respuesta (ES)" : "Your reply (ES)"}
                            </label>
                            <textarea
                              value={replyBodyEs}
                              onChange={(e) => setReplyBodyEs(e.target.value)}
                              rows={3}
                              placeholder={isES ? "Escribe tu respuesta en español..." : "Type your reply in Spanish..."}
                              className="w-full px-4 py-3 border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface-lowest"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyBody("");
                                setReplyBodyEs("");
                              }}
                              className="flex-1 py-2 border border-outline-variant/30 text-on-surface-variant rounded-lg hover:bg-surface-low transition-colors"
                            >
                              {isES ? "Cancelar" : "Cancel"}
                            </button>
                            <button
                              onClick={sendReply}
                              disabled={replySending || !replyBody.trim()}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" />
                              {replySending ? (isES ? "Enviando..." : "Sending...") : (isES ? "Enviar respuesta" : "Send reply")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
