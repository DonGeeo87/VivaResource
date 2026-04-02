"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Handshake,
  Home,
  Lock,
  MoreHorizontal,
  Phone,
  School,
  Stethoscope,
  Users,
  UtensilsCrossed,
  Verified,
  HeartHandshake,
  X,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  description: string;
}

interface ChecklistItemProps {
  text: string;
}

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

function StepCard({
  number,
  icon,
  iconBgClass,
  title,
  description,
}: StepCardProps) {
  return (
    <div className="relative group">
      <div className="text-9xl font-black text-primary/5 absolute -top-12 -left-4">
        {number}
      </div>
      <div className="relative z-10 pt-8">
        <div
          className={`w-16 h-16 ${iconBgClass} rounded-full flex items-center justify-center mb-6 shadow-md`}
        >
          {icon}
        </div>
        <h3 className="font-headline text-xl font-bold mb-3 text-primary">
          {title}
        </h3>
        <p className="text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ text }: ChecklistItemProps) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
      <span className="text-sm">{text}</span>
    </li>
  );
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-bold text-sm">{text}</span>
    </div>
  );
}

// Crisis Help Modal Component
function CrisisModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="font-headline text-2xl font-bold text-primary mb-2">
            Immediate Crisis Help / Ayuda Inmediata
          </h2>
          <p className="text-on-surface-variant text-sm">
            If you or someone you know is in crisis, please reach out to one of
            these resources:
          </p>
        </div>

        <div className="space-y-4">
          {/* 988 Lifeline */}
          <a
            href="tel:988"
            className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-red-700">
                988 Suicide & Crisis Lifeline
              </p>
              <p className="text-sm text-red-600">
                Call or Text 988 — 24/7, Free & Confidential
              </p>
            </div>
          </a>

          {/* Crisis Text Line */}
          <a
            href="sms:741741"
            className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-blue-700">
                Crisis Text Line
              </p>
              <p className="text-sm text-blue-600">
                Text HOME to 741741 — 24/7 Support
              </p>
            </div>
          </a>

          {/* 211 Colorado */}
          <a
            href="tel:211"
            className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-green-700">
                211 Colorado
              </p>
              <p className="text-sm text-green-600">
                Resource referrals — Call 211
              </p>
            </div>
          </a>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-6">
          These services are free, confidential, and available 24/7.
        </p>
      </div>
    </div>
  );
}

export default function GetHelpPage() {
  const { translations } = useLanguage();
  const t = translations.getHelp;

  // Crisis modal state
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    assistanceTypes: [] as string[],
    contactMethod: "Phone Call / Llamada",
    description: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const handleCheckboxChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      assistanceTypes: prev.assistanceTypes.includes(type)
        ? prev.assistanceTypes.filter((t) => t !== type)
        : [...prev.assistanceTypes, type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }
    if (formData.assistanceTypes.length === 0) {
      setFormError("Please select at least one type of assistance.");
      return;
    }

    setFormSubmitting(true);

    try {
      await addDoc(collection(db, "help_requests"), {
        fullName: formData.fullName,
        email: formData.email,
        assistanceTypes: formData.assistanceTypes,
        contactMethod: formData.contactMethod,
        description: formData.description,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setFormSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        assistanceTypes: [],
        contactMethod: "Phone Call / Llamada",
        description: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting help request:", error);
      setFormError("Error submitting request. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <main className="pt-20 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center py-20 px-6 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1559027615-cd4628902d42?w=1920&q=80')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-secondary/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase mb-6">
              {t.title}
            </span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-primary leading-tight tracking-tighter mb-6">
              {t.subtitle}
            </h1>
            <p className="text-on-primary/90 text-lg md:text-xl leading-relaxed max-w-xl">
              {t.heroDescription}
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                className="bg-secondary text-on-secondary px-6 md:px-8 py-4 rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity"
                href="#referral-form"
              >
                {t.startRequest}
              </a>
              <button
                onClick={() => setCrisisModalOpen(true)}
                className="bg-on-primary/20 text-on-primary px-6 md:px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity backdrop-blur-sm border border-on-primary/30 cursor-pointer"
              >
                {t.immediateCrisisHelp}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="bg-red-50 text-red-900 mb-24 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 text-red-600" />
            <div>
              <h2 className="font-headline font-bold text-lg md:text-xl">
                {t.immediateAssistanceRequired}
              </h2>
              <p className="text-sm text-red-700">{t.immediateAssistanceDescription}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/60 p-4 rounded-lg backdrop-blur-md border border-white/30">
              <p className="text-xs uppercase tracking-wider font-bold text-red-600">
                {t.crisisLifeline}
              </p>
              <p className="text-2xl font-black text-red-900">{t.crisisPhone}</p>
            </div>
            <div className="bg-white/60 p-4 rounded-lg backdrop-blur-md border border-white/30">
              <p className="text-xs uppercase tracking-wider font-bold text-red-600">
                {t.textSupport}
              </p>
              <p className="text-2xl font-black text-red-900">{t.textCode}</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="mb-16">
          <h2 className="font-headline text-3xl font-bold text-primary mb-2">
            {t.howItWorks}
          </h2>
          <div className="h-1 w-24 bg-secondary rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <StepCard
            number="01"
            icon={<Edit className="w-8 h-8 text-on-primary" />}
            iconBgClass="bg-primary"
            title={t.steps.step1}
            description={t.submitRequestDescription}
          />
          <StepCard
            number="02"
            icon={<Handshake className="w-8 h-8 text-on-secondary" />}
            iconBgClass="bg-secondary"
            title={t.steps.step2}
            description={t.reviewMatchDescription}
          />
          <StepCard
            number="03"
            icon={<Users className="w-8 h-8 text-on-primary-container" />}
            iconBgClass="bg-primary-container"
            title={t.steps.step3}
            description={t.connectDescription}
          />
        </div>
      </section>

      {/* Referral Form & Sidebar Grid */}
      <section
        className="max-w-7xl mx-auto px-6 mb-32 scroll-mt-24"
        id="referral-form"
      >
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="col-span-12 lg:col-span-8 bg-surface-low p-6 md:p-12 rounded-3xl">
            <div className="mb-10">
              <span className="bg-secondary/10 text-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                {t.directReferral}
              </span>
              <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary">
                {t.supportRequestForm}
              </h2>
            </div>

            {/* Success Message */}
            {formSuccess && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-bold">
                    Request submitted successfully! / ¡Solicitud enviada!
                  </p>
                  <p className="text-sm">
                    We will contact you within 24-48 hours.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {formError && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <X className="w-6 h-6 flex-shrink-0" />
                <p className="font-bold">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Personal Info */}
              <div>
                <h3 className="font-headline text-lg font-bold border-l-4 border-primary pl-4 mb-6">
                  {t.personalInformation}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label text-sm font-semibold uppercase text-on-surface-variant">
                      {t.fullName} *
                    </label>
                    <input
                      name="fullName"
                      className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary p-4"
                      placeholder="Jane Doe"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-sm font-semibold uppercase text-on-surface-variant">
                      {t.emailAddress} *
                    </label>
                    <input
                      name="email"
                      className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary p-4"
                      placeholder="jane@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Assistance Type */}
              <div>
                <h3 className="font-headline text-lg font-bold border-l-4 border-primary pl-4 mb-6">
                  {t.typeOfAssistance} *
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Home, label: t.housing, value: "housing" },
                    {
                      icon: UtensilsCrossed,
                      label: t.food,
                      value: "food",
                    },
                    {
                      icon: Stethoscope,
                      label: t.health,
                      value: "health",
                    },
                    { icon: School, label: t.education, value: "education" },
                    {
                      icon: Building,
                      label: t.legalAid,
                      value: "legalAid",
                    },
                    {
                      icon: MoreHorizontal,
                      label: t.other,
                      value: "other",
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <label key={value} className="cursor-pointer group">
                      <input
                        className="hidden peer"
                        type="checkbox"
                        checked={formData.assistanceTypes.includes(value)}
                        onChange={() => handleCheckboxChange(value)}
                      />
                      <div className="bg-surface-highest p-4 rounded-xl text-center peer-checked:bg-primary peer-checked:text-on-primary transition-all">
                        <Icon className="block w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm font-bold">{label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact & Notes */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label text-sm font-semibold uppercase text-on-surface-variant">
                    {t.preferredContactMethod}
                  </label>
                  <select
                    name="contactMethod"
                    className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary p-4"
                    value={formData.contactMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, contactMethod: e.target.value })
                    }
                  >
                    <option>{t.phoneCall}</option>
                    <option>{t.email}</option>
                    <option>{t.smsText}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-sm font-semibold uppercase text-on-surface-variant">
                    {t.briefDescriptionNeed}
                  </label>
                  <textarea
                    name="description"
                    className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary p-4"
                    placeholder={t.tellUsHowWeCanHelp}
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  className="w-full bg-secondary text-on-secondary py-5 rounded-full font-black text-lg shadow-xl hover:shadow-2xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Submitting... / Enviando..."
                    : t.sendRequest}
                </button>
                <p className="text-center mt-4 text-sm text-on-surface-variant">
                  {t.privacyPolicyNote}{" "}
                  <a className="underline" href="/privacy">
                    {t.privacyPolicy}
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Checklist Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-secondary w-8 h-8" />
                <h3 className="font-headline text-xl font-bold">
                  Checklist / Lista
                </h3>
              </div>
              <p className="text-sm mb-6 text-on-surface-variant leading-relaxed">
                Having these ready will speed up your request / Tenga estos
                listos para acelerar su solicitud:
              </p>
              <ul className="space-y-4">
                <ChecklistItem text="Photo ID / Identificación con foto" />
                <ChecklistItem text="Proof of Address / Comprobante de domicilio" />
                <ChecklistItem text="Basic Household Info / Información básica del hogar" />
                <ChecklistItem text="Current Utility Bill / Factura de servicios públicos" />
              </ul>
            </div>

            {/* What to Expect Card */}
            <div className="bg-primary-container text-on-primary-container p-8 rounded-3xl shadow-lg">
              <h3 className="font-headline text-xl font-bold mb-4">
                What to Expect / Qué Esperar
              </h3>
              <div className="space-y-6">
                <FeatureItem
                  icon={<Clock className="w-5 h-5" />}
                  text="Response within 24–48 hours. / Respuesta en 24–48 horas."
                />
                <FeatureItem
                  icon={<Lock className="w-5 h-5" />}
                  text="100% Secure & Confidential. / 100% Seguro y Confidencial."
                />
                <FeatureItem
                  icon={<HeartHandshake className="w-5 h-5" />}
                  text="Compassionate, bilingual case workers. / Trabajadores compasivos y bilingües."
                />
              </div>
            </div>

            {/* Image Accent */}
            <div className="rounded-3xl overflow-hidden h-64 shadow-lg relative">
              <Image
                alt="Compassion"
                fill
                sizes="(max-width: 768px) 100vw, 30vw"
                style={{ objectFit: "cover" }}
                className="w-full h-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnSTmaysPfUG4NZVF7uya2sQaj-4j0URop_2alh1Wf2SOHGEGVjFTqKBtUECERx1uvpcGrQnwSCcP5cGx6B_Lpo1YBqnvQAFtD5ugY9WCmXXpLb64a09FhBXBfklCIHXJyaDkrZIuNM5rNZM1VbHEP7fr-L_7d7nOT3_XjCWhrOGSXXkSHkBQqX3piWAXxGCJCPZY9tw2POVb-T-HdSYSWERuIdE1P2NBfeSwzJR1uADeWUSHnT9HphT9e-eGouF1eATCugMu0ytQ"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-surface-high py-16 px-8 rounded-[3rem] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-primary mb-4">
              We Are Here For You / Estamos Aquí Para Usted
            </h2>
            <p className="text-base md:text-lg text-on-surface-variant mb-8">
              No matter the situation, our goal is to provide empathy and
              actionable solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <FeatureItem
                icon={<Verified className="text-secondary w-5 h-5" />}
                text="Free Service"
              />
              <FeatureItem
                icon={<Verified className="text-secondary w-5 h-5" />}
                text="Bilingual Support"
              />
            </div>
          </div>
          {/* Abstract Design Elements */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary-container/30 rounded-full blur-3xl" />
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Crisis Help Modal */}
      <CrisisModal
        isOpen={crisisModalOpen}
        onClose={() => setCrisisModalOpen(false)}
      />
    </main>
  );
}
