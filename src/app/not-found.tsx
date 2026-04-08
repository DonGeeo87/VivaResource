"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound(): JSX.Element {
  const { language } = useLanguage();
  
  const translations = {
    en: {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist or has been moved.",
      home: "Go Home",
      back: "Go Back",
    },
    es: {
      title: "Página No Encontrada",
      description: "La página que buscas no existe o ha sido movida.",
      home: "Ir al Inicio",
      back: "Volver",
    },
  };
  
  const t = translations[language] || translations.en;

  useEffect(() => {
    console.log("404 - Page not found");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Error code */}
        <div className="mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary/20 to-secondary/20 leading-none select-none">
            404
          </h1>
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="w-16 h-16 text-gray-400" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t.title}
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          {t.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors"
          >
            <Home className="w-5 h-5" />
            {t.home}
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.back}
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            {language === "en" ? "Quick links:" : "Enlaces rápidos:"}
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/about" className="text-primary hover:underline">
              {language === "en" ? "About Us" : "Sobre Nosotros"}
            </Link>
            <Link href="/blog" className="text-primary hover:underline">
              {language === "en" ? "Blog" : "Blog"}
            </Link>
            <Link href="/events" className="text-primary hover:underline">
              {language === "en" ? "Events" : "Eventos"}
            </Link>
            <Link href="/contact" className="text-primary hover:underline">
              {language === "en" ? "Contact" : "Contacto"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
