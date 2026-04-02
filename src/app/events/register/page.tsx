"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  event: string;
  attendees: number;
  accommodations: string;
}

export default function EventRegistrationPage(): JSX.Element {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    event: "",
    attendees: 1,
    accommodations: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "attendees" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
  };

  return (
    <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
          <div className="relative h-48 bg-primary-container overflow-hidden">
            <Image
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              className="opacity-40 mix-blend-overlay"
              alt="diverse group of community members laughing together"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD3WzpAJgsApG7ISMaQZY3gRsI6-MpHz_sAqXCVedBaCH5jhmp20vsB03E3G7GSol80b7XG3K4_6DgjbT2afaWLZfrwDZBSG3p2dnshGcLOlqIWZskwk1Oo_o3H3I4RTe2Naub4H4BCsacR0yGLCYmPhoWIjShQZBAeVpJIr_dPFCIZzcgirTqUDHg4HTPV0bRzamp3BPL6aZweuNdDIq9quQ4Na-1_B0CN-E0MGDN_RUN4RYGuW7ynxGi_OIANppvBiBUbrwTDxM"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
              <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-primary-container tracking-tight leading-tight">
                Event Registration / <br />
                Registro para Eventos
              </h1>
            </div>
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            {!isSubmitted ? (
              <section className="space-y-8">
                <div className="flex items-start space-x-4 border-l-4 border-primary pl-4">
                  <p className="text-on-surface-variant body-lg">
                    Join our community events to learn, grow, and connect. Please fill
                    out the form below to secure your spot.
                    <span className="block mt-1 italic text-sm">
                      Únase a nuestros eventos comunitarios. Complete el formulario
                      para asegurar su lugar.
                    </span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-y-8">
                    {/* Full Name */}
                    <div className="group">
                      <label
                        htmlFor="name"
                        className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                      >
                        Full Name / Nombre Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Jane Doe"
                        required
                        className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                      />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      <div className="group">
                        <label
                          htmlFor="email"
                          className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                        >
                          Email Address / Correo Electrónico
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="jane@example.com"
                          required
                          className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                      </div>
                      <div className="group">
                        <label
                          htmlFor="phone"
                          className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                        >
                          Phone Number / Teléfono
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(555) 000-0000"
                          className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Event & Attendees */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      <div className="group">
                        <label
                          htmlFor="event"
                          className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                        >
                          Select Event / Seleccionar Evento
                        </label>
                        <select
                          id="event"
                          name="event"
                          value={formData.event}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                        >
                          <option value="">Choose an event...</option>
                          <option value="community-workshop">
                            Community Wellness Workshop - Oct 15
                          </option>
                          <option value="resource-fair">
                            Annual Resource Fair - Nov 02
                          </option>
                          <option value="leadership-seminar">
                            Youth Leadership Seminar - Nov 18
                          </option>
                        </select>
                      </div>
                      <div className="group">
                        <label
                          htmlFor="attendees"
                          className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                        >
                          Number of Attendees / Número de Asistentes
                        </label>
                        <input
                          type="number"
                          id="attendees"
                          name="attendees"
                          value={formData.attendees}
                          onChange={handleInputChange}
                          min={1}
                          max={10}
                          required
                          className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Accommodations */}
                    <div className="group">
                      <label
                        htmlFor="accommodations"
                        className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                      >
                        Special Accommodations / Adaptaciones Especiales
                      </label>
                      <textarea
                        id="accommodations"
                        name="accommodations"
                        value={formData.accommodations}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Please let us know if you have any dietary restrictions or accessibility needs."
                        className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      className="w-full bg-secondary text-on-secondary py-4 px-8 rounded-full font-headline font-bold text-lg hover:brightness-110 active:scale-95 transition-all duration-300 editorial-shadow flex items-center justify-center space-x-2"
                    >
                      <span>Complete Registration / Completar Registro</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </section>
            ) : (
              <div className="text-center space-y-6 py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="font-headline text-3xl font-bold text-primary">
                  Registration Successful!
                </h2>
                <p className="text-on-surface-variant max-w-md mx-auto">
                  Thank you for registering. You will receive a confirmation email
                  shortly with all the event details.
                  <br />
                  <span className="italic text-sm">
                    Registro exitoso. Recibirá un correo de confirmación pronto.
                  </span>
                </p>
                <div className="pt-8">
                  <a
                    href="/"
                    className="text-primary font-bold hover:underline"
                  >
                    Return to Home
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-outline">
            Need help? Contact our events team at{" "}
            <a
              href="mailto:events@vivafoundation.org"
              className="text-primary font-medium hover:underline"
            >
              events@vivafoundation.org
            </a>
          </p>
        </div>
    </main>
  );
}
