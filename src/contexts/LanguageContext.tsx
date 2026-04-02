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
}

export function LanguageProvider({ children }: LanguageProviderProps): JSX.Element {
  const [language, setLanguageState] = useState<Language>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem("viva-lang") as Language | null;
    if (stored === "en" || stored === "es") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language): void => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("viva-lang", lang);
    }
  };

  const currentTranslations = translations[language];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      translations: isHydrated ? currentTranslations : translations.en,
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
