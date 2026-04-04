"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ImageUpload from "@/components/ImageUpload";

// Dynamic import to avoid SSR issues with react-quill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const categories = [
  { value: "news", labelEn: "News", labelEs: "Noticias" },
  { value: "impact", labelEn: "Impact Stories", labelEs: "Historias de Impacto" },
  { value: "resources", labelEn: "Resources", labelEs: "Recursos" },
  { value: "events", labelEn: "Events", labelEs: "Eventos" }
];

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  author: string;
  language: "en" | "es";
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

const labels = {
  en: {
    language: "Language",
    title: "Title",
    excerpt: "Excerpt",
    content: "Content",
    category: "Category",
    slug: "Slug",
    author: "Author",
    published: "Published",
    imageLabel: "Featured image",
    publishSettings: "Publication",
    saving: "Saving...",
    create: "Create Post",
    update: "Update Post",
    cancel: "Cancel"
  },
  es: {
    language: "Idioma",
    title: "Título",
    excerpt: "Extracto",
    content: "Contenido",
    category: "Categoría",
    slug: "Slug",
    author: "Autor",
    published: "Publicado",
    imageLabel: "Imagen destacada",
    publishSettings: "Publicación",
    saving: "Guardando...",
    create: "Crear Post",
    update: "Actualizar Post",
    cancel: "Cancelar"
  }
};

export default function BlogEditor({
  initialData,
  onSubmit,
  onCancel,
  saving,
  isEditing
}: BlogEditorProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "news",
    featured_image: "",
    author: "",
    language: "en",
    published: false,
    status: "draft"
  });

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const lang = formData.language;
  const l = labels[lang];

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleChange = (field: keyof BlogFormData, value: string | boolean) => {
    setFormData(prev => {
      // Reset content fields when language changes to avoid mixing languages
      if (field === "language" && (prev.title || prev.content)) {
        const confirmed = window.confirm(
          prev.language === "en"
            ? "Changing language will clear all content fields. Continue?"
            : "Cambiar el idioma borrará todos los campos de contenido. ¿Continuar?"
        );
        if (!confirmed) return prev;
      }
      const newData = { ...prev, [field]: value };
      if (field === "language") {
        newData.title = "";
        newData.excerpt = "";
        newData.content = "";
        newData.slug = "";
      }
      // Auto-generate slug from title only when creating
      if (field === "title" && !isEditing) {
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
          {/* Language Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {l.language}
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          {/* Content Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {l.title} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {l.excerpt}
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {l.content} *
                </label>
                <div className="min-h-[300px] bg-white">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => handleChange("content", value)}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publication Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-lg mb-4">{l.publishSettings}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {l.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {formData.language === "es" ? cat.labelEs : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {l.slug}
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
                  {l.author}
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
                  {l.published}
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
              label={l.imageLabel}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {saving ? l.saving : isEditing ? l.update : l.create}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-4 rounded-lg font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {l.cancel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
