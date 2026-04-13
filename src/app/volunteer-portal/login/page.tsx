"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVolunteerAuth } from "@/contexts/VolunteerAuthContext";
import { HandHeart, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Suspense } from "react";

function VolunteerLoginForm() {
  const { language } = useLanguage();
  const isES = language === "es";
  const { login, error, loading, user } = useVolunteerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activated = searchParams.get("activated");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/volunteer-portal");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/volunteer-portal");
    } catch {
      // Error already set in context
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-surface to-secondary/10 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HandHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">
            {isES ? "Portal de Voluntarios" : "Volunteer Portal"}
          </h1>
          <p className="text-on-surface-variant mt-2">
            {isES
              ? "Accede a tu panel de voluntario"
              : "Access your volunteer dashboard"}
          </p>
        </div>

        {/* Activation Success Message */}
        {activated === "true" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
            <div>
              <p className="text-sm font-medium text-green-800">
                {isES ? "¡Perfil creado exitosamente!" : "Profile created successfully!"}
              </p>
              <p className="text-xs text-green-700 mt-1">
                {isES ? "Ahora inicia sesión con tu correo y contraseña." : "Now sign in with your email and password."}
              </p>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-surface-lowest rounded-2xl shadow-ambient-md p-8 border border-outline-variant/10">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <LogIn className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-headline font-bold text-on-surface">
              {isES ? "Iniciar Sesión" : "Sign In"}
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
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                {isES ? "Correo Electrónico" : "Email"} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-highest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant/50"
                  placeholder="volunteer@example.com"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-highest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant/50"
                  placeholder={isES ? "Tu contraseña" : "Your password"}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {isES ? "Iniciar Sesión" : "Sign In"}
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant text-center">
              {isES
                ? "¿No tienes cuenta? Aplica como voluntario en nuestra página de "
                : "Don't have an account? Apply as a volunteer on our "}
              <a href="/get-involved" className="text-primary hover:underline font-medium">
                {isES ? "Únete a Nuestra Causa" : "Get Involved"}
              </a>
              {isES ? ". Una vez aprobado, recibirás un correo para crear tu contraseña." : " page. Once approved, you'll receive an email to create your password."}
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            {isES ? "← Volver al inicio" : "← Back to Home"}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VolunteerLoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
      <VolunteerLoginForm />
    </Suspense>
  );
}
