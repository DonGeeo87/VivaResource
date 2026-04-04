"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Users, Shield, ArrowLeft } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/i18n/translations";

type PortalType = "admin" | "volunteer";

export default function AdminLoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [portal, setPortal] = useState<PortalType>("admin");
  const [isHydrated, setIsHydrated] = useState(false);
  const [bgShift, setBgShift] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handlePortalChange = (newPortal: PortalType) => {
    setBgShift((prev) => !prev);
    setPortal(newPortal);
    setError("");
  };

  const t = isHydrated 
    ? translations[language]?.admin?.login 
    : translations.en.admin.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, "admin_users", result.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error("No access");
      }

      if (portal === "admin") {
        router.push("/admin");
      } else {
        router.push("/volunteer-portal");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(t?.invalidCredentials || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolunteerRedirect = () => {
    router.push("/get-involved");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ease-in-out ${
        bgShift
          ? "from-secondary/90 via-primary/85 to-primary/95"
          : "from-primary/95 via-primary/90 to-secondary/80"
      }`} />

      {/* Secondary gradient layer for depth */}
      <div className={`absolute inset-0 bg-gradient-to-tr transition-all duration-1000 ease-in-out delay-200 ${
        bgShift
          ? "from-primary/30 via-transparent to-secondary/20"
          : "from-secondary/20 via-transparent to-primary/30"
      }`} />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl transition-all duration-1000 ${
          bgShift ? "bg-secondary/20 translate-x-10" : "bg-white/5 animate-pulse"
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl transition-all duration-1000 delay-300 ${
          bgShift ? "bg-primary/20 translate-y-10" : "bg-white/5 animate-pulse"
        }`} style={{ animationDelay: "1s" }} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 delay-500 ${
          bgShift ? "bg-primary/15 scale-110" : "bg-secondary/10 animate-pulse"
        }`} style={{ animationDelay: "2s" }} />
        {/* Extra floating element */}
        <div className={`absolute top-20 left-1/4 w-64 h-64 rounded-full blur-3xl transition-all duration-1000 delay-150 ${
          bgShift ? "bg-white/10 -translate-y-8" : "bg-primary/5 translate-y-4"
        }`} />
        <div className={`absolute bottom-20 right-1/4 w-72 h-72 rounded-full blur-3xl transition-all duration-1000 delay-700 ${
          bgShift ? "bg-secondary/15 translate-y-12" : "bg-white/5 -translate-y-4"
        }`} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Fade-in Animation */}
          <div className="animate-fade-in">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Viva Resource Logo"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Viva Resource Foundation
              </h1>
              <p className="text-white/80 text-lg">
                {portal === "admin" ? t?.title : t?.volunteerTitle}
              </p>
            </div>

            {/* Portal Selector */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 mb-6 flex gap-2">
              <button
                onClick={() => handlePortalChange("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-500 ${
                  portal === "admin"
                    ? "bg-white text-primary shadow-lg scale-[1.02]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm">{t?.adminPortal}</span>
              </button>
              <button
                onClick={() => handlePortalChange("volunteer")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-500 ${
                  portal === "volunteer"
                    ? "bg-white text-secondary shadow-lg scale-[1.02]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm">{t?.volunteerPortal}</span>
              </button>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 transition-all duration-500">
              <div className="mb-6 transition-all duration-500">
                <h2 className="text-2xl font-bold text-gray-900 transition-colors duration-300">
                  {portal === "admin" ? t?.title : t?.volunteerTitle}
                </h2>
                <p className="text-gray-500 mt-1">
                  {portal === "admin" ? t?.subtitle : t?.volunteerSubtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t?.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder={t?.emailPlaceholder}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t?.password}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white pr-12"
                      placeholder={t?.passwordPlaceholder}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {portal === "admin" && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-gray-600">{language === "es" ? "Recordarme" : "Remember me"}</span>
                    </label>
                    <a href="#" className="text-primary hover:text-primary-hover transition-colors font-medium">
                      {t?.forgotPassword}
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                    portal === "admin"
                      ? "bg-primary hover:bg-primary-hover"
                      : "bg-secondary hover:bg-secondary/90"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t?.signingIn}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      {t?.signIn}
                    </>
                  )}
                </button>
              </form>

              {portal === "volunteer" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      {t?.orSeparator}
                    </p>
                    <button
                      onClick={handleVolunteerRedirect}
                      className="w-full py-3 px-4 border-2 border-secondary text-secondary rounded-xl font-semibold hover:bg-secondary/5 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      {t?.registerLink}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <a 
                  href="/" 
                  className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  {t?.backToSite}
                </a>
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-white/60 text-sm mt-6 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              {t?.authorizedOnly}
            </p>
          </div>
        </div>
      </div>

      {/* Inline Styles for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
