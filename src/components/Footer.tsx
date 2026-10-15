"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import NewsletterModal from "@/components/NewsletterModal";
import { FacebookIcon, InstagramIcon, VIVA_SOCIALS } from "@/components/SocialIcons";

interface ContactDetail {
  type: "email" | "address";
  value: string;
  subValue?: string;
}

interface SocialLink {
  icon: "facebook" | "instagram";
  href: string;
  label: string;
}

const socialLinks: SocialLink[] = [
  { icon: "facebook", href: VIVA_SOCIALS.facebook, label: "Facebook" },
  { icon: "instagram", href: VIVA_SOCIALS.instagram, label: "Instagram" },
];

const contactDetails: ContactDetail[] = [
  {
    type: "email",
    value: "vivaresourcefoundation@gmail.com",
  },
  {
    type: "address",
    value: "13055 Bradshaw Drive #301",
    subValue: "Peyton, CO",
  },
];

function SocialIcon({ icon }: { icon: "facebook" | "instagram" }): JSX.Element {
  switch (icon) {
    case "facebook":
      return <FacebookIcon className="w-5 h-5" />;
    case "instagram":
      return <InstagramIcon className="w-5 h-5" />;
    default:
      return <FacebookIcon className="w-5 h-5" />;
  }
}

function ContactIcon({ type }: { type: "email" | "address" }): JSX.Element {
  switch (type) {
    case "email":
      return <Mail className="w-5 h-5 text-primary flex-shrink-0" />;
    case "address":
      return <MapPin className="w-5 h-5 text-primary flex-shrink-0" />;
    default:
      return <Mail className="w-5 h-5 text-primary flex-shrink-0" />;
  }
}

export default function Footer(): JSX.Element {
  const { translations, language } = useLanguage();
  const { footer } = translations;
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  const getLabel = (labelKey: string): string => {
    const labels: Record<string, Record<string, string>> = {
      "About Us": { en: "About Us", es: "Nosotros" },
      "Impact Areas": { en: "Impact Areas", es: "Áreas de Impacto" },
      "Resources Hub": { en: "Resources Hub", es: "Centro de Recursos" },
      "Locations": { en: "Locations", es: "Ubicaciones" },
      "Get Involved": { en: "Get Involved", es: "Involúcrate" },
      "Get Help": { en: "Get Help", es: "Obtener Ayuda" },
      "Events": { en: "Events", es: "Eventos" },
      "Donate": { en: "Donate", es: "Donar" },
      "Volunteer Portal": { en: "Volunteer Portal", es: "Portal de Voluntarios" },
      "Admin Portal": { en: "Admin Portal", es: "Portal de Admin" },
      "Contact Details": { en: "Contact Details", es: "Detalles de Contacto" },
    };
    return labels[labelKey]?.[language] || labelKey;
  };

  /**
   * El footer es el lugar de los destinos secundarios: el Portal de Voluntarios
   * (area con login) y el de Admin viven aqui, no en el nav publico. Cada label
   * debe describir SU destino: antes /get-help decia "Impact Areas" y
   * /get-involved decia "Volunteer Portal".
   */
  const footerLinks = [
    { href: "/about", label: getLabel("About Us") },
    { href: "/get-help", label: getLabel("Get Help") },
    { href: "/resources", label: getLabel("Resources Hub") },
    { href: "/locations", label: getLabel("Locations") },
    { href: "/events", label: getLabel("Events") },
    { href: "/get-involved", label: getLabel("Get Involved") },
    { href: "/donate", label: getLabel("Donate") },
    { href: "/volunteer-portal", label: getLabel("Volunteer Portal") },
    { href: "/admin", label: getLabel("Admin Portal") },
  ];

  return (
    <footer className="bg-primary text-on-primary w-full rounded-t-[3rem] mt-24" role="contentinfo" aria-label="Footer">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
        {/* Column 1: Logo + Description + Social Icons */}
        <div className="space-y-6">
          <Link href="/" className="block" aria-label="Viva Resource Home">
            <span className="text-2xl font-bold text-on-primary font-headline">
              Viva Resource
            </span>
          </Link>
          <p className="text-on-primary/70 leading-relaxed font-body">
            {footer.footerBuildBridges}
          </p>
          <div className="flex gap-4 pt-2">
            {socialLinks.map((social) => (
              <a
                key={social.icon}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-10 h-10 bg-on-primary/10 rounded-full flex items-center justify-center text-on-primary hover:bg-secondary hover:text-on-secondary transition-colors"
              >
                <SocialIcon icon={social.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-6">
          <h3 className="font-bold text-on-primary uppercase tracking-widest text-sm font-body">
            {footer.footerNavTitle}
          </h3>
          <ul className="space-y-4">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-on-primary/70 hover:text-secondary transition-colors font-body"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact Details + Newsletter */}
        <div className="space-y-6">
          <h3 className="font-bold text-on-primary uppercase tracking-widest text-sm font-body">
            {footer.footerContactTitle}
          </h3>
          <div className="space-y-4">
            {contactDetails.map((detail, index) => (
              <div
                key={index}
                className="flex items-start gap-3 text-on-primary/70 font-body"
              >
                <ContactIcon type={detail.type} />
                <div>
                  <p>{detail.value}</p>
                  {detail.subValue && <p>{detail.subValue}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <button
              onClick={() => setIsNewsletterOpen(true)}
              className="inline-block bg-secondary-container text-on-secondary-container px-6 py-3 rounded-full font-bold text-sm font-body hover:bg-secondary hover:text-on-secondary transition-colors cursor-pointer"
            >
              {footer.footerJoinNewsletter}
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-on-primary/10 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-on-primary/80 text-sm font-body">
          © {new Date().getFullYear()} Viva Resource.{" "}
          {language === "es"
            ? "Todos los derechos reservados. Organización 501(c)(3) registrada."
            : "All rights reserved. Registered 501(c)(3)."}
        </div>
      </div>

      {/* Newsletter Modal */}
      <NewsletterModal isOpen={isNewsletterOpen} onClose={() => setIsNewsletterOpen(false)} />
    </footer>
  );
}
