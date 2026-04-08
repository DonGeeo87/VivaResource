"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Globe,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast";

const faqs = [
  {
    question:
      "What is your typical response time? / ¿Cuál es su tiempo de respuesta?",
    answer:
      "We typically respond to all inquiries within 24-48 business hours. / Normalmente respondemos a todas las consultas en un plazo de 24 a 48 horas laborables.",
    defaultOpen: true,
  },
  {
    question: "How can I volunteer? / ¿Cómo puedo ser voluntario?",
    answer:
      "You can express your interest using the contact form above, or visit our Volunteer page for specific opportunities. / Puede expresar su interés utilizando el formulario de contacto de arriba, o visite nuestra página de Voluntariado para oportunidades específicas.",
    defaultOpen: false,
  },
  {
    question:
      "Do you offer financial assistance? / ¿Ofrecen asistencia financiera?",
    answer:
      "Our programs vary by season and resource availability. Please message us with your specific situation. / Nuestros programas varían según la temporada y la disponibilidad de recursos. Por favor, envíenos un mensaje con su situación específica.",
    defaultOpen: false,
  },
];

export default function ContactPage(): JSX.Element {
  const { translations, language } = useLanguage();
  const { contact: t } = translations;
  const { showToast, Toast: ToastComponent } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    newsletter: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast(
        language === "en" ? "Please enter your name" : "Por favor ingresa tu nombre",
        "error"
      );
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast(
        language === "en" ? "Please enter a valid email" : "Por favor ingresa un correo válido",
        "error"
      );
      return false;
    }
    if (!formData.message.trim()) {
      showToast(
        language === "en" ? "Please enter a message" : "Por favor ingresa un mensaje",
        "error"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject || (language === "en" ? "Contact Form Submission" : "Envío de Formulario de Contacto"),
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          language === "en" ? "Message sent successfully! We'll get back to you soon." : "¡Mensaje enviado exitosamente! Te responderemos pronto.",
          "success"
        );
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          newsletter: false,
        });
      } else {
        throw new Error(data.error || "Failed to send");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showToast(
        language === "en" ? "Error sending message. Please try again." : "Error al enviar el mensaje. Por favor intenta de nuevo.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-surface font-body text-on-surface pt-24">
      <ToastComponent />
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-br from-primary to-primary-container py-24 px-6">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxCNb4SWpP96lkuuFhuEnA9E7dVEzO6wPHzX_ie08ZbcdIjk8XcZai-h8kqInbsdaYsduMlsw3sTXvCvyhK-et0S3TEyeqTxTQBOlGFAz5As1NSW4jws_gbZyg27wtId-hh8bPnNaue00TP1KTRJRwmaR-kNcicCQZFPJlBZ3OdehCGsTFX78uRBmMsyRMPPzW332yrXCmC5z0KQiEK4RBVqVzDeRDbsCbMQb-juD9ZKW1gDKCAhYqcZAB86yrEtpv0s8SK3nHCbk"
            alt="Soft focused background of hands holding soil with a small plant growing"
            fill
            className="object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-on-primary tracking-tight mb-6 leading-tight">
              {t.title} / <span className="block">{language === "en" ? "Get in Touch" : "Póngase en Contacto"}</span>
            </h1>
            <p className="text-xl text-on-primary/90 font-medium leading-relaxed max-w-2xl">
              We&apos;re here to support our rural communities. Reach out for
              assistance, partnerships, or more information.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-outline-variant/10">
            <h2 className="text-3xl font-headline font-bold text-primary mb-8">
              Send Us a Message / Envíanos un Mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline font-label">
                    {t.name}* / Nombre*
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                    placeholder="John / Juan"
                    className="w-full bg-surface-container border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline font-label">
                    {t.name}* / Apellido*
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                    placeholder="Doe / Pérez"
                    className="w-full bg-surface-container border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all duration-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline font-label">
                    {t.email}* / Correo*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="email@example.com"
                    className="w-full bg-surface-container border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline font-label">
                    Phone / Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="(000) 000-0000"
                    className="w-full bg-surface-container border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all duration-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline font-label">
                  {t.subject} / Asunto
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help? / ¿Cómo podemos ayudar?"
                  className="w-full bg-surface-container border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline font-label">
                  {t.message}* / Mensaje*
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Write your message here... / Escribe tu mensaje aquí..."
                  className="w-full bg-surface-container border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all duration-300"
                />
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <input
                  type="checkbox"
                  name="newsletter"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-none bg-surface-container text-secondary focus:ring-secondary"
                />
                <label
                  htmlFor="newsletter"
                  className="text-sm text-slate-600 font-medium cursor-pointer"
                >
                  I agree to receive newsletters / Acepto recibir boletines.
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-secondary text-on-secondary px-10 py-4 rounded-full font-headline font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === "en" ? "Sending..." : "Enviando..."}
                  </>
                ) : (
                  t.submit
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Quick Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-surface-low p-8 rounded-3xl space-y-8">
              <div>
                <h3 className="text-xl font-headline font-bold text-primary mb-4 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-secondary fill-secondary" />
                  Email / Correo
                </h3>
                <a
                  href="mailto:vivaresourcefoundation@gmail.com"
                  className="text-lg text-slate-700 hover:text-primary transition-colors font-medium"
                >
                  vivaresourcefoundation@gmail.com
                </a>
              </div>
              <div className="h-px bg-outline-variant/20"></div>
              <div>
                <h3 className="text-xl font-headline font-bold text-primary mb-4 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-secondary fill-secondary" />
                  Address / Dirección
                </h3>
                <p className="text-lg text-slate-700 font-medium leading-relaxed">
                  13055 Bradshaw Drive #301,
                  <br />
                  Peyton, Colorado, 80831
                </p>
              </div>
              <div className="h-px bg-outline-variant/20"></div>
              <div>
                <h3 className="text-xl font-headline font-bold text-primary mb-4 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-secondary fill-secondary" />
                  Hours / Horas
                </h3>
                <p className="text-lg text-slate-700 font-medium">
                  Mon-Fri: 9 AM - 5 PM
                  <br />
                  <span className="text-slate-500 text-base">
                    Lun-Vie: 9 AM - 5 PM
                  </span>
                </p>
              </div>
              <div className="h-px bg-outline-variant/20"></div>
              <div>
                <h3 className="text-xl font-headline font-bold text-primary mb-4">
                  Follow Us / Síguenos
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <Globe className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <Mail className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl h-64 shadow-lg group">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAzCOBQuv1yhE66tIdXYzNFzNuFVhlm_fAMRt4ip7ucMiaDLG_YBaWJ59khL13TtGMmZHntG6N9FJgPei6M9uN8YR1qQceRljQKc-ImiJiklorVIwS_dtkj6rmFaDT28GAhpxVno2VbLrdNWc4LO8-rNA7VchKhGXUd8-2Hh_k2EAtVKyPfJIvFxeL51OTjawXMt3gETYQ73EDJ--43e1fdCV9m1GHSsXH1w4_b8m7C-6iNXHpM69SAGuTXrQw_b_zpdwZLyGMd6Q"
                alt="Peaceful rural landscape in Colorado with plains and mountains"
                width={600}
                height={256}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <span className="bg-white/90 backdrop-blur px-6 py-2 rounded-full font-headline font-bold text-primary text-sm">
                  Empowering Communities
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-surface-low py-24">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">
            Our Location /{" "}
            <span className="text-secondary">Nuestra Ubicación</span>
          </h2>
        </div>
        <div className="w-full h-[500px] relative bg-surface-high overflow-hidden">
          {/* Map Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 text-center">
              <MapPin className="text-error w-12 h-12 fill-error" />
              <div>
                <p className="font-headline font-bold text-lg">
                  Peyton, Colorado
                </p>
                <p className="text-slate-500">13055 Bradshaw Drive #301</p>
              </div>
              <a
                href="https://maps.google.com/?q=13055+Bradshaw+Drive+%23301+Peyton+CO+80831"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVyIZ_NfMf9B1clV2U9YwyMtecK12_5MvyCiKBLmVrQhHtP-W2WUqeap3xF9VBGvthdZ_9lRsGzpuSLz0U8_EYao05UoeIVyjfUzO-xj2Qtg9xXM-SyL5hfIP6tVZL3EyVUnF8KC86q2f73DeUvFiRX1u7p_6AhZ9eSeLfJ2baoMFsJeSejoQAACVx-p5xU2KDBnEhDSQnhvMxHX-aFNfBo_HfFjud-QVXrSkFS76wG7z8fFJjcVHz1yOa5LUIZRKjTvyodWoqLvk"
            alt="Map showing location of Peyton, Colorado"
            width={1920}
            height={500}
            className="w-full h-full object-cover grayscale opacity-40"
          />
        </div>
      </section>

      {/* Quick FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline font-bold text-primary mb-4">
            Frequently Asked Questions / Preguntas Frecuentes
          </h2>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white rounded-2xl shadow-sm overflow-hidden"
              open={faq.defaultOpen}
            >
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <h4 className="font-headline font-semibold text-lg text-primary pr-4">
                  {faq.question}
                </h4>
                <ChevronDown className="w-6 h-6 text-secondary transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
