"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsent: boolean;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  acceptSpecific: (prefs: Partial<CookiePreferences>) => void;
  hideBanner: () => void;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: ReactNode }): JSX.Element {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("cookie_preferences");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
        setShowBanner(false);
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allPrefs: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    setPreferences(allPrefs);
    localStorage.setItem("cookie_preferences", JSON.stringify(allPrefs));
    localStorage.setItem("cookie_consent", "accepted");
    setShowBanner(false);
  };

  const rejectAll = () => {
    const minimalPrefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    setPreferences(minimalPrefs);
    localStorage.setItem("cookie_preferences", JSON.stringify(minimalPrefs));
    localStorage.setItem("cookie_consent", "rejected");
    setShowBanner(false);
  };

  const acceptSpecific = (prefs: Partial<CookiePreferences>) => {
    const newPrefs: CookiePreferences = {
      necessary: true,
      analytics: prefs.analytics ?? false,
      functional: prefs.functional ?? false,
      marketing: prefs.marketing ?? false,
    };
    setPreferences(newPrefs);
    localStorage.setItem("cookie_preferences", JSON.stringify(newPrefs));
    localStorage.setItem("cookie_consent", "custom");
    setShowBanner(false);
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  const hasConsent = preferences.analytics || preferences.functional || preferences.marketing;

  return (
    <CookieContext.Provider
      value={{
        preferences,
        hasConsent,
        showBanner: mounted && showBanner,
        acceptAll,
        rejectAll,
        acceptSpecific,
        hideBanner,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent(): CookieContextType {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieProvider");
  }
  return context;
}