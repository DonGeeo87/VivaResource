"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, Sparkles } from "lucide-react";

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
    { value: "health", label: "Problemas de salud / Discapacidad" },
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

// ---------- COLOR THEMES FOR EACH SECTION ----------
const SECTION_THEMES = [
  { bg: "from-indigo-500/10 via-purple-500/5 to-transparent", accent: "indigo", border: "border-indigo-200", card: "bg-white/90 backdrop-blur-sm ring-1 ring-indigo-100", bullet: "text-indigo-500", chip: "border-indigo-200 hover:border-indigo-400 data-[checked]:bg-indigo-50 data-[checked]:border-indigo-500", label: "text-indigo-700" },
  { bg: "from-amber-500/10 via-orange-500/5 to-transparent", accent: "amber", border: "border-amber-200", card: "bg-white/90 backdrop-blur-sm ring-1 ring-amber-100", bullet: "text-amber-500", chip: "border-amber-200 hover:border-amber-400 data-[checked]:bg-amber-50 data-[checked]:border-amber-500", label: "text-amber-700" },
  { bg: "from-violet-500/10 via-fuchsia-500/5 to-transparent", accent: "violet", border: "border-violet-200", card: "bg-white/90 backdrop-blur-sm ring-1 ring-violet-100", bullet: "text-violet-500", chip: "border-violet-200 hover:border-violet-400 data-[checked]:bg-violet-50 data-[checked]:border-violet-500", label: "text-violet-700" },
  { bg: "from-emerald-500/10 via-teal-500/5 to-transparent", accent: "emerald", border: "border-emerald-200", card: "bg-white/90 backdrop-blur-sm ring-1 ring-emerald-100", bullet: "text-emerald-500", chip: "border-emerald-200 hover:border-emerald-400 data-[checked]:bg-emerald-50 data-[checked]:border-emerald-500", label: "text-emerald-700" },
  { bg: "from-rose-500/10 via-pink-500/5 to-transparent", accent: "rose", border: "border-rose-200", card: "bg-white/90 backdrop-blur-sm ring-1 ring-rose-100", bullet: "text-rose-500", chip: "border-rose-200 hover:border-rose-400 data-[checked]:bg-rose-50 data-[checked]:border-rose-500", label: "text-rose-700" },
  { bg: "from-sky-500/10 via-blue-500/5 to-transparent", accent: "sky", border: "border-sky-200", card: "bg-white/90 backdrop-blur-sm ring-1 ring-sky-100", bullet: "text-sky-500", chip: "border-sky-200 hover:border-sky-400 data-[checked]:bg-sky-50 data-[checked]:border-sky-500", label: "text-sky-700" },
  { bg: "from-slate-400/10 via-gray-400/5 to-transparent", accent: "slate", border: "border-slate-200", card: "bg-white/90 backdrop-blur-sm ring-1 ring-slate-100", bullet: "text-slate-500", chip: "border-slate-200 hover:border-slate-400 data-[checked]:bg-slate-50 data-[checked]:border-slate-500", label: "text-slate-700" },
];

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

// ---------- SCROLL WATCH BACKGROUND ----------
function useScrollGradient() {
  const [gradient, setGradient] = useState("from-indigo-50 via-purple-50 to-blue-50");

  useEffect(() => {
    const sections = document.querySelectorAll("[data-section]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute("data-theme");
            if (theme) {
              setGradient(
                `from-${theme}-50 via-${theme}-50/70 to-${theme}-100`
              );
            }
            break;
          }
        }
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return gradient;
}

export default function SurveyPage() {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const isES = language === "es";
  const scrollGradient = useScrollGradient();

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
      setError(
        t(
          "There was an error. Please try again.",
          "Hubo un error. Por favor intenta de nuevo."
        )
      );
    } finally {
      setSending(false);
    }
  };

  // ---------- SUBMITTED STATE ----------
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t("Thank You!", "¡Gracias!")}
          </h1>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {t(
              "Your responses help us create better events and services for our community.",
              "Tus respuestas nos ayudan a crear mejores eventos y servicios para nuestra comunidad."
            )}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Back to Home", "Volver al Inicio")}
          </Link>
        </div>
      </div>
    );
  }

  // ---------- SECTION RENDERER ----------
  function Section({
    themeIndex,
    question,
    subtitle,
    questionNum,
    children,
  }: {
    themeIndex: number;
    question: string;
    subtitle?: string;
    questionNum: number;
    children: React.ReactNode;
  }) {
    const theme = SECTION_THEMES[themeIndex];
    return (
      <section
        data-section
        data-theme={theme.accent}
        className={`relative rounded-3xl ${theme.card} p-6 md:p-8 shadow-sm transition-all duration-500 hover:shadow-md`}
      >
        {/* Question number badge */}
        <div className="flex items-center gap-3 mb-1">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white bg-${theme.accent}-500`}
          >
            {questionNum}
          </span>
          <h2 className={`text-xl font-bold ${theme.label}`}>{question}</h2>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 ml-10 mb-4">{subtitle}</p>
        )}
        <div className="mt-4">{children}</div>
      </section>
    );
  }

  // ---------- CHIP CHECKBOX ----------
  function ChipCheckbox({
    checked,
    onChange,
    label,
    themeIndex,
    type = "checkbox",
    name,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    themeIndex: number;
    type?: "checkbox" | "radio";
    name?: string;
  }) {
    const theme = SECTION_THEMES[themeIndex];
    return (
      <label
        data-checked={checked || undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${theme.chip} ${
          checked
            ? `shadow-sm scale-[1.02]`
            : "bg-white/60"
        }`}
      >
        <input
          type={type}
          name={name}
          checked={checked}
          onChange={onChange}
          className={`sr-only`}
        />
        <div
          className={`w-5 h-5 rounded-${type === "radio" ? "full" : "md"} border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            checked
              ? `bg-${theme.accent}-500 border-${theme.accent}-500`
              : "border-gray-300 bg-white"
          }`}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <span className="text-sm md:text-base font-medium text-gray-800">
          {label}
        </span>
      </label>
    );
  }

  // ---------- MAIN RENDER ----------
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${scrollGradient} transition-all duration-700 ease-in-out`}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t("Community Voice Survey", "Encuesta Voz Comunitaria")}
            </h1>
            <p className="text-xs text-gray-500">
              {t("~2 min • Help us serve you better", "~2 min • Ayúdanos a servirte mejor")}
            </p>
          </div>
          {/* Progress dots */}
          <div className="hidden sm:flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => {
              const filled =
                (n === 1 && form.interests.length > 0) ||
                (n === 2 && form.barriers.length > 0) ||
                (n === 3 && form.channels.length > 0) ||
                (n === 4 && form.preferred_time !== "") ||
                (n === 5 && form.needs_childcare !== "") ||
                (n === 6 && form.wants_contact) ||
                (n === 7 && form.comments.length > 0);
              return (
                <div
                  key={n}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    filled
                      ? "bg-primary scale-100"
                      : "bg-gray-200 scale-75"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Interests */}
          <Section
            themeIndex={0}
            questionNum={1}
            question={t(
              "What topics interest you most?",
              "¿Qué temas te interesan más?"
            )}
            subtitle={t("Choose all that apply", "Elige todos los que apliquen")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isES ? INTERESTS.es : INTERESTS.en).map((opt) => (
                <ChipCheckbox
                  key={opt.value}
                  themeIndex={0}
                  checked={form.interests.includes(opt.value)}
                  onChange={() =>
                    setForm({
                      ...form,
                      interests: toggleArray(form.interests, opt.value),
                    })
                  }
                  label={opt.label}
                />
              ))}
            </div>
            <div className="mt-3">
              <ChipCheckbox
                themeIndex={0}
                checked={form.interests.includes("other")}
                onChange={() =>
                  setForm({
                    ...form,
                    interests: toggleArray(form.interests, "other"),
                  })
                }
                label={t("Other:", "Otro:")}
              />
              {form.interests.includes("other") && (
                <input
                  type="text"
                  value={form.interests_other}
                  onChange={(e) =>
                    setForm({ ...form, interests_other: e.target.value })
                  }
                  placeholder={t("Tell us more...", "Cuéntanos más...")}
                  className="mt-2 w-full bg-white/80 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              )}
            </div>
          </Section>

          {/* 2. Barriers */}
          <Section
            themeIndex={1}
            questionNum={2}
            question={t(
              "What prevents you from attending our events?",
              "¿Qué te impide asistir a nuestros eventos?"
            )}
            subtitle={t("Choose all that apply", "Elige todos los que apliquen")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isES ? BARRIERS.es : BARRIERS.en).map((opt) => (
                <ChipCheckbox
                  key={opt.value}
                  themeIndex={1}
                  checked={form.barriers.includes(opt.value)}
                  onChange={() =>
                    setForm({
                      ...form,
                      barriers: toggleArray(form.barriers, opt.value),
                    })
                  }
                  label={opt.label}
                />
              ))}
            </div>
            <div className="mt-3">
              <ChipCheckbox
                themeIndex={1}
                checked={form.barriers.includes("other")}
                onChange={() =>
                  setForm({
                    ...form,
                    barriers: toggleArray(form.barriers, "other"),
                  })
                }
                label={t("Other:", "Otro:")}
              />
              {form.barriers.includes("other") && (
                <input
                  type="text"
                  value={form.barriers_other}
                  onChange={(e) =>
                    setForm({ ...form, barriers_other: e.target.value })
                  }
                  placeholder={t("Tell us more...", "Cuéntanos más...")}
                  className="mt-2 w-full bg-white/80 border border-amber-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              )}
            </div>
          </Section>

          {/* 3. Channels */}
          <Section
            themeIndex={2}
            questionNum={3}
            question={t(
              "How do you prefer to receive information?",
              "¿Cómo prefieres recibir información?"
            )}
            subtitle={t("Choose all that apply", "Elige todos los que apliquen")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isES ? CHANNELS.es : CHANNELS.en).map((opt) => (
                <ChipCheckbox
                  key={opt.value}
                  themeIndex={2}
                  checked={form.channels.includes(opt.value)}
                  onChange={() =>
                    setForm({
                      ...form,
                      channels: toggleArray(form.channels, opt.value),
                    })
                  }
                  label={opt.label}
                />
              ))}
            </div>
          </Section>

          {/* 4. Preferred Time */}
          <Section
            themeIndex={3}
            questionNum={4}
            question={t(
              "What time works best for you?",
              "¿Qué horario te funciona mejor?"
            )}
            subtitle={t("Choose one", "Elige uno")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isES ? TIMES.es : TIMES.en).map((opt) => (
                <ChipCheckbox
                  key={opt.value}
                  themeIndex={3}
                  type="radio"
                  name="preferred_time"
                  checked={form.preferred_time === opt.value}
                  onChange={() =>
                    setForm({ ...form, preferred_time: opt.value })
                  }
                  label={opt.label}
                />
              ))}
            </div>
          </Section>

          {/* 5. Childcare */}
          <Section
            themeIndex={4}
            questionNum={5}
            question={t(
              "Do you need childcare to attend?",
              "¿Necesitas cuidado de niños para asistir?"
            )}
          >
            <div className="grid grid-cols-1 gap-3">
              {(isES ? CHILDCARE.es : CHILDCARE.en).map((opt) => (
                <ChipCheckbox
                  key={opt.value}
                  themeIndex={4}
                  type="radio"
                  name="childcare"
                  checked={form.needs_childcare === opt.value}
                  onChange={() =>
                    setForm({ ...form, needs_childcare: opt.value })
                  }
                  label={opt.label}
                />
              ))}
            </div>
          </Section>

          {/* 6. Contact */}
          <Section
            themeIndex={5}
            questionNum={6}
            question={t(
              "Would you like to be contacted?",
              "¿Te gustaría que te contactemos?"
            )}
            subtitle={t(
              "We'll reach out with personalized event recommendations.",
              "Te contactaremos con recomendaciones de eventos personalizados."
            )}
          >
            <ChipCheckbox
              themeIndex={5}
              checked={form.wants_contact}
              onChange={() =>
                setForm({ ...form, wants_contact: !form.wants_contact })
              }
              label={t("Yes, contact me!", "¡Sí, contáctame!")}
            />
            {form.wants_contact && (
              <div className="mt-4 space-y-4 pl-4 border-l-4 border-sky-300">
                <div className="flex gap-3">
                  <ChipCheckbox
                    themeIndex={5}
                    type="radio"
                    name="contact_method"
                    checked={form.contact_method === "email"}
                    onChange={() => setForm({ ...form, contact_method: "email" })}
                    label={t("Email", "Correo")}
                  />
                  <ChipCheckbox
                    themeIndex={5}
                    type="radio"
                    name="contact_method"
                    checked={form.contact_method === "phone"}
                    onChange={() => setForm({ ...form, contact_method: "phone" })}
                    label={t("Phone", "Teléfono")}
                  />
                </div>
                <input
                  type={form.contact_method === "email" ? "email" : "tel"}
                  value={form.contact_value}
                  onChange={(e) =>
                    setForm({ ...form, contact_value: e.target.value })
                  }
                  placeholder={
                    form.contact_method === "email"
                      ? t("your@email.com", "tu@correo.com")
                      : t("(555) 123-4567", "(555) 123-4567")
                  }
                  className="w-full bg-white/80 border border-sky-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
            )}
          </Section>

          {/* 7. Comments */}
          <Section
            themeIndex={6}
            questionNum={7}
            question={t("Any other comments?", "¿Otros comentarios?")}
            subtitle={t("Optional", "Opcional")}
          >
            <textarea
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              rows={4}
              placeholder={t(
                "Share your thoughts, ideas, or concerns...",
                "Comparte tus pensamientos, ideas o inquietudes..."
              )}
              className="w-full bg-white/80 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none resize-none"
            />
          </Section>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {t("Submit Survey", "Enviar Encuesta")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}