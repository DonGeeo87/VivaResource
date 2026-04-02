"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Mail, Phone, Calendar, Check, X } from "lucide-react";
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

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

  useEffect(() => {
    if (volunteerId) {
      fetchVolunteer(volunteerId);
    }
  }, [volunteerId]);

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

  const sendStatusEmail = async (newStatus: string) => {
    if (!volunteer) return;
    
    try {
      const subject = newStatus === "approved" 
        ? (isES ? "¡Bienvenido al equipo de Viva Resource!" : "Welcome to the Viva Resource Team!")
        : (isES ? "Actualización de su solicitud de voluntariado" : "Your Volunteer Application Update");
      
      const messageContent = newStatus === "approved"
        ? isES
          ? `Estimado/a ${volunteer.firstName} ${volunteer.lastName},\n\n¡Nos complace informarle que su solicitud de voluntariado ha sido aprobada!\n\nBienvenido/a al equipo de Viva Resource Foundation. Pronto nos pondremos en contacto con usted para coordinar los próximos pasos.\n\nSi tiene alguna pregunta, no dude en contactarnos.\n\nSaludos cordiales,\nEquipo de Viva Resource Foundation`
          : `Dear ${volunteer.firstName} ${volunteer.lastName},\n\nWe are pleased to inform you that your volunteer application has been approved!\n\nWelcome to the Viva Resource Foundation team. We will be in touch soon to coordinate next steps.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nViva Resource Foundation Team`
        : isES
          ? `Estimado/a ${volunteer.firstName} ${volunteer.lastName},\n\nGracias por su interés en ser voluntario/a de Viva Resource Foundation.\n\nDespués de revisar su solicitud, lamentamos informarle que en este momento no podemos aceptar su solicitud. Esto no refleja negativamente sobre usted, y le animamos a que vuelva a aplicar en el futuro.\n\nAgradecemos su interés en nuestra misión.\n\nSaludos cordiales,\nEquipo de Viva Resource Foundation`
          : `Dear ${volunteer.firstName} ${volunteer.lastName},\n\nThank you for your interest in volunteering with Viva Resource Foundation.\n\nAfter reviewing your application, we regret to inform you that we cannot accept your application at this time. This does not reflect negatively on you, and we encourage you to apply again in the future.\n\nWe appreciate your interest in our mission.\n\nBest regards,\nViva Resource Foundation Team`;

      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: volunteer.email,
          subject,
          message: messageContent,
        }),
      });
    } catch (error) {
      console.error("Error sending status email:", error);
    }
  };

  const updateStatus = async (newStatus: "pending" | "approved" | "rejected") => {
    setStatusUpdating(true);
    try {
      await updateDoc(doc(db, "volunteer_registrations", volunteerId), {
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      setVolunteer(volunteer ? { ...volunteer, status: newStatus } : null);
      
      // Send email notification
      await sendStatusEmail(newStatus);
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
      // Save message to Firestore
      await addDoc(collection(db, "volunteer_messages"), {
        volunteer_id: volunteerId,
        volunteer_email: volunteer.email,
        message,
        sent_at: Timestamp.now(),
        status: "sent"
      });

      // Send email via Resend
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: volunteer.email,
          subject: isES ? "Mensaje de Viva Resource Foundation" : "Message from Viva Resource Foundation",
          message: `${isES ? "Hola" : "Hello"} ${volunteer.firstName},\n\n${message}\n\n${isES ? "Saludos cordiales," : "Best regards,"}\n${isES ? "Equipo de Viva Resource Foundation" : "Viva Resource Foundation Team"}`
        })
      });

      setMessage("");
      alert(isES ? "Mensaje enviado exitosamente" : "Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      alert(isES ? "Error al enviar mensaje" : "Error sending message");
    } finally {
      setSending(false);
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
        </div>
      </div>
    </div>
  );
}
