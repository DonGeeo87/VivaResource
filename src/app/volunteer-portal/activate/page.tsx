"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVolunteerAuth } from "@/contexts/VolunteerAuthContext";
import { Mail, Lock, User, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Suspense } from "react";

function ActivateForm() {
  const { language } = useLanguage();
  const isES = language === "es";
  const { activateAccount, error, loading: authLoading } = useVolunteerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const regId = searchParams.get("reg");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailState, setEmailState] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);

  // Validate token and load volunteer data
  useEffect(() => {
    const validate = async () => {
      if (!token || !regId) {
        setValidating(false);
        return;
      }

      try {
        // Verify the activation token matches the registration
        const regDoc = await getDoc(doc(db, "volunteer_registrations", regId));
        if (!regDoc.exists()) {
          setValidating(false);
          return;
        }

        const data = regDoc.data();
        if (data.activation_token !== token) {
          setValidating(false);
          return;
        }

        if (data.status !== "approved") {
          setValidating(false);
          return;
        }

        setEmailState(data.email || email || "");
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setValid(true);
      } catch (err) {
        console.error("Error validating token:", err);
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [token, regId, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setSubmitting(true);
    try {
      await activateAccount(emailState, password, firstName, lastName, regId || undefined);
      router.push("/volunteer-portal/login?activated=true");
    } catch {
      // Error already set in context
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-surface to-secondary/10 flex items-center justify-center px-6 py-12">
        <LoadingSpinner size="lg" fullScreen />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-surface to-secondary/10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-surface-lowest rounded-2xl shadow-ambient-md p-8 border border-outline-variant/10">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
              {isES ? "Enlace Inválido" : "Invalid Link"}
            </h2>
            <p className="text-on-surface-variant mb-6">
              {isES
                ? "Este enlace de activación no es válido o ya ha sido usado. Si tu solicitud fue aprobada, revisa tu bandeja de correo para el enlace correcto."
                : "This activation link is invalid or has already been used. If your application was approved, check your email for the correct link."}
            </p>
            <a
              href="/get-involved"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              {isES ? "Aplicar como Voluntario" : "Apply as Volunteer"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const passwordMatch = password === confirmPassword && password.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-surface to-secondary/10 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">
            {isES ? "¡Bienvenido al Equipo!" : "Welcome to the Team!"}
          </h1>
          <p className="text-on-surface-variant mt-2">
            {isES
              ? "Tu solicitud fue aprobada. Crea tu contraseña para acceder al portal."
              : "Your application was approved. Create your password to access the portal."}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface-lowest rounded-2xl shadow-ambient-md p-8 border border-outline-variant/10">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-headline font-bold text-on-surface">
              {isES ? "Crear tu Cuenta" : "Create Your Account"}
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (pre-filled, editable) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  {isES ? "Nombre" : "First Name"}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-highest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  {isES ? "Apellido" : "Last Name"}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-highest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant/50"
                  required
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                {isES ? "Correo Electrónico" : "Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
                <input
                  type="email"
                  value={emailState}
                  onChange={(e) => setEmailState(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-outline-variant/20 rounded-lg text-on-surface/60"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                {isES ? "Contraseña" : "Password"} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-surface-highest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant/50"
                  placeholder={isES ? "Mínimo 6 caracteres" : "Minimum 6 characters"}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                {isES ? "Confirmar Contraseña" : "Confirm Password"} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-surface-highest border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant/50 ${
                    confirmPassword && !passwordMatch
                      ? "border-red-300 bg-red-50"
                      : "border-outline-variant/20"
                  }`}
                  placeholder={isES ? "Repite tu contraseña" : "Repeat your password"}
                  required
                  minLength={6}
                />
              </div>
              {confirmPassword && !passwordMatch && (
                <p className="text-xs text-red-600 mt-1">
                  {password !== confirmPassword
                    ? isES ? "Las contraseñas no coinciden" : "Passwords don't match"
                    : isES ? "Mínimo 6 caracteres" : "Minimum 6 characters"}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !passwordMatch}
              className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {isES ? "Crear Cuenta e Iniciar Sesión" : "Create Account & Sign In"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VolunteerActivatePage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
      <ActivateForm />
    </Suspense>
  );
}
