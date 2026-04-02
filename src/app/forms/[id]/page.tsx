"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, AlertCircle, Calendar, MapPin, Clock } from "lucide-react";
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Form, FormField } from "@/types/forms";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

interface EventInfo {
  id: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id as string;
  const { language, isHydrated } = useLanguage();

  const [form, setForm] = useState<Form | null>(null);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expired, setExpired] = useState(false);

  const filledRequiredFields = form ? form.fields.filter(f => f.required && responses[f.id] && responses[f.id] !== '').length : 0;
  const totalRequiredFields = form ? form.fields.filter(f => f.required).length : 0;
  const emailFilled = !form?.settings?.requireEmail || !!email;
  const progressTotal = totalRequiredFields + (form?.settings?.requireEmail ? 1 : 0);
  const progressFilled = filledRequiredFields + (emailFilled ? (form?.settings?.requireEmail ? 1 : 0) : 0);
  const progressPercent = progressTotal > 0 ? Math.round((progressFilled / progressTotal) * 100) : 0;

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const docRef = doc(db, 'forms', formId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Form;
          // Solo mostrar si está publicado
          if (data.published && data.status === 'published') {
            // Check if form has expired
            if (data.expiresAt) {
              const expiresDate = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt);
              if (expiresDate < new Date()) {
                setExpired(true);
                setLoading(false);
                return;
              }
            }

            setForm(data);

            // Si tiene evento asociado, cargar info del evento
            if (data.linkedEventId) {
              const eventRef = doc(db, 'events', data.linkedEventId);
              const eventSnap = await getDoc(eventRef);
              if (eventSnap.exists()) {
                const eventData = eventSnap.data();
                setEventInfo({
                  id: data.linkedEventId,
                  title: eventData.title_es || eventData.title_en || '',
                  date: eventData.date ? new Date(eventData.date.toDate()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
                  time: eventData.time,
                  location: eventData.location,
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching form:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleResponseChange = (fieldId: string, value: string | string[]) => {
    setResponses({ ...responses, [fieldId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      if (!form) return;

      // Build dynamic Zod schema from form fields
      const schemaShape: Record<string, z.ZodTypeAny> = {};
      
      for (const field of form.fields) {
        if (field.required) {
          if (field.type === 'checkbox') {
            schemaShape[field.id] = z.array(z.string()).min(1, "Required");
          } else if (field.type === 'number') {
            schemaShape[field.id] = z.string().min(1, "Required");
          } else if (field.type === 'email') {
            schemaShape[field.id] = z.string().email("Invalid email");
          } else {
            schemaShape[field.id] = z.string().min(1, "Required");
          }
        }
      }

      if (form.settings?.requireEmail) {
        schemaShape['__email'] = z.string().email("Invalid email");
      }

      const schema = z.object(schemaShape);
      const validationData: Record<string, unknown> = { ...responses };
      if (form.settings?.requireEmail) {
        validationData['__email'] = email;
      }

      const result = schema.safeParse(validationData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0];
          if (key) fieldErrors[String(key)] = issue.message;
        }
        setErrors(fieldErrors);
        setSubmitting(false);
        return;
      }

      // Check for duplicate submissions
      if (form.settings?.allowMultipleSubmissions === false) {
        const emailToCheck = form.settings?.requireEmail ? email : undefined;
        if (emailToCheck) {
          const { query: firestoreQuery, where: firestoreWhere, getDocs: firestoreGetDocs } = await import("firebase/firestore");
          const dupQuery = firestoreQuery(
            collection(db, "form_submissions"),
            firestoreWhere("formId", "==", formId),
            firestoreWhere("email", "==", emailToCheck)
          );
          const dupSnapshot = await firestoreGetDocs(dupQuery);
          if (!dupSnapshot.empty) {
            setErrors({ __form: language === "es"
              ? "Ya has enviado una respuesta a este formulario."
              : "You have already submitted a response to this form." });
            setSubmitting(false);
            return;
          }
        }
      }

      // Save submission
      await addDoc(collection(db, "form_submissions"), {
        formId,
        responses,
        email: form.settings?.requireEmail ? email : undefined,
        submittedAt: Timestamp.now(),
      });

      // Send notification email (fire and forget)
      fetch("/api/forms/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          formTitle: form.title,
          formTitleEs: form.titleEs,
          responses: Object.fromEntries(
            form.fields.map((field) => {
              const value = responses[field.id];
              const label = field.labelEs || field.label;
              return [label, value || ""];
            })
          ),
          email: form.settings?.requireEmail ? email : undefined,
        }),
      }).catch(() => {});

      setSubmitted(true);

      if (form.settings?.redirectUrl) {
        window.location.href = form.settings.redirectUrl;
        return;
      }
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      setErrors({ __form: "Error submitting form. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">{language === "es" ? "Selecciona una opción" : "Select an option"}</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-3">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleResponseChange(field.id, e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        const checkedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={checkedValues.includes(opt.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...checkedValues, opt.value]
                      : checkedValues.filter(v => v !== opt.value);
                    handleResponseChange(field.id, newValues);
                  }}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            value={value as string}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-gray-600">{language === "es" ? "Cargando..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!isHydrated) return null;

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{language === "es" ? "Formulario no encontrado" : "Form Not Found"}</h1>
          <p className="text-gray-600">{language === "es" ? "Este formulario puede haber sido eliminado o no está publicado." : "This form may have been deleted or is not published."}</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === "es" ? "Formulario cerrado" : "Form Closed"}
          </h1>
          <p className="text-gray-600">
            {language === "es"
              ? "Este formulario ya no acepta respuestas."
              : "This form is no longer accepting responses."}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {form.settings?.thankYouMessage || (language === "es" ? "¡Gracias!" : "Thank You!")}
          </h1>
          <p className="text-gray-600">
            {form.settings?.thankYouMessageEs || (language === "es" ? "Tu respuesta ha sido registrada." : "Your response has been recorded.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-container py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Event Info Banner (si está asociado a un evento) */}
        {eventInfo && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-l-4 border-secondary">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                {language === "es" ? "Evento asociado" : "Associated Event"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {eventInfo.title}
            </h2>
            <div className="space-y-2">
              {eventInfo.date && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{eventInfo.date}</span>
                </div>
              )}
              {eventInfo.time && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{eventInfo.time}</span>
                </div>
              )}
              {eventInfo.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{eventInfo.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Viva Resource Branding (si es formulario independiente) */}
        {!eventInfo && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Viva Resource Foundation</p>
                <p className="text-sm text-gray-500">{language === "es" ? "Formulario de registro" : "Registration Form"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {form.title}
          </h1>
          {form.titleEs && (
            <p className="text-xl text-gray-600 mb-4">{form.titleEs}</p>
          )}
          {form.description && (
            <p className="text-gray-600 mb-2">{form.description}</p>
          )}
          {form.descriptionEs && (
            <p className="text-gray-600">{form.descriptionEs}</p>
          )}
        </div>

        {/* Progress Bar */}
        {form.settings?.showProgressBar && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {language === "es" ? "Progreso" : "Progress"}
              </span>
              <span className="text-sm font-medium text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Email Field (if required) */}
          {form.settings?.requireEmail && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "es" ? "Correo electrónico *" : "Email Address *"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="your@email.com"
              />
              {errors['__email'] && (
                <p className="text-sm text-red-500 mt-1">{errors['__email']}</p>
              )}
            </div>
          )}

          {/* Form Fields */}
          {form.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.description && (
                <p className="text-sm text-gray-500 mb-2">{field.description}</p>
              )}
              {errors[field.id] && (
                <p className="text-sm text-red-500 mb-2">{errors[field.id]}</p>
              )}
              {renderField(field)}
            </div>
          ))}

          {/* Form-level errors */}
          {errors['__form'] && (
            <p className="text-sm text-red-500 mb-4">{errors['__form']}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {submitting ? (language === "es" ? "Enviando..." : "Submitting...") : (language === "es" ? "Enviar formulario" : "Submit Form")}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 text-sm">
          <p>© {new Date().getFullYear()} Viva Resource Foundation</p>
        </div>
      </div>
    </div>
  );
}
