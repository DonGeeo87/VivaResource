"use client";

import { useState, useEffect } from "react";
import {
  Save,
  CheckCircle,
  Globe,
  Search,
  Share2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Bot,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface SeoSettings {
  // General
  site_title: string;
  site_description: string;
  site_keywords: string;
  canonical_url: string;
  site_locale: string;
  // Social (sameAs for Schema)
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  tiktok_url: string;
  // Open Graph
  og_site_name: string;
  og_default_image: string;
  og_locale: string;
  og_locale_alternate: string;
  // Google Search Console
  google_verification_code: string;
  bing_verification_code: string;
  // Robots & Indexing
  allow_indexing: string;
  noindex_paths: string;
  custom_robots_rules: string;
  // Twitter
  twitter_handle: string;
  twitter_card_type: string;
}

const DEFAULT_SETTINGS: SeoSettings = {
  site_title: "Viva Resource Foundation - Immigrant Support Colorado",
  site_description:
    "Viva Resource Foundation empowers immigrant families in Colorado with resources, legal guidance, community events, and advocacy. Fundación sin fines de lucro 501(c)(3).",
  site_keywords:
    "immigrant resources colorado, apoyo inmigrantes, familia inmigrante, colorado nonprofit, 501c3, immigration support, recursos para inmigrantes, fundacion colorado",
  canonical_url: "https://vivaresource.org",
  site_locale: "en_US",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  tiktok_url: "",
  og_site_name: "Viva Resource Foundation",
  og_default_image: "https://vivaresource.org/og-default.jpg",
  og_locale: "en_US",
  og_locale_alternate: "es_419",
  google_verification_code: "",
  bing_verification_code: "",
  allow_indexing: "true",
  noindex_paths: "/volunteer-portal\n/admin\n/api",
  custom_robots_rules: "",
  twitter_handle: "@vivaresource",
  twitter_card_type: "summary_large_image",
};

interface SeoAudit {
  page: string;
  url: string;
  hasTitle: boolean;
  hasDescription: boolean;
  hasOgImage: boolean;
  hasSchema: boolean;
  hasCanonical: boolean;
  issues: string[];
}

export default function AdminSeoPage(): JSX.Element {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"general" | "social" | "og" | "search-console" | "robots" | "audit">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SeoSettings>(DEFAULT_SETTINGS);
  const [audit, setAudit] = useState<SeoAudit[]>([]);
  const [runningAudit, setRunningAudit] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "seo_settings"));
      const data: Partial<SeoSettings> = {};
      snapshot.forEach((d) => {
        data[d.id as keyof SeoSettings] = d.data().value as string;
      });
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof SeoSettings, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await setDoc(
          doc(db, "seo_settings", key),
          { value, updated_at: new Date() },
          { merge: true }
        );
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      alert(language === "es" ? "Error al guardar configuración SEO" : "Error saving SEO settings");
    } finally {
      setSaving(false);
    }
  };

  const runSeoAudit = async (): Promise<void> => {
    setRunningAudit(true);
    const results: SeoAudit[] = [];

    // Check static pages
    const staticPages = [
      { url: "/", name: "Home" },
      { url: "/about", name: "About" },
      { url: "/resources", name: "Resources" },
      { url: "/get-help", name: "Get Help" },
      { url: "/get-involved", name: "Get Involved" },
      { url: "/contact", name: "Contact" },
      { url: "/donate", name: "Donate" },
      { url: "/blog", name: "Blog" },
      { url: "/events", name: "Events" },
      { url: "/privacy", name: "Privacy Policy" },
    ];

    for (const page of staticPages) {
      const issues: string[] = [];
      // Simple audit: check if page exists and has basic meta
      const auditResult: SeoAudit = {
        page: page.name,
        url: page.url,
        hasTitle: true, // All static pages have metadata via layout.tsx
        hasDescription: true,
        hasOgImage: page.url !== "/privacy",
        hasSchema: false, // Only blog has schema
        hasCanonical: true,
        issues,
      };

      if (page.url === "/privacy") {
        auditResult.hasOgImage = false;
        issues.push(language === "es" ? "Falta imagen Open Graph" : "Missing Open Graph image");
      }

      if (page.url === "/" ) {
        // Home page audit
      }

      results.push(auditResult);
    }

    // Check blog posts
    try {
      const blogSnapshot = await getDocs(collection(db, "blog_posts"));
      blogSnapshot.forEach((post) => {
        const data = post.data();
        const issues: string[] = [];
        if (!data.meta_description && !data.excerpt) {
          issues.push(language === "es" ? "Sin meta descripción" : "No meta description");
        }
        if (!data.image_url && !data.cover_image) {
          issues.push(language === "es" ? "Sin imagen para Open Graph" : "No Open Graph image");
        }

        results.push({
          page: data.title_en || data.title_es || post.id,
          url: `/blog/${data.slug || post.id}`,
          hasTitle: !!(data.title_en || data.title_es),
          hasDescription: !!(data.meta_description || data.excerpt),
          hasOgImage: !!(data.image_url || data.cover_image),
          hasSchema: true, // Blog posts include Article schema
          hasCanonical: true,
          issues,
        });
      });
    } catch {
      // Skip blog audit if fetch fails
    }

    // Check events
    try {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      eventsSnapshot.forEach((event) => {
        const data = event.data();
        const issues: string[] = [];
        if (!data.image_url) {
          issues.push(language === "es" ? "Sin imagen para Open Graph" : "No Open Graph image");
        }
        issues.push(language === "es" ? "Falta Schema Event y metadata dinámica" : "Missing Event Schema and dynamic metadata");

        results.push({
          page: data.title_en || event.id,
          url: `/events/${event.id}`,
          hasTitle: !!(data.title_en),
          hasDescription: !!(data.description_en),
          hasOgImage: !!data.image_url,
          hasSchema: false,
          hasCanonical: false,
          issues,
        });
      });
    } catch {
      // Skip events audit if fetch fails
    }

    setAudit(results);
    setRunningAudit(false);
  };

  const tabs = [
    { id: "general" as const, label: language === "es" ? "General" : "General", icon: Globe },
    { id: "social" as const, label: language === "es" ? "Redes Sociales" : "Social Media", icon: Share2 },
    { id: "og" as const, label: "Open Graph", icon: ImageIcon },
    { id: "search-console" as const, label: "Search Console", icon: ShieldCheck },
    { id: "robots" as const, label: language === "es" ? "Robots e Indexación" : "Robots & Indexing", icon: Bot },
    { id: "audit" as const, label: language === "es" ? "Auditoría SEO" : "SEO Audit", icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-56 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "es" ? "Centro de SEO" : "SEO Center"}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === "es"
              ? "Optimiza el posicionamiento orgánico, metadata, robots y redes sociales"
              : "Optimize organic search positioning, metadata, robots, and social media"}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving
            ? language === "es" ? "Guardando..." : "Saving..."
            : language === "es" ? "Guardar Todo" : "Save All"}
        </button>
      </div>

      {saved && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">
            {language === "es" ? "Configuración SEO guardada correctamente" : "SEO settings saved successfully"}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="-mb-px flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Site Title & Description */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              {language === "es" ? "Título y Descripción del Sitio" : "Site Title & Description"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "es" ? "Título por defecto (meta title)" : "Default Title (meta title)"}
                </label>
                <input
                  type="text"
                  value={settings.site_title}
                  onChange={(e) => handleChange("site_title", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Viva Resource Foundation - Immigrant Support Colorado"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {settings.site_title.length}/60{" "}
                  {settings.site_title.length > 60 && (
                    <span className="text-amber-600 font-medium">
                      ({language === "es" ? "excede 60 caracteres" : "exceeds 60 chars"})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "es" ? "Descripción por defecto (meta description)" : "Default Description (meta description)"}
                </label>
                <textarea
                  value={settings.site_description}
                  onChange={(e) => handleChange("site_description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Empowering immigrant families in Colorado..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {settings.site_description.length}/160{" "}
                  {settings.site_description.length > 160 && (
                    <span className="text-amber-600 font-medium">
                      ({language === "es" ? "excede 160 caracteres" : "exceeds 160 chars"})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {language === "es" ? "Palabras Clave" : "Keywords"}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "es" ? "Keywords (separadas por coma)" : "Keywords (comma-separated)"}
              </label>
              <textarea
                value={settings.site_keywords}
                onChange={(e) => handleChange("site_keywords", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="immigrant resources, colorado nonprofit, apoyo inmigrantes..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === "es"
                  ? "Separadas por coma. Incluir términos en inglés y español."
                  : "Comma-separated. Include terms in both English and Spanish."}
              </p>
            </div>
          </div>

          {/* Canonical URL & Locale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "es" ? "URL Canónica" : "Canonical URL"}
              </label>
              <input
                type="url"
                value={settings.canonical_url}
                onChange={(e) => handleChange("canonical_url", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="https://vivaresource.org"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "es" ? "Locale del Sitio" : "Site Locale"}
              </label>
              <select
                value={settings.site_locale}
                onChange={(e) => handleChange("site_locale", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="en_US">English (US)</option>
                <option value="en_GB">English (UK)</option>
                <option value="es_419">Español (Latinoamérica)</option>
                <option value="es_MX">Español (México)</option>
                <option value="es_ES">Español (España)</option>
              </select>
            </div>
          </div>

          {/* Twitter Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter {language === "es" ? "Handle" : "Handle"}
              </label>
              <input
                type="text"
                value={settings.twitter_handle}
                onChange={(e) => handleChange("twitter_handle", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="@vivaresource"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "es" ? "Tipo de Twitter Card" : "Twitter Card Type"}
              </label>
              <select
                value={settings.twitter_card_type}
                onChange={(e) => handleChange("twitter_card_type", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="summary_large_image">Summary Large Image</option>
                <option value="summary">Summary</option>
              </select>
            </div>
          </div>

          {/* Google Preview */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              {language === "es" ? "Vista Previa en Google" : "Google Search Preview"}
            </h2>
            <div className="border border-gray-200 rounded-lg p-4 bg-white max-w-xl">
              <p className="text-lg text-[#1a0dab] truncate font-medium">
                {settings.site_title || "Viva Resource Foundation"}
              </p>
              <p className="text-sm text-[#006621] truncate">
                {settings.canonical_url || "https://vivaresource.org"}
              </p>
              <p className="text-sm text-[#545454] mt-1 line-clamp-2">
                {settings.site_description || language === "es"
                  ? "Fundación que apoya a familias inmigrantes en Colorado..."
                  : "Foundation supporting immigrant families in Colorado..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "social" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            {language === "es" ? "Redes Sociales (Schema sameAs)" : "Social Media (Schema sameAs)"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {language === "es"
              ? "Estos links se usan en el Schema Organization para que Google conozca tus perfiles sociales."
              : "These links are used in the Organization Schema so Google knows your social profiles."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "facebook_url" as const, label: "Facebook", placeholder: "https://facebook.com/vivaresource" },
              { key: "twitter_url" as const, label: "X / Twitter", placeholder: "https://x.com/vivaresource" },
              { key: "instagram_url" as const, label: "Instagram", placeholder: "https://instagram.com/vivaresource" },
              { key: "linkedin_url" as const, label: "LinkedIn", placeholder: "https://linkedin.com/company/vivaresource" },
              { key: "youtube_url" as const, label: "YouTube", placeholder: "https://youtube.com/@vivaresource" },
              { key: "tiktok_url" as const, label: "TikTok", placeholder: "https://tiktok.com/@vivaresource" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type="url"
                  value={settings[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "og" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Open Graph {language === "es" ? "Configuración por Defecto" : "Default Configuration"}
          </h2>
          <p className="text-sm text-gray-500">
            {language === "es"
              ? "Configuración por defecto para Open Graph (Facebook, LinkedIn, WhatsApp previews)."
              : "Default settings for Open Graph (Facebook, LinkedIn, WhatsApp previews)."}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                og:site_name
              </label>
              <input
                type="text"
                value={settings.og_site_name}
                onChange={(e) => handleChange("og_site_name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Viva Resource Foundation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                og:image (default fallback image URL)
              </label>
              <input
                type="url"
                value={settings.og_default_image}
                onChange={(e) => handleChange("og_default_image", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="https://vivaresource.org/og-default.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === "es"
                  ? "Imagen 1200x630px recomendada. Se usa cuando una página no tiene imagen propia."
                  : "Recommended 1200x630px. Used when a page has no specific image."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">og:locale</label>
                <select
                  value={settings.og_locale}
                  onChange={(e) => handleChange("og_locale", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="en_US">English (US)</option>
                  <option value="en_GB">English (UK)</option>
                  <option value="es_419">Español (Latinoamérica)</option>
                  <option value="es_MX">Español (México)</option>
                  <option value="es_ES">Español (España)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  og:locale:alternate
                </label>
                <select
                  value={settings.og_locale_alternate}
                  onChange={(e) => handleChange("og_locale_alternate", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="es_419">Español (Latinoamérica)</option>
                  <option value="es_MX">Español (México)</option>
                  <option value="es_ES">Español (España)</option>
                  <option value="en_US">English (US)</option>
                </select>
              </div>
            </div>
          </div>

          {/* OG Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden max-w-lg">
            <div className="bg-gray-100 h-64 flex items-center justify-center">
              {settings.og_default_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.og_default_image}
                  alt="OG default"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div className="hidden text-gray-400 text-sm">1200 x 630</div>
            </div>
            <div className="p-3 bg-white">
              <p className="text-xs text-gray-500 uppercase">{settings.canonical_url.replace(/^https?:\/\//, "")}</p>
              <p className="font-semibold text-gray-900 mt-1">{settings.og_site_name}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{settings.site_description}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "search-console" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Google Search Console & {language === "es" ? "Verificación de Motores" : "Search Engine Verification"}
          </h2>
          <p className="text-sm text-gray-500">
            {language === "es"
              ? "Ingresa los códigos de verificación de Google y Bing. Estos se insertan como meta tags en el head."
              : "Enter verification codes from Google and Bing. These are inserted as meta tags in the head."}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Site Verification Code
              </label>
              <input
                type="text"
                value={settings.google_verification_code}
                onChange={(e) => handleChange("google_verification_code", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono"
                placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === "es"
                  ? "Disponible en Google Search Console → Configuración → Verificación de propiedad"
                  : "Available in Google Search Console → Settings → Ownership verification"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bing Webmaster Verification Code
              </label>
              <input
                type="text"
                value={settings.bing_verification_code}
                onChange={(e) => handleChange("bing_verification_code", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono"
                placeholder="msvalidate.01=XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-sm mb-3">
              {language === "es" ? "Enlaces Rápidos" : "Quick Links"}
            </h3>
            <div className="space-y-2">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Google Search Console
              </a>
              <a
                href="https://www.bing.com/webmasters"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Bing Webmaster Tools
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Sitemap.xml
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Robots.txt
              </a>
            </div>
          </div>

          {/* Sitemap Status */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-sm mb-3">Sitemap {language === "es" ? "Estado" : "Status"}</h3>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  {language === "es" ? "Sitemap dinámico activo" : "Dynamic sitemap is active"}
                </p>
                <p className="text-xs text-green-600">
                  {language === "es"
                    ? "Incluye páginas estáticas + blog posts + eventos + formularios"
                    : "Includes static pages + blog posts + events + forms"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "robots" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Robots & {language === "es" ? "Indexación" : "Indexing"}
          </h2>

          {/* Global Indexing Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="font-medium text-gray-900">
                {language === "es" ? "Permitir Indexación Global" : "Allow Global Indexing"}
              </h3>
              <p className="text-sm text-gray-500">
                {language === "es"
                  ? "Si se desactiva, todo el sitio tendrá noindex (útil para staging)"
                  : "If disabled, the entire site will have noindex (useful for staging)"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_indexing === "true"}
                onChange={(e) => handleChange("allow_indexing", e.target.checked ? "true" : "false")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Noindex Paths */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "es" ? "Rutas con Noindex (una por línea)" : "Noindex Paths (one per line)"}
            </label>
            <textarea
              value={settings.noindex_paths}
              onChange={(e) => handleChange("noindex_paths", e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
              placeholder="/admin&#10;/api&#10;/volunteer-portal&#10;/privacy"
            />
            <p className="mt-1 text-xs text-gray-500">
              {language === "es"
                ? "Estas rutas bloquearán la indexación en robots.txt y agregarán noindex meta tag."
                : "These paths will block indexing in robots.txt and add noindex meta tag."}
            </p>
          </div>

          {/* Custom Robots Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "es" ? "Reglas Personalizadas de Robots.txt" : "Custom Robots.txt Rules"}
            </label>
            <textarea
              value={settings.custom_robots_rules}
              onChange={(e) => handleChange("custom_robots_rules", e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
              placeholder={`# Custom robots rules\nUser-agent: GoogleBot\nDisallow: /admin/\nAllow: /\n\n# Block specific bots\nUser-agent: GPTBot\nDisallow: /`}
            />
            <p className="mt-1 text-xs text-gray-500">
              {language === "es"
                ? "Reglas adicionales para robots.txt. Puedes bloquear bots de IA (GPTBot, CCBot, etc.)"
                : "Additional rules for robots.txt. You can block AI bots (GPTBot, CCBot, etc.)"}
            </p>
          </div>

          {/* Current robots.txt Preview */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-sm mb-3">
              {language === "es" ? "Vista Previa Actual de robots.txt" : "Current robots.txt Preview"}
            </h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64">
              <pre>
{`# robots.txt for Viva Resource Foundation
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /volunteer-portal/
Allow: /

Sitemap: ${settings.canonical_url}/sitemap.xml`}
{settings.custom_robots_rules && `\n\n# Custom rules\n${settings.custom_robots_rules}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {language === "es" ? "Auditoría SEO del Sitio" : "Site SEO Audit"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {language === "es"
                  ? "Analiza todas las páginas y detecta problemas de metadata, schema e indexación."
                  : "Scans all pages and detects issues with metadata, schema, and indexing."}
              </p>
            </div>
            <button
              onClick={runSeoAudit}
              disabled={runningAudit}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {runningAudit ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === "es" ? "Analizando..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {language === "es" ? "Ejecutar Auditoría" : "Run Audit"}
                </>
              )}
            </button>
          </div>

          {audit.length === 0 && !runningAudit && (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>
                {language === "es"
                  ? "Haz clic en 'Ejecutar Auditoría' para analizar el sitio."
                  : "Click 'Run Audit' to analyze the site."}
              </p>
            </div>
          )}

          {runningAudit && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="ml-3 text-gray-500">
                {language === "es" ? "Escaneando páginas..." : "Scanning pages..."}
              </p>
            </div>
          )}

          {audit.length > 0 && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {audit.filter((a) => a.issues.length === 0).length}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {language === "es" ? "Sin problemas" : "No issues"}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <p className="text-2xl font-bold text-amber-700">
                    {audit.filter((a) => a.issues.length > 0 && a.issues.length <= 2).length}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {language === "es" ? "Problemas leves" : "Minor issues"}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                  <p className="text-2xl font-bold text-red-700">
                    {audit.filter((a) => a.issues.length > 2).length}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {language === "es" ? "Problemas graves" : "Critical issues"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-gray-700">{audit.length}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {language === "es" ? "Total páginas" : "Total pages"}
                  </p>
                </div>
              </div>

              {/* Audit Results */}
              <div className="space-y-3">
                {audit.map((item, index) => (
                  <div
                    key={`${item.url}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.issues.length === 0 ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : item.issues.length <= 2 ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          )}
                          <h3 className="font-medium text-gray-900 truncate">{item.page}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 font-mono truncate">{item.url}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.hasTitle ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {item.hasDescription ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {item.hasOgImage ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {item.hasSchema ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    {item.issues.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {item.issues.map((issue, i) => (
                          <p key={i} className="text-sm text-amber-700 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Legend */}
          {audit.length > 0 && (
            <div className="border-t border-gray-100 mt-6 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {language === "es" ? "Leyenda" : "Legend"}
              </h4>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> OK
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Warning
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" /> Error
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Title
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Description
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> OG Image
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Schema
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
