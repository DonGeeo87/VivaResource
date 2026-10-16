"use client";

import { useState, useEffect } from "react";
import { db, Timestamp, addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "@/lib/db-client";
import { Sparkles, Copy, Save, Loader2, FileText, Mail, Share2, Clock, Trash2, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { authFetch } from "@/lib/auth/client";
import {
  PageShell,
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  AdminButton,
  Field,
  Input,
  StatusBadge,
  EmptyState,
} from "@/components/admin";

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

type ContentType = "blog" | "newsletter" | "social";
type Language = "en" | "es" | "both";

interface GenerationHistory {
  id: string;
  type: ContentType;
  topic: string;
  language: Language;
  created_at: Timestamp | Date;
}

const contentTypes: { value: ContentType; labelEn: string; labelEs: string; icon: typeof FileText }[] = [
  { value: "blog", labelEn: "Blog Post", labelEs: "Publicación de Blog", icon: FileText },
  { value: "newsletter", labelEn: "Newsletter", labelEs: "Boletín", icon: Mail },
  { value: "social", labelEn: "Social Media Copy", labelEs: "Contenido para Redes Sociales", icon: Share2 },
];

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "both", label: "Both (EN/ES)" },
];

const TYPE_ICON: Record<ContentType, typeof FileText> = { blog: FileText, newsletter: Mail, social: Share2 };

export default function AIGeneratorPage(): JSX.Element {
  const { language: lang, isHydrated } = useLanguage();
  const t = lang === "es" ? "es" : "en";

  const [contentType, setContentType] = useState<ContentType>("blog");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<Language>("both");

  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const q = query(collection(db, "ai_generated_content"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as GenerationHistory[];
      setHistory(data.slice(0, 10));
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError(t === "es" ? "Por favor ingresa un tema o idea" : "Please enter a topic or idea");
      return;
    }
    setGenerating(true);
    setError(null);
    setGeneratedContent(null);
    setSaveSuccess(false);
    try {
      const response = await authFetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contentType, topic: topic.trim(), language }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || (t === "es" ? "Error al generar contenido" : "Error generating content"));
      }
      setGeneratedContent(data.content);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (t === "es" ? "Ocurrió un error desconocido" : "Unknown error occurred");
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t === "es" ? "Error al copiar al portapapeles" : "Error copying to clipboard");
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedContent || !topic.trim()) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      let collectionName = "";
      let docData: Record<string, unknown> = {};
      if (contentType === "blog") {
        collectionName = "blog_posts";
        const content = generatedContent as { title?: string; excerpt?: string; content?: string[] | string };
        docData = {
          title: content.title || topic,
          excerpt: content.excerpt || "",
          content: Array.isArray(content.content) ? content.content.join("\n\n") : content.content || "",
          language: language === "both" ? "en" : language,
          status: "draft",
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };
      } else if (contentType === "newsletter") {
        collectionName = "newsletter_history";
        const content = generatedContent as { subject?: string; body?: string };
        docData = {
          subject: content.subject || topic,
          content: content.body || "",
          sent_at: serverTimestamp(),
          total_sent: 0,
          total_failed: 0,
          total_subscribers: 0,
          status: "draft",
        };
      } else if (contentType === "social") {
        collectionName = "ai_generated_content";
        docData = { type: contentType, topic: topic.trim(), language, content: generatedContent, created_at: serverTimestamp() };
      }
      await addDoc(collection(db, collectionName), docData);
      setSaveSuccess(true);
      fetchHistory();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (t === "es" ? "Error al guardar borrador" : "Error saving draft");
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm(t === "es" ? "¿Estás seguro de que quieres eliminar este elemento?" : "Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "ai_generated_content", id));
      setHistory(history.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  const formatDate = (date: Timestamp | Date) => {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleString(lang === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const renderContent = () => {
    if (!generatedContent) return null;

    if (contentType === "blog") {
      const content = generatedContent as {
        title?: string;
        excerpt?: string;
        content?: string[] | string;
        en?: { title?: string; excerpt?: string; content?: string[] };
        es?: { title?: string; excerpt?: string; content?: string[] };
      };
      if (language === "both" && content.en && content.es) {
        return (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-primary mb-2">{t === "es" ? "Versión en Inglés" : "English Version"}</h3>
              <h2 className="text-xl font-bold mb-2">{content.en.title || ""}</h2>
              <p className="text-on-surface-variant italic mb-4">{content.en.excerpt || ""}</p>
              <div className="prose max-w-none">
                {Array.isArray(content.en.content) ? content.en.content.map((p, i) => <p key={i} className="mb-4">{p}</p>) : <p>{content.en.content}</p>}
              </div>
            </div>
            <div className="border-l-4 border-secondary pl-4">
              <h3 className="font-semibold text-secondary mb-2">Versión en Español</h3>
              <h2 className="text-xl font-bold mb-2">{content.es.title || ""}</h2>
              <p className="text-on-surface-variant italic mb-4">{content.es.excerpt || ""}</p>
              <div className="prose max-w-none">
                {Array.isArray(content.es.content) ? content.es.content.map((p, i) => <p key={i} className="mb-4">{p}</p>) : <p>{content.es.content}</p>}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{content.title || ""}</h2>
          <p className="text-on-surface-variant italic mb-4">{content.excerpt || ""}</p>
          <div className="prose max-w-none">
            {Array.isArray(content.content) ? content.content.map((p, i) => <p key={i} className="mb-4">{p}</p>) : <p>{content.content}</p>}
          </div>
        </div>
      );
    }

    if (contentType === "newsletter") {
      const content = generatedContent as {
        subject?: string;
        body?: string;
        en?: { subject?: string; body?: string };
        es?: { subject?: string; body?: string };
      };
      if (language === "both" && content.en && content.es) {
        return (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-primary mb-2">{t === "es" ? "Versión en Inglés" : "English Version"}</h3>
              <p className="font-medium mb-2">{t === "es" ? "Asunto:" : "Subject:"} {content.en.subject}</p>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.en.body || "") }} />
            </div>
            <div className="border-l-4 border-secondary pl-4">
              <h3 className="font-semibold text-secondary mb-2">Versión en Español</h3>
              <p className="font-medium mb-2">Asunto: {content.es.subject}</p>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.es.body || "") }} />
            </div>
          </div>
        );
      }
      return (
        <div>
          <p className="font-medium mb-2">{t === "es" ? "Asunto:" : "Subject:"} {content.subject}</p>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.body || "") }} />
        </div>
      );
    }

    if (contentType === "social") {
      const content = generatedContent as {
        variations?: { text?: string; hashtags?: string[] }[];
        en?: { variations?: { text?: string; hashtags?: string[] }[] };
        es?: { variations?: { text?: string; hashtags?: string[] }[] };
      };
      const renderVariations = (vars: { text?: string; hashtags?: string[] }[]) => (
        <div className="space-y-3">
          {vars.map((v, i) => (
            <div key={i} className="bg-surface-low p-4 rounded-md">
              <p className="font-medium text-xs text-on-surface-variant mb-2 uppercase tracking-wider">{t === "es" ? "Variación" : "Variation"} {i + 1}</p>
              <p className="mb-2 text-on-surface">{v.text}</p>
              <p className="text-primary text-sm">{Array.isArray(v.hashtags) ? v.hashtags.join(" ") : v.hashtags}</p>
            </div>
          ))}
        </div>
      );
      if (language === "both" && content.en && content.es) {
        return (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-primary mb-2">{t === "es" ? "Versiones en Inglés" : "English Versions"}</h3>
              {content.en.variations && renderVariations(content.en.variations)}
            </div>
            <div className="border-l-4 border-secondary pl-4">
              <h3 className="font-semibold text-secondary mb-2">Versiones en Español</h3>
              {content.es.variations && renderVariations(content.es.variations)}
            </div>
          </div>
        );
      }
      return content.variations ? renderVariations(content.variations) : null;
    }

    return <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(generatedContent, null, 2)}</pre>;
  };

  if (!isHydrated) return <></>;

  return (
    <PageShell>
      <PageHeader
        title={t === "es" ? "Generador de Contenido con IA" : "AI Content Generator"}
        description={t === "es" ? "Genera contenido bilingüe para publicaciones de blog, boletines y redes sociales" : "Generate bilingual content for blog posts, newsletters, and social media"}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader title={t === "es" ? "Generar Contenido" : "Generate Content"} icon={<Sparkles className="w-4 h-4 text-primary" />} />
            <CardBody className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                  {t === "es" ? "Tipo de Contenido" : "Content Type"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setContentType(type.value)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-sm font-medium transition-colors ${
                        contentType === type.value ? "border-primary bg-primary/5 text-primary" : "border-outline-low text-on-surface-variant hover:bg-surface-low"
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{t === "es" ? type.labelEs : type.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Field label={t === "es" ? "Tema / Idea" : "Topic / Idea"} htmlFor="ai-topic" required>
                <Input
                  id="ai-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t === "es" ? "ej., Recursos de inmigración para nuevos llegados en Colorado" : "e.g., Immigration resources for new arrivals in Colorado"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !generating) handleGenerate();
                  }}
                />
              </Field>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                  {t === "es" ? "Idioma" : "Language"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLanguage(l.value)}
                      className={`p-2.5 rounded-md border text-sm font-medium transition-colors ${
                        language === l.value ? "border-primary bg-primary/5 text-primary" : "border-outline-low text-on-surface-variant hover:bg-surface-low"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <AdminButton
                fullWidth
                size="md"
                onClick={handleGenerate}
                disabled={generating || !topic.trim()}
                icon={generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {generating ? (t === "es" ? "Generando..." : "Generating...") : (t === "es" ? "Generar Contenido" : "Generate Content")}
              </AdminButton>

              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}
            </CardBody>
          </Card>

          {generatedContent && (
            <Card>
              <CardHeader
                title={t === "es" ? "Contenido Generado" : "Generated Content"}
                actions={
                  <>
                    <AdminButton variant="secondary" icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} onClick={handleCopy}>
                      {copied ? (t === "es" ? "¡Copiado!" : "Copied!") : (t === "es" ? "Copiar" : "Copy")}
                    </AdminButton>
                    <AdminButton
                      onClick={handleSaveDraft}
                      disabled={saving}
                      icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    >
                      {saving ? (t === "es" ? "Guardando..." : "Saving...") : (t === "es" ? "Guardar Borrador" : "Save Draft")}
                    </AdminButton>
                  </>
                }
              />
              <CardBody>
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-sm">
                    {t === "es" ? "¡Contenido guardado como borrador exitosamente!" : "Content saved as draft successfully!"}
                  </div>
                )}
                <div className="prose max-w-none">{renderContent()}</div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Historial */}
        <Card className="xl:col-span-1 self-start xl:sticky xl:top-24">
          <CardHeader title={t === "es" ? "Generaciones Recientes" : "Recent Generations"} icon={<Clock className="w-4 h-4 text-primary" />} />
          <CardBody className="space-y-2">
            {loadingHistory ? (
              <div className="space-y-3 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="p-3 bg-surface-low rounded-md">
                    <div className="h-4 w-full bg-surface-high rounded mb-2" />
                    <div className="h-3 w-20 bg-surface-high rounded" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6 text-outline" />}
                title={t === "es" ? "No hay generaciones recientes" : "No recent generations"}
                description={t === "es" ? "El contenido generado aparecerá aquí" : "Generated content will appear here"}
              />
            ) : (
              history.map((item) => {
                const Icon = TYPE_ICON[item.type] || FileText;
                return (
                  <div key={item.id} className="p-3 bg-surface-low rounded-md hover:bg-surface-high transition-colors group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-on-surface-variant uppercase">{item.type}</span>
                        </div>
                        <p className="text-sm font-medium text-on-surface truncate">{item.topic}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge tone="brand">{item.language === "both" ? "EN/ES" : (item.language || "en").toUpperCase()}</StatusBadge>
                          <span className="text-xs text-on-surface-variant">{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteHistory(item.id)} title={t === "es" ? "Eliminar" : "Delete"} className="p-1 text-on-surface-variant hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}
