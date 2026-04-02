"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogPost {
  id: string;
  title_en: string;
  title_es: string;
  slug: string;
  category: string;
  published: boolean;
  created_at: unknown;
}

export default function AdminBlogPage(): JSX.Element {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "blog_posts"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
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
        setPosts(posts.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title_en.toLowerCase().includes(search.toLowerCase()) ||
      post.title_es?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ||
      (filter === "published" && post.published) ||
      (filter === "draft" && !post.published);
    return matchesSearch && matchesFilter;
  });

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700"
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{language === "es" ? "Publicaciones del Blog" : "Blog Posts"}</h1>
          <p className="text-gray-600 mt-1">{language === "es" ? "Gestiona los artículos del blog" : "Manage blog articles"}</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          {language === "es" ? "Nuevo Post" : "New Post"}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === "es" ? "Buscar posts..." : "Search posts..."}
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
            <option value="all">{language === "es" ? "Todos" : "All"}</option>
            <option value="draft">{language === "es" ? "Borrador" : "Draft"}</option>
            <option value="published">{language === "es" ? "Publicados" : "Published"}</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "es" ? "Título" : "Title"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "es" ? "Categoría" : "Category"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "es" ? "Estado" : "Status"}
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
                <>
                  {[1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-28 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {language === "es" ? "No se encontraron posts" : "No posts found"}
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{post.title_en}</div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-gray-600">{post.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.published ? statusColors.published : statusColors.draft
                      }`}>
                        {post.published
                          ? (language === "es" ? "Publicado" : "Published")
                          : (language === "es" ? "Borrador" : "Draft")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.created_at && typeof post.created_at === 'object' && 'toDate' in post.created_at 
                        ? (post.created_at as { toDate: () => Date }).toDate().toLocaleDateString() 
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
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
