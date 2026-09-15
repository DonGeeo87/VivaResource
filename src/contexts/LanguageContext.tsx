"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { translations } from "@/i18n/translations";

type Language = "en" | "es";
type TranslationsType = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: TranslationsType;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
  /**
   * Idioma resuelto en el SERVIDOR (cookie viva-lang, marcada por el
   * middleware segun la URL /es). Llega en el HTML inicial, asi que los
   * buscadores -- que no ejecutan JS ni tienen localStorage -- ven el
   * contenido en el idioma correcto.
   */
  initialLanguage?: Language;
}

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: LanguageProviderProps): JSX.Element {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // La cookie es la fuente de verdad (la mantiene el middleware, que decide
    // segun la URL). localStorage solo se respeta si no hay cookie, para no
    // pisar el idioma que impone la ruta.
    const hasCookie =
      typeof document !== "undefined" &&
      /(?:^|;\s*)viva-lang=(en|es)/.test(document.cookie);

    if (hasCookie) return;

    const stored = localStorage.getItem("viva-lang") as Language | null;
    if (stored === "en" || stored === "es") {
      setLanguageState(stored);
    }
  }, []);

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language): void => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("viva-lang", lang);
      document.cookie = `viva-lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    }
  };

  const currentTranslations = translations[language];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      translations: currentTranslations,
      isHydrated
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    return {
      language: "en",
      setLanguage: () => {},
      translations: translations.en,
      isHydrated: false,
    };
  }
  return context;
}
