"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Download, Mail, Phone, Calendar, Eye, CheckCheck, XCircle, Inbox } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import { db, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, writeBatch } from "@/lib/db-client";
import { toDate } from "@/lib/timezone";
import { PageShell, PageHeader, AdminButton, Pagination, StatusBadge, EmptyState, Toolbar, SearchInput, FilterSelect } from "@/components/admin";
import { authFetch } from "@/lib/auth/client";

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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    fetchVolunteers();

    const messagesQuery = query(collection(db, "volunteer_messages"));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const unread = snapshot.docs.filter((doc: { data: () => Record<string, unknown> }) => {
        const data = doc.data();
        return !data.read && !data.isReply;
      }).length;
      setUnreadMessages(unread);
    });

    return () => unsubscribe();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const q = query(collection(db, "volunteer_registrations"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Volunteer[];
      setVolunteers(data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      try {
        const snapshot = await getDocs(collection(db, "volunteer_registrations"));
        const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Volunteer[];
        data.sort((a, b) => {
          const dateA = a.created_at ? (a.created_at.toDate ? a.created_at.toDate() : new Date()) : new Date(0);
          const dateB = b.created_at ? (b.created_at.toDate ? b.created_at.toDate() : new Date()) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        setVolunteers(data);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
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
          ? `Estimado/a ${volunteer.firstName} ${volunteer.lastName},\n\n¡Nos complace informarle que su solicitud de voluntariado ha sido aprobada!\n\nBienvenido/a al equipo de Viva Resource. Pronto nos pondremos en contacto con usted para coordinar los próximos pasos.\n\nSi tiene alguna pregunta, no dude en contactarnos.\n\nSaludos cordiales,\nEquipo de Viva Resource`
          : `Dear ${volunteer.firstName} ${volunteer.lastName},\n\nWe are pleased to inform you that your volunteer application has been approved!\n\nWelcome to the Viva Resource team. We will be in touch soon to coordinate next steps.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nViva Resource Team`
        : isES
          ? `Estimado/a ${volunteer.firstName} ${volunteer.lastName},\n\nGracias por su interés en ser voluntario/a de Viva Resource.\n\nDespués de revisar su solicitud, lamentamos informarle que en este momento no podemos aceptar su solicitud. Esto no refleja negativamente sobre usted, y le animamos a que vuelva a aplicar en el futuro.\n\nAgradecemos su interés en nuestra misión.\n\nSaludos cordiales,\nEquipo de Viva Resource`
          : `Dear ${volunteer.firstName} ${volunteer.lastName},\n\nThank you for your interest in volunteering with Viva Resource.\n\nAfter reviewing your application, we regret to inform you that we cannot accept your application at this time. This does not reflect negatively on you, and we encourage you to apply again in the future.\n\nWe appreciate your interest in our mission.\n\nBest regards,\nViva Resource Team`;

      await authFetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: volunteer.email, subject, message }),
      });
    } catch (error) {
      console.error("Error sending status email:", error);
    }
  };

  const updateStatus = async (id: string, status: "pending" | "approved" | "rejected", sendEmail = true) => {
    try {
      await updateDoc(doc(db, "volunteer_registrations", id), { status, updated_at: new Date().toISOString() });
      setVolunteers(volunteers.map((v) => (v.id === id ? { ...v, status } : v)));
      if (sendEmail) {
        const volunteer = volunteers.find((v) => v.id === id);
        if (volunteer) await sendStatusEmail(volunteer, status);
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
      selectedIds.forEach((id) => {
        const docRef = doc(db, "volunteer_registrations", id);
        batch.update(docRef, { status: newStatus, updated_at: new Date().toISOString() });
      });
      await batch.commit();
      setVolunteers(volunteers.map((v) => (selectedIds.includes(v.id) ? { ...v, status: newStatus } : v)));
      for (const id of selectedIds) {
        const volunteer = volunteers.find((v) => v.id === id);
        if (volunteer) await sendStatusEmail(volunteer, newStatus);
      }
      setSelectedIds([]);
    } catch (error) {
      console.error("Error updating bulk status:", error);
    } finally {
      setBulkAction(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const filteredVolunteers = volunteers.filter((v) => {
    const fullName = `${v.firstName} ${v.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || v.status === filter;
    return matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    const headers = [
      isES ? "Nombre" : "Name",
      "Email",
      isES ? "Teléfono" : "Phone",
      isES ? "Programa" : "Program",
      isES ? "Habilidades" : "Skills",
      isES ? "Intereses" : "Interests",
      isES ? "Disponibilidad" : "Availability",
      isES ? "Estado" : "Status",
      isES ? "Fecha" : "Date",
    ];
    const rows = filteredVolunteers.map((v) => [
      `${v.firstName} ${v.lastName}`,
      v.email,
      v.phone || "",
      v.program || "",
      (v.skills || []).join(", "),
      (v.interests || []).join(", "),
      v.availability || "",
      v.status,
      toDate(v.created_at)?.toLocaleDateString() || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isES ? "voluntarios.csv" : "volunteers.csv";
    a.click();
  };

  const totalPages = Math.max(1, Math.ceil(filteredVolunteers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVolunteers = filteredVolunteers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const statusLabels: Record<string, string> = {
    pending: isES ? "Pendiente" : "Pending",
    approved: isES ? "Aprobado" : "Approved",
    rejected: isES ? "Rechazado" : "Rejected",
  };

  const programLabels: Record<string, string> = {
    ambassador: isES ? "Embajadores" : "Ambassador",
    volunteer: isES ? "Voluntariado" : "Volunteer",
    general: isES ? "Consulta General" : "General Inquiry",
  };

  return (
    <PageShell>
      <PageHeader
        title={isES ? "Voluntarios" : "Volunteers"}
        description={isES ? "Gestiona las solicitudes de voluntarios" : "Manage volunteer applications"}
        actions={
          <>
            <Link href="/admin/volunteers/tasks">
              <AdminButton variant="secondary" icon={<Calendar className="w-4 h-4" />}>{isES ? "Tareas" : "Tasks"}</AdminButton>
            </Link>
            <Link href="/admin/volunteers/messages" className="relative">
              <AdminButton variant="secondary" icon={<Inbox className="w-4 h-4" />}>
                {isES ? "Mensajes" : "Messages"}
                {unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {unreadMessages}
                  </span>
                )}
              </AdminButton>
            </Link>
            <AdminButton variant="secondary" icon={<Download className="w-4 h-4" />} onClick={exportCSV}>
              {isES ? "Exportar CSV" : "Export CSV"}
            </AdminButton>
            {selectedIds.length > 0 && (
              <>
                <AdminButton variant="primary" icon={<CheckCheck className="w-4 h-4" />} onClick={() => handleBulkAction("approve")} disabled={bulkAction !== null}>
                  {isES ? "Aprobar" : "Approve"} ({selectedIds.length})
                </AdminButton>
                <AdminButton variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={() => handleBulkAction("reject")} disabled={bulkAction !== null}>
                  {isES ? "Rechazar" : "Reject"} ({selectedIds.length})
                </AdminButton>
              </>
            )}
          </>
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder={isES ? "Buscar voluntarios..." : "Search volunteers..."} />
        <FilterSelect value={filter} onChange={(v) => { setFilter(v); setCurrentPage(1); }}>
          <option value="all">{isES ? "Todos" : "All"}</option>
          <option value="pending">{isES ? "Pendientes" : "Pending"}</option>
          <option value="approved">{isES ? "Aprobados" : "Approved"}</option>
          <option value="rejected">{isES ? "Rechazados" : "Rejected"}</option>
        </FilterSelect>
      </Toolbar>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-surface-lowest border border-outline-low rounded-lg p-5">
                <div className="h-5 w-40 bg-surface-high rounded mb-3" />
                <div className="h-4 w-64 bg-surface-high rounded" />
              </div>
            ))}
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="bg-surface-lowest border border-outline-low rounded-lg">
            <EmptyState title={isES ? "No se encontraron voluntarios" : "No volunteers found"} />
          </div>
        ) : (
          paginatedVolunteers.map((volunteer) => (
            <div key={volunteer.id} className="bg-surface-lowest border border-outline-low rounded-lg p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(volunteer.id)}
                      onChange={() => toggleSelect(volunteer.id)}
                      className="w-4 h-4 rounded border-outline-low text-primary focus:ring-primary/40"
                      aria-label={isES ? "Seleccionar voluntario" : "Select volunteer"}
                    />
                    <h3 className="font-semibold text-on-surface">{volunteer.firstName} {volunteer.lastName}</h3>
                    <StatusBadge status={volunteer.status}>{statusLabels[volunteer.status]}</StatusBadge>
                    <Link href={`/admin/volunteers/${volunteer.id}`} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors">
                      <Eye className="w-4 h-4" />
                      {isES ? "Ver Detalles" : "View Details"}
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-2 min-w-0"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{volunteer.email}</span></span>
                    {volunteer.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" />{volunteer.phone}</span>}
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 flex-shrink-0" />{toDate(volunteer.created_at)?.toLocaleDateString(isES ? "es-ES" : "en-US") || "—"}</span>
                  </div>

                  {volunteer.program && (
                    <p className="mt-2 text-sm text-on-surface-variant">{isES ? "Programa" : "Program"}: {programLabels[volunteer.program] || volunteer.program}</p>
                  )}

                  {volunteer.skills && volunteer.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {volunteer.skills.map((skill, i) => (
                        <StatusBadge key={i} tone="brand">{skill}</StatusBadge>
                      ))}
                    </div>
                  )}

                  {volunteer.availability && (
                    <p className="mt-2 text-sm text-on-surface-variant">{isES ? "Disponibilidad" : "Availability"}: {volunteer.availability}</p>
                  )}
                </div>

                {volunteer.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <AdminButton variant="primary" icon={<Check className="w-4 h-4" />} onClick={() => updateStatus(volunteer.id, "approved")}>
                      {isES ? "Aprobar" : "Approve"}
                    </AdminButton>
                    <AdminButton variant="danger" icon={<X className="w-4 h-4" />} onClick={() => updateStatus(volunteer.id, "rejected")}>
                      {isES ? "Rechazar" : "Reject"}
                    </AdminButton>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && filteredVolunteers.length > PAGE_SIZE && (
        <div className="flex justify-center">
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </PageShell>
  );
}
