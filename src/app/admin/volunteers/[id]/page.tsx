"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Mail, Phone, Calendar, Check, X, Plus, ClipboardList, Inbox, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useLanguage } from "@/contexts/LanguageContext";
import type { VolunteerMessage } from "@/types/volunteer";

interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  skills: string[];
  interests: string[];
  availability: string;
  experience: string;
  status: "pending" | "approved" | "rejected";
  created_at: Timestamp | Date | { toDate: () => Date } | null;
}

export default function AdminVolunteerDetailPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const volunteerId = params.id as string;
  const { language } = useLanguage();
  const isES = language === "es";

  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Task assignment state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTitleEs, setTaskTitleEs] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDescriptionEs, setTaskDescriptionEs] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("");
  const [taskEndTime, setTaskEndTime] = useState("");
  const [taskLocation, setTaskLocation] = useState("");
  const [taskCreating, setTaskCreating] = useState(false);

  // Admin UID state
  const [adminUid, setAdminUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setAdminUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  // Messages state
  const [messages, setMessages] = useState<VolunteerMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (volunteerId) {
      fetchVolunteer(volunteerId);
    }
  }, [volunteerId]);

  useEffect(() => {
    if (showMessages && volunteer && messages.length === 0) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMessages, volunteer]);

  const fetchVolunteer = async (id: string) => {
    try {
      const docRef = doc(db, "volunteer_registrations", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setVolunteer({
          id: docSnap.id,
          ...docSnap.data()
        } as Volunteer);
      }
    } catch (error) {
      console.error("Error fetching volunteer:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!volunteerId) return;
    setLoadingMessages(true);
    try {
      const q = query(
        collection(db, "volunteer_messages"),
        where("volunteerId", "==", volunteerId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerMessage[];
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const updateStatus = async (newStatus: "pending" | "approved" | "rejected") => {
    setStatusUpdating(true);
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Generate activation token if approved
      if (newStatus === "approved") {
        const token = crypto.randomUUID();
        updateData.activation_token = token;
        updateData.approved_at = new Date().toISOString();
      }

      await updateDoc(doc(db, "volunteer_registrations", volunteerId), updateData);
      setVolunteer(volunteer ? { ...volunteer, status: newStatus } : null);

      // If approved, send activation email with link
      if (newStatus === "approved" && volunteer) {
        const token = updateData.activation_token as string;
        const activationUrl = `${window.location.origin}/volunteer-portal/activate?token=${token}&reg=${volunteerId}&email=${encodeURIComponent(volunteer.email)}`;

        await fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "volunteer-activation",
            data: {
              volunteerEmail: volunteer.email,
              volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
              activationUrl,
            }
          })
        }).catch((emailErr) => console.error("Failed to send activation email:", emailErr));
      } else {
        // Send status change notification for non-approved statuses
        await fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "volunteer-status-change",
            data: {
              volunteerEmail: volunteer?.email,
              volunteerName: volunteer ? `${volunteer.firstName} ${volunteer.lastName}` : "",
              status: newStatus as "approved" | "rejected",
            }
          })
        }).catch((emailErr) => console.error("Failed to send status notification:", emailErr));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !volunteer) return;

    setSending(true);
    try {
      // Save message to Firestore with correct structure
      await addDoc(collection(db, "volunteer_messages"), {
        volunteerId: volunteer.id, // Changed from volunteer_id
        from: adminUid || "unknown",
        fromName: "Viva Resource Foundation",
        subject: isES ? "Mensaje de Viva Resource Foundation" : "Message from Viva Resource Foundation",
        subjectEs: isES ? "Mensaje de Viva Resource Foundation" : null,
        body: message,
        bodyEs: null,
        read: false,
        createdAt: Timestamp.now(),
        priority: "normal"
      });

      // Send email notification via notify API
      await fetch("/api/email/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "volunteer-message",
          data: {
            volunteerEmail: volunteer.email,
            volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
            subject: isES ? "Mensaje de Viva Resource Foundation" : "Message from Viva Resource Foundation",
            message: message,
          }
        })
      }).catch((emailErr) => console.error("Failed to send message notification:", emailErr));

      setMessage("");
      alert(isES ? "Mensaje enviado exitosamente" : "Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      alert(isES ? "Error al enviar mensaje" : "Error sending message");
    } finally {
      setSending(false);
    }
  };

  const createTask = async () => {
    if (!taskTitle.trim() || !volunteer) return;

    setTaskCreating(true);
    try {
      await addDoc(collection(db, "volunteer_tasks"), {
        volunteerId: volunteer.id,
        title: taskTitle,
        titleEs: taskTitleEs || taskTitle,
        description: taskDescription,
        descriptionEs: taskDescriptionEs || taskDescription,
        date: taskDate ? Timestamp.fromDate(new Date(taskDate)) : Timestamp.now(),
        startTime: taskStartTime || null,
        endTime: taskEndTime || null,
        location: taskLocation || null,
        status: "pending",
        assignedBy: adminUid || "unknown",
        createdAt: Timestamp.now(),
      });

      // Reset form
      setTaskTitle("");
      setTaskTitleEs("");
      setTaskDescription("");
      setTaskDescriptionEs("");
      setTaskDate("");
      setTaskStartTime("");
      setTaskEndTime("");
      setTaskLocation("");
      setShowTaskForm(false);

      alert(isES ? "Tarea asignada exitosamente" : "Task assigned successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      alert(isES ? "Error al crear tarea" : "Error creating task");
    } finally {
      setTaskCreating(false);
    }
  };

  const getProgramLabel = (program: string) => {
    switch (program) {
      case "ambassador":
        return isES ? "Programa de Embajadores" : "Ambassador Program";
      case "volunteer":
        return isES ? "Programa de Voluntariado" : "Volunteer Program";
      case "general":
        return isES ? "Consulta General" : "General Inquiry";
      default:
        return program;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return isES ? "Aprobado" : "Approved";
      case "pending":
        return isES ? "Pendiente" : "Pending";
      case "rejected":
        return isES ? "Rechazado" : "Rejected";
      default:
        return status;
    }
  };

  const getDateValue = (date: Timestamp | Date | { toDate: () => Date } | null): Date | null => {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate();
    if (typeof date === 'object' && 'toDate' in date) return date.toDate();
    if (date instanceof Date) return date;
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-7 w-52 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-36 bg-gray-200 rounded" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="h-5 w-36 bg-gray-200 rounded" />
                <div className="h-5 w-40 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                  <div className="h-6 w-14 bg-gray-200 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-12 w-full bg-gray-200 rounded-lg" />
              <div className="h-12 w-full bg-gray-200 rounded-lg" />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-24 w-full bg-gray-200 rounded-lg" />
              <div className="h-12 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {isES ? "Voluntario no encontrado" : "Volunteer not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/volunteers")}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {isES ? "Volver a Voluntarios" : "Back to Volunteers"}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {volunteer.firstName} {volunteer.lastName}
                </h1>
                <p className="text-gray-600">
                  {getProgramLabel(volunteer.program)}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                volunteer.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : volunteer.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {getStatusLabel(volunteer.status)}
              </span>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                {volunteer.email}
              </div>
              {volunteer.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  {volunteer.phone}
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                {getDateValue(volunteer.created_at)?.toLocaleDateString(isES ? "es-ES" : "en-US") || "-"}
              </div>
            </div>

            {/* Skills */}
            {volunteer.skills && volunteer.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">
                  {isES ? "Habilidades" : "Skills"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {volunteer.interests && volunteer.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">
                  {isES ? "Intereses" : "Interests"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {volunteer.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  {isES ? "Disponibilidad" : "Availability"}
                </h3>
                <p className="text-sm text-gray-600">{volunteer.availability || (isES ? "No especificada" : "Not specified")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  {isES ? "Experiencia" : "Experience"}
                </h3>
                <p className="text-sm text-gray-600">{volunteer.experience || (isES ? "No especificada" : "Not specified")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              {isES ? "Actualizar Estado" : "Update Status"}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => updateStatus("approved")}
                disabled={statusUpdating || volunteer.status === "approved"}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {isES ? "Aprobar" : "Approve"}
              </button>
              <button
                onClick={() => updateStatus("rejected")}
                disabled={statusUpdating || volunteer.status === "rejected"}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                {isES ? "Rechazar" : "Reject"}
              </button>
            </div>
          </div>

          {/* Send Message */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              {isES ? "Enviar Mensaje" : "Send Message"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isES ? "Mensaje" : "Message"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={isES ? "Escribe tu mensaje aquí..." : "Type your message here..."}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={sending || !message.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {sending ? (isES ? "Enviando..." : "Sending...") : (isES ? "Enviar Mensaje" : "Send Message")}
              </button>
            </div>
          </div>

          {/* Assign Task */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                {isES ? "Asignar Tarea" : "Assign Task"}
              </h3>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {showTaskForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isES ? "Título (EN)" : "Title (EN)"} *
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder={isES ? "Ej: Event setup" : "e.g., Event setup"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isES ? "Título (ES)" : "Title (ES)"}
                  </label>
                  <input
                    type="text"
                    value={taskTitleEs}
                    onChange={(e) => setTaskTitleEs(e.target.value)}
                    placeholder={isES ? "Ej: Preparación de evento" : "e.g., Event preparation"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isES ? "Descripción (EN)" : "Description (EN)"}
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                    placeholder={isES ? "Describe la tarea..." : "Describe the task..."}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isES ? "Descripción (ES)" : "Description (ES)"}
                  </label>
                  <textarea
                    value={taskDescriptionEs}
                    onChange={(e) => setTaskDescriptionEs(e.target.value)}
                    rows={3}
                    placeholder={isES ? "Describe la tarea en español..." : "Describe the task in Spanish..."}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isES ? "Fecha" : "Date"}
                    </label>
                    <input
                      type="date"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isES ? "Ubicación" : "Location"}
                    </label>
                    <input
                      type="text"
                      value={taskLocation}
                      onChange={(e) => setTaskLocation(e.target.value)}
                      placeholder={isES ? "Ej: Centro comunitario" : "e.g., Community center"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isES ? "Hora inicio" : "Start Time"}
                    </label>
                    <input
                      type="time"
                      value={taskStartTime}
                      onChange={(e) => setTaskStartTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isES ? "Hora fin" : "End Time"}
                    </label>
                    <input
                      type="time"
                      value={taskEndTime}
                      onChange={(e) => setTaskEndTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {isES ? "Cancelar" : "Cancel"}
                  </button>
                  <button
                    onClick={createTask}
                    disabled={taskCreating || !taskTitle.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {taskCreating ? (isES ? "Creando..." : "Creating...") : (isES ? "Asignar" : "Assign")}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {isES
                  ? "Haz clic en + para asignar una tarea al voluntario"
                  : "Click + to assign a task to the volunteer"}
              </p>
            )}
          </div>

          {/* Messages History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                {isES ? "Mensajes" : "Messages"}
                {messages.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {messages.length}
                  </span>
                )}
              </h3>
              {showMessages ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {showMessages && (
              <div className="mt-4 space-y-3">
                {loadingMessages ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {isES ? "No hay mensajes aún" : "No messages yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`border rounded-lg transition-colors ${
                          msg.isReply
                            ? "border-l-4 border-l-green-500 bg-green-50/30"
                            : msg.read
                            ? "border-gray-200"
                            : "border-l-4 border-l-blue-500 bg-blue-50/30"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                          className="w-full text-left p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {msg.isReply ? (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                                    {isES ? "Respuesta" : "Reply"}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                    {isES ? "Enviado" : "Sent"}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {msg.createdAt instanceof Timestamp
                                    ? msg.createdAt.toDate().toLocaleDateString(isES ? "es-ES" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                                    : new Date(msg.createdAt as unknown as Date).toLocaleDateString(isES ? "es-ES" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                                  }
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {isES && msg.subjectEs ? msg.subjectEs : msg.subject}
                              </p>
                            </div>
                            {expandedMessage === msg.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>

                        {expandedMessage === msg.id && (
                          <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                            <p className="text-xs text-gray-600 mb-2">
                              {isES ? "De:" : "From:"} <strong>{msg.fromName}</strong>
                            </p>
                            <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                              {isES && msg.bodyEs ? msg.bodyEs : msg.body}
                            </div>
                            {msg.isReply && msg.replyTo && (
                              <p className="text-xs text-gray-500 mt-2 italic">
                                {isES ? "Respuesta al mensaje original" : "Reply to original message"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
