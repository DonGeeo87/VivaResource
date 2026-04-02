"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Check, X, Download, Mail, Phone, Calendar, Eye, CheckCheck, XCircle } from "lucide-react";
import { collection, query, orderBy, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  program?: string;
  skills?: string[];
  interests?: string[];
  availability?: string;
  experience?: string;
  status: "pending" | "approved" | "rejected";
  created_at: { toDate: () => Date } | null;
}

export default function AdminVolunteersPage(): JSX.Element {
  const { language } = useLanguage();
  const isES = language === "es";
  
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const q = query(collection(db, "volunteer_registrations"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Volunteer[];
      setVolunteers(data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendStatusEmail = async (volunteer: Volunteer, newStatus: string) => {
    try {
      const subject = newStatus === "approved" 
        ? (isES ? "¡Bienvenido al equipo de Viva Resource!" : "Welcome to the Viva Resource Team!")
        : (isES ? "Actualización de su solicitud de voluntariado" : "Your Volunteer Application Update");
      
      const message = newStatus === "approved"
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
          message,
        }),
      });
    } catch (error) {
      console.error("Error sending status email:", error);
    }
  };

  const updateStatus = async (id: string, status: "pending" | "approved" | "rejected", sendEmail = true) => {
    try {
      await updateDoc(doc(db, "volunteer_registrations", id), { 
        status,
        updated_at: new Date().toISOString()
      });
      setVolunteers(volunteers.map(v => v.id === id ? { ...v, status } : v));
      
      // Send email notification
      if (sendEmail) {
        const volunteer = volunteers.find(v => v.id === id);
        if (volunteer) {
          await sendStatusEmail(volunteer, status);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedIds.length === 0) return;
    
    setBulkAction(action);
    const newStatus = action === "approve" ? "approved" : "rejected";
    
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        const docRef = doc(db, "volunteer_registrations", id);
        batch.update(docRef, { 
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      });
      await batch.commit();
      
      // Update local state
      setVolunteers(volunteers.map(v => 
        selectedIds.includes(v.id) ? { ...v, status: newStatus } : v
      ));
      
      // Send emails to all affected volunteers
      for (const id of selectedIds) {
        const volunteer = volunteers.find(v => v.id === id);
        if (volunteer) {
          await sendStatusEmail(volunteer, newStatus);
        }
      }
      
      setSelectedIds([]);
    } catch (error) {
      console.error("Error updating bulk status:", error);
    } finally {
      setBulkAction(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    const headers = [
      isES ? "Nombre" : "Name",
      isES ? "Email" : "Email",
      isES ? "Teléfono" : "Phone",
      isES ? "Programa" : "Program",
      isES ? "Habilidades" : "Skills",
      isES ? "Intereses" : "Interests",
      isES ? "Disponibilidad" : "Availability",
      isES ? "Estado" : "Status",
      isES ? "Fecha" : "Date"
    ];
    const rows = filteredVolunteers.map(v => [
      `${v.firstName} ${v.lastName}`,
      v.email,
      v.phone || "",
      v.program || "",
      (v.skills || []).join(", "),
      (v.interests || []).join(", "),
      v.availability || "",
      v.status,
      v.created_at ? v.created_at.toDate().toLocaleDateString() : ""
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isES ? "voluntarios.csv" : "volunteers.csv";
    a.click();
  };

  const filteredVolunteers = volunteers.filter(v => {
    const fullName = `${v.firstName} ${v.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || v.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700"
  };

  const statusLabels: Record<string, string> = {
    pending: isES ? "Pendiente" : "Pending",
    approved: isES ? "Aprobado" : "Approved",
    rejected: isES ? "Rechazado" : "Rejected"
  };

  const programLabels: Record<string, string> = {
    ambassador: isES ? "Embajadores" : "Ambassador",
    volunteer: isES ? "Voluntariado" : "Volunteer",
    general: isES ? "Consulta General" : "General Inquiry"
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isES ? "Voluntarios" : "Volunteers"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isES ? "Gestiona las solicitudes de voluntarios" : "Manage volunteer applications"}
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={() => handleBulkAction("approve")}
                disabled={bulkAction !== null}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-5 h-5" />
                {isES ? "Aprobar" : "Approve"} ({selectedIds.length})
              </button>
              <button
                onClick={() => handleBulkAction("reject")}
                disabled={bulkAction !== null}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                {isES ? "Rechazar" : "Reject"} ({selectedIds.length})
              </button>
            </>
          )}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            <Download className="w-5 h-5" />
            {isES ? "Exportar CSV" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={isES ? "Buscar voluntarios..." : "Search volunteers..."}
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
            <option value="all">{isES ? "Todos" : "All"}</option>
            <option value="pending">{isES ? "Pendientes" : "Pending"}</option>
            <option value="approved">{isES ? "Aprobados" : "Approved"}</option>
            <option value="rejected">{isES ? "Rechazados" : "Rejected"}</option>
          </select>
        </div>
      </div>

      {/* Volunteers List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-200 rounded" />
                      <div className="h-5 w-40 bg-gray-200 rounded" />
                      <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <div className="h-5 w-16 bg-gray-200 rounded" />
                      <div className="h-5 w-20 bg-gray-200 rounded" />
                      <div className="h-5 w-14 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                    <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">
            {isES ? "No se encontraron voluntarios" : "No volunteers found"}
          </div>
        ) : (
          filteredVolunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(volunteer.id)}
                      onChange={() => toggleSelect(volunteer.id)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <h3 className="font-semibold text-lg text-gray-900">
                      {volunteer.firstName} {volunteer.lastName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[volunteer.status]}`}>
                      {statusLabels[volunteer.status]}
                    </span>
                    <Link
                      href={`/admin/volunteers/${volunteer.id}`}
                      className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {isES ? "Ver Detalles" : "View Details"}
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {volunteer.email}
                    </div>
                    {volunteer.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {volunteer.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {volunteer.created_at 
                        ? volunteer.created_at.toDate().toLocaleDateString() 
                        : "-"}
                    </div>
                  </div>

                  {volunteer.program && (
                    <p className="mt-2 text-sm text-gray-600">
                      {isES ? "Programa" : "Program"}: {programLabels[volunteer.program] || volunteer.program}
                    </p>
                  )}

                  {volunteer.skills && volunteer.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {volunteer.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {volunteer.availability && (
                    <p className="mt-2 text-sm text-gray-600">
                      {isES ? "Disponibilidad" : "Availability"}: {volunteer.availability}
                    </p>
                  )}
                </div>

                {volunteer.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(volunteer.id, "approved")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      {isES ? "Aprobar" : "Approve"}
                    </button>
                    <button
                      onClick={() => updateStatus(volunteer.id, "rejected")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {isES ? "Rechazar" : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
