"use client";

import { useState, useEffect } from "react";
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

// Pre-defined color values for each theme (no dynamic Tailwind classes)
const THEME_COLORS = [
  { badge: "#6366f1", heading: "#4338ca", ring: "#c7d2fe", chipBorder: "#c7d2fe", chipBg: "#eef2ff", chipBorderChecked: "#6366f1", label: "rgba(99,102,241,0.15)", gradient: "linear-gradient(180deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 50%, transparent 100%)" },
  { badge: "#f59e0b", heading: "#b45309", ring: "#fde68a", chipBorder: "#fde68a", chipBg: "#fffbeb", chipBorderChecked: "#f59e0b", label: "rgba(245,158,11,0.15)", gradient: "linear-gradient(180deg, rgba(245,158,11,0.12) 0%, rgba(249,115,22,0.06) 50%, transparent 100%)" },
  { badge: "#8b5cf6", heading: "#7c3aed", ring: "#ddd6fe", chipBorder: "#ddd6fe", chipBg: "#f5f3ff", chipBorderChecked: "#8b5cf6", label: "rgba(139,92,246,0.15)", gradient: "linear-gradient(180deg, rgba(139,92,246,0.12) 0%, rgba(232,121,249,0.06) 50%, transparent 100%)" },
  { badge: "#10b981", heading: "#047857", ring: "#a7f3d0", chipBorder: "#a7f3d0", chipBg: "#ecfdf5", chipBorderChecked: "#10b981", label: "rgba(16,185,129,0.15)", gradient: "linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(20,184,166,0.06) 50%, transparent 100%)" },
  { badge: "#f43f5e", heading: "#be123c", ring: "#fecdd3", chipBorder: "#fecdd3", chipBg: "#fff1f2", chipBorderChecked: "#f43f5e", label: "rgba(244,63,94,0.15)", gradient: "linear-gradient(180deg, rgba(244,63,94,0.12) 0%, rgba(236,72,153,0.06) 50%, transparent 100%)" },
  { badge: "#0ea5e9", heading: "#0369a1", ring: "#bae6fd", chipBorder: "#bae6fd", chipBg: "#f0f9ff", chipBorderChecked: "#0ea5e9", label: "rgba(14,165,233,0.15)", gradient: "linear-gradient(180deg, rgba(14,165,233,0.12) 0%, rgba(59,130,246,0.06) 50%, transparent 100%)" },
  { badge: "#64748b", heading: "#475569", ring: "#e2e8f0", chipBorder: "#e2e8f0", chipBg: "#f8fafc", chipBorderChecked: "#64748b", label: "rgba(100,116,139,0.15)", gradient: "linear-gradient(180deg, rgba(100,116,139,0.12) 0%, rgba(148,163,184,0.06) 50%, transparent 100%)" },
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

// ---------- ANIMATED BACKGROUND (cross-fade) ----------
function useAnimatedBackground() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [fade, setFade] = useState(0); // 0 = current visible, 1 = next visible
  const colors = [
    "#c7d2fe", "#fde68a", "#ddd6fe",
    "#a7f3d0", "#fecdd3", "#bae6fd", "#e2e8f0",
  ];

  const gradient = (i: number) =>
    `linear-gradient(135deg, ${colors[i]} 0%, ${colors[(i + 1) % colors.length]} 50%, ${colors[(i + 2) % colors.length]} 100%)`;

  useEffect(() => {
    // Primer cambio a los 2s, luego cada 5s
    const timeout = setTimeout(() => {
      setNext(1);
      setFade(1); // fade → next
      setTimeout(() => {
        setCurrent(1);
        setNext(null);
        setFade(0);
      }, 2000);
    }, 2000);

    const interval = setInterval(() => {
      setCurrent((prev) => {
        const nextIdx = (prev + 1) % colors.length;
        setNext(nextIdx);
        setFade(1); // start fade
        setTimeout(() => {
          setCurrent(nextIdx);
          setNext(null);
          setFade(0);
        }, 2000);
        return prev; // keep old until timeout updates it
      });
    }, 5000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return {
    currentGradient: gradient(current),
    nextGradient: next !== null ? gradient(next) : gradient(current),
    fadeOpacity: fade, // 0→1 over 2s
  };
}

export default function SurveyPage() {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const isES = language === "es";
  const animatedBg = useAnimatedBackground();

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
    const c = THEME_COLORS[themeIndex];
    return (
      <section
        data-section
        data-theme={["indigo","amber","violet","emerald","rose","sky","slate"][themeIndex]}
        className="relative rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-500 hover:shadow-md"
        style={{
          background: c.gradient,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: `0 0 0 1px ${c.ring}`,
        }}
      >
        {/* Question number badge */}
        <div className="flex items-center gap-3 mb-1">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: c.badge }}
          >
            {questionNum}
          </span>
          <h2 className="text-xl font-bold" style={{ color: c.heading }}>
            {question}
          </h2>
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
    const c = THEME_COLORS[themeIndex];
    return (
      <label
        className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-200"
        style={{
          borderColor: checked ? c.chipBorderChecked : c.chipBorder,
          backgroundColor: checked ? c.chipBg : "rgba(255,255,255,0.6)",
          transform: checked ? "scale(1.02)" : "scale(1)",
          boxShadow: checked ? `0 1px 3px ${c.label}` : "none",
        }}
      >
        <input
          type={type}
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className="w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            borderRadius: type === "radio" ? "9999px" : "6px",
            backgroundColor: checked ? c.badge : "white",
            borderColor: checked ? c.badge : "#d1d5db",
          }}
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
    <div className="min-h-screen relative">
      {/* Current background */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
        style={{
          background: animatedBg.currentGradient,
          opacity: 1 - animatedBg.fadeOpacity,
        }}
      />
      {/* Next background (cross-fade) */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
        style={{
          background: animatedBg.nextGradient,
          opacity: animatedBg.fadeOpacity,
        }}
      />
      {/* Content */}
      <div className="relative z-10">
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
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: filled ? "8px" : "6px",
                    height: filled ? "8px" : "6px",
                    backgroundColor: filled ? "#6366f1" : "#e5e7eb",
                  }}
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
              <div className="mt-4 space-y-4 pl-4" style={{ borderLeft: "4px solid #7dd3fc" }}>
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
      </div>{/* end content wrapper */}
    </div>
  );
}