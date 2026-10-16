"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { db, Timestamp, collection, doc, getDocs, orderBy, query, updateDoc } from "@/lib/db-client";
import { Eye, Mail, Phone, Tag, MessageSquare, Inbox } from "lucide-react";
import {
  PageShell,
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  StatusBadge,
  Modal,
  AdminButton,
  Field,
  Textarea,
  Toolbar,
  SearchInput,
  FilterSelect,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmpty,
  TableSkeleton,
} from "@/components/admin";

interface HelpRequest {
  id: string;
  fullName: string;
  email: string;
  assistanceTypes: string[];
  contactMethod: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

type StatusFilter = "all" | "pending" | "in_progress" | "resolved" | "closed";

const statusLabels: Record<string, { en: string; es: string }> = {
  pending: { en: "Pending", es: "Pendiente" },
  in_progress: { en: "In Progress", es: "En Progreso" },
  resolved: { en: "Resolved", es: "Resuelto" },
  closed: { en: "Closed", es: "Cerrado" },
};

const assistanceTypeLabels: Record<string, { en: string; es: string }> = {
  housing: { en: "Housing", es: "Vivienda" },
  food: { en: "Food", es: "Comida" },
  health: { en: "Health", es: "Salud" },
  education: { en: "Education", es: "Educación" },
  legalAid: { en: "Legal Aid", es: "Asistencia Legal" },
  other: { en: "Other", es: "Otro" },
};

export default function AdminHelpRequestsPage(): JSX.Element {
  const { language } = useLanguage();
  const isES = language === "es";
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "help_requests"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as HelpRequest[];
      setRequests(data);
    } catch (error) {
      console.error("Error fetching help requests:", error);
      try {
        const snapshot = await getDocs(collection(db, "help_requests"));
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as HelpRequest[];
        data.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        setRequests(data);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const openRequest = (request: HelpRequest) => {
    setSelectedRequest(request);
    setNoteDraft(request.notes || "");
  };

  const updateStatus = async (id: string, newStatus: HelpRequest["status"]) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "help_requests", id), { status: newStatus, updatedAt: Timestamp.now() });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus, updatedAt: Timestamp.now() } : r)));
      setSelectedRequest((prev) => (prev && prev.id === id ? { ...prev, status: newStatus, updatedAt: Timestamp.now() } : prev));
    } catch (error) {
      console.error("Error updating request status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async (id: string, note: string) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "help_requests", id), { notes: note, updatedAt: Timestamp.now() });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, notes: note, updatedAt: Timestamp.now() } : r)));
      setSelectedRequest((prev) => (prev && prev.id === id ? { ...prev, notes: note } : prev));
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const term = search.toLowerCase();
    const matchesSearch =
      r.fullName.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
    closed: requests.filter((r) => r.status === "closed").length,
  };

  const formatDate = (date: Timestamp | Date) => {
    const locale = isES ? "es-ES" : "en-US";
    const value = date instanceof Timestamp ? date.toDate() : new Date(date);
    return value.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const typeLabel = (type: string) => assistanceTypeLabels[type]?.[isES ? "es" : "en"] || type;

  return (
    <PageShell>
      <PageHeader
        title={isES ? "Solicitudes de Apoyo" : "Help Requests"}
        description={isES ? "Gestiona y da seguimiento a las solicitudes de ayuda" : "Manage and track help requests"}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label={isES ? "Total" : "Total"} value={stats.total} icon={<Inbox className="w-5 h-5" />} tone="neutral" loading={loading} />
        <StatCard label={statusLabels.pending[isES ? "es" : "en"]} value={stats.pending} icon={<Inbox className="w-5 h-5" />} tone="warning" loading={loading} />
        <StatCard label={statusLabels.in_progress[isES ? "es" : "en"]} value={stats.in_progress} icon={<Inbox className="w-5 h-5" />} tone="info" loading={loading} />
        <StatCard label={statusLabels.resolved[isES ? "es" : "en"]} value={stats.resolved} icon={<Inbox className="w-5 h-5" />} tone="success" loading={loading} />
        <StatCard label={statusLabels.closed[isES ? "es" : "en"]} value={stats.closed} icon={<Inbox className="w-5 h-5" />} tone="neutral" loading={loading} />
      </div>

      <Card>
        <CardHeader title={isES ? "Solicitudes" : "Requests"} actions={<span className="text-xs text-on-surface-variant tabular-nums">{filteredRequests.length}</span>} />
        <CardBody className="space-y-4">
          <Toolbar>
            <SearchInput value={search} onChange={setSearch} placeholder={isES ? "Buscar solicitudes..." : "Search requests..."} />
            <FilterSelect value={statusFilter} onChange={(v) => setStatusFilter(v as StatusFilter)}>
              <option value="all">{isES ? "Todos" : "All"}</option>
              {Object.entries(statusLabels).map(([key, labels]) => (
                <option key={key} value={key}>{labels[isES ? "es" : "en"]}</option>
              ))}
            </FilterSelect>
          </Toolbar>

          <div className="-mx-4 border-y border-outline-low">
            <Table>
              <Thead>
                <Th>{isES ? "Nombre" : "Name"}</Th>
                <Th>{isES ? "Tipos" : "Types"}</Th>
                <Th align="center">{isES ? "Estado" : "Status"}</Th>
                <Th>{isES ? "Fecha" : "Date"}</Th>
                <Th align="right">{isES ? "Acciones" : "Actions"}</Th>
              </Thead>
              <Tbody>
                {loading ? (
                  <TableSkeleton rows={5} cols={5} />
                ) : filteredRequests.length === 0 ? (
                  <TableEmpty colSpan={5}>{isES ? "No se encontraron solicitudes" : "No requests found"}</TableEmpty>
                ) : (
                  filteredRequests.map((request) => (
                    <Tr key={request.id}>
                      <Td>
                        <span className="font-medium text-on-surface">{request.fullName}</span>
                        <span className="block text-xs text-on-surface-variant">{request.email}</span>
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {request.assistanceTypes.slice(0, 2).map((type) => (
                            <StatusBadge key={type} tone="brand">{typeLabel(type)}</StatusBadge>
                          ))}
                          {request.assistanceTypes.length > 2 && (
                            <StatusBadge tone="neutral">+{request.assistanceTypes.length - 2}</StatusBadge>
                          )}
                        </div>
                      </Td>
                      <Td align="center">
                        <StatusBadge status={request.status}>{statusLabels[request.status][isES ? "es" : "en"]}</StatusBadge>
                      </Td>
                      <Td>{formatDate(request.createdAt)}</Td>
                      <Td align="right">
                        <button onClick={() => openRequest(request)} title={isES ? "Detalles" : "Details"} className="p-2 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-low">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <Modal
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={isES ? "Detalles del caso" : "Case Details"}
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-on-surface">{selectedRequest.fullName}</h3>
                <p className="text-sm text-on-surface-variant">{selectedRequest.email}</p>
              </div>
              <StatusBadge status={selectedRequest.status}>{statusLabels[selectedRequest.status][isES ? "es" : "en"]}</StatusBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-on-surface mb-2"><Tag className="w-4 h-4 text-outline" />{isES ? "Tipos" : "Types"}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRequest.assistanceTypes.map((type) => (
                      <StatusBadge key={type} tone="brand">{typeLabel(type)}</StatusBadge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-on-surface mb-2"><MessageSquare className="w-4 h-4 text-outline" />{isES ? "Descripción" : "Description"}</h4>
                  <p className="text-sm text-on-surface-variant bg-surface-low p-3 rounded-md">
                    {selectedRequest.description || (isES ? "Sin descripción" : "No description")}
                  </p>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-on-surface mb-2"><Mail className="w-4 h-4 text-outline" />{isES ? "Contacto" : "Contact"}</h4>
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant"><Phone className="w-4 h-4" />{selectedRequest.contactMethod}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-on-surface mb-2">{isES ? "Actualizar estado" : "Update status"}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statusLabels).map(([key, labels]) => (
                      <button
                        key={key}
                        onClick={() => updateStatus(selectedRequest.id, key as HelpRequest["status"])}
                        disabled={updating || selectedRequest.status === key}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 ${
                          selectedRequest.status === key
                            ? "bg-primary text-white border-primary"
                            : "bg-surface-lowest text-on-surface-variant border-outline-low hover:bg-surface-low"
                        }`}
                      >
                        {labels[isES ? "es" : "en"]}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label={isES ? "Notas internas" : "Internal notes"} htmlFor="notes-input">
                  <Textarea
                    id="notes-input"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder={isES ? "Agregar notas internas..." : "Add internal notes..."}
                    rows={4}
                  />
                </Field>
                <AdminButton onClick={() => addNote(selectedRequest.id, noteDraft)} disabled={updating}>
                  {isES ? "Guardar nota" : "Save note"}
                </AdminButton>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}
