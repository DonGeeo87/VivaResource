"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Calendar, FileText, Loader2 } from "lucide-react";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface EventData {
  id: string;
  title_en: string;
  title_es: string;
  date: string | Date;
  location?: string;
}

interface LinkedForm {
  id: string;
  title: string;
  titleEs?: string;
  customSlug?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  attendees: number;
  accommodations: string;
}

export default function EventRegistrationPage(): JSX.Element {
  const params = useParams();
  const { language } = useLanguage();
  const isES = language === "es";
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [linkedForm, setLinkedForm] = useState<LinkedForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    attendees: 1,
    accommodations: "",
  });

  // Fetch event and linked form
  useEffect(() => {
    async function fetchData() {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch event
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() } as EventData);
        }

        // Fetch linked form
        const formQuery = query(
          collection(db, "forms"),
          where("linkedEventId", "==", eventId),
          where("published", "==", true)
        );
        const formSnap = await getDocs(formQuery);
        if (!formSnap.empty) {
          const formData = formSnap.docs[0].data();
          setLinkedForm({
            id: formSnap.docs[0].id,
            title: formData.title || "",
            titleEs: formData.titleEs,
            customSlug: formData.customSlug,
          });
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "attendees" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "event_registrations"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        event_id: eventId,
        attendees: formData.attendees,
        accommodations: formData.accommodations || "",
        status: "confirmed",
        created_at: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting registration:", error);
    }
  };

  const eventTitle = event
    ? (isES && event.title_es ? event.title_es : event.title_en)
    : "";

  if (loading) {
    return (
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  // If there's a linked form, redirect to it
  if (linkedForm) {
    const formPath = linkedForm.customSlug
      ? `/forms/slug/${linkedForm.customSlug}`
      : `/forms/${linkedForm.id}`;
    return (
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
            {isES ? "Registro mediante Formulario" : "Registration via Form"}
          </h1>
          <p className="text-on-surface-variant text-lg">
            {isES
              ? `Este evento tiene un formulario de registro personalizado. Haz clic en el botón para completar tu registro.`
              : `This event has a custom registration form. Click the button below to complete your registration.`}
          </p>
          {event && (
            <p className="text-primary font-medium">
              <Calendar className="w-4 h-4 inline mr-2" />
              {eventTitle}
            </p>
          )}
          <Link
            href={formPath}
            className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-hover transition-all shadow-lg"
          >
            <FileText className="w-5 h-5" />
            {isES ? "Ir al Formulario de Registro" : "Go to Registration Form"}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="pt-4">
            <Link
              href="/events"
              className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              {isES ? "← Volver a eventos" : "← Back to events"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
                {eventTitle || "Event Registration / Registro para Eventos"}
              </h1>
              {event?.location && (
                <p className="text-on-primary-container/80 mt-2">
                  {event.location}
                </p>
              )}
            </div>
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            {!isSubmitted ? (
              <section className="space-y-8">
                <div className="flex items-start space-x-4 border-l-4 border-primary pl-4">
                  <p className="text-on-surface-variant body-lg">
                    {isES
                      ? "Complete el formulario para asegurar su lugar en este evento."
                      : "Fill out the form below to secure your spot at this event."}
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
                        {isES ? "Nombre Completo" : "Full Name"}
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

                    {/* Event Display (read-only) */}
                    {event && (
                      <div className="group">
                        <label
                          htmlFor="event-display"
                          className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                        >
                          {isES ? "Evento" : "Event"}
                        </label>
                        <input
                          type="text"
                          id="event-display"
                          value={eventTitle}
                          readOnly
                          className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface opacity-75"
                        />
                      </div>
                    )}

                    {/* Attendees */}
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
