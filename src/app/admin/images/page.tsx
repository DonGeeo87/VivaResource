"use client";

import { useState } from "react";
import { Image as ImageIcon, X, ExternalLink, Home, FileText, MapPin, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImageUsage {
  location: string;
  path: string;
  descriptionEn: string;
  descriptionEs: string;
  page: "home" | "about" | "login";
  icon: string;
}

const siteImages: ImageUsage[] = [
  {
    location: "home hero",
    path: "/photo-bank/hero_01.jpg",
    descriptionEn: "Home page hero background (slideshow)",
    descriptionEs: "Hero de la página principal (presentación)",
    page: "home",
    icon: "home"
  },
  {
    location: "about hero",
    path: "/photo-bank/hero_01.jpg",
    descriptionEn: "About page hero background",
    descriptionEs: "Hero de la página sobre nosotros",
    page: "about",
    icon: "info"
  },
  {
    location: "home hero",
    path: "/photo-bank/hero_02.jpg",
    descriptionEn: "Home page hero background (slideshow)",
    descriptionEs: "Hero de la página principal (presentación)",
    page: "home",
    icon: "home"
  },
  {
    location: "home hero",
    path: "/photo-bank/hero_03.jpg",
    descriptionEn: "Home page hero background (slideshow)",
    descriptionEs: "Hero de la página principal (presentación)",
    page: "home",
    icon: "home"
  },
  {
    location: "home Eva",
    path: "/photo-bank/vivaresource (4).jpg",
    descriptionEn: "Team member: Eva photo on home and about",
    descriptionEs: "Equipo: Foto de Eva en home y sobre nosotros",
    page: "home",
    icon: "users"
  },
  {
    location: "about Eva",
    path: "/photo-bank/vivaresource (4).jpg",
    descriptionEn: "Team member: Eva photo on about page",
    descriptionEs: "Equipo: Foto de Eva en página sobre nosotros",
    page: "about",
    icon: "info"
  },
  {
    location: "home Monse",
    path: "/photo-bank/vivaresource (3).jpg",
    descriptionEn: "Team member: Monse photo on home and about",
    descriptionEs: "Equipo: Foto de Monse en home y sobre nosotros",
    page: "home",
    icon: "users"
  },
  {
    location: "about Monse",
    path: "/photo-bank/vivaresource (3).jpg",
    descriptionEn: "Team member: Monse photo on about page",
    descriptionEs: "Equipo: Foto de Monse en página sobre nosotros",
    page: "about",
    icon: "info"
  },
  {
    location: "pathway Education",
    path: "/photo-bank/vivaresource (5).jpg",
    descriptionEn: "Pathway section: Education card image",
    descriptionEs: "Sección Pathways: Imagen de tarjeta Educación",
    page: "home",
    icon: "home"
  },
  {
    location: "pathway Food",
    path: "/photo-bank/vivaresource (6).jpg",
    descriptionEn: "Pathway section: Food card image",
    descriptionEs: "Sección Pathways: Imagen de tarjeta Comida",
    page: "home",
    icon: "home"
  },
  {
    location: "pathway Community",
    path: "/photo-bank/vivaresource (8).jpg",
    descriptionEn: "Pathway section: Community card image",
    descriptionEs: "Sección Pathways: Imagen de tarjeta Comunidad",
    page: "home",
    icon: "home"
  },
  {
    location: "Get Help CTA",
    path: "/photo-bank/vivaresource (10).jpg",
    descriptionEn: "Call-to-action section background",
    descriptionEs: "Fondo de sección de llamado a la acción",
    page: "home",
    icon: "home"
  },
  {
    location: "login logo",
    path: "/logo.png",
    descriptionEn: "Logo displayed on login page",
    descriptionEs: "Logo mostrado en página de inicio de sesión",
    page: "login",
    icon: "login"
  }
];

const uniqueImages = siteImages.reduce((acc, img) => {
  if (!acc.find(i => i.path === img.path)) {
    acc.push(img);
  }
  return acc;
}, [] as ImageUsage[]);

function getPageIcon(page: string) {
  switch (page) {
    case "home": return Home;
    case "about": return FileText;
    case "login": return Users;
    default: return ImageIcon;
  }
}

function ImageCard({ image, onPreview, language }: { image: ImageUsage; onPreview: () => void; language: string }): JSX.Element {
  const PageIcon = getPageIcon(image.page);
  const usages = siteImages.filter(img => img.path === image.path);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="relative aspect-video bg-gray-100 cursor-pointer group"
        onClick={onPreview}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.path}
          alt={image.descriptionEn}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const icon = document.createElement('div');
              icon.className = 'absolute inset-0 flex items-center justify-center';
              icon.innerHTML = `<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
              parent.appendChild(icon);
            }
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-lg text-sm font-medium text-gray-700">
            {language === "es" ? "Ver imagen" : "View Image"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
            {image.path.split('/').pop()}
          </span>
          <PageIcon className="w-4 h-4 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          {language === "es" ? "Usado en:" : "Used in:"}
        </h3>
        <ul className="space-y-1">
          {usages.map((usage, idx) => (
            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
              <MapPin className="w-3 h-3 mt-1 flex-shrink-0 text-gray-400" />
              <span>
                <span className="font-medium">{usage.location}</span>
                <span className="text-gray-400 text-xs ml-1">
                  ({usage.page})
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ImageModal({ image, onClose, language }: { image: ImageUsage; onClose: () => void; language: string }): JSX.Element {
  const usages = siteImages.filter(img => img.path === image.path);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
        <div className="p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.path}
            alt={image.descriptionEn}
            className="w-full max-h-[60vh] object-contain rounded-lg bg-gray-100"
          />
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-500">Path:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{image.path}</code>
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {language === "es" ? "Ubicaciones donde se usa esta imagen:" : "Locations where this image is used:"}
            </h3>
            <ul className="space-y-2">
              {usages.map((usage, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">{usage.location}</span>
                    <p className="text-sm text-gray-600">
                      {language === "es" ? usage.descriptionEs : usage.descriptionEn}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard(): JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-20 bg-gray-200 rounded mb-2" />
        <div className="space-y-1">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function AdminImagesPage(): JSX.Element {
  const { language, isHydrated } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<ImageUsage | null>(null);
  const [loading] = useState(true);

  if (!isHydrated) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "es" ? "Imágenes del Sitio" : "Site Images"}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === "es" 
              ? "Administra las imágenes del sitio y conoce dónde se usan" 
              : "Manage site images and see where they are used"}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <h2 className="font-semibold text-blue-900 flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          {language === "es" ? "Cómo cambiar las imágenes" : "How to change images"}
        </h2>
        <p className="text-sm text-blue-800 mt-1">
          {language === "es"
            ? "Las imágenes están hardcodeadas en los archivos de componentes. Para cambiarlas, edita los archivos correspondientes:"
            : "Images are hardcoded in component files. To change them, edit the corresponding files:"}
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
          <li><code className="bg-blue-100 px-1 rounded">src/components/home/</code> - {language === "es" ? "Componentes de la página principal" : "Home page components"}</li>
          <li><code className="bg-blue-100 px-1 rounded">src/components/about/</code> - {language === "es" ? "Componentes de sobre nosotros" : "About page components"}</li>
          <li><code className="bg-blue-100 px-1 rounded">src/app/admin/login/</code> - {language === "es" ? "Página de inicio de sesión" : "Login page"}</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueImages.map((image, idx) => (
          <ImageCard
            key={idx}
            image={image}
            language={language}
            onPreview={() => setSelectedImage(image)}
          />
        ))}
      </div>

      {uniqueImages.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {language === "es" ? "No se encontraron imágenes" : "No images found"}
          </p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          language={language}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
