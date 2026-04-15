"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import EmbeddedAIGenerator from "./EmbeddedAIGenerator";

export type BlockType = "hero" | "heading" | "text" | "image" | "button" | "divider" | "spacer";

export interface NewsletterBlock {
  id: string;
  type: BlockType;
  content: {
    heading?: string;
    headingEs?: string;
    text?: string;
    textEs?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonTextEs?: string;
    buttonUrl?: string;
    alignment?: "left" | "center" | "right";
  };
}

export interface NewsletterTemplate {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  headerColor: string;
  accentColor: string;
  blocks: NewsletterBlock[];
}

export const newsletterTemplates: NewsletterTemplate[] = [
  {
    id: "monthly_update",
    name: "Monthly Update",
    nameEs: "Actualización Mensual",
    description: "Clean template for monthly updates and news",
    descriptionEs: "Plantilla limpia para actualizaciones mensuales",
    headerColor: "#025689", // Primary
    accentColor: "#416900", // Secondary
    blocks: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          heading: "Monthly Update",
          headingEs: "Actualización Mensual",
          text: "Stay connected with our latest news and events",
          textEs: "Mantente conectado con nuestras últimas noticias y eventos",
        },
      },
      {
        id: "heading-1",
        type: "heading",
        content: {
          heading: "What's New This Month",
          headingEs: "Novedades del Mes",
        },
      },
      {
        id: "text-1",
        type: "text",
        content: {
          text: "We've been busy this month organizing community events and supporting families in need. Here's what we've accomplished together.",
          textEs: "Hemos estado ocupados este mes organizando eventos comunitarios y apoyando a familias necesitadas. Esto es lo que hemos logrado juntos.",
        },
      },
      {
        id: "divider-1",
        type: "divider",
        content: {},
      },
      {
        id: "heading-2",
        type: "heading",
        content: {
          heading: "Upcoming Events",
          headingEs: "Próximos Eventos",
        },
      },
      {
        id: "text-2",
        type: "text",
        content: {
          text: "Don't miss our upcoming community workshop on November 15th. Register now!",
          textEs: "¡No te pierdas nuestro próximo taller comunitario el 15 de noviembre. Regístrate ahora!",
        },
      },
      {
        id: "button-1",
        type: "button",
        content: {
          buttonText: "View Events",
          buttonTextEs: "Ver Eventos",
          buttonUrl: "https://vivaresource.org/events",
        },
      },
    ],
  },
  {
    id: "event_announcement",
    name: "Event Announcement",
    nameEs: "Anuncio de Evento",
    description: "Eye-catching template for event promotions",
    descriptionEs: "Plantilla llamativa para promociones de eventos",
    headerColor: "#416900", // Secondary
    accentColor: "#025689", // Primary
    blocks: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          heading: "You're Invited!",
          headingEs: "¡Estás Invitado!",
          text: "Join us for an unforgettable community event",
          textEs: "Únete a nosotros para un evento comunitario inolvidable",
        },
      },
      {
        id: "heading-1",
        type: "heading",
        content: {
          heading: "Event Details",
          headingEs: "Detalles del Evento",
        },
      },
      {
        id: "text-1",
        type: "text",
        content: {
          text: "📅 Date: Saturday, November 15th\n⏰ Time: 10:00 AM - 4:00 PM\n📍 Location: Community Center, Denver\n\nBring your family and friends! Food and activities provided.",
          textEs: "📅 Fecha: Sábado 15 de noviembre\n⏰ Hora: 10:00 AM - 4:00 PM\n📍 Ubicación: Centro Comunitario, Denver\n\n¡Trae a tu familia y amigos! Comida y actividades proporcionadas.",
        },
      },
      {
        id: "button-1",
        type: "button",
        content: {
          buttonText: "Register Now",
          buttonTextEs: "Registrarse Ahora",
          buttonUrl: "https://vivaresource.org/events",
        },
      },
    ],
  },
  {
    id: "impact_report",
    name: "Impact Report",
    nameEs: "Reporte de Impacto",
    description: "Professional template for sharing results and updates",
    descriptionEs: "Plantilla profesional para compartir resultados",
    headerColor: "#2e6fa3", // Primary Container
    accentColor: "#b7f569", // Secondary Container
    blocks: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          heading: "Our Impact",
          headingEs: "Nuestro Impacto",
          text: "See how your support is transforming lives in Colorado",
          textEs: "Mira cómo tu apoyo está transformando vidas en Colorado",
        },
      },
      {
        id: "heading-1",
        type: "heading",
        content: {
          heading: "This Quarter's Results",
          headingEs: "Resultados de Este Trimestre",
        },
      },
      {
        id: "text-1",
        type: "text",
        content: {
          text: "Thanks to your generosity, we've served 500+ families, organized 15 community events, and provided essential resources to those who need them most.",
          textEs: "Gracias a tu generosidad, hemos atendido a más de 500 familias, organizado 15 eventos comunitarios y proporcionado recursos esenciales a quienes más los necesitan.",
        },
      },
      {
        id: "divider-1",
        type: "divider",
        content: {},
      },
      {
        id: "button-1",
        type: "button",
        content: {
          buttonText: "Learn More",
          buttonTextEs: "Saber Más",
          buttonUrl: "https://vivaresource.org/about",
        },
      },
    ],
  },
];

interface NewsletterBuilderProps {
  template: string | null;
  subject: string;
  onSubjectChange: (subject: string) => void;
  onBlocksChange: (blocks: NewsletterBlock[]) => void;
  blocks: NewsletterBlock[];
  onSubjectChangeEs?: (subject: string) => void;
  subjectEs?: string;
}

export default function NewsletterBuilder({
  template: initialTemplate,
  subject,
  onSubjectChange,
  onBlocksChange,
  blocks,
  subjectEs: subjectEsProp,
  onSubjectChangeEs,
}: NewsletterBuilderProps): JSX.Element {
  const { language } = useLanguage();
  const isES = language === "es";
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [subjectEs, setSubjectEs] = useState(subjectEsProp || "");

  useEffect(() => {
    if (subjectEsProp !== undefined) {
      setSubjectEs(subjectEsProp);
    }
  }, [subjectEsProp]);

  const handleAIApply = (en: Record<string, unknown>, es: Record<string, unknown>) => {
    if (en.subject) {
      onSubjectChange(en.subject as string);
    }
    if (es.subject && onSubjectChangeEs) {
      onSubjectChangeEs(es.subject as string);
    } else if (es.subject) {
      setSubjectEs(es.subject as string);
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: NewsletterBlock = {
      id: `${type}-${Date.now()}`,
      type,
      content: {
        alignment: "left",
      },
    };
    onBlocksChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: Partial<NewsletterBlock["content"]>) => {
    onBlocksChange(
      blocks.map((block) =>
        block.id === id ? { ...block, content: { ...block.content, ...content } } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    onBlocksChange(blocks.filter((block) => block.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    onBlocksChange(newBlocks);
  };

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

  const blockTools: { type: BlockType; label: string; icon: string }[] = [
    { type: "hero", label: isES ? "Encabezado" : "Hero", icon: "🎨" },
    { type: "heading", label: isES ? "Título" : "Heading", icon: "📝" },
    { type: "text", label: isES ? "Texto" : "Text", icon: "📄" },
    { type: "image", label: isES ? "Imagen" : "Image", icon: "🖼️" },
    { type: "button", label: isES ? "Botón" : "Button", icon: "🔘" },
    { type: "divider", label: isES ? "Separador" : "Divider", icon: "➖" },
  ];

  const templateData = newsletterTemplates.find((t) => t.id === initialTemplate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Panel - Tools */}
      <div className="lg:col-span-2">
        <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/10 p-4 sticky top-24">
          <h3 className="text-sm font-semibold text-on-surface mb-3">
            {isES ? "Bloques" : "Blocks"}
          </h3>
          <div className="space-y-2">
            {blockTools.map((tool) => (
              <button
                key={tool.type}
                onClick={() => addBlock(tool.type)}
                className="w-full text-left p-2 rounded-lg hover:bg-surface-low transition-colors text-sm flex items-center gap-2"
              >
                <span className="text-lg">{tool.icon}</span>
                <span className="text-on-surface-variant">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center - Blocks Editor */}
      <div className="lg:col-span-5">
        <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">
            {isES ? "Contenido del Newsletter" : "Newsletter Content"}
          </h3>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              {isES ? "Asunto / Subject" : "Subject"} *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder={isES ? "Asunto del newsletter..." : "Newsletter subject..."}
              className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface-highest"
            />
          </div>

          {/* Subject ES */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              {isES ? "Asunto (Español)" : "Subject (Spanish)"} 
            </label>
            <input
              type="text"
              value={subjectEs}
              onChange={(e) => {
                setSubjectEs(e.target.value);
                if (onSubjectChangeEs) onSubjectChangeEs(e.target.value);
              }}
              placeholder={isES ? "Asunto del newsletter..." : "Asunto en español..."}
              className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface-highest"
            />
          </div>

          {/* AI Generator */}
          <div className="mb-6">
            <EmbeddedAIGenerator
              onApplySeparate={handleAIApply}
              defaultLanguage="both"
            />
          </div>

          {/* Blocks List */}
          <div className="space-y-3">
            {blocks.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <p className="text-lg font-medium">
                  {isES ? "Agrega bloques para comenzar" : "Add blocks to get started"}
                </p>
                <p className="text-sm mt-1">
                  {isES ? "Usa los bloques del panel izquierdo" : "Use blocks from the left panel"}
                </p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlock(block.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedBlock === block.id
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant/20 bg-surface hover:border-outline"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {blockTools.find((t) => t.type === block.type)?.icon || "📦"}
                      </span>
                      <span className="text-sm font-medium text-on-surface capitalize">
                        {block.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }}
                        disabled={index === 0}
                        className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }}
                        disabled={index === blocks.length - 1}
                        className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {/* Preview text */}
                  <p className="text-xs text-on-surface-variant truncate">
                    {block.content.heading || block.content.headingEs || block.content.text?.substring(0, 50) || block.content.textEs?.substring(0, 50) || "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Block Editor - when a block is selected */}
        {selectedBlockData && (
          <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6 mt-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4 capitalize">
              {isES ? "Editar bloque:" : "Edit block:"} {selectedBlockData.type}
            </h3>
            <div className="space-y-4">
              {(selectedBlockData.type === "hero" || selectedBlockData.type === "heading") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      {isES ? "Título (Inglés)" : "Heading (English)"}
                    </label>
                    <input
                      type="text"
                      value={selectedBlockData.content.heading || ""}
                      onChange={(e) => updateBlock(selectedBlockData.id, { heading: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg bg-surface-highest"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      {isES ? "Título (Español)" : "Heading (Spanish)"}
                    </label>
                    <input
                      type="text"
                      value={selectedBlockData.content.headingEs || ""}
                      onChange={(e) => updateBlock(selectedBlockData.id, { headingEs: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg bg-surface-highest"
                    />
                  </div>
                </>
              )}
              {(selectedBlockData.type === "hero" || selectedBlockData.type === "text") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      {isES ? "Texto (Inglés)" : "Text (English)"}
                    </label>
                    <textarea
                      value={selectedBlockData.content.text || ""}
                      onChange={(e) => updateBlock(selectedBlockData.id, { text: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg bg-surface-highest"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      {isES ? "Texto (Español)" : "Text (Spanish)"}
                    </label>
                    <textarea
                      value={selectedBlockData.content.textEs || ""}
                      onChange={(e) => updateBlock(selectedBlockData.id, { textEs: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg bg-surface-highest"
                    />
                  </div>
                </>
              )}
              {selectedBlockData.type === "image" && (
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    {isES ? "URL de la imagen" : "Image URL"}
                  </label>
                  <input
                    type="text"
                    value={selectedBlockData.content.imageUrl || ""}
                    onChange={(e) => updateBlock(selectedBlockData.id, { imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg bg-surface-highest"
                  />
                </div>
              )}
              {selectedBlockData.type === "button" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      {isES ? "Texto del botón (Inglés)" : "Button text (English)"}
                    </label>
                    <input
                      type="text"
                      value={selectedBlockData.content.buttonText || ""}
                      onChange={(e) => updateBlock(selectedBlockData.id, { buttonText: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg bg-surface-highest"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      {isES ? "Texto del botón (Español)" : "Button text (Spanish)"}
                    </label>
                    <input
                      type="text"
                      value={selectedBlockData.content.buttonTextEs || ""}
                      onChange={(e) => updateBlock(selectedBlockData.id, { buttonTextEs: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg bg-surface-highest"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      {isES ? "URL del enlace" : "Link URL"}
                    </label>
                    <input
                      type="text"
                      value={selectedBlockData.content.buttonUrl || ""}
                      onChange={(e) => updateBlock(selectedBlockData.id, { buttonUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-outline-variant/20 rounded-lg bg-surface-highest"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Live Preview */}
      <div className="lg:col-span-5">
        <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6 sticky top-24">
          <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            👁️ {isES ? "Vista Previa" : "Live Preview"}
          </h3>
          <div className="border border-outline-variant/20 rounded-lg overflow-hidden bg-white">
            {/* Email Preview */}
            <div style={{ backgroundColor: "#f9f9f9", minHeight: "400px" }}>
              {/* Header */}
              <div
                style={{ backgroundColor: templateData?.headerColor || "#025689", padding: "24px", textAlign: "center" }}
              >
                <div style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>
                  Viva Resource Foundation
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "4px" }}>
                  {isES ? "Recursos para Inmigrantes en Colorado" : "Immigrant Resources in Colorado"}
                </div>
              </div>

              {/* Subject Line */}
              {subject && (
                <div style={{ backgroundColor: "#ffffff", padding: "16px 24px", borderBottom: "1px solid #e0e0e0" }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1c1c" }}>
                    {subject}
                  </div>
                </div>
              )}

              {/* Content Blocks */}
              <div style={{ padding: "24px" }}>
                {blocks.map((block) => (
                  <div key={block.id} style={{ marginBottom: "16px" }}>
                    {block.type === "hero" && (
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: templateData?.headerColor || "#025689", marginBottom: "8px" }}>
                          {isES && block.content.headingEs ? block.content.headingEs : block.content.heading || ""}
                        </h1>
                        <p style={{ fontSize: "16px", color: "#41474f" }}>
                          {isES && block.content.textEs ? block.content.textEs : block.content.text || ""}
                        </p>
                      </div>
                    )}
                    {block.type === "heading" && (
                      <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1a1c1c", borderBottom: `2px solid ${templateData?.accentColor || "#416900"}`, paddingBottom: "8px" }}>
                        {isES && block.content.headingEs ? block.content.headingEs : block.content.heading || ""}
                      </h2>
                    )}
                    {block.type === "text" && (
                      <p style={{ fontSize: "14px", color: "#41474f", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                        {isES && block.content.textEs ? block.content.textEs : block.content.text || ""}
                      </p>
                    )}
                    {block.type === "image" && block.content.imageUrl && (
                      <img
                        src={block.content.imageUrl}
                        alt="Newsletter image"
                        style={{ width: "100%", borderRadius: "8px" }}
                      />
                    )}
                    {block.type === "button" && (
                      <div style={{ textAlign: block.content.alignment === "center" ? "center" : block.content.alignment === "right" ? "right" : "left" }}>
                        <a
                          href={block.content.buttonUrl || "#"}
                          style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            backgroundColor: templateData?.accentColor || "#416900",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                          }}
                        >
                          {isES && block.content.buttonTextEs ? block.content.buttonTextEs : block.content.buttonText || ""}
                        </a>
                      </div>
                    )}
                    {block.type === "divider" && (
                      <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "16px 0" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ backgroundColor: "#f3f3f3", padding: "24px", textAlign: "center", fontSize: "12px", color: "#717880" }}>
                <div style={{ marginBottom: "8px" }}>
                  © 2026 Viva Resource Foundation
                </div>
                <div>
                  {isES ? "Si no deseas recibir más correos" : "If you no longer wish to receive these emails"}
                  , <a href="#" style={{ color: "#025689" }}>{isES ? "cancela tu suscripción aquí" : "unsubscribe here"}</a>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
