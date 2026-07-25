"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Sparkles, Check, X } from "lucide-react";
import { blogTemplates } from "@/data/blog-templates";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  language: "en" | "es";
  status: string;
  published: boolean;
  created_at: string;
}

export default function AdminV2BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [publishing, setPublishing] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/v2/blog/list?lang=all");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error("Error fetching posts:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishTemplate = async (slug: string) => {
    setPublishing(slug);
    setPublishResult(null);
    try {
      const res = await fetch("/api/blog/publish-template", {
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/v2/blog/update?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch {
      alert("Error deleting post");
    } finally {
      setDeleting(null);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ||
      (filter === "published" && post.published) ||
      (filter === "draft" && !post.published);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Admin (PG)</h1>
          <p className="text-gray-600 mt-1">Manage blog posts via PostgreSQL</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-500">PostgreSQL</span>
        </div>
      </div>

      {/* Auto-Publish Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-900">Auto-Publish</h2>
        </div>
        {publishResult && (
          <div className={`mb-3 p-3 rounded-lg text-sm ${publishResult.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {publishResult.message}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {blogTemplates.map((template) => (
            <button
              key={template.slug}
              onClick={() => handlePublishTemplate(template.slug)}
              disabled={publishing === template.slug}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-primary/5 border border-gray-200 rounded-lg transition-colors disabled:opacity-50 text-left"
            >
              <Sparkles className={`w-4 h-4 flex-shrink-0 ${publishing === template.slug ? "animate-pulse text-primary" : "text-gray-400"}`} />
              <span className="truncate">{template.titleEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
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
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
              ) : filteredPosts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No posts found</td></tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.language === "es" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {post.language === "es" ? "ES" : "EN"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-gray-600">{post.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deleting === post.id}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
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

      <div className="mt-4 text-sm text-gray-400">
        Total: {posts.length} posts ({posts.filter(p => p.published).length} published, {posts.filter(p => !p.published).length} drafts)
      </div>
    </div>
  );
}
