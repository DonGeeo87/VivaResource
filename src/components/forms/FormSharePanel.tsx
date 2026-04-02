"use client";

import { useState, useRef } from "react";
import { Copy, Download, ExternalLink, Link as LinkIcon, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormSharePanelProps {
  formId: string;
  published: boolean;
  shareMode: "link" | "qr" | "both";
  customSlug?: string;
  linkedEventId?: string;
  onPublishChange?: (published: boolean) => void;
  onShareModeChange?: (mode: "link" | "qr" | "both") => void;
}

export default function FormSharePanel({
  formId,
  published,
  shareMode,
  customSlug,
  linkedEventId,
  onPublishChange,
  onShareModeChange,
}: FormSharePanelProps): JSX.Element {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Construir URL pública del formulario
  const formUrl = customSlug
    ? `${window.location.origin}/forms/slug/${customSlug}`
    : `${window.location.origin}/forms/${formId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-form-${formId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const showLink = shareMode === "link" || shareMode === "both";
  const showQR = shareMode === "qr" || shareMode === "both";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-primary" />
        {language === "es" ? "Compartir Formulario" : "Share Form"}
      </h3>

      {/* Toggle Publicar */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {language === "es" ? "Estado de publicación" : "Publication Status"}
            </p>
            <p className="text-sm text-gray-600">
              {published
                ? language === "es"
                  ? "El formulario es público y accesible"
                  : "Form is public and accessible"
                : language === "es"
                  ? "El formulario está en borrador"
                  : "Form is in draft mode"}
            </p>
          </div>
          <button
            onClick={() => onPublishChange?.(!published)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              published ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                published ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <span
          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            published
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {published
            ? language === "es"
              ? "Publicado"
              : "Published"
            : language === "es"
              ? "Borrador"
              : "Draft"}
        </span>
      </div>

      {/* Share Mode Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {language === "es" ? "Modo de compartir" : "Share Mode"}
        </label>
        <div className="flex gap-2">
          {(["link", "qr", "both"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onShareModeChange?.(mode)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                shareMode === mode
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {mode === "link" && (language === "es" ? "Solo Link" : "Link Only")}
              {mode === "qr" && (language === "es" ? "Solo QR" : "QR Only")}
              {mode === "both" && (language === "es" ? "Ambos" : "Both")}
            </button>
          ))}
        </div>
      </div>

      {/* Link Section */}
      {showLink && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "es" ? "Enlace público" : "Public Link"}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={formUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
            >
              <Copy className="w-4 h-4" />
              {copied
                ? language === "es"
                  ? "Copiado!"
                  : "Copied!"
                : language === "es"
                  ? "Copiar"
                  : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* QR Code Section */}
      {showQR && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            {language === "es" ? "Código QR" : "QR Code"}
          </label>
          <div className="flex flex-col items-center gap-4">
            <div
              ref={qrRef}
              className="p-4 bg-white border-2 border-gray-200 rounded-lg"
            >
              <QRCodeSVG
                value={formUrl}
                size={180}
                level="M"
                includeMargin={true}
              />
            </div>
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              {language === "es" ? "Descargar QR" : "Download QR"}
            </button>
          </div>
        </div>
      )}

      {/* Linked Event Info */}
      {linkedEventId && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-1">
            {language === "es"
              ? "Formulario asociado a evento"
              : "Form linked to event"}
          </p>
          <a
            href={`/admin/events/${linkedEventId}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            {language === "es" ? "Ver evento" : "View event"}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Stats placeholder */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {language === "es"
            ? "Las estadísticas de acceso estarán disponibles pronto"
            : "Access statistics coming soon"}
        </p>
      </div>
    </div>
  );
}
