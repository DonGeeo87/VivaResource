"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Check, X, Eye, FileText, Calendar, User, Mail, Building, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import type { VolunteerCertificateRequest } from "@/types/volunteer";

import { db, collection, doc, getDocs, orderBy, query, updateDoc } from "@/lib/db-client";

interface VolunteerRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface CertificateRequestWithName extends VolunteerCertificateRequest {
  volunteerName: string;
}

export default function AdminCertificatesPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const isES = language === "es";

  const t = useMemo(() => {
    const en = {
      title: "Volunteer Certificates",
      subtitle: "Manage certificate requests",
      back: "Back to Volunteers",
      search: "Search requests...",
      purpose: "Purpose",
      recipient: "Recipient Organization",
      volunteer: "Volunteer",
      date: "Date",
      status: "Status",
      actions: "Actions",
      viewDetails: "View Details",
      approve: "Approve",
      reject: "Reject",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      all: "All",
      filterByStatus: "Filter by status",
      noRequests: "No certificate requests found",
      requestDetails: "Request Details",
      close: "Close",
      additionalNotes: "Additional Notes",
      adminNoteLabel: "Admin Note (optional)",
      adminNotePlaceholder: "Reason for rejection...",
      sending: "Sending...",
      emailSent: "Email notification sent",
      emailError: "Email notification failed",
      requestFrom: "Request from",
      requested: "Requested",
    };
    const es = {
      title: "Certificados de Voluntarios",
      subtitle: "Gestionar solicitudes de certificados",
      back: "Volver a Voluntarios",
      search: "Buscar solicitudes...",
      purpose: "Propósito",
      recipient: "Organización Destinatario",
      volunteer: "Voluntario",
      date: "Fecha",
      status: "Estado",
      actions: "Acciones",
      viewDetails: "Ver Detalles",
      approve: "Aprobar",
      reject: "Rechazar",
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
      all: "Todos",
      filterByStatus: "Filtrar por estado",
      noRequests: "No se encontraron solicitudes de certificado",
      requestDetails: "Detalles de la Solicitud",
      close: "Cerrar",
      additionalNotes: "Notas Adicionales",
      adminNoteLabel: "Nota del Admin (opcional)",
      adminNotePlaceholder: "Motivo del rechazo...",
      sending: "Enviando...",
      emailSent: "Notificación enviada",
      emailError: "Error al enviar notificación",
      requestFrom: "Solicitud de",
      requested: "Solicitado",
    };
    return isES ? es : en;
  }, [isES]);

  const [requests, setRequests] = useState<CertificateRequestWithName[]>([]);
  const [, setVolunteers] = useState<Record<string, VolunteerRegistration>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequestWithName | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch volunteer registrations and volunteer users for lookup
      const [volsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(query(collection(db, "volunteer_registrations"))),
        getDocs(query(collection(db, "volunteer_users"))),
      ]);

      const volsMap: Record<string, VolunteerRegistration> = {};
      volsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        volsMap[docSnap.id] = {
          id: docSnap.id,
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || "",
          status: data?.status || "pending",
        };
      });

      // volunteer_users uses auth UID as doc ID
      usersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        volsMap[docSnap.id] = {
          id: docSnap.id,
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || "",
          status: data?.status || "pending",
        };
      });
      setVolunteers(volsMap);

      // Fetch certificate requests
      const certsQuery = query(
        collection(db, "volunteer_certificate_requests"),
        orderBy("createdAt", "desc")
      );
      const certsSnapshot = await getDocs(certsQuery);
      const certsData: CertificateRequestWithName[] = certsSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const vol = volsMap[data?.volunteerId];
        return {
          id: docSnap.id,
          volunteerId: data?.volunteerId || "",
          volunteerEmail: data?.volunteerEmail || "",
          purpose: data?.purpose || "",
          recipientOrganization: data?.recipientOrganization || "",
          additionalNotes: data?.additionalNotes,
          status: data?.status || "pending",
          adminNote: data?.adminNote,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt ? new Date(data.updatedAt) : undefined,
          volunteerName: vol ? `${vol.firstName} ${vol.lastName}` : data?.volunteerEmail || "Unknown",
        };
      });
      setRequests(certsData);
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    setProcessingId(id);
    try {
      const req = requests.find((r) => r.id === id);
      if (!req) return;

      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: new Date(),
      };
      if (newStatus === "rejected" && adminNote.trim()) {
        updateData.adminNote = adminNote.trim();
      }

      await updateDoc(doc(db, "volunteer_certificate_requests", id), updateData);

      // Send email notification
      const emailType =
        newStatus === "approved"
          ? "volunteer-certificate-approved"
          : "volunteer-certificate-rejected";

      const emailPayload: Record<string, unknown> = {
        type: emailType,
        data: {
          email: req.volunteerEmail,
          name: req.volunteerName,
          purpose: req.purpose,
          adminNote: newStatus === "rejected" ? adminNote.trim() || undefined : undefined,
        },
      };

      await fetch("/api/email/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: newStatus,
                updatedAt: new Date(),
                adminNote: newStatus === "rejected" ? adminNote.trim() || undefined : r.adminNote,
              }
            : r
        )
      );
      setAdminNote("");
      setSelectedRequest(null);
    } catch (error: unknown) {
      console.error("Error updating status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isES ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: "success" | "warning" | "error" | "default"; label: string }
    > = {
      pending: { variant: "warning", label: t.pending },
      approved: { variant: "success", label: t.approved },
      rejected: { variant: "error", label: t.rejected },
    };
    const c = config[status] || { variant: "default", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.purpose.toLowerCase().includes(search.toLowerCase()) ||
      r.recipientOrganization.toLowerCase().includes(search.toLowerCase()) ||
      r.volunteerName.toLowerCase().includes(search.toLowerCase()) ||
      r.volunteerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/volunteers")}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.back}
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            {t.title}
            {pendingCount > 0 && (
              <span className="ml-2 px-3 py-1 bg-red-500 text-white text-sm rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          <p className="text-sm text-gray-600">{t.all}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">
            {requests.filter((r) => r.status === "pending").length}
          </p>
          <p className="text-sm text-gray-600">{t.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">
            {requests.filter((r) => r.status === "approved").length}
          </p>
          <p className="text-sm text-gray-600">{t.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-red-600">
            {requests.filter((r) => r.status === "rejected").length}
          </p>
          <p className="text-sm text-gray-600">{t.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">{t.all}</option>
            <option value="pending">{t.pending}</option>
            <option value="approved">{t.approved}</option>
            <option value="rejected">{t.rejected}</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">{t.noRequests}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    {t.volunteer}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    {t.purpose}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    {t.recipient}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    {t.date}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    {t.status}
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{req.volunteerName}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {req.volunteerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">
                        {req.purpose}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 flex items-center gap-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        {req.recipientOrganization}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(req.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setAdminNote("");
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title={t.viewDetails}
                        >
                          <Eye className="w-4 h-4" />
                          {t.viewDetails}
                        </button>
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(req.id, "approved")}
                              disabled={processingId === req.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              {t.approve}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setAdminNote("");
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                              {t.reject}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          setAdminNote("");
        }}
        title={t.requestDetails}
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {t.requestFrom}
                </p>
                <p className="font-medium text-gray-900">{selectedRequest.volunteerName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {selectedRequest.volunteerEmail}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {t.requested}
                </p>
                <p className="font-medium text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                <div className="mt-2">{getStatusBadge(selectedRequest.status)}</div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {t.purpose}
              </p>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-4">{selectedRequest.purpose}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                <Building className="w-4 h-4" />
                {t.recipient}
              </p>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-4">
                {selectedRequest.recipientOrganization}
              </p>
            </div>

            {selectedRequest.additionalNotes && (
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {t.additionalNotes}
                </p>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-4">
                  {selectedRequest.additionalNotes}
                </p>
              </div>
            )}

            {selectedRequest.status === "pending" && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.adminNoteLabel}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={t.adminNotePlaceholder}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedRequest.id, "approved")}
                    disabled={processingId === selectedRequest.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    <Check className="w-5 h-5" />
                    {processingId === selectedRequest.id ? t.sending : t.approve}
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequest.id, "rejected")}
                    disabled={processingId === selectedRequest.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    <X className="w-5 h-5" />
                    {processingId === selectedRequest.id ? t.sending : t.reject}
                  </button>
                </div>
              </div>
            )}

            {selectedRequest.adminNote && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-800 mb-1">
                  {isES ? "Nota del admin" : "Admin note"}
                </p>
                <p className="text-orange-700">{selectedRequest.adminNote}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
