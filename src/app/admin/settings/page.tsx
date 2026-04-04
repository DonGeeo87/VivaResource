"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, CheckCircle, Globe, Link as LinkIcon, Bell } from "lucide-react";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface SiteSettings {
  [key: string]: string;
}

export default function AdminSettingsPage(): JSX.Element {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});

  const settingsConfig = useMemo(() => [
    {
      category: "general",
      title: language === "es" ? "Información de la Organización" : "Organization Information",
      icon: Globe,
      fields: [
        { key: "organization_name", label: language === "es" ? "Nombre de la Organización" : "Organization Name", type: "text" },
        { key: "organization_email", label: language === "es" ? "Email de Contacto" : "Contact Email", type: "email" },
        { key: "organization_phone", label: language === "es" ? "Teléfono" : "Phone", type: "tel" },
        { key: "organization_address", label: language === "es" ? "Dirección" : "Address", type: "text" }
      ]
    },
    {
      category: "social",
      title: language === "es" ? "Redes Sociales" : "Social Media",
      icon: LinkIcon,
      fields: [
        { key: "facebook_url", label: "Facebook URL", type: "url" },
        { key: "instagram_url", label: "Instagram URL", type: "url" },
        { key: "twitter_url", label: "Twitter/X URL", type: "url" },
        { key: "linkedin_url", label: "LinkedIn URL", type: "url" }
      ]
    },
    {
      category: "notifications",
      title: language === "es" ? "Notificaciones por Email" : "Email Notifications",
      icon: Bell,
      fields: [
        { key: "notification_emails", label: language === "es" ? "Emails de Notificación (separados por coma)" : "Notification Emails (comma-separated)", type: "textarea", placeholder: "email1@example.com, email2@example.com" },
        { key: "notify_on_form_submission", label: language === "es" ? "Notificar en envío de formulario" : "Notify on form submission", type: "checkbox" },
        { key: "notify_on_event_registration", label: language === "es" ? "Notificar en registro a evento" : "Notify on event registration", type: "checkbox" },
        { key: "notify_on_volunteer_signup", label: language === "es" ? "Notificar en registro de voluntario" : "Notify on volunteer signup", type: "checkbox" }
      ]
    },
    {
      category: "seo",
      title: language === "es" ? "Configuración SEO" : "SEO Configuration",
      icon: Globe,
      fields: [
        { key: "default_meta_title", label: language === "es" ? "Título por Defecto" : "Default Title", type: "text" },
        { key: "default_meta_description", label: language === "es" ? "Descripción por Defecto" : "Default Description", type: "textarea" }
      ]
    }
  ], [language]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "site_settings"));
      const data: SiteSettings = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data().value || "";
      });
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      for (const [key, value] of Object.entries(settings)) {
        await setDoc(doc(db, "site_settings", key), {
          value,
          updated_at: new Date()
        }, { merge: true });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(language === "es" ? "Error al guardar la configuración" : "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded" />
          </div>
          <div className="mt-4 md:mt-0 h-10 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                <div className="h-5 w-48 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
                    <div className="h-10 w-full bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{language === "es" ? "Configuración" : "Settings"}</h1>
          <p className="text-gray-600 mt-1">{language === "es" ? "Administra la configuración del sitio" : "Manage site settings"}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving
            ? (language === "es" ? "Guardando..." : "Saving...")
            : (language === "es" ? "Guardar Todo" : "Save All")}
        </button>
      </div>

      {saved && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{language === "es" ? "Configuración guardada correctamente" : "Settings saved successfully"}</span>
        </div>
      )}

      <div className="space-y-6">
        {settingsConfig.map((section) => (
          <div key={section.category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <section.icon className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="font-semibold text-lg">{section.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  {field.type === "checkbox" ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={field.key}
                        checked={settings[field.key] === "true"}
                        onChange={(e) => handleChange(field.key, e.target.checked ? "true" : "false")}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                    </div>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={settings[field.key] || ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={settings[field.key] || ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
