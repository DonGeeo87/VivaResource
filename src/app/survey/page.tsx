"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";

const INTERESTS = {
  en: [
    { value: "job_training", label: "Job Training & Employment" },
    { value: "health_wellness", label: "Health & Wellness Workshops" },
    { value: "education", label: "Educational Programs (GED, College Prep)" },
    { value: "immigration", label: "Immigration Legal Help" },
    { value: "financial", label: "Financial Literacy & Savings" },
    { value: "housing", label: "Housing & Rental Assistance" },
    { value: "food", label: "Food Distribution & Nutrition" },
    { value: "childcare", label: "Childcare & Youth Programs" },
    { value: "language", label: "English Classes (ESL)" },
    { value: "digital", label: "Digital Skills & Technology" },
  ],
  es: [
    { value: "job_training", label: "Capacitación Laboral y Empleo" },
    { value: "health_wellness", label: "Talleres de Salud y Bienestar" },
    { value: "education", label: "Programas Educativos (GED, Preparación Universitaria)" },
    { value: "immigration", label: "Ayuda Legal de Inmigración" },
    { value: "financial", label: "Educación Financiera y Ahorros" },
    { value: "housing", label: "Asistencia de Vivienda y Alquiler" },
    { value: "food", label: "Distribución de Alimentos y Nutrición" },
    { value: "childcare", label: "Programas para Niños y Cuidado Infantil" },
    { value: "language", label: "Clases de Inglés (ESL)" },
    { value: "digital", label: "Habilidades Digitales y Tecnología" },
  ],
};

const BARRIERS = {
  en: [
    { value: "time", label: "I don't have time / Schedule conflicts" },
    { value: "location", label: "Location is too far / Hard to reach" },
    { value: "transport", label: "No transportation" },
    { value: "language", label: "Language barrier / Not in my language" },
    { value: "childcare", label: "No childcare available" },
    { value: "cost", label: "Cost is too high" },
    { value: "awareness", label: "I didn't know about the event" },
    { value: "interest", label: "Topics don't interest me" },
  ],
  es: [
    { value: "time", label: "No tengo tiempo / Conflictos de horario" },
    { value: "location", label: "La ubicación queda muy lejos" },
    { value: "transport", label: "No tengo transporte" },
    { value: "language", label: "Barrera del idioma / No está en mi idioma" },
    { value: "childcare", label: "No hay cuidado de niños disponible" },
    { value: "cost", label: "El costo es muy alto" },
    { value: "awareness", label: "No sabía del evento" },
    { value: "interest", label: "Los temas no me interesan" },
  ],
};

const CHANNELS = {
  en: [
    { value: "email", label: "Email" },
    { value: "whatsapp", label: "WhatsApp / Text Message" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "website", label: "Website" },
    { value: "flyer", label: "Flyers / Posters" },
    { value: "word_of_mouth", label: "Word of Mouth / Friend" },
  ],
  es: [
    { value: "email", label: "Correo Electrónico" },
    { value: "whatsapp", label: "WhatsApp / Mensaje de Texto" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "website", label: "Sitio Web" },
    { value: "flyer", label: "Volantes / Carteles" },
    { value: "word_of_mouth", label: "Boca a Boca / Amistades" },
  ],
};

const TIMES = {
  en: [
    { value: "morning", label: "Mornings (9AM - 12PM)" },
    { value: "afternoon", label: "Afternoons (12PM - 5PM)" },
    { value: "evening", label: "Evenings (5PM - 8PM)" },
    { value: "weekend", label: "Weekends" },
    { value: "flexible", label: "Flexible / No preference" },
  ],
  es: [
    { value: "morning", label: "Mañanas (9AM - 12PM)" },
    { value: "afternoon", label: "Tardes (12PM - 5PM)" },
    { value: "evening", label: "Noches (5PM - 8PM)" },
    { value: "weekend", label: "Fines de Semana" },
    { value: "flexible", label: "Flexible / Sin preferencia" },
  ],
};

const CHILDCARE = {
  en: [
    { value: "yes", label: "Yes, I would need childcare to attend" },
    { value: "no", label: "No, I don't need childcare" },
    { value: "maybe", label: "Maybe, depends on the event" },
  ],
  es: [
    { value: "yes", label: "Sí, necesitaría cuidado de niños para asistir" },
    { value: "no", label: "No, no necesito cuidado de niños" },
    { value: "maybe", label: "Tal vez, depende del evento" },
  ],
};

interface FormData {
  interests: string[];
  interests_other: string;
  barriers: string[];
  barriers_other: string;
  channels: string[];
  preferred_time: string;
  needs_childcare: string;
  wants_contact: boolean;
  contact_method: string;
  contact_value: string;
  comments: string;
}

export default function SurveyPage() {
  const { language } = useLanguage();
  const t = (en: string, es: string) => language === "es" ? es : en;
  const isES = language === "es";

  const [form, setForm] = useState<FormData>({
    interests: [],
    interests_other: "",
    barriers: [],
    barriers_other: "",
    channels: [],
    preferred_time: "",
    needs_childcare: "",
    wants_contact: false,
    contact_method: "email",
    contact_value: "",
    comments: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const toggleArray = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language }),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSubmitted(true);
    } catch {
      setError(t(
        "There was an error. Please try again.",
        "Hubo un error. Por favor intenta de nuevo."
      ));
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t("Thank You!", "¡Gracias!")}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {t(
              "Your responses help us create better events and services for our community.",
              "Tus respuestas nos ayudan a crear mejores eventos y servicios para nuestra comunidad."
            )}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Back to Home", "Volver al Inicio")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {t("Community Voice Survey", "Encuesta Voz Comunitaria")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("Help us serve you better", "Ayúdanos a servirte mejor")}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Interests */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t("What topics interest you most?", "¿Qué temas te interesan más?")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("Choose all that apply", "Elige todos los que apliquen")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isES ? INTERESTS.es : INTERESTS.en).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.interests.includes(opt.value)
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.interests.includes(opt.value)}
                    onChange={() =>
                      setForm({ ...form, interests: toggleArray(form.interests, opt.value) })
                    }
                    className="mt-1 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm md:text-base">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.interests.includes("other")}
                  onChange={() =>
                    setForm({ ...form, interests: toggleArray(form.interests, "other") })
                  }
                  className="mt-1 rounded text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm md:text-base font-medium">
                    {t("Other:", "Otro:")}
                  </span>
                  <input
                    type="text"
                    value={form.interests_other}
                    onChange={(e) => setForm({ ...form, interests_other: e.target.value })}
                    placeholder={t("Tell us more...", "Cuéntanos más...")}
                    className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </label>
            </div>
          </section>

          {/* 2. Barriers */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t("What prevents you from attending our events?", "¿Qué te impide asistir a nuestros eventos?")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("Choose all that apply", "Elige todos los que apliquen")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isES ? BARRIERS.es : BARRIERS.en).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.barriers.includes(opt.value)
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.barriers.includes(opt.value)}
                    onChange={() =>
                      setForm({ ...form, barriers: toggleArray(form.barriers, opt.value) })
                    }
                    className="mt-1 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm md:text-base">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.barriers.includes("other")}
                  onChange={() =>
                    setForm({ ...form, barriers: toggleArray(form.barriers, "other") })
                  }
                  className="mt-1 rounded text-amber-500 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <span className="text-sm md:text-base font-medium">
                    {t("Other:", "Otro:")}
                  </span>
                  <input
                    type="text"
                    value={form.barriers_other}
                    onChange={(e) => setForm({ ...form, barriers_other: e.target.value })}
                    placeholder={t("Tell us more...", "Cuéntanos más...")}
                    className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </label>
            </div>
          </section>

          {/* 3. Channels */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t("How do you prefer to receive information?", "¿Cómo prefieres recibir información?")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("Choose all that apply", "Elige todos los que apliquen")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isES ? CHANNELS.es : CHANNELS.en).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.channels.includes(opt.value)
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.channels.includes(opt.value)}
                    onChange={() =>
                      setForm({ ...form, channels: toggleArray(form.channels, opt.value) })
                    }
                    className="mt-1 rounded text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-sm md:text-base">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 4. Preferred Time */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t("What time works best for you?", "¿Qué horario te funciona mejor?")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("Choose one", "Elige uno")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isES ? TIMES.es : TIMES.en).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.preferred_time === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="preferred_time"
                    checked={form.preferred_time === opt.value}
                    onChange={() => setForm({ ...form, preferred_time: opt.value })}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm md:text-base">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 5. Childcare */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t("Do you need childcare to attend?", "¿Necesitas cuidado de niños para asistir?")}
            </h2>
            <div className="grid grid-cols-1 gap-3 mt-4">
              {(isES ? CHILDCARE.es : CHILDCARE.en).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.needs_childcare === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="childcare"
                    checked={form.needs_childcare === opt.value}
                    onChange={() => setForm({ ...form, needs_childcare: opt.value })}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm md:text-base">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 6. Contact */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t("Would you like to be contacted?", "¿Te gustaría que te contactemos?")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("We'll reach out with personalized event recommendations.", "Te contactaremos con recomendaciones de eventos personalizados.")}
            </p>
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={form.wants_contact}
                onChange={(e) => setForm({ ...form, wants_contact: e.target.checked })}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm md:text-base font-medium">
                {t("Yes, contact me!", "¡Sí, contáctame!")}
              </span>
            </label>

            {form.wants_contact && (
              <div className="space-y-4 pl-2 border-l-4 border-primary/30">
                <div className="flex gap-3">
                  <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer flex-1 ${
                    form.contact_method === "email" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}>
                    <input
                      type="radio"
                      name="contact_method"
                      value="email"
                      checked={form.contact_method === "email"}
                      onChange={() => setForm({ ...form, contact_method: "email" })}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="font-medium">{t("Email", "Correo")}</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer flex-1 ${
                    form.contact_method === "phone" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}>
                    <input
                      type="radio"
                      name="contact_method"
                      value="phone"
                      checked={form.contact_method === "phone"}
                      onChange={() => setForm({ ...form, contact_method: "phone" })}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="font-medium">{t("Phone", "Teléfono")}</span>
                  </label>
                </div>
                <input
                  type={form.contact_method === "email" ? "email" : "tel"}
                  value={form.contact_value}
                  onChange={(e) => setForm({ ...form, contact_value: e.target.value })}
                  placeholder={
                    form.contact_method === "email"
                      ? t("your@email.com", "tu@correo.com")
                      : t("(555) 123-4567", "(555) 123-4567")
                  }
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            )}
          </section>

          {/* 7. Comments */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t("Any other comments?", "¿Otros comentarios?")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("Optional", "Opcional")}
            </p>
            <textarea
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              rows={4}
              placeholder={t(
                "Share your thoughts, ideas, or concerns...",
                "Comparte tus pensamientos, ideas o inquietudes..."
              )}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("Sending...", "Enviando...")}
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {t("Submit Survey", "Enviar Encuesta")}
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}