"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Trash2,
  Eye,
  X,
  Calendar,
  Mail,
  User,
  BarChart3,
  Send,
} from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { FormField } from "@/types/forms";
import ConfirmModal from "@/components/ConfirmModal";

interface FormSubmission {
  id: string;
  formId: string;
  responses: Record<string, string | string[]>;
  submittedAt: Timestamp | Date;
  email?: string;
}

interface Form {
  id: string;
  title: string;
  titleEs?: string;
  description: string;
  descriptionEs?: string;
  fields: FormField[];
  status: string;
}

export default function FormResponsesPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form
        const formDoc = await getDoc(doc(db, "forms", formId));
        if (!formDoc.exists()) {
          router.push("/admin/forms");
          return;
        }
        setForm({ id: formDoc.id, ...formDoc.data() } as Form);

        // Fetch submissions
        const q = query(
          collection(db, "form_submissions"),
          where("formId", "==", formId),
          orderBy("submittedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as FormSubmission[];
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId, router]);

  const handleDeleteSubmission = async (submissionId: string) => {
    const confirmMsg =
      language === "es"
        ? "¿Estás seguro de eliminar esta respuesta? Esta acción no se puede deshacer."
        : "Are you sure you want to delete this response? This action cannot be undone.";
    if (!confirm(confirmMsg)) return;

    setDeleting(submissionId);
    try {
      await deleteDoc(doc(db, "form_submissions", submissionId));
      setSubmissions(submissions.filter((s) => s.id !== submissionId));
    } catch (error) {
      console.error("Error deleting submission:", error);
    } finally {
      setDeleting(null);
    }
  };

  const exportToCSV = () => {
    if (!form || submissions.length === 0) return;

    const headers = [
      language === "es" ? "Nombre" : "Name",
      language === "es" ? "Correo" : "Email",
      language === "es" ? "Fecha de envío" : "Submitted At",
      ...form.fields.map((f) => (language === "es" && f.labelEs ? f.labelEs : f.label)),
    ];

    const rows = submissions.map((sub) => {
      const rowData = [
        sub.email ? sub.email.split('@')[0] : "",
        sub.email || "",
        formatTimestamp(sub.submittedAt),
        ...form.fields.map((field) => {
          const value = sub.responses[field.id];
          if (Array.isArray(value)) return value.join(", ");
          return value?.toString() || "";
        }),
      ];
      return rowData;
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.title.replace(/\s+/g, "_")}_responses.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const [sendingSummary, setSendingSummary] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const sendSummaryEmail = async () => {
    if (!form) return;
    
    setShowConfirmModal(false);
    setSendingSummary(true);
    try {
      const response = await fetch("/api/email/send-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "form",
          id: formId,
          data: { language },
        }),
      });

      if (response.ok) {
        alert(language === "es" ? "¡Resumen enviado exitosamente!" : "Summary sent successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send summary");
      }
    } catch (error) {
      console.error("Error sending summary:", error);
      alert(language === "es" ? "Error al enviar el resumen: " + (error instanceof Error ? error.message : "") : "Error sending summary");
    } finally {
      setSendingSummary(false);
    }
  };

  const formatTimestamp = (ts: Timestamp | Date): string => {
    const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
    return date.toLocaleString(language === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLastSubmissionDate = (): string => {
    if (submissions.length === 0) return "-";
    return formatTimestamp(submissions[0].submittedAt);
  };

  const getFieldLabel = (field: FormField): string => {
    return language === "es" && field.labelEs ? field.labelEs : field.label;
  };

  const renderFieldValue = (field: FormField, value: string | string[] | undefined): string => {
    if (value === undefined || value === null || value === "") return "-";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="animate-pulse bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="h-10 w-full bg-gray-200 rounded mb-4" />
          <div className="h-10 w-full bg-gray-200 rounded mb-4" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {language === "es" ? "Formulario no encontrado" : "Form not found"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/forms"
            className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === "es" && form.titleEs ? form.titleEs : form.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === "es" ? "Respuestas del formulario" : "Form Responses"}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {language === "es" ? "Enviar Resumen" : "Send Summary"}
          </button>
          <button
            onClick={exportToCSV}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {language === "es" ? "Exportar CSV" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              <p className="text-sm text-gray-600">
                {language === "es" ? "Total respuestas" : "Total responses"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{getLastSubmissionDate()}</p>
              <p className="text-sm text-gray-600">
                {language === "es" ? "Última respuesta" : "Last response"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {submissions.filter((s) => s.email).length}
              </p>
              <p className="text-sm text-gray-600">
                {language === "es" ? "Con correo" : "With email"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === "es" ? "Sin respuestas aún" : "No responses yet"}
          </h3>
          <p className="text-gray-500">
            {language === "es"
              ? "Las respuestas aparecerán aquí cuando alguien complete el formulario."
              : "Responses will appear here when someone completes the form."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "es" ? "Respondiente" : "Respondent"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "es" ? "Correo" : "Email"}
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
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {sub.email ? sub.email.split('@')[0] : (language === "es" ? "Anónimo" : "Anonymous")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">
                        {sub.email || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">
                        {formatTimestamp(sub.submittedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                          title={language === "es" ? "Ver respuesta" : "View response"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubmission(sub.id)}
                          disabled={deleting === sub.id}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          title={language === "es" ? "Eliminar" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {sub.email ? sub.email.split('@')[0] : (language === "es" ? "Anónimo" : "Anonymous")}
                      </p>
                      <p className="text-sm text-gray-500">{sub.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="p-2 text-gray-400 hover:text-primary rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubmission(sub.id)}
                      disabled={deleting === sub.id}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTimestamp(sub.submittedAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {language === "es" ? "Detalle de respuesta" : "Response Detail"}
              </h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Respondent Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {language === "es" ? "Nombre" : "Name"}
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedSubmission.email ? selectedSubmission.email.split('@')[0] : (language === "es" ? "Anónimo" : "Anonymous")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {language === "es" ? "Correo" : "Email"}
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedSubmission.email || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">
                      {language === "es" ? "Fecha de envío" : "Submitted At"}
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatTimestamp(selectedSubmission.submittedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Responses */}
              <div className="space-y-4">
                {form.fields.map((field) => (
                  <div key={field.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {getFieldLabel(field)}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {renderFieldValue(field, selectedSubmission.responses[field.id])}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {language === "es" ? "Cerrar" : "Close"}
              </button>
              <button
                onClick={() => {
                  handleDeleteSubmission(selectedSubmission.id);
                  setSelectedSubmission(null);
                }}
                disabled={deleting === selectedSubmission.id}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {language === "es" ? "Eliminar" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title={language === "es" ? "Enviar Resumen por Email" : "Send Summary Email"}
        message={language === "es"
          ? "Se enviará un resumen completo de todas las respuestas de este formulario a los administradores configurados."
          : "A complete summary of all form responses will be sent to the configured administrators."}
        confirmText={language === "es" ? "Enviar Resumen" : "Send Summary"}
        cancelText={language === "es" ? "Cancelar" : "Cancel"}
        onConfirm={sendSummaryEmail}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={sendingSummary}
      />
    </div>
  );
}
