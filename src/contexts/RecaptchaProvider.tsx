// reCAPTCHA v3 Provider for Viva Resource Foundation
// Must be used client-side only due to SSR limitations
"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

export default function RecaptchaProvider({ children }: RecaptchaProviderProps): JSX.Element {
  // If no site key configured, render children without reCAPTCHA
  if (!RECAPTCHA_SITE_KEY) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
