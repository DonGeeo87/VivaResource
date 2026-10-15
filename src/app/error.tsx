"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  const { language } = useLanguage();

  useEffect(() => {
    // Log error for debugging
    console.error("Application error:", error);
  }, [error]);

  const translations = {
    en: {
      title: "Something went wrong",
      body: "We apologize for the inconvenience. An unexpected error has occurred.",
      retry: "Try Again",
      home: "Go Home",
      ref: "Error reference",
    },
    es: {
      title: "Algo salió mal",
      body: "Lamentamos el inconveniente. Ocurrió un error inesperado.",
      retry: "Reintentar",
      home: "Ir al Inicio",
      ref: "Referencia del error",
    },
  };

  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Error icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t.title}
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          {t.body}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            {t.retry}
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            {t.home}
          </Link>
        </div>

        {/* Error reference */}
        {error.digest && (
          <p className="mt-8 text-xs text-gray-400">
            {t.ref}: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
