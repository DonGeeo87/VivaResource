"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Sparkles, FileText, CheckCircle2, FileEdit } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { blogTemplates } from "@/data/blog-templates";
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
  FilterSelect,
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

import { db, collection, deleteDoc, doc, getDocs, orderBy, query } from "@/lib/db-client";
import { authFetch } from "@/lib/auth/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  language: "en" | "es";
  published: boolean;
  created_at: unknown;
}

const PAGE_SIZE = 10;

export default function AdminBlogPage(): JSX.Element {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "blog_posts"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as BlogPost[];
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === "es" ? "¿Estás seguro de eliminar este post?" : "Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "blog_posts", id));
        setPosts(posts.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handlePublishTemplate = async (slug: string) => {
    setPublishing(slug);
    setPublishResult(null);
    try {
      const res = await authFetch("/api/blog/publish-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      setPublishResult({ success: data.success, message: data.message || data.error });
      if (data.success) fetchPosts();
    } catch {
      setPublishResult({ success: false, message: "Error publishing" });
    } finally {
      setPublishing(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch = !term || (post.title?.toLowerCase() ?? "").includes(term);
      const matchesFilter =
        filter === "all" ||
        (filter === "published" && post.published) ||
        (filter === "draft" && !post.published);
      return matchesSearch && matchesFilter;
    });
  }, [posts, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatDate = (value: unknown) =>
    value && typeof value === "object" && "toDate" in value
      ? (value as { toDate: () => Date }).toDate().toLocaleDateString(language === "es" ? "es-ES" : "en-US")
      : "—";

  return (
    <PageShell>
      <PageHeader
        title={language === "es" ? "Publicaciones del Blog" : "Blog Posts"}
        description={language === "es" ? "Gestiona los artículos del blog" : "Manage blog articles"}
        actions={
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-primary bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            {language === "es" ? "Nuevo Post" : "New Post"}
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={language === "es" ? "Total" : "Total"} value={posts.length} icon={<FileText className="w-5 h-5" />} loading={loading} />
        <StatCard label={language === "es" ? "Publicados" : "Published"} value={posts.filter((p) => p.published).length} icon={<CheckCircle2 className="w-5 h-5" />} tone="success" loading={loading} />
        <StatCard label={language === "es" ? "Borradores" : "Drafts"} value={posts.filter((p) => !p.published).length} icon={<FileEdit className="w-5 h-5" />} tone="warning" loading={loading} />
      </div>

      <Card>
        <CardHeader title={language === "es" ? "Publicación automática" : "Auto-publish"} icon={<Sparkles className="w-4 h-4 text-primary" />} />
        <CardBody className="space-y-3">
          {publishResult && (
            <div className={`p-3 rounded-md text-sm border ${publishResult.success ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {publishResult.message}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {blogTemplates.map((template) => (
              <button
                key={template.slug}
                onClick={() => handlePublishTemplate(template.slug)}
                disabled={publishing === template.slug}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-surface-low hover:bg-primary/5 border border-outline-low rounded-md transition-colors disabled:opacity-50 text-left"
              >
                <Sparkles className={`w-4 h-4 flex-shrink-0 ${publishing === template.slug ? "animate-pulse text-primary" : "text-outline"}`} />
                <span className="truncate">{language === "es" ? template.titleEs : template.titleEn}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={language === "es" ? "Todos los posts" : "All posts"}
          actions={<span className="text-xs text-on-surface-variant tabular-nums">{filtered.length}</span>}
        />
        <CardBody className="space-y-4">
          <Toolbar>
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder={language === "es" ? "Buscar posts..." : "Search posts..."}
            />
            <FilterSelect value={filter} onChange={(v) => { setFilter(v); setPage(1); }}>
              <option value="all">{language === "es" ? "Todos" : "All"}</option>
              <option value="draft">{language === "es" ? "Borradores" : "Drafts"}</option>
              <option value="published">{language === "es" ? "Publicados" : "Published"}</option>
            </FilterSelect>
          </Toolbar>

          <div className="-mx-4 border-y border-outline-low">
            <Table>
              <Thead>
                <Th>{language === "es" ? "Título" : "Title"}</Th>
                <Th>{language === "es" ? "Idioma" : "Language"}</Th>
                <Th>{language === "es" ? "Categoría" : "Category"}</Th>
                <Th>{language === "es" ? "Estado" : "Status"}</Th>
                <Th>{language === "es" ? "Fecha" : "Date"}</Th>
                <Th align="right">{language === "es" ? "Acciones" : "Actions"}</Th>
              </Thead>
              <Tbody>
                {loading ? (
                  <TableSkeleton rows={4} cols={6} />
                ) : pageItems.length === 0 ? (
                  <TableEmpty colSpan={6}>
                    {search ? (language === "es" ? "Sin resultados" : "No results") : (language === "es" ? "No hay posts todavía" : "No posts yet")}
                  </TableEmpty>
                ) : (
                  pageItems.map((post) => (
                    <Tr key={post.id}>
                      <Td>
                        <span className="font-medium text-on-surface">{post.title}</span>
                        <span className="block text-xs text-on-surface-variant">{post.slug}</span>
                      </Td>
                      <Td><StatusBadge tone={post.language === "es" ? "info" : "brand"}>{post.language === "es" ? "ES" : "EN"}</StatusBadge></Td>
                      <Td><span className="capitalize">{post.category}</span></Td>
                      <Td><StatusBadge status={post.published ? "published" : "draft"}>{post.published ? (language === "es" ? "Publicado" : "Published") : (language === "es" ? "Borrador" : "Draft")}</StatusBadge></Td>
                      <Td>{formatDate(post.created_at)}</Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`${post.language === "es" ? "/es" : ""}/blog/${post.slug}`} target="_blank" title={language === "es" ? "Ver" : "View"} className="p-2 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-low">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link href={`/admin/blog/${post.id}`} title={language === "es" ? "Editar" : "Edit"} className="p-2 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-low">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(post.id)} title={language === "es" ? "Eliminar" : "Delete"} className="p-2 text-on-surface-variant hover:text-red-600 rounded-md hover:bg-surface-low">
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
