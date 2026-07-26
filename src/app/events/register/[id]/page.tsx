"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, CheckCircle, Calendar, MapPin, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast";
import { formatMountainDate } from "@/lib/timezone";
import type { Timestamp } from "firebase/firestore";

import { db, addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from "@/lib/db-client";

const safeFormatDate = (date: string | Date | Timestamp | { toDate: () => Date } | undefined, lang: string): string => {
  if (!date) return "-";
  if (typeof date === "string") return date;
  if (typeof (date as { toDate?: () => Date }).toDate === "function") {
    return formatMountainDate(date, lang);
  }
  if (date instanceof Date) {
    return formatMountainDate(date, lang);
  }
  try {
    const dateObj = new Date(date as unknown as string);
    if (!isNaN(dateObj.getTime())) {
      return formatMountainDate(dateObj, lang);
    }
  } catch {
    // ignore
  }
  return "-";
};

interface FormFieldDef {
  id: string;
  type: string;
  label: string;
  labelEs: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { label: string; labelEs: string; value: string }[];
}

interface EventData {
  id: string;
  title_en?: string;
  title_es?: string;
  description_en?: string;
  description_es?: string;
  date?: string | Date | Timestamp | { toDate: () => Date };
  time?: string;
  location?: string;
  image_url?: string;
  formId?: string;
}

export default function EventRegisterPage(): JSX.Element {
  const params = useParams();
  const eventId = params?.id as string;
  const { translations, language } = useLanguage();
  const isES = language === "es";

  const [event, setEvent] = useState<EventData | null>(null);
  const [formFields, setFormFields] = useState<FormFieldDef[]>([]);
  const [formData, setFormData] = useState<{ title: string; titleEs: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, Toast: EventToast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) {
        setError("Event ID not provided");
        setLoading(false);
        return;
      }

      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() } as EventData;
          setEvent(eventData);

          let formFound = false;

          // First try: fetch form by formId
          if (eventData.formId) {
            try {
              const formDoc = await getDoc(doc(db, "forms", eventData.formId));
              if (formDoc.exists()) {
                const formData = formDoc.data();
                const fields = (formData.fields || []) as FormFieldDef[];
                if (fields.length > 0) {
                  setFormFields(fields);
                  setFormData({ title: formData.title || "", titleEs: formData.titleEs || "" });
                  const initialValues: Record<string, string> = {};
                  fields.forEach((f: FormFieldDef) => { initialValues[f.id] = ""; });
                  setFormValues(initialValues);
                  formFound = true;
                }
              }
            } catch (err) {
              console.error("Error fetching form by formId:", err);
            }
          }

          // Second try: fetch form by linkedEventId if not found yet
          if (!formFound) {
            try {
              const formQuery = query(
                collection(db, "forms"),
                where("linkedEventId", "==", eventId)
              );
              const formSnap = await getDocs(formQuery);
              if (!formSnap.empty) {
                const formData = formSnap.docs[0].data();
                const fields = (formData.fields || []) as FormFieldDef[];
                if (fields.length > 0) {
                  setFormFields(fields);
                  setFormData({ title: formData.title || "", titleEs: formData.titleEs || "" });
                  const initialValues: Record<string, string> = {};
                  fields.forEach((f: FormFieldDef) => { initialValues[f.id] = ""; });
                  setFormValues(initialValues);
                  formFound = true;
                }
              }
            } catch (err) {
              console.error("Error fetching form by linkedEventId:", err);
            }
          }
        } else {
          setError(isES ? "Evento no encontrado" : "Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(isES ? "Error al cargar el evento" : "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const formTitle = formData
    ? (isES ? (formData.titleEs || formData.title) : formData.title)
    : "";

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    const errors: Record<string, string> = {};
    formFields.forEach((field) => {
      if (field.required) {
        const val = (formValues[field.id] || "").trim();
        if (!val) {
          errors[field.id] = isES
            ? `${isES ? field.labelEs : field.label} es requerido`
            : `${field.label} is required`;
        }
        if (field.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          errors[field.id] = isES ? "Ingrese un correo válido" : "Please enter a valid email";
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationData: Record<string, unknown> = {
        event_id: eventId,
        ...formValues,
        status: "registered",
        created_at: serverTimestamp(),
      };
      if (registrationData.email && typeof registrationData.email === "string") {
        registrationData.email = registrationData.email.trim().toLowerCase();
      }

      await addDoc(collection(db, "event_registrations"), registrationData);

      try {
        fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "event-registration",
            data: {
              eventName: eventTitle,
              attendeeName: formValues.full_name || formValues.name || "",
              attendeeEmail: formValues.email || "",
              eventDate: event?.date,
              eventTime: event?.time,
              eventLocation: event?.location,
            },
          }),
        }).catch(() => {});
      } catch {
        // silently fail
      }

      // Notify admins about new registration (fire and forget)
      try {
        fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "event-admin-notification",
            data: {
              eventName: eventTitle,
              attendeeName: formValues.full_name || formValues.name || "",
              attendeeEmail: formValues.email || "",
              eventDate: event?.date,
              eventTime: event?.time,
              eventLocation: event?.location,
            },
          }),
        }).catch(() => {});
      } catch {
        // silently fail
      }

      setIsSubmitted(true);
      showToast(isES ? "¡Registro exitoso!" : "Registration successful!", "success");
    } catch (err) {
      console.error("Error registering:", err);
      setError(isES ? "Error al registrar. Intente de nuevo." : "Failed to register. Please try again.");
      showToast(isES ? "Error al registrar" : "Registration failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTitle = event
    ? (isES && event.title_es ? event.title_es : event.title_en) || ""
    : "";
  const eventDescription = event
    ? (isES && event.description_es ? event.description_es : event.description_en) || ""
    : "";

  const renderField = (field: FormFieldDef): JSX.Element => {
    const label = isES ? field.labelEs : field.label;
    const value = formValues[field.id] || "";
    const hasError = !!fieldErrors[field.id];

    const inputClass = `w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200 ${hasError ? "ring-2 ring-red-500" : ""}`;

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.id} className="group">
            <label htmlFor={field.id} className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
              {label} {field.required && "*"}
            </label>
            <textarea
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || ""}
              rows={3}
              className={inputClass}
            />
            {hasError && <p className="mt-1 text-sm text-red-600">{fieldErrors[field.id]}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="group">
            <label htmlFor={field.id} className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
              {label} {field.required && "*"}
            </label>
            <select
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={inputClass}
            >
              <option value="">{isES ? "Seleccionar..." : "Select..."}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isES ? opt.labelEs : opt.label}
                </option>
              ))}
            </select>
            {hasError && <p className="mt-1 text-sm text-red-600">{fieldErrors[field.id]}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="group">
            <label className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
              {label} {field.required && "*"}
            </label>
            <div className="space-y-2">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-on-surface text-sm">{isES ? opt.labelEs : opt.label}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="mt-1 text-sm text-red-600">{fieldErrors[field.id]}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="group">
            <label className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
              {label} {field.required && "*"}
            </label>
            <div className="space-y-2">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={(value || "").split(",").includes(opt.value)}
                    onChange={(e) => {
                      const current = (formValues[field.id] || "").split(",").filter(Boolean);
                      if (e.target.checked) {
                        handleInputChange(field.id, [...current, opt.value].join(","));
                      } else {
                        handleInputChange(field.id, current.filter((v: string) => v !== opt.value).join(","));
                      }
                    }}
                    className="h-4 w-4 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-on-surface text-sm">{isES ? opt.labelEs : opt.label}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="mt-1 text-sm text-red-600">{fieldErrors[field.id]}</p>}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="group">
            <label htmlFor={field.id} className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
              {label} {field.required && "*"}
            </label>
            <input
              type="number"
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || ""}
              min={0}
              className={inputClass}
            />
            {hasError && <p className="mt-1 text-sm text-red-600">{fieldErrors[field.id]}</p>}
          </div>
        );

      case "phone":
        return (
          <div key={field.id} className="group">
            <label htmlFor={field.id} className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
              {label} {field.required && "*"}
            </label>
            <input
              type="tel"
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || ""}
              className={inputClass}
            />
            {hasError && <p className="mt-1 text-sm text-red-600">{fieldErrors[field.id]}</p>}
          </div>
        );

      default: // text, email
        return (
          <div key={field.id} className="group">
            <label htmlFor={field.id} className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
              {label} {field.required && "*"}
            </label>
            <input
              type={field.type === "email" ? "email" : "text"}
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || ""}
              className={inputClass}
            />
            {hasError && <p className="mt-1 text-sm text-red-600">{fieldErrors[field.id]}</p>}
          </div>
        );
    }
  };

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

  if (error && !event) {
    return (
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error-container text-error mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-4">
              {isES ? "Evento No Encontrado" : "Event Not Found"}
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
            <div className="relative w-full bg-primary-container overflow-hidden">
              <Image
                width={1200}
                height={600}
                sizes="100vw"
                style={{ width: "100%", height: "auto", objectFit: "contain", objectPosition: "center" }}
                alt={eventTitle}
                src={event.image_url}
              />
            </div>
          )}

          <div className="p-8 sm:p-12 space-y-8">
            <div>
              <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mb-4">
                {isES ? "Registro" : "Registration"} - {eventTitle}
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
                    <span>{safeFormatDate(event.date, language)}</span>
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

            {formTitle && (
              <div className="flex items-start space-x-4 border-l-4 border-primary pl-4">
                <p className="text-on-surface-variant body-lg">
                  {isES
                    ? `Complete el formulario "${formTitle}" para asegurar su lugar en este evento.`
                    : `Fill out the "${formTitle}" form to secure your spot at this event.`}
                </p>
              </div>
            )}

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-error-container text-error text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {formFields.length > 0 ? (
                    formFields.map((field) => renderField(field))
                  ) : (
                    <div className="group">
                      <label htmlFor="full_name" className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                        {translations.getHelp.fullName || "Full Name"} *
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        value={formValues.full_name || ""}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        required
                        className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                      />
                      <div className="group mt-6">
                        <label htmlFor="email" className="block font-label text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                          {translations.getHelp.emailAddress || "Email Address"} *
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formValues.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-secondary text-on-secondary py-4 px-8 rounded-full font-headline font-bold text-lg hover:brightness-110 active:scale-95 transition-all duration-300 editorial-shadow flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span>{isES ? "Procesando..." : "Processing..."}</span>
                    ) : (
                      <>
                        <span>{translations.events.registerNow || "Register Now"}</span>
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
                  {isES ? "¡Registro Exitoso!" : "Registration Successful!"}
                </h2>
                <p className="text-on-surface-variant max-w-md mx-auto">
                  {isES
                    ? "Gracias por registrarte. Recibirás un correo de confirmación pronto con todos los detalles del evento."
                    : "Thank you for registering. You will receive a confirmation email shortly with all the event details."}
                </p>

                <div className="bg-surface-container-high rounded-lg p-6 text-left mt-8">
                  <h3 className="font-bold text-on-surface mb-4">{isES ? "Detalles del Registro" : "Registration Details"}</h3>
                  <dl className="space-y-2 text-sm">
                    {formFields.length > 0 ? (
                      formFields.map((field) => {
                        const val = formValues[field.id];
                        if (!val) return null;
                        return (
                          <div key={field.id} className="flex justify-between">
                            <dt className="text-on-surface-variant">{isES ? field.labelEs : field.label}:</dt>
                            <dd className="font-medium text-on-surface">{val}</dd>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-on-surface-variant">{translations.getHelp.fullName}:</dt>
                          <dd className="font-medium text-on-surface">{formValues.full_name}</dd>
                        </div>
                        <div className="flex justify-center">
                          <dt className="text-on-surface-variant">Email:</dt>
                          <dd className="font-medium text-on-surface">{formValues.email}</dd>
                        </div>
                      </>
                    )}
                    {eventTitle && (
                      <div className="flex justify-between">
                        <dt className="text-on-surface-variant">{isES ? "Evento" : "Event"}:</dt>
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
            {isES ? "¿Necesitas ayuda? Contacta a nuestro equipo de eventos en" : "Need help? Contact our events team at"}{" "}
            <a
              href="mailto:vivaresourcefoundation@gmail.com"
              className="text-primary font-medium hover:underline"
            >
              vivaresourcefoundation@gmail.com
            </a>
          </p>
        </div>
      </main>
    </>
  );
}