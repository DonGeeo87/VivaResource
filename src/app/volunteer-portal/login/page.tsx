"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVolunteerAuth } from "@/contexts/VolunteerAuthContext";
import { HandHeart, Mail, Lock, UserPlus, LogIn, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function VolunteerLoginPage() {
  const { language } = useLanguage();
  const isES = language === "es";
  const { login, signup, error, loading } = useVolunteerAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!firstName.trim() || !lastName.trim()) {
          return;
        }
        await signup(email, password, firstName, lastName);
      } else {
        await login(email, password);
      }
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

        {/* Auth Card */}
        <div className="bg-surface-lowest rounded-2xl shadow-ambient-md p-8 border border-outline-variant/10">
          {/* Toggle */}
          <div className="flex gap-2 mb-6 bg-surface-low p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                !isSignUp
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <LogIn className="w-4 h-4" />
              {isES ? "Iniciar Sesión" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                isSignUp
                  ? "bg-secondary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {isES ? "Crear Cuenta" : "Sign Up"}
            </button>
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
            {/* Name fields (Sign Up only) */}
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    {isES ? "Nombre" : "First Name"} *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-highest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant/50"
                    placeholder="Jane"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    {isES ? "Apellido" : "Last Name"} *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-highest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant/50"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            )}

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
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  {isES ? "Crear Cuenta" : "Create Account"}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {isES ? "Iniciar Sesión" : "Sign In"}
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <p className="text-center text-xs text-on-surface-variant mt-6">
            {isES
              ? "Si no tienes una cuenta, contacta al administrador para registrarte como voluntario."
              : "If you don't have an account, contact the administrator to register as a volunteer."}
          </p>
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
