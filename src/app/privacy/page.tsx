"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import {
  Database,
  BarChart3,
  ShieldCheck,
  Cookie,
  Gavel,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function PrivacyPolicyPage(): JSX.Element {
  const { language, isHydrated } = useLanguage();

  if (!isHydrated) return <></>;

  const sidebarLinks = [
    { href: "#intro", label: language === "es" ? "Introducción" : "Introduction", active: true },
    { href: "#collection", label: language === "es" ? "Recolección de información" : "Information Collection", active: false },
    { href: "#usage", label: language === "es" ? "Uso de datos" : "Data Usage", active: false },
    { href: "#security", label: language === "es" ? "Seguridad" : "Security", active: false },
    { href: "#cookies", label: language === "es" ? "Cookies" : "Cookies", active: false },
    { href: "#compliance", label: language === "es" ? "Cumplimiento" : "Compliance", active: false },
    { href: "#contact", label: language === "es" ? "Contacto" : "Contact", active: false },
  ];

  const cookieTypes = language === "es"
    ? ["Cookies Necesarias", "Análisis de Rendimiento", "Preferencias Funcionales"]
    : ["Necessary Cookies", "Performance Analytics", "Functional Preferences"];

  const usageItems = [
    {
      title: language === "es" ? "Entrega de servicios" : "Service Delivery",
      description: language === "es"
        ? "Para proporcionar los recursos y el apoyo que las familias rurales nos solicitan."
        : "To provide the resources and support rural families request from us.",
    },
    {
      title: language === "es" ? "Reporte de impacto" : "Impact Reporting",
      description: language === "es"
        ? "Para medir la efectividad de nuestros programas para nuestra junta y donantes."
        : "To measure the effectiveness of our programs for our board and donors.",
    },
  ];

  return (
    <main className="bg-[#f9f9f9] text-[#1a1c1c] font-body selection:bg-[#b7f569] selection:text-[#457000]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-24">
        {/* Hero Header */}
        <header className="mb-24 flex flex-col md:flex-row md:items-end gap-8 relative">
          <div className="flex-1">
            <div className="h-1 w-24 bg-[#416900] mb-6" />
            <h1 className="text-[3.5rem] leading-none font-headline font-extrabold tracking-tight text-[#025689] mb-6">
              {language === "es" ? "Política de Privacidad" : "Privacy Policy"}
            </h1>
            <p className="text-lg text-[#41474f] max-w-2xl leading-relaxed">
              {language === "es"
                ? "Última actualización: Octubre 2024. Su confianza es nuestro recurso más valioso. Estamos comprometidos a proteger la dignidad y los datos de las familias a las que servimos."
                : "Last updated: October 2024. Your trust is our most valuable resource. We are committed to protecting the dignity and data of the families we serve."}
            </p>
          </div>
          <div className="hidden lg:block w-1/3 aspect-[4/3] bg-[#f3f3f3] rounded-xl overflow-hidden relative">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2XPGM5MojMsPUlBiUsGKtUp3BN42FCcTbJDYhN000WXHdr5lGV5J6ylTZpfCG5OdU0yJcGaaxLSjEe7LosipRnVSU6aRm7gRPi-EwHJeIT6HxbWW81UyrDsiNy9xBHtBTdjSS23ZVEt8bZ0Y4Ur4uFmRxM8ou27DCoSyT54U8XTSSAMmIMmRpSloRCBESZLMNMw4wEkb8xKDlLAD-XfH3ec7uMvHJk4oS1FuDzE_h_JukfiHwBTknTG58I2n4jI2i07kvNNlnJQc"
              alt={language === "es" ? "Privacidad y seguridad" : "Privacy and security"}
              fill
              className="object-cover opacity-80 mix-blend-multiply"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-32 h-fit">
            <nav className="flex flex-col gap-4 border-l-2 border-[#eeeeee] pl-6">
              {sidebarLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`hover:text-[#025689] transition-colors ${
                    link.active
                      ? "text-[#025689] font-bold"
                      : "text-[#41474f]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-24">
            {/* Introduction */}
            <section id="intro" className="scroll-mt-32">
              <p className="text-lg text-[#41474f] leading-relaxed mb-8">
                <span className="float-left text-[4rem] leading-none font-extrabold pr-3 text-[#025689] font-headline">
                  {language === "es" ? "E" : "A"}
                </span>
                {language === "es"
                  ? "n Viva Resource Foundation, reconocemos que la privacidad es un derecho humano fundamental. Como organización 501(c)(3) dedicada al desarrollo rural, manejamos su información con el mismo cuidado y respeto que aportamos a nuestro trabajo de campo."
                  : "t Viva Resource Foundation, we recognize that privacy is a fundamental human right. As a 501(c)(3) organization dedicated to rural development, we handle your information with the same care and respect we bring to our field work."}
              </p>
            </section>

            {/* Information Collection */}
            <section id="collection" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <Database className="w-6 h-6 text-[#416900]" fill="currentColor" />
                <h2 className="text-2xl font-headline font-bold text-[#025689]">
                  {language === "es" ? "Lo que recolectamos" : "What We Collect"}
                </h2>
              </div>
              <div className="bg-[#f3f3f3] rounded-xl p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-headline font-bold text-lg mb-4 text-[#1a1c1c]">
                      {language === "es" ? "Proporcionado directamente" : "Directly Provided"}
                    </h3>
                    <p className="text-[#41474f] text-sm">
                      {language === "es"
                        ? "Nombres, correos electrónicos y números de teléfono proporcionados durante solicitudes de recursos o donaciones."
                        : "Names, email addresses, and phone numbers provided during resource requests or donations."}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg mb-4 text-[#1a1c1c]">
                      {language === "es" ? "Recolectado automáticamente" : "Automatically Collected"}
                    </h3>
                    <p className="text-[#41474f] text-sm">
                      {language === "es"
                        ? "Direcciones IP, tipos de navegador y patrones de uso a través de nuestras plataformas digitales."
                        : "IP addresses, browser types, and usage patterns through our digital platforms."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section id="usage" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <BarChart3 className="w-6 h-6 text-[#416900]" fill="currentColor" />
                <h2 className="text-2xl font-headline font-bold text-[#025689]">
                  {language === "es" ? "Cómo usamos su información" : "How We Use Your Info"}
                </h2>
              </div>
              <div className="space-y-6">
                {usageItems.map((item, index) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="w-1 bg-[#025689] group-hover:bg-[#416900] transition-colors shrink-0" />
                    <div className="py-2">
                      <p className="text-[#1a1c1c] font-semibold mb-1">
                        {item.title}
                      </p>
                      <p className="text-[#41474f]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Security */}
            <section id="security" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <ShieldCheck className="w-6 h-6 text-[#416900]" fill="currentColor" />
                <h2 className="text-2xl font-headline font-bold text-[#025689]">
                  {language === "es" ? "Nuestra seguridad" : "Our Security"}
                </h2>
              </div>
              <div className="relative p-12 bg-[#025689] text-white rounded-xl overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-headline font-bold text-xl mb-4">
                    {language === "es" ? "Seguridad y Estándares" : "Encryption & Standards"}
                  </h3>
                  <p className="opacity-90 leading-relaxed">
                    {language === "es"
                      ? "Empleamos cifrado SSL estándar de la industria para todas las transmisiones de datos. Sus datos se almacenan en entornos de nube seguros accesibles solo por personal autorizado."
                      : "We employ industry-standard SSL encryption for all data transmissions. Your data is stored in secured cloud environments accessible only by authorized personnel."}
                  </p>
                </div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <Cookie className="w-6 h-6 text-[#416900]" fill="currentColor" />
                <h2 className="text-2xl font-headline font-bold text-[#025689]">
                  {language === "es" ? "Política de cookies" : "Cookie Policy"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {cookieTypes.map((type, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#e8e8e8] rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-[#41474f] leading-relaxed">
                {language === "es"
                  ? "Utilizamos cookies para mejorar su experiencia de navegación y comprender el tráfico del sitio web. Puede optar por no participar en cualquier momento a través de la configuración de su navegador."
                  : "We use cookies to enhance your browsing experience and understand website traffic. You can opt-out at any time through your browser settings."}
              </p>
            </section>

            {/* Compliance */}
            <section
              id="compliance"
              className="scroll-mt-32 border-t-4 border-[#416900] pt-12"
            >
              <div className="flex items-center gap-4 mb-6">
                <Gavel className="w-6 h-6 text-[#025689]" fill="currentColor" />
                <h2 className="text-2xl font-headline font-bold text-[#025689]">
                  {language === "es" ? "Cumplimiento" : "Compliance"}
                </h2>
              </div>
              <p className="text-sm text-[#41474f]">
                {language === "es"
                  ? "Como fundación con mentalidad global, nos esforzamos por alinearnos con los estándares GDPR (Reglamento General de Protección de Datos) y CCPA (Ley de Privacidad del Consumidor de California) donde sea aplicable, garantizando la portabilidad de los datos y el derecho al olvido."
                  : "As a global-minded foundation, we strive for alignment with GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act) standards where applicable, ensuring data portability and the right to be forgotten."}
              </p>
            </section>

            {/* Contact */}
            <section
              id="contact"
              className="scroll-mt-32 bg-[#b7f569]/30 p-12 rounded-xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <HelpCircle className="w-6 h-6 text-[#416900]" fill="currentColor" />
                <h2 className="text-2xl font-headline font-bold text-[#025689]">
                  {language === "es" ? "Contacto" : "Contact"}
                </h2>
              </div>
              <div className="max-w-xl">
                <p className="text-[#41474f] mb-8">
                  {language === "es"
                    ? "Si tiene inquietudes sobre sus datos o desea ejercer sus derechos, comuníquese con nuestro oficial de privacidad."
                    : "If you have concerns about your data or wish to exercise your rights, please reach out to our privacy officer."}
                </p>
                <a
                  href="mailto:privacy@vivafoundation.org"
                  className="inline-flex items-center gap-3 bg-[#025689] text-white px-8 py-4 rounded-full font-bold hover:shadow-lg transition-all group"
                >
                  privacy@vivafoundation.org
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
