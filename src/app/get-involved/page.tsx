"use client";

import { useState, FormEvent } from "react";
import { Star, HeartHandshake, AlertCircle, GraduationCap, Package, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/components/Toast";

const skillsOptions = [
  { id: "communityOutreach", label: "Community Outreach", labelEs: "Extensión Comunitaria" },
  { id: "eventPlanning", label: "Event Planning", labelEs: "Planificación de Eventos" },
  { id: "socialMedia", label: "Social Media", labelEs: "Redes Sociales" },
  { id: "translation", label: "Translation/Interpretation", labelEs: "Traducción/Interpretación" },
  { id: "adminSupport", label: "Administrative Support", labelEs: "Soporte Administrativo" },
  { id: "driving", label: "Driving/Transportation", labelEs: "Conducción/Transporte" },
  { id: "firstAid", label: "First Aid/CPR", labelEs: "Primeros Auxilios/CPR" },
  { id: "techSupport", label: "Technical Support", labelEs: "Soporte Técnico" },
];

const interestsOptions = [
  { id: "emergencyResponse", label: "Emergency Response", labelEs: "Respuesta de Emergencia" },
  { id: "foodDistribution", label: "Food Distribution", labelEs: "Distribución de Alimentos" },
  { id: "healthFairs", label: "Health Fairs", labelEs: "Ferias de Salud" },
  { id: "educationWorkshops", label: "Education Workshops", labelEs: "Talleres Educativos" },
  { id: "advocacy", label: "Advocacy", labelEs: "Defensa" },
  { id: "fundraising", label: "Fundraising", labelEs: "Recaudación de Fondos" },
];

const volunteerOpportunities = [
  {
    icon: AlertCircle,
    title: "Emergency Support",
    titleEs: "Apoyo en Emergencias",
    description: "Rapid response for community crises.",
    descriptionEs: "Respuesta rápida en crisis.",
  },
  {
    icon: GraduationCap,
    title: "Educational Outreach",
    titleEs: "Educación Comunitaria",
    description: "Workshops and skill sharing.",
    descriptionEs: "Talleres y capacitación.",
  },
  {
    icon: Package,
    title: "Resource Distribution",
    titleEs: "Distribución de Recursos",
    description: "Direct aid for families in need.",
    descriptionEs: "Ayuda directa para familias.",
  },
];

const steps = [
  {
    number: "1",
    title: "Explore",
    titleEs: "Explorar",
    description: "Review our programs and find the one that resonates with your skills.",
    descriptionEs: "Revise nuestros programas y encuentre el que resuene con sus habilidades.",
  },
  {
    number: "2",
    title: "Apply",
    titleEs: "Aplicar",
    description: "Fill out our simple digital form below to express your interest.",
    descriptionEs: "Complete nuestro sencillo formulario digital para expresar su interés.",
  },
  {
    number: "3",
    title: "Impact",
    titleEs: "Impactar",
    description: "Attend orientation and start making a real community difference.",
    descriptionEs: "Asista a la orientación y comience a marcar una diferencia real.",
  },
];

const testimonials = [
  {
    quote: "Being an ambassador has changed how I see my own street. I feel empowered to help my neighbors navigate complex systems.",
    quoteEs: "Ser embajadora ha cambiado mi forma de ver mi propia calle. Me siento empoderada para ayudar a mis vecinos.",
    author: "Elena R.",
    role: "Community Ambassador",
    roleEs: "Embajadora Comunitaria",
  },
  {
    quote: "The volunteer team is like a second family. Distributing resources during the winter was the most rewarding thing I've done this year.",
    quoteEs: "El equipo de voluntarios es como una segunda familia. Ayudar a las familias fue lo más gratificante que hice este año.",
    author: "Marcus T.",
    role: "Lead Volunteer",
    roleEs: "Voluntario Principal",
  },
];

export default function GetInvolvedPage(): JSX.Element {
  const { translations, language } = useLanguage();
  const t = translations.getInvolved;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    program: "volunteer",
    skills: [] as string[],
    interests: [] as string[],
    availability: "",
    experience: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { showToast, Toast: VolunteerToast } = useToast();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isES = language === "es";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (field: "skills" | "interests", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");
    setFieldErrors({});

    // Validate all required fields
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      errors.firstName = language === "en" ? "First name is required" : "El nombre es requerido";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = language === "en" ? "Last name is required" : "El apellido es requerido";
    }
    if (!formData.email.trim()) {
      errors.email = language === "en" ? "Email is required" : "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = language === "en" ? "Please enter a valid email" : "Ingrese un correo válido";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "volunteer_registrations"), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || "",
        program: formData.program,
        skills: formData.skills,
        interests: formData.interests,
        availability: formData.availability,
        experience: formData.experience,
        status: "pending",
        created_at: serverTimestamp(),
      });

      // Send admin notification email asynchronously (don't block UI)
      try {
        fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new-volunteer",
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone || "",
              program: formData.program,
              skills: formData.skills,
              interests: formData.interests,
              availability: formData.availability,
            },
          }),
        }).catch((emailErr) => console.error("Failed to send volunteer notification:", emailErr));
      } catch (emailError) {
        // Silently fail - don't block the main operation
        console.error("Error triggering volunteer notification:", emailError);
      }

      setSubmitStatus("success");
      showToast(language === "en" ? "Application submitted successfully!" : "¡Solicitud enviada exitosamente!", "success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        program: "volunteer",
        skills: [],
        interests: [],
        availability: "",
        experience: "",
      });
    } catch (error) {
      console.error("Error submitting volunteer registration:", error);
      setSubmitStatus("error");
      setErrorMessage(language === "en" ? "Something went wrong. Please try again." : "Algo salió mal. Por favor intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <VolunteerToast />
      <main className="pt-0">
        {/* Hero Section */}
        <header className="relative overflow-hidden px-6 lg:px-12 py-20 lg:py-32 bg-gradient-to-br from-primary to-primary-container text-on-primary">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-block bg-secondary text-on-secondary px-4 py-1 rounded-full text-xs font-bold mb-6 tracking-widest uppercase">
                {isES ? "Impulsado por la Comunidad" : "Community Driven"}
              </span>
              <h1 className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-8">
                {isES ? "Únase a Nuestra Causa" : "Join Our Cause"}
              </h1>
              <p className="text-lg text-on-primary/80 max-w-xl mb-10 leading-relaxed">
                {isES 
                  ? "Sus manos y su corazón son la base de nuestro trabajo. Juntos podemos construir una comunidad más solidaria."
                  : "Your hands and heart are the foundation of our work. Together, we can build a more resilient and supportive community for everyone."
                }
              </p>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkHH-eYSUuv5Ascsub3aRhJZ-4Q_WRY0N3sv6qce3afa3TTZE0DXGifxvViubqZPWG066hDP0wQvMT2SgcJwCxPnECENaEiSMvVzmeDCVMDTqkimbEh2hrZOcNQbfkxHkp7feuv6RjiHvWWtACu-si-c2QSpa58R7BliyKZFQ4eTINTWuoxGdGG__S4wVG0swBV15C7gnQuS-MluUafNZg7lcmozm5YNb0QzsMgY3VW7r0jzIBwMBMogLu4VyY3nfJS1a-POR15sg"
                  alt="Volunteers working together at a community food pantry"
                  width={600}
                  height={500}
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-secondary-container rounded-xl -z-10 opacity-50"></div>
            </div>
          </div>
        </header>

        {/* Programs Bento Grid */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Ambassador Program Card */}
            <div className="lg:col-span-7 bg-surface-low rounded-xl p-8 lg:p-12 flex flex-col justify-between overflow-hidden relative group">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Star className="text-primary w-8 h-8" />
                  <h2 className="font-headline text-3xl font-bold text-primary">
                    {isES ? "Programa de Embajadores" : "Ambassador Program"}
                  </h2>
                </div>
                <p className="text-secondary font-bold uppercase tracking-tighter mb-4">
                  {isES ? "Faro de Esperanza" : "Beacon of Hope"}
                </p>
                <p className="text-lg text-on-surface-variant mb-8 leading-relaxed max-w-lg">
                  {isES
                    ? "Los embajadores son líderes visionarios que empoderan a sus propios vecindarios, facilitando el diálogo y liderando iniciativas locales."
                    : "Ambassadors are the visionary leaders who empower their own neighborhoods. They facilitate dialogue, identify needs, and lead local initiatives."
                  }
                </p>
              </div>
              <div className="mt-8 rounded-lg overflow-hidden h-64 shadow-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5bCa0b1mqp5EScbVI4PyP4NJKaz5fZ4EQlskc5FlVxMPK4BxqyJltpR8x_9IIUG2889TOJPsn4MZ7hNOInv9ILKf59VWnmJKMXJbwU0Wx2PSZ_QZqJW4Ib19TFasv--CypnOXQIg_qIqR0KF8vFTRRAu3kWkpKbyLgr2AYC17f3uXDd-LqXQwNvGnvpZBTa8TOrQ77cQ-he0P8kY16GkpbUrEjmjIXS55pW1-C7QNMX7vDAZ3aOz2Puk0bcrdzh1t0P-W5cLwyg8"
                  alt="Community ambassador speaking to diverse audience"
                  width={800}
                  height={256}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Volunteer Program Card */}
            <div className="lg:col-span-5 bg-secondary-container/20 rounded-xl p-8 lg:p-12 flex flex-col border border-secondary/10">
              <div className="mb-8">
                <HeartHandshake className="text-secondary w-10 h-10 mb-4" />
                <h2 className="font-headline text-3xl font-bold text-secondary mb-2">
                  {t.volunteer}
                </h2>
                <h3 className="text-secondary font-semibold text-lg mb-6 italic">
                  {isES ? "Haga la Diferencia" : "Make a Difference Hands-On"}
                </h3>
              </div>
              <ul className="space-y-6 flex-grow">
                {volunteerOpportunities.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <item.icon className="text-secondary w-6 h-6 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-primary">{isES ? item.titleEs : item.title}</p>
                      <p className="text-sm text-on-surface-variant">{isES ? item.descriptionEs : item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How to Get Involved / Steps */}
        <section className="bg-surface-high py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="font-headline text-4xl font-bold text-primary mb-4">
                {isES ? "Cómo Participar" : "How to Get Involved"}
              </h2>
              <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="bg-surface rounded-xl p-10 text-center shadow-sm relative z-10"
                >
                  <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    {step.number}
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-4">{isES ? step.titleEs : step.title}</h3>
                  <p className="text-on-surface-variant text-sm">
                    {isES ? step.descriptionEs : step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/3">
              <h2 className="font-headline text-4xl font-extrabold text-primary mb-6">
                {isES ? "Voces del Cambio" : "Voices of Change"}
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                {isES
                  ? "Escucha de quienes ya están construyendo el futuro con nosotros. Sus historias son el verdadero latido de Viva."
                  : "Hear from those who are already building the future with us. Their stories are the true heartbeat of Viva."
                }
              </p>
            </div>
            <div className="lg:w-2/3 grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="p-8 border-l-4 border-secondary bg-surface-lowest">
                  <p className="text-lg italic mb-6 text-on-surface">
                    &ldquo;{isES ? testimonial.quoteEs : testimonial.quote}&rdquo;
                  </p>
                  <p className="text-sm font-bold text-primary mb-2">
                    — {testimonial.author}, {isES ? testimonial.roleEs : testimonial.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-24 px-6 bg-surface" id="apply">
          <div className="max-w-4xl mx-auto bg-surface-low rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-primary p-12 text-on-primary flex flex-col justify-center">
              <h2 className="font-headline text-3xl font-bold mb-6">
                {isES ? "Únase al Equipo" : "Join the Team"}
              </h2>
              <p className="opacity-80 text-sm leading-relaxed">
                {isES
                  ? "Comience su viaje hoy. Nuestro equipo le contactará en 48 horas."
                  : "Start your journey today. Our team will contact you within 48 hours."
                }
              </p>
            </div>
            <div className="md:w-2/3 p-12 bg-surface-lowest">
              {submitStatus === "success" ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <h3 className="font-headline text-2xl font-bold text-primary mb-2">
                    {language === "en" ? "Thank You!" : "¡Gracias!"}
                  </h3>
                  <p className="text-on-surface-variant mb-6">
                    {language === "en" 
                      ? "Your application has been submitted. We'll be in touch within 48 hours." 
                      : "Su solicitud ha sido enviada. Nos pondremos en contacto en 48 horas."}
                  </p>
                  <button
                    onClick={() => setSubmitStatus("idle")}
                    className="text-primary font-medium hover:underline"
                  >
                    {language === "en" ? "Submit another application" : "Enviar otra solicitud"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitStatus === "error" && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-2">
                        {language === "en" ? "First Name *" : "Nombre *"}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Jane"
                        className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-2">
                        {language === "en" ? "Last Name *" : "Apellido *"}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-2">
                        {language === "en" ? "Email *" : "Correo Electrónico *"}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="jane@example.com"
                        className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-2">
                        {language === "en" ? "Phone" : "Teléfono"}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">
                      {language === "en" ? "Program of Interest" : "Programa de Interés"}
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                    >
                      <option value="ambassador">{language === "en" ? "Ambassador Program" : "Programa de Embajadores"}</option>
                      <option value="volunteer">{language === "en" ? "Volunteer Program" : "Programa de Voluntariado"}</option>
                      <option value="general">{language === "en" ? "General Inquiry" : "Consulta General"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-3">
                      {language === "en" ? "Skills (select all that apply)" : "Habilidades (seleccione todas las aplicables)"}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {skillsOptions.map((skill) => (
                        <label key={skill.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill.id)}
                            onChange={() => handleCheckboxChange("skills", skill.id)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                          <span className="text-sm text-on-surface-variant">
                            {language === "en" ? skill.label : skill.labelEs}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-3">
                      {language === "en" ? "Areas of Interest" : "Áreas de Interés"}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {interestsOptions.map((interest) => (
                        <label key={interest.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest.id)}
                            onChange={() => handleCheckboxChange("interests", interest.id)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                          <span className="text-sm text-on-surface-variant">
                            {language === "en" ? interest.label : interest.labelEs}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">
                      {language === "en" ? "Availability" : "Disponibilidad"}
                    </label>
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      placeholder={language === "en" ? "e.g., Weekends, Evenings" : "ej., Fines de semana, Tardes"}
                      className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">
                      {language === "en" ? "Relevant Experience" : "Experiencia Relevante"}
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder={language === "en" ? "Tell us about any relevant experience..." : "Cuéntenos sobre su experiencia relevante..."}
                      rows={3}
                      className="w-full bg-surface-highest border-none rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-secondary text-on-secondary font-headline font-bold py-4 rounded-full hover:opacity-90 transition-all shadow-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting 
                      ? (language === "en" ? "Submitting..." : "Enviando...")
                      : (language === "en" ? "Submit Application" : "Enviar Solicitud")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 text-center max-w-4xl mx-auto">
          <h2 className="font-headline text-5xl font-extrabold text-primary mb-8 tracking-tight">
            Ready to take the first step? / ¿Listo para dar el primer paso?
          </h2>
          <p className="text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto">
            Your impact starts here. Join a community dedicated to resilience, equity, and hope.
          </p>
          <Link
            href="#apply"
            className="inline-block bg-secondary text-on-secondary px-12 py-5 rounded-full font-headline font-extrabold text-xl hover:scale-105 transition-transform duration-300 shadow-xl"
          >
            Join Us / Únase a Nosotros
          </Link>
        </section>
      </main>
    </>
  );
}
