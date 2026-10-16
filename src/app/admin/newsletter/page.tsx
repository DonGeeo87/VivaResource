"use client";

import { useState, useEffect } from "react";
import { Download, Mail, Trash2, Send, History, Users, Eye, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import NewsletterBuilder, { newsletterTemplates, NewsletterBlock, NewsletterTemplate } from "@/components/forms/NewsletterBuilder";
import {
  PageShell,
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  StatusBadge,
  AdminButton,
  Toolbar,
  SearchInput,
  EmptyState,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmpty,
  TableSkeleton,
} from "@/components/admin";

import { db, Timestamp, collection, deleteDoc, doc, getDocs, orderBy, query } from "@/lib/db-client";
import { getToken } from "@/lib/auth/client";

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
  const isES = language === "es";
  const [activeTab, setActiveTab] = useState<Tab>("subscribers");

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Send newsletter state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [subjectEs, setSubjectEs] = useState("");
  const [blocks, setBlocks] = useState<NewsletterBlock[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [sendMode, setSendMode] = useState<"all" | "selected">("all");
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());

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
      const response = await fetch("/api/newsletter/history", {
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!response.ok) {
        console.warn("[Newsletter] History fetch failed, using empty array");
        setHistory([]);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistory([]);
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
        const response = await fetch(`/api/newsletter/history?id=${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken() ?? ""}` },
        });
        const data = await response.json();
        if (data.success) {
          setHistory(history.filter(h => h.id !== id));
        }
      } catch (error) {
        console.error("Error deleting history entry:", error);
      }
    }
  };

  const handleSelectTemplate = (template: NewsletterTemplate) => {
    setSelectedTemplate(template.id);
    setBlocks(template.blocks);
    setSubject(isES ? "" : template.name);
    setSubjectEs(isES ? template.nameEs : "");
    setShowBuilder(true);
  };

  const toggleSubscriberSelection = (id: string) => {
    setSelectedSubscribers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllSubscribers = () => {
    setSelectedSubscribers(new Set(subscribers.map(s => s.id)));
  };

  const deselectAllSubscribers = () => {
    setSelectedSubscribers(new Set());
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || blocks.length === 0) {
      setSendResult({ success: false, message: isES ? "El asunto y al menos un bloque son requeridos" : "Subject and at least one block are required" });
      return;
    }

    // Determine recipient count based on send mode
    const recipientCount = sendMode === "all"
      ? activeSubscribers
      : selectedSubscribers.size;

    if (recipientCount === 0) {
      setSendResult({
        success: false,
        message: isES
          ? (sendMode === "selected" ? "No hay suscriptores seleccionados" : "No hay suscriptores activos para enviar")
          : (sendMode === "selected" ? "No subscribers selected" : "No active subscribers to send to")
      });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      // Convert blocks to HTML content
      let htmlContent = `<h1>${subject}</h1>`;
      blocks.forEach((block) => {
        if (block.type === "hero") {
          htmlContent += `<h2 style="color: #025689">${isES && block.content.headingEs ? block.content.headingEs : block.content.heading}</h2>`;
          htmlContent += `<p>${isES && block.content.textEs ? block.content.textEs : block.content.text}</p>`;
        } else if (block.type === "heading") {
          htmlContent += `<h3>${isES && block.content.headingEs ? block.content.headingEs : block.content.heading}</h3>`;
        } else if (block.type === "text") {
          htmlContent += `<p>${isES && block.content.textEs ? block.content.textEs : block.content.text}</p>`;
        } else if (block.type === "image" && block.content.imageUrl) {
          htmlContent += `<img src="${block.content.imageUrl}" alt="Newsletter image" />`;
        } else if (block.type === "button") {
          htmlContent += `<a href="${block.content.buttonUrl}">${isES && block.content.buttonTextEs ? block.content.buttonTextEs : block.content.buttonText}</a>`;
        } else if (block.type === "divider") {
          htmlContent += `<hr />`;
        }
      });

      // Get selected emails if in selected mode
      const selectedEmails = sendMode === "selected"
        ? subscribers
            .filter(s => selectedSubscribers.has(s.id))
            .map(s => s.email)
        : [];

      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken() ?? ""}`,
        },
        body: JSON.stringify({
          subject,
          content: htmlContent,
          sendMode,
          selectedEmails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({ success: true, message: data.message });
        setShowBuilder(false);
        setSelectedTemplate(null);
        setBlocks([]);
        setSubject("");
        setSelectedSubscribers(new Set());
        setSendMode("all");
        fetchHistory();
      } else {
        setSendResult({ success: false, message: data.error || (isES ? "Error al enviar" : "Error sending") });
      }
    } catch {
      setSendResult({ success: false, message: isES ? "Error de conexión. Intenta nuevamente." : "Connection error. Please try again." });
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
    <PageShell>
      <PageHeader
        title="Newsletter"
        description={language === "es" ? "Gestiona los suscriptores y envía newsletters" : "Manage subscribers and send newsletters"}
        actions={
          activeTab === "subscribers" ? (
            <AdminButton icon={<Download className="w-4 h-4" />} onClick={exportCSV}>
              {language === "es" ? "Exportar CSV" : "Export CSV"}
            </AdminButton>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-low">
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "subscribers"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
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
              : "border-transparent text-on-surface-variant hover:text-on-surface"
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
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <History className="w-4 h-4" />
          {language === "es" ? "Historial" : "History"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={language === "es" ? "Total Suscriptores" : "Total Subscribers"} value={subscribers.length} icon={<Mail className="w-5 h-5" />} loading={loading} />
        <StatCard label={language === "es" ? "Activos" : "Active"} value={activeSubscribers} icon={<Users className="w-5 h-5" />} tone="success" loading={loading} />
        <StatCard label={language === "es" ? "Últimos 30 días" : "Last 30 days"} value={recentSubscribers} icon={<Clock className="w-5 h-5" />} tone="info" loading={loading} />
      </div>

      {/* Tab Content */}
      {activeTab === "subscribers" && (
        <>
          <Toolbar>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={language === "es" ? "Buscar suscriptores..." : "Search subscribers..."}
            />
          </Toolbar>

          <Card>
            <Table>
              <Thead>
                <Th>Email</Th>
                <Th>{language === "es" ? "Nombre" : "Name"}</Th>
                <Th>{language === "es" ? "Estado" : "Status"}</Th>
                <Th>{language === "es" ? "Fuente" : "Source"}</Th>
                <Th>{language === "es" ? "Fecha" : "Date"}</Th>
                <Th align="right">{language === "es" ? "Acciones" : "Actions"}</Th>
              </Thead>
              <Tbody>
                {loading ? (
                  <TableSkeleton rows={5} cols={6} />
                ) : filteredSubscribers.length === 0 ? (
                  <TableEmpty colSpan={6}>{language === "es" ? "No se encontraron suscriptores" : "No subscribers found"}</TableEmpty>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <Tr key={subscriber.id}>
                      <Td><span className="font-medium text-on-surface">{subscriber.email}</span></Td>
                      <Td>{subscriber.name || "—"}</Td>
                      <Td><StatusBadge status={subscriber.status}>{subscriber.status}</StatusBadge></Td>
                      <Td>{subscriber.source}</Td>
                      <Td>{formatDate(subscriber.subscribed_at)}</Td>
                      <Td align="right">
                        <button onClick={() => handleDelete(subscriber.id)} title={language === "es" ? "Eliminar" : "Delete"} className="p-2 text-on-surface-variant hover:text-red-600 rounded-md hover:bg-surface-low">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Card>
        </>
      )}

      {activeTab === "send" && (
        <>
          {sendResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              sendResult.success
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {sendResult.message}
              {sendResult.success && (
                <button
                  onClick={() => setSendResult(null)}
                  className="ml-4 text-sm underline"
                >
                  {isES ? "Cerrar" : "Close"}
                </button>
              )}
            </div>
          )}

          {!showBuilder ? (
            <>
              {/* Template Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-on-surface mb-4">
                  {isES ? "Elige una Plantilla" : "Choose a Template"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {newsletterTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="group relative rounded-xl overflow-hidden border-2 border-outline-low/20 hover:border-primary transition-all hover:shadow-lg text-left"
                    >
                      {/* Template Preview Header */}
                      <div
                        className="p-6 text-white"
                        style={{ backgroundColor: template.headerColor }}
                      >
                        <h3 className="text-xl font-bold mb-1">
                          {isES ? template.nameEs : template.name}
                        </h3>
                        <p className="text-sm opacity-80">
                          {isES ? template.descriptionEs : template.description}
                        </p>
                      </div>
                      {/* Template Accent */}
                      <div className="p-4 bg-surface-lowest">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: template.accentColor }}
                          />
                          <span className="text-xs text-on-surface-variant">
                            {template.blocks.length} {isES ? "bloques" : "blocks"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Newsletter Builder */}
              <div className="mb-6">
                <button
                  onClick={() => { setShowBuilder(false); setBlocks([]); setSubject(""); setSubjectEs(""); }}
                  className="text-sm text-primary hover:underline flex items-center gap-1 mb-4"
                >
                  ← {isES ? "Volver a plantillas" : "Back to templates"}
                </button>
                <NewsletterBuilder
                  template={selectedTemplate}
                  subject={subject}
                  subjectEs={subjectEs}
                  onSubjectChange={setSubject}
                  onSubjectChangeEs={setSubjectEs}
                  blocks={blocks}
                  onBlocksChange={setBlocks}
                />
              </div>

              {/* Send Button */}
              <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-low/10 p-6 mt-6">
                {/* Send Mode Toggle */}
                <div className="mb-4 pb-4 border-b border-outline-low/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-on-surface-variant" />
                    <h3 className="text-lg font-semibold text-on-surface">
                      {isES ? "Destinatarios" : "Recipients"}
                    </h3>
                  </div>
                  <div className="flex gap-2 mb-3 bg-surface-low p-1 rounded-lg w-fit">
                    <button
                      onClick={() => setSendMode("all")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        sendMode === "all"
                          ? "bg-primary text-white shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {isES ? "Todos" : "All"} ({activeSubscribers})
                    </button>
                    <button
                      onClick={() => setSendMode("selected")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        sendMode === "selected"
                          ? "bg-primary text-white shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {isES ? "Seleccionados" : "Selected"} ({selectedSubscribers.size})
                    </button>
                  </div>

                  {/* Selected Subscribers List */}
                  {sendMode === "selected" && (
                    <div className="border border-outline-low/20 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                      <div className="p-2 bg-surface-low border-b border-outline-low/10 flex gap-2">
                        <button
                          onClick={selectAllSubscribers}
                          className="text-xs text-primary hover:underline"
                        >
                          {isES ? "Seleccionar todos" : "Select all"}
                        </button>
                        <span className="text-outline-low">|</span>
                        <button
                          onClick={deselectAllSubscribers}
                          className="text-xs text-primary hover:underline"
                        >
                          {isES ? "Deseleccionar todos" : "Deselect all"}
                        </button>
                      </div>
                      {subscribers.filter(s => s.status === "active").map((subscriber) => (
                        <label
                          key={subscriber.id}
                          className="flex items-center gap-3 p-3 hover:bg-surface-low cursor-pointer border-b border-outline-low/5 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.has(subscriber.id)}
                            onChange={() => toggleSubscriberSelection(subscriber.id)}
                            className="w-4 h-4 text-primary border-outline-low/30 rounded focus:ring-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-on-surface truncate">
                              {subscriber.email}
                            </p>
                            {subscriber.name && (
                              <p className="text-xs text-on-surface-variant truncate">
                                {subscriber.name}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface">
                      {isES ? "Enviar Newsletter" : "Send Newsletter"}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      {isES
                        ? `Se enviará a ${sendMode === "all" ? activeSubscribers : selectedSubscribers.size} suscriptores`
                        : `Will be sent to ${sendMode === "all" ? activeSubscribers : selectedSubscribers.size} subscribers`}
                    </p>
                  </div>
                  <button
                    onClick={handleSendNewsletter}
                    disabled={sending || blocks.length === 0 || !subject.trim() || (sendMode === "selected" && selectedSubscribers.size === 0)}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    {sending
                      ? (isES ? "Enviando..." : "Sending...")
                      : (isES ? "Enviar" : "Send")}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "history" && (
        <Card>
          <CardHeader title={language === "es" ? "Historial de Newsletters Enviados" : "Sent Newsletter History"} icon={<History className="w-4 h-4 text-primary" />} />
          <CardBody className="p-0 divide-y divide-outline-low">
            {loadingHistory ? (
              <p className="px-4 py-12 text-center text-sm text-on-surface-variant">{language === "es" ? "Cargando historial..." : "Loading history..."}</p>
            ) : history.length === 0 ? (
              <EmptyState title={language === "es" ? "No hay newsletters enviados aún" : "No newsletters sent yet"} />
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-surface-low transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-outline" />
                        <h3 className="font-medium text-on-surface">{entry.subject}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-on-surface-variant flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(entry.sent_at)}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{entry.total_sent} {language === "es" ? "enviados" : "sent"}</span>
                        {entry.total_failed > 0 && (
                          <span className="text-red-600">{entry.total_failed} {language === "es" ? "fallidos" : "failed"}</span>
                        )}
                        <StatusBadge status={entry.status === "completed" ? "success" : "warning"}>
                          {entry.status === "completed" ? (language === "es" ? "Completado" : "Completed") : (language === "es" ? "Con errores" : "With errors")}
                        </StatusBadge>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteHistory(entry.id)} title={language === "es" ? "Eliminar" : "Delete"} className="p-2 text-on-surface-variant hover:text-red-600 rounded-md hover:bg-surface-low">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}
    </PageShell>
  );
}
