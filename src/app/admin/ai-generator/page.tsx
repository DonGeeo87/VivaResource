"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Save,
  Loader2,
  FileText,
  Mail,
  Share2,
  Clock,
  Trash2,
  Check,
} from "lucide-react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
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

export default function AIGeneratorPage(): JSX.Element {
  const { language: lang, isHydrated } = useLanguage();
  const t = lang === "es" ? "es" : "en";

  // Form state
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<Language>("both");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // History state
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "ai_generated_content"),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GenerationHistory[];
      setHistory(data.slice(0, 10)); // Only show last 10
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
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          topic: topic.trim(),
          language,
        }),
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

    const textToCopy = JSON.stringify(generatedContent, null, 2);
    try {
      await navigator.clipboard.writeText(textToCopy);
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
          content: Array.isArray(content.content)
            ? content.content.join("\n\n")
            : content.content || "",
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
        docData = {
          type: contentType,
          topic: topic.trim(),
          language,
          content: generatedContent,
          created_at: serverTimestamp(),
        };
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
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-700 mb-2">{t === "es" ? "Versión en Inglés" : "English Version"}</h3>
              <h2 className="text-xl font-bold mb-2">{content.en.title || ""}</h2>
              <p className="text-gray-600 italic mb-4">{content.en.excerpt || ""}</p>
              <div className="prose max-w-none">
                {Array.isArray(content.en.content)
                  ? content.en.content.map((p, i) => <p key={i} className="mb-4">{p}</p>)
                  : <p>{content.en.content}</p>}
              </div>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-700 mb-2">Versión en Español</h3>
              <h2 className="text-xl font-bold mb-2">{content.es.title || ""}</h2>
              <p className="text-gray-600 italic mb-4">{content.es.excerpt || ""}</p>
              <div className="prose max-w-none">
                {Array.isArray(content.es.content)
                  ? content.es.content.map((p, i) => <p key={i} className="mb-4">{p}</p>)
                  : <p>{content.es.content}</p>}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{content.title || ""}</h2>
          <p className="text-gray-600 italic mb-4">{content.excerpt || ""}</p>
          <div className="prose max-w-none">
            {Array.isArray(content.content)
              ? content.content.map((p, i) => <p key={i} className="mb-4">{p}</p>)
              : <p>{content.content}</p>}
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
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-700 mb-2">{t === "es" ? "Versión en Inglés" : "English Version"}</h3>
              <p className="font-medium mb-2">{t === "es" ? "Asunto:" : "Subject:"} {content.en.subject}</p>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.en.body || "") }} />
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-700 mb-2">Versión en Español</h3>
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
        <div className="space-y-4">
          {vars.map((v, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-sm text-gray-500 mb-2">{t === "es" ? "Variación" : "Variation"} {i + 1}</p>
              <p className="mb-2">{v.text}</p>
              <p className="text-blue-600 text-sm">
                {Array.isArray(v.hashtags) ? v.hashtags.join(" ") : v.hashtags}
              </p>
            </div>
          ))}
        </div>
      );

      if (language === "both" && content.en && content.es) {
        return (
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-700 mb-2">{t === "es" ? "Versiones en Inglés" : "English Versions"}</h3>
              {content.en.variations && renderVariations(content.en.variations)}
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-700 mb-2">Versiones en Español</h3>
              {content.es.variations && renderVariations(content.es.variations)}
            </div>
          </div>
        );
      }

      return content.variations ? renderVariations(content.variations) : null;
    }

    return <pre className="whitespace-pre-wrap">{JSON.stringify(generatedContent, null, 2)}</pre>;
  };

  if (!isHydrated) return <></>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t === "es" ? "Generador de Contenido con IA" : "AI Content Generator"}</h1>
        <p className="text-gray-600 mt-1">
          {t === "es" ? "Genera contenido bilingüe para publicaciones de blog, boletines y redes sociales" : "Generate bilingual content for blog posts, newsletters, and social media"}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t === "es" ? "Generar Contenido" : "Generate Content"}
            </h2>

            {/* Content Type Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t === "es" ? "Tipo de Contenido" : "Content Type"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setContentType(type.value)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      contentType === type.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{t === "es" ? type.labelEs : type.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t === "es" ? "Tema / Idea *" : "Topic / Idea *"}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t === "es" ? "ej., Recursos de inmigración para nuevos llegados en Colorado" : "e.g., Immigration resources for new arrivals in Colorado"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !generating) handleGenerate();
                }}
              />
            </div>

            {/* Language Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t === "es" ? "Idioma" : "Language"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      language === lang.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t === "es" ? "Generando..." : "Generating..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {t === "es" ? "Generar Contenido" : "Generate Content"}
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t === "es" ? "Contenido Generado" : "Generated Content"}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title={t === "es" ? "Copiar al portapapeles" : "Copy to clipboard"}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">{t === "es" ? "¡Copiado!" : "Copied!"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t === "es" ? "Copiar" : "Copy"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t === "es" ? "Guardando..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {t === "es" ? "Guardar como Borrador" : "Save as Draft"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  {t === "es" ? "¡Contenido guardado como borrador exitosamente!" : "Content saved as draft successfully!"}
                </div>
              )}

              <div className="prose max-w-none">{renderContent()}</div>
            </div>
          )}
        </div>

        {/* Sidebar - History */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              {t === "es" ? "Generaciones Recientes" : "Recent Generations"}
            </h2>

            {loadingHistory ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-gray-200 rounded" />
                      <div className="h-3 w-12 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-8 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">{t === "es" ? "No hay generaciones recientes" : "No recent generations"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {t === "es" ? "El contenido generado aparecerá aquí" : "Generated content will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === "blog" && <FileText className="w-3 h-3 text-blue-500" />}
                          {item.type === "newsletter" && <Mail className="w-3 h-3 text-green-500" />}
                          {item.type === "social" && <Share2 className="w-3 h-3 text-purple-500" />}
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{item.topic}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {item.language === "both" ? "EN/ES" : item.language.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
