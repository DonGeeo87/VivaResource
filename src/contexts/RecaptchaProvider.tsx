// reCAPTCHA v3 Provider for Viva Resource Foundation
// Optimizado con carga lazy - solo se carga cuando se necesita
"use client";

import { useState, useEffect } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

// Componente wrapper que carga reCAPTCHA solo cuando se necesita
function RecaptchaLoader({ children }: { children: React.ReactNode }): JSX.Element {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Escuchar eventos para cargar reCAPTCHA solo en páginas con formularios
    const handleLoadRecaptcha = () => {
      setShouldLoad(true);
    };

    window.addEventListener("load-recaptcha", handleLoadRecaptcha);
    
    // Auto-cargar después de 3 segundos si no se ha cargado
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 3000);

    return () => {
      window.removeEventListener("load-recaptcha", handleLoadRecaptcha);
      clearTimeout(timer);
    };
  }, []);

  if (!shouldLoad) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
        nonce: undefined,
      }}
      container={{
        parameters: {
          badge: "bottomright",
        },
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}

export default function RecaptchaProvider({ children }: RecaptchaProviderProps): JSX.Element {
  // If no site key configured, render children without reCAPTCHA
  if (!RECAPTCHA_SITE_KEY) {
    return <>{children}</>;
  }

  return <RecaptchaLoader>{children}</RecaptchaLoader>;
}

// Exportar función para trigger manual
export function triggerRecaptchaLoad(): void {
  window.dispatchEvent(new CustomEvent("load-recaptcha"));
}
