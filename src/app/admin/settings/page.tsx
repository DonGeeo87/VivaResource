"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, CheckCircle, Globe, Link as LinkIcon, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PageShell,
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  AdminButton,
  Field,
  Input,
  Textarea,
} from "@/components/admin";

import { db, collection, doc, getDocs, setDoc } from "@/lib/db-client";

interface SiteSettings {
  [key: string]: string;
}

interface SettingsField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
}

export default function AdminSettingsPage(): JSX.Element {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});

  const settingsConfig = useMemo<{ category: string; title: string; icon: typeof Globe; fields: SettingsField[] }[]>(() => [
    {
      category: "general",
      title: language === "es" ? "Información de la Organización" : "Organization Information",
      icon: Globe,
      fields: [
        { key: "organization_name", label: language === "es" ? "Nombre de la Organización" : "Organization Name", type: "text" },
        { key: "organization_email", label: language === "es" ? "Email de Contacto" : "Contact Email", type: "email" },
        { key: "organization_phone", label: language === "es" ? "Teléfono" : "Phone", type: "tel" },
        { key: "organization_address", label: language === "es" ? "Dirección" : "Address", type: "text" },
      ],
    },
    {
      category: "social",
      title: language === "es" ? "Redes Sociales" : "Social Media",
      icon: LinkIcon,
      fields: [
        { key: "facebook_url", label: "Facebook URL", type: "url" },
        { key: "instagram_url", label: "Instagram URL", type: "url" },
        { key: "twitter_url", label: "Twitter/X URL", type: "url" },
        { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
      ],
    },
    {
      category: "notifications",
      title: language === "es" ? "Notificaciones por Email" : "Email Notifications",
      icon: Bell,
      fields: [
        { key: "notification_emails", label: language === "es" ? "Emails de Notificación (separados por coma)" : "Notification Emails (comma-separated)", type: "textarea", placeholder: "email1@example.com, email2@example.com" },
        { key: "notify_on_form_submission", label: language === "es" ? "Notificar en envío de formulario" : "Notify on form submission", type: "checkbox" },
        { key: "notify_on_event_registration", label: language === "es" ? "Notificar en registro a evento" : "Notify on event registration", type: "checkbox" },
        { key: "notify_on_volunteer_signup", label: language === "es" ? "Notificar en registro de voluntario" : "Notify on volunteer signup", type: "checkbox" },
      ],
    },
    {
      category: "seo",
      title: language === "es" ? "Configuración SEO" : "SEO Configuration",
      icon: Globe,
      fields: [
        { key: "default_meta_title", label: language === "es" ? "Título por Defecto" : "Default Title", type: "text" },
        { key: "default_meta_description", label: language === "es" ? "Descripción por Defecto" : "Default Description", type: "textarea" },
      ],
    },
  ], [language]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "site_settings"));
      const data: SiteSettings = {};
      snapshot.forEach((d) => {
        data[d.id] = d.data()?.value || "";
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
        await setDoc(doc(db, "site_settings", key), { value, updated_at: new Date() }, { merge: true });
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

  return (
    <PageShell>
      <PageHeader
        title={language === "es" ? "Configuración" : "Settings"}
        description={language === "es" ? "Administra la configuración del sitio" : "Manage site settings"}
        actions={
          <AdminButton icon={<Save className="w-4 h-4" />} onClick={handleSave} disabled={saving}>
            {saving ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar Todo" : "Save All")}
          </AdminButton>
        }
      />

      {saved && (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-sm text-emerald-700">{language === "es" ? "Configuración guardada correctamente" : "Settings saved successfully"}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface-lowest border border-outline-low rounded-lg p-4">
              <div className="h-5 w-48 bg-surface-high rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="h-10 bg-surface-high rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {settingsConfig.map((section) => (
            <Card key={section.category}>
              <CardHeader title={section.title} icon={<section.icon className="w-4 h-4 text-primary" />} />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                      {field.type === "checkbox" ? (
                        <label htmlFor={field.key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            id={field.key}
                            checked={settings[field.key] === "true"}
                            onChange={(e) => handleChange(field.key, e.target.checked ? "true" : "false")}
                            className="w-4 h-4 rounded border-outline-low text-primary focus:ring-primary/40"
                          />
                          <span className="text-sm font-medium text-on-surface-variant">{field.label}</span>
                        </label>
                      ) : (
                        <Field label={field.label} htmlFor={field.key}>
                          {field.type === "textarea" ? (
                            <Textarea
                              id={field.key}
                              value={settings[field.key] || ""}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              rows={3}
                            />
                          ) : (
                            <Input
                              id={field.key}
                              type={field.type}
                              value={settings[field.key] || ""}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                            />
                          )}
                        </Field>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
