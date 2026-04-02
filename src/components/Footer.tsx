"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import NewsletterModal from "@/components/NewsletterModal";

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
  { icon: "facebook", href: "https://facebook.com", label: "Facebook" },
  { icon: "instagram", href: "https://instagram.com", label: "Instagram" },
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

function FacebookIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

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
      "Volunteer Portal": { en: "Volunteer Portal", es: "Portal de Voluntarios" },
      "Admin Portal": { en: "Admin Portal", es: "Portal de Admin" },
      "Contact Details": { en: "Contact Details", es: "Detalles de Contacto" },
    };
    return labels[labelKey]?.[language] || labelKey;
  };

  const footerLinks = [
    { href: "/about", label: getLabel("About Us") },
    { href: "/get-help", label: getLabel("Impact Areas") },
    { href: "/resources", label: getLabel("Resources Hub") },
    { href: "/get-involved", label: getLabel("Volunteer Portal") },
    { href: "/admin", label: getLabel("Admin Portal") },
  ];

  return (
    <footer className="bg-primary text-on-primary w-full rounded-t-[3rem] mt-24" role="contentinfo" aria-label="Footer">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
        {/* Column 1: Logo + Description + Social Icons */}
        <div className="space-y-6">
          <Link href="/" className="block" aria-label="Viva Resource Foundation Home">
            <span className="text-2xl font-bold text-on-primary font-headline">
              Viva Resource Foundation
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
          <h4 className="font-bold text-on-primary uppercase tracking-widest text-sm font-body">
            {footer.footerNavTitle}
          </h4>
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
          <h4 className="font-bold text-on-primary uppercase tracking-widest text-sm font-body">
            {footer.footerContactTitle}
          </h4>
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
        <div className="max-w-7xl mx-auto text-center text-on-primary/50 text-sm font-body">
          © {new Date().getFullYear()} Viva Resource Foundation. {footer.footerCopyright}
        </div>
      </div>

      {/* Newsletter Modal */}
      <NewsletterModal isOpen={isNewsletterOpen} onClose={() => setIsNewsletterOpen(false)} />
    </footer>
  );
}
