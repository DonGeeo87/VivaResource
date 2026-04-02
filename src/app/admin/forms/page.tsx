"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2, Edit, Eye, Copy, BarChart3 } from "lucide-react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface Form {
  id: string;
  title: string;
  titleEs?: string;
  description: string;
  status: string;
  eventId?: string;
  fields: { id: string }[];
  createdAt: Timestamp | Date;
}

export default function AdminFormsPage(): JSX.Element {
  const { language } = useLanguage();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const q = query(
        collection(db, "forms"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Form[];
      setForms(data);
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === "es" ? "¿Estás seguro de eliminar este formulario? Esta acción no se puede deshacer." : "Are you sure you want to delete this form? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "forms", id));
        setForms(forms.filter(f => f.id !== id));
      } catch (error) {
        console.error("Error deleting form:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'closed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return language === "es" ? "Publicado" : "Published";
      case 'draft':
        return language === "es" ? "Borrador" : "Draft";
      case 'closed':
        return language === "es" ? "Cerrado" : "Closed";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{language === "es" ? "Formularios" : "Forms"}</h1>
          <p className="text-gray-600 mt-1">{language === "es" ? "Crea formularios y encuestas personalizadas" : "Create custom forms and surveys"}</p>
        </div>
        <Link
          href="/admin/forms/new"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          {language === "es" ? "Nuevo Formulario" : "New Form"}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
              <p className="text-sm text-gray-600">{language === "es" ? "Total Formularios" : "Total Forms"}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {forms.filter(f => f.status === 'published').length}
            </p>
            <p className="text-sm text-gray-600">{language === "es" ? "Publicados" : "Published"}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {forms.filter(f => f.status === 'draft').length}
            </p>
            <p className="text-sm text-gray-600">{language === "es" ? "Borradores" : "Drafts"}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-600">{language === "es" ? "Respuestas (ver detalle)" : "Responses (see detail)"}</p>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "es" ? "Título" : "Title"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "es" ? "Estado" : "Status"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "es" ? "Campos" : "Fields"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "es" ? "Evento" : "Event"}
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
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-12 bg-gray-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {language === "es" ? "No hay formularios creados" : "No forms created yet"}
                  </td>
                </tr>
              ) : (
                forms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{form.title}</div>
                      {form.titleEs && (
                        <div className="text-sm text-gray-500">{form.titleEs}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(form.status)}`}>
                        {getStatusText(form.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{form.fields?.length || 0} {language === "es" ? "campos" : "fields"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {form.eventId ? (
                        <Link
                          href={`/admin/events/${form.eventId}`}
                          className="text-primary hover:underline text-sm"
                        >
                          {language === "es" ? "Ver evento" : "View event"}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">
                        {form.createdAt instanceof Timestamp
                          ? form.createdAt.toDate().toLocaleDateString("es-ES")
                          : new Date(form.createdAt).toLocaleDateString("es-ES")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/forms/${form.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                           title={language === "es" ? "Ver formulario público" : "View public form"}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/forms/${form.id}`}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                           title={language === "es" ? "Editar" : "Edit"}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/forms/${form.id}/responses`}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                           title={language === "es" ? "Ver respuestas" : "View responses"}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/forms/duplicate/${form.id}`}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                           title={language === "es" ? "Duplicar" : "Duplicate"}
                        >
                          <Copy className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                           title={language === "es" ? "Eliminar" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
