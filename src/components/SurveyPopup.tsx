"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, BarChart3 } from "lucide-react";

const SURVEY_POPUP_KEY = "viva-survey-popup-dismissed";
const SURVEY_DELAY_MS = 5000;
const SURVEY_REAPPEAR_DAYS = 30;

export default function SurveyPopup() {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const dismissed = localStorage.getItem(SURVEY_POPUP_KEY);
        if (dismissed) {
          const dismissedDate = new Date(dismissed);
          const now = new Date();
          const diffDays = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays < SURVEY_REAPPEAR_DAYS) return;
        }
        setVisible(true);
      } catch {
        setVisible(true);
      }
    }, SURVEY_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(SURVEY_POPUP_KEY, new Date().toISOString());
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {language === "es"
            ? "Ayúdanos a Mejorar"
            : "Help Us Improve"}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-2 text-sm leading-relaxed">
          {language === "es"
            ? "Queremos crear eventos y talleres que realmente te interesen. Tómate 2 minutos para responder esta breve encuesta y ayudarnos a servirte mejor."
            : "We want to create events and workshops that truly interest you. Take 2 minutes to answer this short survey and help us serve you better."}
        </p>

        <p className="text-xs text-gray-400 mb-6">
          {language === "es"
            ? "Tus respuestas son anónimas y nos ayudarán a mejorar."
            : "Your responses are anonymous and will help us improve."}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/survey"
            onClick={dismiss}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-center transition-all shadow-md hover:shadow-lg"
          >
            {language === "es"
              ? "Responder Encuesta"
              : "Take the Survey"}
          </Link>
          <button
            onClick={dismiss}
            className="w-full text-gray-500 hover:text-gray-700 py-2 px-6 rounded-xl text-sm font-medium transition-colors"
          >
            {language === "es"
              ? "Ahora no, gracias"
              : "Not now, thanks"}
          </button>
        </div>
      </div>
    </div>
  );
}