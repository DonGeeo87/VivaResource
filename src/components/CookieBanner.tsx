"use client";

import { useState } from "react";
import { useCookieConsent } from "@/contexts/CookieContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cookie, ChevronDown, ChevronUp } from "lucide-react";

interface CookieBannerProps {
  className?: string;
}

export default function CookieBanner({ className = "" }: CookieBannerProps): JSX.Element | null {
  const { showBanner, acceptAll, rejectAll, acceptSpecific } = useCookieConsent();
  const { language } = useLanguage();
  const [showCustomize, setShowCustomize] = useState(false);
  const [customPrefs, setCustomPrefs] = useState({
    analytics: false,
    functional: false,
    marketing: false,
  });

  if (!showBanner) return null;

  const isES = language === "es";

  const togglePref = (key: keyof typeof customPrefs) => {
    setCustomPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCustomize = () => {
    acceptSpecific(customPrefs);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl ${className}`}
      role="dialog"
      aria-label={isES ? "Configuración de cookies" : "Cookie settings"}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Icon and main message */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5 text-amber-700" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isES ? "Configuración de Cookies" : "Cookie Settings"}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {isES
                ? "Utilizamos cookies para mejorar tu experiencia en nuestro sitio. Al continuar, aceptas nuestro uso de cookies."
                : "We use cookies to enhance your experience on our site. By continuing, you agree to our use of cookies."}
            </p>

            {/* Cookie type pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                {isES ? "Necesarias" : "Necessary"} ✓
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                Analytics
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                Functional
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                Marketing
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 lg:w-80">
            {!showCustomize ? (
              <>
                <button
                  onClick={acceptAll}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  {isES ? "Aceptar todas" : "Accept All"}
                </button>
                <button
                  onClick={rejectAll}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {isES ? "Rechazar todas" : "Reject All"}
                </button>
                <button
                  onClick={() => setShowCustomize(true)}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isES ? "Personalizar" : "Customize"}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    {isES ? "Personalizar cookies:" : "Customize cookies:"}
                  </p>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPrefs.analytics}
                      onChange={() => togglePref("analytics")}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">
                        {isES ? "Analíticas" : "Analytics"}
                      </span>
                      <p className="text-xs text-gray-500">
                        {isES
                          ? "Nos ayudan a entender cómo usas el sitio"
                          : "Help us understand how you use the site"}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPrefs.functional}
                      onChange={() => togglePref("functional")}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">
                        {isES ? "Funcionales" : "Functional"}
                      </span>
                      <p className="text-xs text-gray-500">
                        {isES
                          ? "Permiten características como preferencias de idioma"
                          : "Enable features like language preferences"}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPrefs.marketing}
                      onChange={() => togglePref("marketing")}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">
                        {isES ? "Marketing" : "Marketing"}
                      </span>
                      <p className="text-xs text-gray-500">
                        {isES
                          ? "Para mostrarte anuncios relevantes"
                          : "To show you relevant ads"}
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                    {isES ? "Volver" : "Back"}
                  </button>
                  <button
                    onClick={handleCustomize}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
                  >
                    {isES ? "Guardar" : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
          <a href="/privacy#cookies" className="hover:text-primary underline">
            {isES ? "Política de Cookies" : "Cookie Policy"}
          </a>
        </div>
      </div>
    </div>
  );
}