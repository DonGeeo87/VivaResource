"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations as allTranslations } from "@/i18n/translations";

interface LanguagePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguagePromptModal({
  isOpen,
  onClose,
}: LanguagePromptModalProps): JSX.Element | null {
  const { setLanguage } = useLanguage();
  const [selected, setSelected] = useState<"en" | "es">("en");
  const [visible, setVisible] = useState(false);
  const t = allTranslations[selected].languagePrompt;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const browserLang =
        typeof navigator !== "undefined" ? navigator.language : "";
      if (browserLang.startsWith("es")) {
        setSelected("es");
      } else {
        setSelected("en");
      }
    } else if (visible) {
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, visible]);

  const handleConfirm = (): void => {
    setLanguage(selected);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!visible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transition-all duration-200 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
        }`}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <h2
            id="lang-modal-title"
            className="text-xl font-bold text-gray-900 mb-1 font-headline"
          >
            {t?.title ?? "Choose Your Language"}
          </h2>
          <p className="text-sm text-gray-600 mb-6 font-body">
            {t?.subtitle ?? "Select your preferred language to continue"}
          </p>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => setSelected("en")}
              className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all font-body ${
                selected === "en"
                  ? "border-primary bg-primary/5 text-primary font-bold"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
              aria-pressed={selected === "en"}
            >
              <span className="block text-base">
                {t?.english ?? "English"}
              </span>
            </button>
            <button
              onClick={() => setSelected("es")}
              className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all font-body ${
                selected === "es"
                  ? "border-primary bg-primary/5 text-primary font-bold"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
              aria-pressed={selected === "es"}
            >
              <span className="block text-base">
                {t?.spanish ?? "Español"}
              </span>
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold font-body hover:bg-primary-hover active:bg-primary-active transition-all"
          >
            {t?.confirm ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
