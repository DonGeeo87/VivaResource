// Hook para verificar reCAPTCHA v3 en formularios
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

/**
 * Verifica reCAPTCHA v3 y retorna el token.
 * Si no hay site key configurado, retorna null (modo dev).
 */
export async function verifyRecaptcha(
  executeRecaptcha: ReturnType<typeof useGoogleReCaptcha>["executeRecaptcha"] | undefined,
  action: string = "form_submit"
): Promise<string | null> {
  // Si no hay site key, estamos en dev - saltar verificacion
  if (!RECAPTCHA_SITE_KEY) {
    console.warn("[reCAPTCHA] No site key configured, skipping verification (dev mode)");
    return null;
  }

  if (!executeRecaptcha) {
    console.error("[reCAPTCHA] executeRecaptcha not available");
    return null;
  }

  try {
    const token = await executeRecaptcha(action);
    return token;
  } catch (error) {
    console.error("[reCAPTCHA] Error verifying:", error);
    return null;
  }
}

/**
 * Verifica el token de reCAPTCHA en el servidor.
 * Retorna true si la verificacion es exitosa.
 */
export async function validateRecaptchaToken(
  token: string | null,
  action: string = "form_submit"
): Promise<boolean> {
  // Si no hay token (dev mode), permitir
  if (!token) {
    return true;
  }

  try {
    const response = await fetch("/api/recaptcha/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("[reCAPTCHA] Error validating token:", error);
    return false;
  }
}
