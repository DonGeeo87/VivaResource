"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQItem {
  question: string;
  questionEs: string;
  answer: string;
  answerEs: string;
}

const faqData: FAQItem[] = [
  {
    question: "What services does Viva Resource provide?",
    questionEs: "¿Qué servicios ofrece Viva Resource?",
    answer: "Viva Resource provides food assistance, housing support, legal aid referrals, healthcare navigation, educational workshops, and emergency response services to immigrant and rural communities across El Paso County, Colorado.",
    answerEs: "Viva Resource ofrece asistencia alimentaria, apoyo de vivienda, referencias legales, navegación de salud, talleres educativos y servicios de respuesta de emergencia para comunidades inmigrantes y rurales en todo el Condado de El Paso, Colorado.",
  },
  {
    question: "Is Viva Resource a nonprofit organization?",
    questionEs: "¿Viva Resource es una organización sin fines de lucro?",
    answer: "Yes, Viva Resource is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the extent allowed by law.",
    answerEs: "Sí, Viva Resource es una organización sin fines de lucro registrada 501(c)(3). Todas las donaciones son deducibles de impuestos según lo permitido por la ley.",
  },
  {
    question: "Do I need to be a U.S. citizen to receive services?",
    questionEs: "¿Necesito ser ciudadano estadounidense para recibir servicios?",
    answer: "No. Viva Resource serves all community members regardless of immigration status. We do not ask about immigration status to provide services. Your information is kept confidential.",
    answerEs: "No. Viva Resource sirve a todos los miembros de la comunidad independientemente de su estatus migratorio. No preguntamos sobre el estatus migratorio para proporcionar servicios. Su información se mantiene confidencial.",
  },
  {
    question: "What areas do you serve?",
    questionEs: "¿Qué áreas atienden?",
    answer: "We serve all of El Paso County, Colorado, including Peyton (headquarters), Colorado Springs, Pueblo, Fountain, Monument, and surrounding rural communities.",
    answerEs: "Atendemos todo el Condado de El Paso, Colorado, incluyendo Peyton (sede central), Colorado Springs, Pueblo, Fountain, Monument y las comunidades rurales circundantes.",
  },
  {
    question: "How can I get help?",
    questionEs: "¿Cómo puedo obtener ayuda?",
    answer: "You can submit a help request through our Get Help page, call 211 for resource referrals, or contact us directly via email at vivaresourcefoundation@gmail.com.",
    answerEs: "Puede enviar una solicitud de ayuda a través de nuestra página Obtener Ayuda, llamar al 211 para referencias de recursos, o contactarnos directamente por correo electrónico a vivaresourcefoundation@gmail.com.",
  },
  {
    question: "How can I volunteer or donate?",
    questionEs: "¿Cómo puedo ser voluntario o donar?",
    answer: "Visit our Get Involved page to sign up as a volunteer, or go to our Donate page to make a tax-deductible contribution. We also accept in-kind donations of food, clothing, and household items.",
    answerEs: "Visite nuestra página Involúcrate para registrarse como voluntario, o vaya a nuestra página Donar para hacer una contribución deducible de impuestos. También aceptamos donaciones en especie de alimentos, ropa y artículos para el hogar.",
  },
  {
    question: "Are services available in Spanish?",
    questionEs: "¿Los servicios están disponibles en español?",
    answer: "Yes, all our services are available in both English and Spanish. Our team is bilingual and all forms and resources are offered in both languages.",
    answerEs: "Sí, todos nuestros servicios están disponibles tanto en inglés como en español. Nuestro equipo es bilingüe y todos los formularios y recursos se ofrecen en ambos idiomas.",
  },
  {
    question: "What is your location and hours?",
    questionEs: "¿Cuál es su ubicación y horario?",
    answer: "Our headquarters is at 13055 Bradshaw Drive #301, Peyton, CO 80831. We are open Monday through Friday, 9:00 AM to 5:00 PM. Services in other locations are available by appointment.",
    answerEs: "Nuestra sede central está en 13055 Bradshaw Drive #301, Peyton, CO 80831. Estamos abiertos de lunes a viernes, de 9:00 AM a 5:00 PM. Los servicios en otras ubicaciones están disponibles con cita previa.",
  },
];

export default function FAQSection() {
  const { language } = useLanguage();
  const isES = language === "es";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-6 bg-surface-low">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4">
            {isES ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            {isES
              ? "Respuestas a las preguntas más comunes sobre nuestros servicios"
              : "Answers to common questions about our services and programs"}
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="font-headline font-bold text-on-surface pr-4">
                  {isES ? faq.questionEs : faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-on-surface-variant leading-relaxed">
                  {isES ? faq.answerEs : faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
