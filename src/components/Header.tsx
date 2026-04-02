"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header(): JSX.Element {
  const pathname = usePathname();
  const { language, setLanguage, translations } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleLanguage = (): void => {
    setLanguage(language === "en" ? "es" : "en");
  };

  const toggleSection = (section: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (href: string): boolean => {
    return pathname === href;
  };

  // Categorías de navegación
  const navCategories = [
    {
      name: language === "es" ? "Nosotros" : "About",
      items: [
        { href: "/about", label: language === "es" ? "Nosotros" : "About Us" },
        { href: "/blog", label: language === "es" ? "Blog" : "Blog" },
        { href: "/contact", label: language === "es" ? "Contáctanos" : "Contact Us" },
      ]
    },
    {
      name: language === "es" ? "Recursos" : "Resources",
      items: [
        { href: "/resources", label: language === "es" ? "Recursos" : "Resources" },
        { href: "/get-help", label: language === "es" ? "Obtener Ayuda" : "Get Help" },
        { href: "/events", label: language === "es" ? "Eventos" : "Events" },
      ]
    },
    {
      name: language === "es" ? "Participa" : "Get Involved",
      items: [
        { href: "/get-involved", label: language === "es" ? "Involúcrate" : "Get Involved" },
        { href: "/donate", label: language === "es" ? "Donar" : "Donate" },
        { href: "/volunteer-portal", label: language === "es" ? "Portal Voluntarios" : "Volunteer Portal" },
      ]
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <nav className="bg-white/80 backdrop-blur-glass shadow-glass w-full px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo-rectangular.png"
                  alt="Viva Resource Foundation"
                  width={140}
                  height={60}
                  className="h-12 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navCategories.map((category) => (
                <div key={category.name} className="relative group">
                  <button className="flex items-center gap-1 transition-colors font-body text-on-surface-variant hover:text-primary py-2">
                    <span className="font-medium">{category.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-ambient-lg border border-outline-variant/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="py-2">
                      {category.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-4 py-2.5 text-sm transition-colors ${
                            isActive(item.href)
                              ? "bg-primary/5 text-primary font-bold"
                              : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Language Selector - Desktop */}
              <button
                onClick={toggleLanguage}
                className="hidden lg:flex items-center gap-1 text-on-surface-variant px-3 py-1 rounded-full hover:bg-surface-low transition-all"
                aria-label="Toggle language"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase">
                  {language}
                </span>
              </button>

              {/* CTA Button - Desktop */}
              <Link
                href="/contact"
                className="hidden md:block bg-primary text-on-primary px-6 py-2 rounded-full font-bold font-body hover:bg-primary-hover active:bg-primary-active hover:shadow-ambient-md transition-all"
              >
                {translations.nav.contactUs}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-on-surface p-2 hover:bg-surface-low rounded-lg transition-colors"
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-glass shadow-ambient-lg fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto z-40">
            <div className="px-4 py-3 space-y-2">
              {/* Categorías desplegables */}
              {navCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border-b border-surface-low pb-2">
                  <button
                    onClick={() => toggleSection(`category-${categoryIndex}`)}
                    className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-low transition-colors"
                  >
                    <span className="font-bold text-primary">{category.name}</span>
                    {expandedSections[`category-${categoryIndex}`] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {/* Submenú */}
                  {expandedSections[`category-${categoryIndex}`] && (
                    <div className="pl-4 space-y-1 mt-1">
                      {category.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                            isActive(item.href)
                              ? "text-primary font-bold bg-primary/5"
                              : "text-on-surface-variant hover:text-primary hover:bg-surface-low"
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="border-t border-surface-low my-3 pt-3" />

              {/* Language Selector - Mobile */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-on-surface-variant py-2.5 px-3 w-full rounded-lg hover:bg-surface-low transition-colors text-sm"
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium uppercase">
                  {language === "en" ? "English" : "Español"}
                </span>
              </button>

              {/* CTA Button - Mobile */}
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center bg-primary text-on-primary px-4 py-2.5 rounded-full font-bold font-body text-sm hover:bg-primary-hover transition-colors mt-2"
              >
                {translations.nav.contactUs}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-[72px]" />
    </>
  );
}
