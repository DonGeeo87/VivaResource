"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Loader2, 
  Copy,
  Wand2,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

interface EmbeddedAIGeneratorProps {
  onApply?: (content: GeneratedContent) => void;
  onApplySeparate?: (en: Partial<GeneratedContent>, es: Partial<GeneratedContent>) => void;
  compact?: boolean;
  defaultLanguage?: Language;
}

interface GeneratedContent {
  title?: string;
  excerpt?: string;
  content?: string;
  subject?: string;
  body?: string;
  variations?: { text: string; hashtags: string[] }[];
  en?: GeneratedContent;
  es?: GeneratedContent;
}

type ContentType = "blog" | "newsletter" | "social";
type Language = "en" | "es" | "both";

const contentTypes: { value: ContentType; labelEn: string; labelEs: string }[] = [
  { value: "blog", labelEn: "Blog Post", labelEs: "Blog" },
  { value: "newsletter", labelEn: "Newsletter", labelEs: "Boletín" },
  { value: "social", labelEn: "Social Media", labelEs: "Redes" },
];

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "both", label: "EN/ES" },
];

export default function EmbeddedAIGenerator({ onApply, onApplySeparate, compact = false, defaultLanguage = "both" }: EmbeddedAIGeneratorProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(!compact);
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatedContentEs, setGeneratedContentEs] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setGenerating(true);
    setError(null);
    setGeneratedContent(null);
    setGeneratedContentEs(null);

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
        throw new Error(data.error || "Error generating content");
      }

      if (language === "both") {
        setGeneratedContent(data.content?.en || data.content);
        setGeneratedContentEs(data.content?.es || data.content);
      } else {
        setGeneratedContent(data.content);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error occurred";
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedContent || !onApply) return;
    
    setApplying(true);
    
    if (language === "both" && onApplySeparate && generatedContentEs) {
      onApplySeparate(generatedContent, generatedContentEs);
    } else if (language === "both") {
      onApply({ en: generatedContent, es: generatedContentEs || undefined });
    } else {
      onApply(generatedContent);
    }
    
    setTimeout(() => setApplying(false), 500);
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
  };

  const containerClass = compact 
    ? "bg-gray-50 rounded-lg border border-gray-200 p-4" 
    : "bg-white rounded-xl shadow-sm border border-gray-100 p-6";

  return (
    <div className={containerClass}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full"
      >
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="font-medium text-gray-900 flex-1 text-left">
          {compact ? "✨ IA" : "AI Content Generator"}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Type / Tipo
            </label>
            <div className="flex gap-2">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value as ContentType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border-2 transition-colors ${
                    contentType === type.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{type.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Language / Idioma
            </label>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value as Language)}
                  className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-colors ${
                    language === lang.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Topic / Tema
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., immigration resources Colorado..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !generating) handleGenerate();
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !topic.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{generating ? "..." : "Generate"}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {generatedContent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Generated / Generado
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {onApply && (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1.5"
                    >
                      {applying ? "✓" : "Apply Both"}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 max-h-48 overflow-y-auto space-y-3">
                {language === "both" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded border border-gray-200">
                      <span className="text-xs font-medium text-blue-600">🇺🇸 English</span>
                      {generatedContent.title && (
                        <p className="font-medium text-gray-900 mt-1">📝 {generatedContent.title}</p>
                      )}
                      {generatedContent.excerpt && (
                        <p className="italic text-gray-600 mt-1">{generatedContent.excerpt}</p>
                      )}
                      {generatedContent.content && (
                        <p className="text-gray-600 mt-1 line-clamp-2">
                          {typeof generatedContent.content === "string" 
                            ? generatedContent.content.slice(0, 150) + "..."
                            : (generatedContent.content as string[]).slice(0, 2).join(" ").slice(0, 150) + "..."}
                        </p>
                      )}
                      {generatedContent.subject && (
                        <p className="font-medium mt-1">📧 {generatedContent.subject}</p>
                      )}
                      {onApplySeparate && (
                        <button
                          onClick={() => { onApplySeparate(generatedContent || {} as GeneratedContent, {} as GeneratedContent); }}
                          className="mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Apply EN →
                        </button>
                      )}
                    </div>
                    <div className="p-3 bg-white rounded border border-gray-200">
                      <span className="text-xs font-medium text-green-600">🇪🇸 Español</span>
                      {generatedContentEs?.title && (
                        <p className="font-medium text-gray-900 mt-1">📝 {generatedContentEs.title}</p>
                      )}
                      {generatedContentEs?.excerpt && (
                        <p className="italic text-gray-600 mt-1">{generatedContentEs.excerpt}</p>
                      )}
                      {generatedContentEs?.content && (
                        <p className="text-gray-600 mt-1 line-clamp-2">
                          {typeof generatedContentEs.content === "string" 
                            ? generatedContentEs.content.slice(0, 150) + "..."
                            : (generatedContentEs.content as string[]).slice(0, 2).join(" ").slice(0, 150) + "..."}
                        </p>
                      )}
                      {generatedContentEs?.subject && (
                        <p className="font-medium mt-1">📧 {generatedContentEs.subject}</p>
                      )}
                      {onApplySeparate && (
                        <button
                          onClick={() => { onApplySeparate({} as GeneratedContent, generatedContentEs || {} as GeneratedContent); }}
                          className="mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Apply ES →
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {language !== "both" && (
                  <>
                    {generatedContent.title && (
                      <p className="font-medium text-gray-900">📝 {generatedContent.title}</p>
                    )}
                    {generatedContent.excerpt && (
                      <p className="italic">{generatedContent.excerpt}</p>
                    )}
                    {generatedContent.content && (
                      <p className="line-clamp-2">
                        {typeof generatedContent.content === "string" 
                          ? generatedContent.content.slice(0, 200) + "..."
                          : (generatedContent.content as string[]).slice(0, 2).join(" ").slice(0, 200) + "..."}
                      </p>
                    )}
                    {generatedContent.subject && (
                      <p className="font-medium">📧 {generatedContent.subject}</p>
                    )}
                    {generatedContent.body && (
                      <p className="line-clamp-2" dangerouslySetInnerHTML={{ __html: generatedContent.body.replace(/<[^>]*>/g, "").slice(0, 150) + "..." }} />
                    )}
                    {generatedContent.variations?.slice(0, 2).map((v, i) => (
                      <div key={i} className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-sm">{v.text?.slice(0, 100)}...</p>
                        {v.hashtags && (
                          <p className="text-xs text-blue-600 mt-1">{v.hashtags.join(" ")}</p>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}