"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, CheckCircle, Calendar, MapPin, Clock, AlertCircle } from "lucide-react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast";

interface EventData {
  id: string;
  title_en?: string;
  title_es?: string;
  description_en?: string;
  description_es?: string;
  date?: string;
  time?: string;
  location?: string;
  image_url?: string;
}

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  attendees: number;
  comments: string;
}

export default function EventRegisterPage(): JSX.Element {
  const params = useParams();
  const eventId = params?.id as string;
  const { translations, language } = useLanguage();
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, Toast: EventToast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [registrationData, setRegistrationData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    attendees: 1,
    comments: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError("Event ID not provided");
        setLoading(false);
        return;
      }

      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() } as EventData);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({
      ...prev,
      [name]: name === "attendees" ? parseInt(value) || 1 : value,
    }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let error = "";
    if (name === "full_name" && !value.trim()) {
      error = language === "es" ? "El nombre es requerido" : "Full name is required";
    }
    if (name === "email" && !value.trim()) {
      error = language === "es" ? "El correo es requerido" : "Email is required";
    } else if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = language === "es" ? "Ingrese un correo válido" : "Please enter a valid email";
    }
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!registrationData.full_name.trim()) {
      errors.full_name = language === "es" ? "El nombre es requerido" : "Full name is required";
    }
    if (!registrationData.email.trim()) {
      errors.email = language === "es" ? "El correo es requerido" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
      errors.email = language === "es" ? "Ingrese un correo válido" : "Please enter a valid email";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "event_registrations"), {
        event_id: eventId,
        full_name: registrationData.full_name,
        email: registrationData.email,
        phone: registrationData.phone,
        attendees: registrationData.attendees,
        comments: registrationData.comments,
        status: "registered",
        created_at: serverTimestamp(),
      });

      // Send confirmation email asynchronously (don't block UI)
      try {
        fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "event-registration",
            data: {
              eventName: eventTitle,
              attendeeName: registrationData.full_name,
              attendeeEmail: registrationData.email,
              eventDate: event?.date,
              eventTime: event?.time,
              eventLocation: event?.location,
              attendees: registrationData.attendees,
            },
          }),
        }).catch((emailErr) => console.error("Failed to send confirmation email:", emailErr));
      } catch (emailError) {
        // Silently fail - don't block the main operation
        console.error("Error triggering confirmation email:", emailError);
      }

      setIsSubmitted(true);
      showToast(language === "es" ? "¡Registro exitoso!" : "Registration successful!", "success");
    } catch (err) {
      console.error("Error registering:", err);
      setError(language === "es" ? "Error al registrar. Intente de nuevo." : "Failed to register. Please try again.");
      showToast(language === "es" ? "Error al registrar" : "Registration failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTitle = event 
    ? (language === "es" && event.title_es ? event.title_es : event.title_en) || ""
    : "";
  const eventDescription = event 
    ? (language === "es" && event.description_es ? event.description_es : event.description_en) || ""
    : "";

  if (loading) {
    return (
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  const eventNotFoundText = language === "es" ? "Evento No Encontrado" : "Event Not Found";
  const attendeesText = language === "es" ? "Número de Asistentes" : "Number of Attendees";
  const registerNowText = translations.events.registerNow || "Register Now";
  const processingText = language === "es" ? "Procesando..." : "Processing...";
  const registrationSuccessText = language === "es" ? "¡Registro Exitoso!" : "Registration Successful!";
  const registrationSuccessDescText = language === "es" 
    ? "Gracias por registrarte. Recibirás un correo de confirmación pronto con todos los detalles del evento."
    : "Thank you for registering. You will receive a confirmation email shortly with all the event details.";
  const registrationDetailsText = language === "es" ? "Detalles del Registro" : "Registration Details";
  const attendeesLabelText = language === "es" ? "Asistentes" : "Attendees";

  if (error) {
    return (
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error-container text-error mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-4">
              {eventNotFoundText}
            </h2>
            <p className="text-on-surface-variant mb-8">{error}</p>
            <a
              href="/events"
              className="inline-flex items-center text-primary font-medium hover:underline"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              {translations.events.viewAll || "View All Events"}
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <EventToast />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
        {event?.image_url && (
          <div className="relative h-48 bg-primary-container overflow-hidden">
            <Image
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              className="opacity-40 mix-blend-overlay"
              alt={eventTitle}
              src={event.image_url}
            />
          </div>
        )}
        
        <div className="p-8 sm:p-12 space-y-8">
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mb-4">
              {translations.events.register} - {eventTitle}
            </h1>
            {eventDescription && (
              <p className="text-on-surface-variant body-lg mb-4">
                {eventDescription}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
              {event?.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{event.date}</span>
                </div>
              )}
              {event?.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{event.time}</span>
                </div>
              )}
              {event?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4 border-l-4 border-primary pl-4 mb-8">
            <p className="text-on-surface-variant body-lg">
              {language === "es" 
                ? "Complete el formulario a continuación para asegurar su lugar en este evento."
                : "Fill out the form below to secure your spot at this event."}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 rounded-lg bg-error-container text-error text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="group">
                  <label
                    htmlFor="full_name"
                    className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                  >
                    {translations.getHelp.fullName || "Full Name"} *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={registrationData.full_name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200 ${fieldErrors.full_name ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {fieldErrors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.full_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label
                      htmlFor="email"
                      className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                    >
                      {translations.getHelp.emailAddress || "Email Address"} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={registrationData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200 ${fieldErrors.email ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div className="group">
                    <label
                      htmlFor="phone"
                      className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                    >
                      {translations.getHelp.phoneNumber || "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={registrationData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="attendees"
                    className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                  >
                    {attendeesText} *
                  </label>
                  <input
                    type="number"
                    id="attendees"
                    name="attendees"
                    value={registrationData.attendees}
                    onChange={handleInputChange}
                    min={1}
                    max={20}
                    required
                    className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="comments"
                    className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2"
                  >
                    {translations.getHelp.tellUsHowWeCanHelp || "Comments / Questions"}
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={registrationData.comments}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-secondary text-on-secondary py-4 px-8 rounded-full font-headline font-bold text-lg hover:brightness-110 active:scale-95 transition-all duration-300 editorial-shadow flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>{processingText}</span>
                  ) : (
                    <>
                      <span>{registerNowText}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6 py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="font-headline text-3xl font-bold text-primary">
                {registrationSuccessText}
              </h2>
              <p className="text-on-surface-variant max-w-md mx-auto">
                {registrationSuccessDescText}
              </p>
              
              <div className="bg-surface-container-high rounded-lg p-6 text-left mt-8">
                <h3 className="font-bold text-on-surface mb-4">{registrationDetailsText}</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">{translations.getHelp.fullName}:</dt>
                    <dd className="font-medium text-on-surface">{registrationData.full_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Email:</dt>
                    <dd className="font-medium text-on-surface">{registrationData.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">{attendeesLabelText}:</dt>
                    <dd className="font-medium text-on-surface">{registrationData.attendees}</dd>
                  </div>
                  {eventTitle && (
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant">Event:</dt>
                      <dd className="font-medium text-on-surface">{eventTitle}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="pt-8">
                <a
                  href="/events"
                  className="text-primary font-bold hover:underline"
                >
                  {translations.events.viewAll || "View All Events"}
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
            href="mailto:events@vivaresource.org"
            className="text-primary font-medium hover:underline"
          >
            events@vivaresource.org
          </a>
        </p>
      </div>
    </main>
    </>
  );
}
