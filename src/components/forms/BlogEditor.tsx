"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ImageUpload from "@/components/ImageUpload";

// Dynamic import to avoid SSR issues with react-quill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const categories = [
  { value: "news", label: "Noticias" },
  { value: "impact", label: "Historias de Impacto" },
  { value: "resources", label: "Recursos" },
  { value: "events", label: "Eventos" }
];

export interface BlogFormData {
  title_en: string;
  title_es: string;
  slug: string;
  excerpt_en: string;
  excerpt_es: string;
  content_en: string;
  content_es: string;
  category: string;
  featured_image: string;
  author: string;
  published: boolean;
  status: string;
}

interface BlogEditorProps {
  initialData?: BlogFormData | null;
  onSubmit: (data: BlogFormData) => void;
  onCancel: () => void;
  saving: boolean;
  isEditing: boolean;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    [{ align: [] }],
    ["clean"]
  ]
};

const quillFormats = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "blockquote", "code-block",
  "link", "image",
  "align"
];

export default function BlogEditor({
  initialData,
  onSubmit,
  onCancel,
  saving,
  isEditing
}: BlogEditorProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    title_en: "",
    title_es: "",
    slug: "",
    excerpt_en: "",
    excerpt_es: "",
    content_en: "",
    content_es: "",
    category: "news",
    featured_image: "",
    author: "",
    published: false,
    status: "draft"
  });

  const [langTab, setLangTab] = useState<"en" | "es">("en");

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleChange = (field: keyof BlogFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Auto-generate slug from English title only when creating
      if (field === "title_en" && !isEditing) {
        newData.slug = generateSlug(value as string);
      }
      // Sync status with published boolean
      if (field === "published") {
        newData.status = value ? "published" : "draft";
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-200 px-6 pt-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setLangTab("en")}
                  className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                    langTab === "en"
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab("es")}
                  className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                    langTab === "es"
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Español
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {langTab === "en" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => handleChange("title_en", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt_en}
                      onChange={(e) => handleChange("excerpt_en", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <div className="min-h-[300px] bg-white">
                      <ReactQuill
                        theme="snow"
                        value={formData.content_en}
                        onChange={(value) => handleChange("content_en", value)}
                        modules={quillModules}
                        formats={quillFormats}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.title_es}
                      onChange={(e) => handleChange("title_es", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extracto
                    </label>
                    <textarea
                      value={formData.excerpt_es}
                      onChange={(e) => handleChange("excerpt_es", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contenido
                    </label>
                    <div className="min-h-[300px] bg-white">
                      <ReactQuill
                        theme="snow"
                        value={formData.content_es}
                        onChange={(value) => handleChange("content_es", value)}
                        modules={quillModules}
                        formats={quillFormats}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publication Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-lg mb-4">Publicación</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => handleChange("author", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Publicado
                </label>
                <button
                  type="button"
                  onClick={() => handleChange("published", !formData.published)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.published ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.published ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <ImageUpload
              value={formData.featured_image}
              onChange={(url) => handleChange("featured_image", url)}
              path="blog"
              label="Imagen destacada"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : isEditing ? "Actualizar Post" : "Crear Post"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-4 rounded-lg font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
