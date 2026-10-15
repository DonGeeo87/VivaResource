"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2, Edit, Eye, Copy, BarChart3, Archive } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PageShell,
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  StatusBadge,
  Toolbar,
  SearchInput,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmpty,
  TableSkeleton,
  Pagination,
} from "@/components/admin";

import { db, Timestamp, collection, deleteDoc, doc, getDocs, orderBy, query } from "@/lib/db-client";

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

const PAGE_SIZE = 10;

export default function AdminFormsPage(): JSX.Element {
  const { language } = useLanguage();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const q = query(collection(db, "forms"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Form[];
      setForms(data);
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        language === "es"
          ? "¿Estás seguro de eliminar este formulario? Esta acción no se puede deshacer."
          : "Are you sure you want to delete this form? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "forms", id));
        setForms(forms.filter((f) => f.id !== id));
      } catch (error) {
        console.error("Error deleting form:", error);
      }
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "published":
        return language === "es" ? "Publicado" : "Published";
      case "draft":
        return language === "es" ? "Borrador" : "Draft";
      case "closed":
        return language === "es" ? "Cerrado" : "Closed";
      default:
        return status;
    }
  };

  const formatDate = (createdAt: Timestamp | Date) =>
    createdAt instanceof Timestamp
      ? createdAt.toDate().toLocaleDateString(language === "es" ? "es-ES" : "en-US")
      : new Date(createdAt).toLocaleDateString(language === "es" ? "es-ES" : "en-US");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return forms;
    return forms.filter(
      (f) =>
        f.title?.toLowerCase().includes(term) ||
        f.titleEs?.toLowerCase().includes(term)
    );
  }, [forms, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell>
      <PageHeader
        title={language === "es" ? "Formularios" : "Forms"}
        description={language === "es" ? "Crea formularios y encuestas personalizadas" : "Create custom forms and surveys"}
        actions={
          <Link
            href="/admin/forms/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-primary bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            {language === "es" ? "Nuevo Formulario" : "New Form"}
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={language === "es" ? "Total Formularios" : "Total Forms"} value={forms.length} icon={<FileText className="w-5 h-5" />} loading={loading} />
        <StatCard label={language === "es" ? "Publicados" : "Published"} value={forms.filter((f) => f.status === "published").length} icon={<Eye className="w-5 h-5" />} tone="success" loading={loading} />
        <StatCard label={language === "es" ? "Borradores" : "Drafts"} value={forms.filter((f) => f.status === "draft").length} icon={<Edit className="w-5 h-5" />} tone="warning" loading={loading} />
        <StatCard label={language === "es" ? "Cerrados" : "Closed"} value={forms.filter((f) => f.status === "closed").length} icon={<Archive className="w-5 h-5" />} tone="neutral" loading={loading} />
      </div>

      {/* Listado */}
      <Card>
        <CardHeader
          title={language === "es" ? "Todos los formularios" : "All forms"}
          actions={<span className="text-xs text-on-surface-variant tabular-nums">{filtered.length}</span>}
        />
        <CardBody className="space-y-4">
          <Toolbar>
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder={language === "es" ? "Buscar formulario..." : "Search form..."}
            />
          </Toolbar>

          <div className="-mx-4 border-y border-outline-low">
            <Table>
              <Thead>
                <Th>{language === "es" ? "Título" : "Title"}</Th>
                <Th>{language === "es" ? "Estado" : "Status"}</Th>
                <Th>{language === "es" ? "Campos" : "Fields"}</Th>
                <Th>{language === "es" ? "Evento" : "Event"}</Th>
                <Th>{language === "es" ? "Fecha" : "Date"}</Th>
                <Th align="right">{language === "es" ? "Acciones" : "Actions"}</Th>
              </Thead>
              <Tbody>
                {loading ? (
                  <TableSkeleton rows={4} cols={6} />
                ) : pageItems.length === 0 ? (
                  <TableEmpty colSpan={6}>
                    {search
                      ? language === "es" ? "Sin resultados" : "No results"
                      : language === "es" ? "No hay formularios creados" : "No forms created yet"}
                  </TableEmpty>
                ) : (
                  pageItems.map((form) => (
                    <Tr key={form.id}>
                      <Td>
                        <span className="font-medium text-on-surface">{form.title}</span>
                        {form.titleEs && <span className="block text-xs text-on-surface-variant">{form.titleEs}</span>}
                      </Td>
                      <Td><StatusBadge status={form.status}>{statusLabel(form.status)}</StatusBadge></Td>
                      <Td><span className="tabular-nums">{form.fields?.length || 0}</span></Td>
                      <Td>
                        {form.eventId ? (
                          <Link href={`/admin/events/${form.eventId}`} className="text-primary hover:underline">
                            {language === "es" ? "Ver evento" : "View event"}
                          </Link>
                        ) : (
                          <span className="text-outline">—</span>
                        )}
                      </Td>
                      <Td>{formatDate(form.createdAt)}</Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/forms/${form.id}`} target="_blank" title={language === "es" ? "Ver formulario público" : "View public form"} className="p-2 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-low">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link href={`/admin/forms/${form.id}`} title={language === "es" ? "Editar" : "Edit"} className="p-2 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-low">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link href={`/admin/forms/${form.id}/responses`} title={language === "es" ? "Ver respuestas" : "View responses"} className="p-2 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-low">
                            <BarChart3 className="w-4 h-4" />
                          </Link>
                          <Link href={`/admin/forms/duplicate/${form.id}`} title={language === "es" ? "Duplicar" : "Duplicate"} className="p-2 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-low">
                            <Copy className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(form.id)} title={language === "es" ? "Eliminar" : "Delete"} className="p-2 text-on-surface-variant hover:text-red-600 rounded-md hover:bg-surface-low">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </CardBody>
      </Card>
    </PageShell>
  );
}
