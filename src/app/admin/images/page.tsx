"use client";

import { useState, useEffect, useCallback } from "react";
import { Replace, CheckCircle, X, ImageIcon, RefreshCw, Images } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSiteImages, updateSiteImage, type SiteImage as SiteImageType } from "@/lib/site-images";
import { SITE_IMAGE_DEFAULTS, type SiteImageDefault } from "@/lib/site-image-defaults";
import { useToast } from "@/components/Toast";
import type { SiteImageKey } from "@/types/site-images";
import {
  PageShell,
  PageHeader,
  StatCard,
  AdminButton,
  StatusBadge,
  Toolbar,
  SearchInput,
  FilterSelect,
  EmptyState,
} from "@/components/admin";

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
      prev.map((img) => (img.key === key ? { ...img, editing: !img.editing } : { ...img, editing: false }))
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
          return { ...img, path: newUrl, editing: false, isDefault: def ? newUrl === def.path : false };
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
    const term = search.toLowerCase();
    const matchesSearch =
      img.key.toLowerCase().includes(term) ||
      (def?.descriptionEn ?? "").toLowerCase().includes(term) ||
      (def?.descriptionEs ?? "").toLowerCase().includes(term) ||
      (def?.page ?? "").toLowerCase().includes(term) ||
      (def?.section ?? "").toLowerCase().includes(term);
    const matchesPage = pageFilter === "all" || (def?.page ?? "") === pageFilter;
    return matchesSearch && matchesPage;
  });

  const groups = groupByPage(filteredImages);
  const sortedPages = Object.keys(groups).sort((a, b) => PAGE_ORDER.indexOf(a) - PAGE_ORDER.indexOf(b));

  const allPages = Array.from(
    new Set(images.map((img) => SITE_IMAGE_DEFAULTS[img.key as SiteImageKey]?.page ?? "Other"))
  ).sort((a, b) => PAGE_ORDER.indexOf(a) - PAGE_ORDER.indexOf(b));

  return (
    <PageShell>
      <PageHeader
        title={language === "es" ? "Imágenes del Sitio" : "Site Images"}
        description={language === "es" ? "Reemplaza las fotos de cada sección" : "Replace the photos for each section"}
        actions={
          <AdminButton variant="secondary" icon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />} onClick={loadImages} disabled={loading}>
            {language === "es" ? "Actualizar" : "Refresh"}
          </AdminButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={language === "es" ? "Total imágenes" : "Total images"} value={images.length} icon={<Images className="w-5 h-5" />} loading={loading} />
        <StatCard label={language === "es" ? "Personalizadas" : "Customized"} value={images.filter((i) => !i.isDefault).length} icon={<CheckCircle className="w-5 h-5" />} tone="success" loading={loading} />
        <StatCard label={language === "es" ? "Por defecto" : "Default"} value={images.filter((i) => i.isDefault).length} icon={<ImageIcon className="w-5 h-5" />} tone="neutral" loading={loading} />
        <StatCard label={language === "es" ? "Páginas" : "Pages"} value={allPages.length} icon={<Images className="w-5 h-5" />} tone="info" loading={loading} />
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder={language === "es" ? "Buscar imagen..." : "Search image..."} />
        <FilterSelect value={pageFilter} onChange={setPageFilter}>
          <option value="all">{language === "es" ? "Todas las páginas" : "All pages"}</option>
          {allPages.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </FilterSelect>
      </Toolbar>

      {loading ? (
        <SkeletonGrid />
      ) : filteredImages.length === 0 ? (
        <div className="bg-surface-lowest border border-outline-low rounded-lg">
          <EmptyState icon={<ImageIcon className="w-6 h-6 text-outline" />} title={language === "es" ? "No se encontraron imágenes" : "No images found"} />
        </div>
      ) : (
        <div className="space-y-8">
          {sortedPages.map((page) => (
            <section key={page}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                {page}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      )}
    </PageShell>
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
  const isES = language === "es";
  return (
    <div className="bg-surface-lowest border border-outline-low rounded-lg overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-surface-low group">
        {image.path ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.path}
              alt={isES ? def?.descriptionEs : def?.descriptionEn}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={onToggleEdit}
                className="px-3 py-2 bg-surface-lowest text-on-surface rounded-md text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
              >
                <Replace className="w-4 h-4" />
                {isES ? "Cambiar" : "Replace"}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          {image.isDefault ? (
            <StatusBadge tone="neutral">{isES ? "Por defecto" : "Default"}</StatusBadge>
          ) : (
            <StatusBadge tone="success"><CheckCircle className="w-3 h-3" />{isES ? "Personalizada" : "Custom"}</StatusBadge>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-xs text-on-surface leading-tight">
            {(image.key || "").replace(/-/g, " ").toUpperCase()}
          </h3>
          {def?.section && <StatusBadge tone="brand">{def.section}</StatusBadge>}
        </div>
        <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">
          {isES ? def?.descriptionEs : def?.descriptionEn}
        </p>

        {image.editing ? (
          <div className="space-y-2 mt-auto">
            <ImageUpload
              value={image.path}
              onChange={onImageChange}
              path="site-images"
              label={isES ? "Nueva imagen" : "New image"}
            />
            <button
              onClick={onToggleEdit}
              className="w-full py-2 text-sm text-on-surface-variant hover:bg-surface-low rounded-md transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              {isES ? "Cancelar" : "Cancel"}
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleEdit}
            disabled={saving}
            className="mt-auto w-full py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <><RefreshCw className="w-4 h-4 animate-spin" />{isES ? "Guardando..." : "Saving..."}</>
            ) : (
              <><Replace className="w-4 h-4" />{isES ? "Cambiar imagen" : "Replace image"}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-8">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="w-32 h-5 bg-surface-high rounded mb-3 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-surface-high rounded-lg h-56" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
