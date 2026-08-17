"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Replace, CheckCircle, X, ImageIcon, RefreshCw } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSiteImages, updateSiteImage, type SiteImage as SiteImageType } from "@/lib/site-images";
import { SITE_IMAGE_DEFAULTS, type SiteImageDefault } from "@/lib/site-image-defaults";
import { useToast } from "@/components/Toast";
import type { SiteImageKey } from "@/types/site-images";

interface ExtendedSiteImage extends SiteImageType {
  editing: boolean;
  isDefault: boolean;
}

const PAGE_ORDER = [
  "Home",
  "About",
  "Get Help",
  "Get Involved",
  "Donate",
  "Contact",
  "Events",
  "Events Register",
  "Privacy",
  "Admin Login",
];

function groupByPage(images: ExtendedSiteImage[]): Record<string, ExtendedSiteImage[]> {
  const groups: Record<string, ExtendedSiteImage[]> = {};
  images.forEach((img) => {
    const def = SITE_IMAGE_DEFAULTS[img.key];
    const page = def?.page ?? "Other";
    if (!groups[page]) groups[page] = [];
    groups[page].push(img);
  });
  return groups;
}

export default function AdminImagesPage(): JSX.Element {
  const { language } = useLanguage();
  const [images, setImages] = useState<ExtendedSiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const { showToast } = useToast();

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSiteImages();
      const mapped = data.map((img): ExtendedSiteImage => {
        const def = SITE_IMAGE_DEFAULTS[img.key as SiteImageKey];
        const isDefault = def ? img.path === def.path : false;
        return { ...img, editing: false, isDefault };
      });
      setImages(mapped);
    } catch {
      showToast(language === "es" ? "Error cargando imágenes" : "Error loading images", "error");
    } finally {
      setLoading(false);
    }
  }, [language, showToast]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const toggleEdit = (key: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.key === key ? { ...img, editing: !img.editing } : { ...img, editing: false }
      )
    );
  };

  const handleImageChange = async (key: string, newUrl: string) => {
    if (!newUrl) return;
    setSavingKey(key);
    try {
      await updateSiteImage(key, { path: newUrl });
      setImages((prev) =>
        prev.map((img) => {
          if (img.key !== key) return img;
          const def = SITE_IMAGE_DEFAULTS[key as SiteImageKey];
          return {
            ...img,
            path: newUrl,
            editing: false,
            isDefault: def ? newUrl === def.path : false,
          };
        })
      );
      showToast(language === "es" ? "Imagen actualizada" : "Image updated", "success");
    } catch {
      showToast(language === "es" ? "Error al guardar" : "Save failed", "error");
    } finally {
      setSavingKey(null);
    }
  };

  const filteredImages = images.filter((img) => {
    const def = SITE_IMAGE_DEFAULTS[img.key as SiteImageKey];
    const matchesSearch =
      img.key.toLowerCase().includes(search.toLowerCase()) ||
      (def?.descriptionEn ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (def?.descriptionEs ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (def?.page ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (def?.section ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesPage = pageFilter === "all" || (def?.page ?? "") === pageFilter;
    return matchesSearch && matchesPage;
  });

  const groups = groupByPage(filteredImages);
  const sortedPages = Object.keys(groups).sort(
    (a, b) => PAGE_ORDER.indexOf(a) - PAGE_ORDER.indexOf(b)
  );

  const allPages = Array.from(
    new Set(images.map((img) => SITE_IMAGE_DEFAULTS[img.key as SiteImageKey]?.page ?? "Other"))
  ).sort((a, b) => PAGE_ORDER.indexOf(a) - PAGE_ORDER.indexOf(b));

  if (loading) return <SkeletonGrid />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          {language === "es" ? "Imágenes del Sitio" : "Site Images"}
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "es" ? "Buscar imagen..." : "Search image..."}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none w-48 md:w-64"
            />
          </div>
          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-white"
          >
            <option value="all">{language === "es" ? "Todas las páginas" : "All pages"}</option>
            {allPages.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={loadImages}
            className="p-2 text-primary hover:text-primary-hover rounded-lg hover:bg-primary/10 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={language === "es" ? "Total imágenes" : "Total images"}
          value={images.length}
        />
        <StatCard
          label={language === "es" ? "Personalizadas" : "Customized"}
          value={images.filter((i) => !i.isDefault).length}
          highlight
        />
        <StatCard
          label={language === "es" ? "Por defecto" : "Default"}
          value={images.filter((i) => i.isDefault).length}
        />
        <StatCard
          label={language === "es" ? "Páginas" : "Pages"}
          value={allPages.length}
        />
      </div>

      {/* Images by page */}
      <div className="space-y-10">
        {sortedPages.map((page) => (
          <section key={page}>
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              {page}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groups[page].map((image) => (
                <ImageCard
                  key={image.key}
                  image={image}
                  def={SITE_IMAGE_DEFAULTS[image.key as SiteImageKey]}
                  onToggleEdit={() => toggleEdit(image.key)}
                  onImageChange={(url) => handleImageChange(image.key, url)}
                  saving={savingKey === image.key}
                  language={language}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredImages.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {language === "es" ? "No se encontraron imágenes" : "No images found"}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-4 ${
        highlight ? "border-primary/30" : "border-gray-100"
      }`}
    >
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function ImageCard({
  image,
  def,
  onToggleEdit,
  onImageChange,
  saving,
  language,
}: {
  image: ExtendedSiteImage;
  def?: SiteImageDefault;
  onToggleEdit: () => void;
  onImageChange: (url: string) => void;
  saving: boolean;
  language: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-50 group">
        {image.path ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.path}
              alt={language === "es" ? def?.descriptionEs : def?.descriptionEn}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={onToggleEdit}
                className="px-3 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Replace className="w-4 h-4" />
                {language === "es" ? "Cambiar" : "Replace"}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          {image.isDefault ? (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
              {language === "es" ? "Por defecto" : "Default"}
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {language === "es" ? "Personalizada" : "Custom"}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-sm text-gray-800 leading-tight">
            {(image.key || "").replace(/-/g, " ").toUpperCase()}
          </h3>
          {def?.section && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md font-medium shrink-0">
              {def.section}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {language === "es" ? def?.descriptionEs : def?.descriptionEn}
        </p>

        {/* Edit area */}
        {image.editing ? (
          <div className="space-y-3">
            <ImageUpload
              value={image.path}
              onChange={onImageChange}
              path="site-images"
              label={language === "es" ? "Nueva imagen" : "New image"}
            />
            <button
              onClick={onToggleEdit}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              {language === "es" ? "Cancelar" : "Cancel"}
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleEdit}
            disabled={saving}
            className="mt-auto w-full py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {language === "es" ? "Guardando..." : "Saving..."}
              </>
            ) : (
              <>
                <Replace className="w-4 h-4" />
                {language === "es" ? "Cambiar imagen" : "Replace image"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-10">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="w-32 h-6 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
