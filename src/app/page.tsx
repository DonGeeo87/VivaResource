"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Handshake,
  ArrowRight,
  Star,
  Flower2,
  Heart,
  Share2,
  AtSign,
  ChevronRight,
  ChevronDown,
  Trophy,
  Mail,
  MapPin,
  Camera,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInView } from "@/hooks/useInView";

function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  isInView: boolean;
}

function FAQItem({ question, answer, isOpen, onToggle, index, isInView }: FAQItemProps): JSX.Element {
  return (
    <div
      className="bg-surface-lowest rounded-2xl overflow-hidden shadow-sm stagger-item"
      style={{ transitionDelay: isInView ? `${index * 100}ms` : "0ms" }}
    >
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex justify-between items-center group"
        aria-expanded={isOpen}
      >
        <span className="font-bold text-lg pr-4">{question}</span>
        <ChevronDown className={`w-6 h-6 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 text-on-surface-variant">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const { translations } = useLanguage();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [heroAnimationsComplete, setHeroAnimationsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Intersection Observer hooks for each section
  const heroRef = useRef<HTMLDivElement | null>(null);
  const getHelpSection = useInView({ threshold: 0.15 });
  const pillarsSection = useInView({ threshold: 0.1 });
  const pillarsStagger = useInView({ threshold: 0.1 });
  const donateSection = useInView({ threshold: 0.15 });
  const donateStagger = useInView({ threshold: 0.1 });
  const aboutSection = useInView({ threshold: 0.15 });
  const foundersSection = useInView({ threshold: 0.1 });
  const partnersSection = useInView({ threshold: 0.3 });
  const drivingChangeSection = useInView({ threshold: 0.2 });
  const pathwaysSection = useInView({ threshold: 0.1 });
  const pathwaysStagger = useInView({ threshold: 0.1 });
  const faqSection = useInView({ threshold: 0.1 });
  const faqStagger = useInView({ threshold: 0.05 });
  const contactSection = useInView({ threshold: 0.15 });

  // Parallax refs
  const parallaxRef1 = useRef<HTMLDivElement | null>(null);
  const parallaxRef2 = useRef<HTMLDivElement | null>(null);

  const toggleFAQ = (index: number): void => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Safety fallback: ensure hero content is visible after animation timeout
  useEffect(() => {
    if (prefersReducedMotion) {
      setHeroAnimationsComplete(true);
      return;
    }
    const timeout = setTimeout(() => {
      setHeroAnimationsComplete(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  // Parallax scroll handler
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const speed = 0.15;
      
      if (parallaxRef1.current) {
        const container = parallaxRef1.current;
        const rect = container.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          const yPos = (window.innerHeight / 2 - rect.top) * speed;
          container.style.transform = `translateY(${yPos}px)`;
        } else {
          container.style.transform = 'translateY(0)';
        }
      }
      
      if (parallaxRef2.current) {
        const container = parallaxRef2.current;
        const rect = container.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          const yPos = (window.innerHeight / 2 - rect.top) * speed;
          container.style.transform = `translateY(${yPos}px)`;
        } else {
          container.style.transform = 'translateY(0)';
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prefersReducedMotion]);

  // Animation classes based on reduced motion preference
  const heroAnimateClass = prefersReducedMotion || heroAnimationsComplete ? '' : 'hero-animate';
  const heroAnimateDelay1 = prefersReducedMotion || heroAnimationsComplete ? '' : 'hero-animate-delay-1';
  const heroAnimateDelay2 = prefersReducedMotion || heroAnimationsComplete ? '' : 'hero-animate-delay-2';
  const heroAnimateDelay3 = prefersReducedMotion || heroAnimationsComplete ? '' : 'hero-animate-delay-3';

  if (!isHydrated) {
    return <main className="bg-surface text-on-surface font-body" />;
  }

  return (
    <main className="bg-surface text-on-surface font-body">
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative min-h-[700px] md:min-h-[870px] flex items-center overflow-hidden bg-surface py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs md:text-sm font-bold tracking-wide uppercase ${heroAnimateClass}`}>
              <Users className="w-4 h-4" />
              {translations.home.heroBadge}
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-7xl font-headline font-extrabold text-on-surface tracking-tight leading-[1.1] ${heroAnimateDelay1}`}>
              {translations.home.heroMain} <br />
              <span className="text-primary italic">{translations.home.heroHighlight}</span>
            </h1>
            <p className={`text-base md:text-lg text-on-surface-variant max-w-lg leading-relaxed ${heroAnimateDelay2}`}>
              {translations.home.heroDescription}
            </p>
            <div className={`flex flex-wrap gap-3 md:gap-4 ${heroAnimateDelay3}`}>
              <Link href="/get-help" className="bg-primary text-on-primary px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                {translations.home.ctaButtonAlt}
              </Link>
              <Link href="/about" className="border-2 border-primary text-primary px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-primary-fixed transition-all">
                {translations.home.ctaButtonAlt2}
              </Link>
            </div>
          </div>
          {/* Circular Collage - Mobile: Single column stack, Desktop: Overlapping collage */}
          <div className={`relative h-[300px] md:h-[500px] lg:h-[600px] w-full order-1 lg:order-2 ${heroAnimateDelay2}`}>
            {/* Mobile: Single image with rounded corners */}
            <div className="lg:hidden relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/photo-bank/hero_01.jpg"
                alt="VIVA volunteers team together"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            {/* Desktop: Overlapping collage */}
            <div className="hidden lg:block relative w-full h-full">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full overflow-hidden border-8 border-surface-lowest shadow-2xl z-10">
                <Image
                  src="/photo-bank/hero_01.jpg"
                  alt="VIVA volunteers team together"
                  fill
                  sizes="256px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
              <div className="absolute bottom-10 left-0 w-80 h-80 rounded-[100px] overflow-hidden border-8 border-surface-lowest shadow-2xl z-20">
                <Image
                  src="/photo-bank/hero_02.jpg"
                  alt="community meeting outdoors"
                  fill
                  sizes="320px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full overflow-hidden border-4 border-primary z-0 opacity-20 bg-primary-container"></div>
              <div className="absolute top-10 left-10 w-56 h-72 rounded-full overflow-hidden border-8 border-surface-lowest shadow-2xl rotate-12 z-10">
                <Image
                  src="/photo-bank/hero_03.jpg"
                  alt="volunteer helping community member"
                  fill
                  sizes="224px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GET HELP CTA */}
      <section ref={getHelpSection.ref} className={`bg-[#E8F4F8] py-24 px-6 overflow-hidden animate-on-scroll animate-slide-left ${getHelpSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-lowest rounded-[3rem] p-12 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center shadow-sm">
            <div className="space-y-8">
              <div className="inline-block p-4 bg-primary-container text-on-primary-container rounded-3xl">
                <Handshake className="w-10 h-10" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface tracking-tight">
                {translations.home.getHelpTitle}
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                {translations.home.getHelpDescription}
              </p>
              <Link href="/get-help" className="bg-primary text-on-primary px-10 py-5 rounded-full font-bold text-xl flex items-center gap-3 hover:shadow-xl transition-all">
                {translations.home.startReferral}
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl rotate-3">
                <Image
                  src="/photo-bank/vivaresource (10).jpg"
                  alt="social workers helping community members"
                  width={600}
                  height={400}
                  sizes="(max-width: 1024px) 100vw, 600px"
                  style={{ objectFit: 'cover' }}
                  className="w-full h-[400px]"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-secondary text-on-secondary p-8 rounded-3xl shadow-xl max-w-xs hidden md:block">
                <p className="font-bold text-xl">{translations.home.referralsCount}</p>
                <p className="text-sm opacity-90 italic">{translations.home.referralsSubtext}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR PILLARS */}
      <section ref={pillarsSection.ref} className={`py-12 md:py-24 px-6 animate-on-scroll animate-fade-in ${pillarsSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-on-surface">{translations.home.pillarsTitle}</h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>
          <div ref={pillarsStagger.ref} className={`space-y-4 md:space-y-6 stagger-container ${pillarsStagger.isInView ? 'in-view' : ''}`}>
            {/* Pillar 01 */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch rounded-2xl md:rounded-3xl overflow-hidden shadow-sm group stagger-item">
              <div className="md:col-span-2 bg-[#D4E8B9] flex items-center justify-center p-4 md:p-8 group-hover:bg-secondary transition-colors duration-500">
                <span className="text-3xl md:text-6xl font-headline font-black text-secondary group-hover:text-on-secondary transition-colors">01</span>
              </div>
              <div className="md:col-span-10 bg-surface-low p-6 md:p-12 flex flex-col justify-center">
                <h3 className="text-xl md:text-3xl font-headline font-bold mb-2 md:mb-4">{translations.home.pillar01Title}</h3>
                <p className="text-sm md:text-base text-on-surface-variant max-w-3xl">{translations.home.pillar01Desc}</p>
              </div>
            </div>
            {/* Pillar 02 */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch rounded-2xl md:rounded-3xl overflow-hidden shadow-sm group stagger-item">
              <div className="md:col-span-2 bg-[#1E4D7B] flex items-center justify-center p-4 md:p-8">
                <span className="text-3xl md:text-6xl font-headline font-black text-white">02</span>
              </div>
              <div className="md:col-span-10 bg-surface-high p-6 md:p-12 flex flex-col justify-center">
                <h3 className="text-xl md:text-3xl font-headline font-bold mb-2 md:mb-4">{translations.home.pillar02Title}</h3>
                <p className="text-sm md:text-base text-on-surface-variant max-w-3xl">{translations.home.pillar02Desc}</p>
              </div>
            </div>
            {/* Pillar 03 */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch rounded-2xl md:rounded-3xl overflow-hidden shadow-sm group stagger-item">
              <div className="md:col-span-2 bg-[#D4E8B9] flex items-center justify-center p-4 md:p-8 group-hover:bg-secondary transition-colors duration-500">
                <span className="text-3xl md:text-6xl font-headline font-black text-secondary group-hover:text-on-secondary transition-colors">03</span>
              </div>
              <div className="md:col-span-10 bg-surface-low p-6 md:p-12 flex flex-col justify-center">
                <h3 className="text-xl md:text-3xl font-headline font-bold mb-2 md:mb-4">{translations.home.pillar03Title}</h3>
                <p className="text-sm md:text-base text-on-surface-variant max-w-3xl">{translations.home.pillar03Desc}</p>
              </div>
            </div>
            {/* Pillar 04 */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch rounded-2xl md:rounded-3xl overflow-hidden shadow-sm group stagger-item">
              <div className="md:col-span-2 bg-[#1E4D7B] flex items-center justify-center p-4 md:p-8">
                <span className="text-3xl md:text-6xl font-headline font-black text-white">04</span>
              </div>
              <div className="md:col-span-10 bg-surface-high p-6 md:p-12 flex flex-col justify-center">
                <h3 className="text-xl md:text-3xl font-headline font-bold mb-2 md:mb-4">{translations.home.pillar04Title}</h3>
                <p className="text-sm md:text-base text-on-surface-variant max-w-3xl">{translations.home.pillar04Desc}</p>
              </div>
            </div>
            {/* Pillar 05 */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch rounded-2xl md:rounded-3xl overflow-hidden shadow-sm group stagger-item">
              <div className="md:col-span-2 bg-[#D4E8B9] flex items-center justify-center p-4 md:p-8 group-hover:bg-secondary transition-colors duration-500">
                <span className="text-3xl md:text-6xl font-headline font-black text-secondary group-hover:text-on-secondary transition-colors">05</span>
              </div>
              <div className="md:col-span-10 bg-surface-low p-6 md:p-12 flex flex-col justify-center">
                <h3 className="text-xl md:text-3xl font-headline font-bold mb-2 md:mb-4">{translations.home.pillar05Title}</h3>
                <p className="text-sm md:text-base text-on-surface-variant max-w-3xl">{translations.home.pillar05Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DONATE CTA */}
      <section ref={donateSection.ref} className={`py-12 md:py-24 px-6 bg-surface-low animate-on-scroll animate-slide-up ${donateSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-8 md:space-y-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-on-surface leading-tight">
                {translations.home.donateReasons} <br />
                <span className="text-secondary">{translations.home.donateHighlight}</span>
              </h2>
              <div ref={donateStagger.ref} className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 stagger-container ${donateStagger.isInView ? 'in-view' : ''}`}>
                <div className="space-y-4 p-4 md:p-6 bg-surface-lowest rounded-2xl stagger-item">
                  <Star className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                  <h4 className="font-bold text-lg md:text-xl">{translations.home.reason1Title}</h4>
                  <p className="text-sm opacity-70">{translations.home.reason1Desc}</p>
                </div>
                <div className="space-y-4 p-4 md:p-6 bg-surface-lowest rounded-2xl stagger-item">
                  <Flower2 className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                  <h4 className="font-bold text-lg md:text-xl">{translations.home.reason2Title}</h4>
                  <p className="text-sm opacity-70">{translations.home.reason2Desc}</p>
                </div>
                <div className="space-y-4 p-4 md:p-6 bg-surface-lowest rounded-2xl stagger-item">
                  <Heart className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                  <h4 className="font-bold text-lg md:text-xl">{translations.home.reason3Title}</h4>
                  <p className="text-sm opacity-70">{translations.home.reason3Desc}</p>
                </div>
                <div className="space-y-4 p-4 md:p-6 bg-surface-lowest rounded-2xl stagger-item">
                  <Handshake className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                  <h4 className="font-bold text-lg md:text-xl">{translations.home.reason4Title}</h4>
                  <p className="text-sm opacity-70">{translations.home.reason4Desc}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 md:space-y-8 bg-primary rounded-2xl md:rounded-[3rem] p-8 md:p-16 text-center text-on-primary stagger-item">
              <Heart className="w-16 h-16 md:w-20 md:h-20 text-secondary-container" />
              <h3 className="text-2xl md:text-3xl font-headline font-bold">{translations.home.donateCardTitle}</h3>
              <p className="text-base md:text-lg opacity-90 max-w-sm">{translations.home.donateCardDesc}</p>
              <Link href="/donate" className="bg-secondary text-on-secondary px-8 md:px-12 py-4 md:py-6 rounded-full font-bold text-xl md:text-2xl hover:scale-105 transition-all shadow-2xl text-center">
                {translations.home.ctaButton2}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT VIVA RESOURCE */}
      <section ref={aboutSection.ref} className={`py-24 px-6 bg-surface animate-on-scroll animate-slide-right ${aboutSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface">{translations.home.aboutTitle}</h2>
            <div className="w-12 h-1 bg-secondary rounded-full"></div>
            <p className="text-xl text-on-surface-variant leading-relaxed font-light">
              {translations.home.aboutDesc1}
            </p>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              {translations.home.aboutDesc2}
            </p>
            <div className="flex gap-12 pt-4">
              <div>
                <p className="text-4xl font-headline font-black text-primary">{translations.home.stats500}</p>
                <p className="text-sm uppercase tracking-widest text-on-surface-variant font-bold">{translations.home.familiesHelped}</p>
              </div>
              <div>
                <p className="text-4xl font-headline font-black text-secondary">{translations.home.stats247}</p>
                <p className="text-sm uppercase tracking-widest text-on-surface-variant font-bold">{translations.home.advocacySupport}</p>
              </div>
            </div>
          </div>
          <div ref={parallaxRef1} className="parallax-container relative group">
            <div className="absolute -inset-4 bg-primary-container rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhlNFXpKXPoBIbturq16XhOwCpjyU-T1q50kVxHVp0M9SYVHp7MAfkoZ734QoU4tmWYdOPHoKWhSMpjU3yd764-H4E_RY5vnTAhUgnjVrKV1w5m7ZjAf943B-cPKtUKEoG8Ga8oqHhcvvc9_h1BSYtmhVbP72mDZoemX5rGzaPn6j5g47ozYRzAzSqiasHOjchDqXv9KpYwP0eMH1JuFE2FnuJPtzmOYBo5UjhyAMckBZIMu6DxzzY6wLv-03nmvBQaITHgdazuN0"
              alt="vibrant photo of students in a community workshop laughing and learning together"
              width={600}
              height={500}
              sizes="(max-width: 1024px) 100vw, 600px"
              style={{ objectFit: 'cover' }}
              className="parallax-image relative rounded-3xl shadow-2xl w-full h-[500px] grayscale-[20%] hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* 6. OUR FOUNDERS */}
      <section ref={foundersSection.ref} className={`py-24 px-6 bg-surface animate-on-scroll animate-fade-in ${foundersSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface">{translations.home.foundersTitle}</h2>
            <p className="mt-4 text-on-surface-variant">{translations.home.foundersSubtitle}</p>
          </div>
          {/* Eva Leon */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <Image
                src="/eva.avif"
                alt="portrait of Eva Leon, co-founder of Viva Resource Foundation, a warm smile sitting in a brightly lit modern office"
                width={400}
                height={600}
                className="rounded-[4rem] rounded-tl-none shadow-2xl h-[500px] w-full object-cover object-center"
                priority
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h3 className="text-4xl font-headline font-bold text-primary">{translations.home.evaName}</h3>
              <p className="text-lg text-secondary font-bold uppercase tracking-widest">{translations.home.evaRole}</p>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                {translations.home.evaBio}
              </p>
              <div className="flex gap-4">
                <Share2 className="w-6 h-6 text-primary cursor-pointer hover:scale-110 transition-transform" />
                <AtSign className="w-6 h-6 text-primary cursor-pointer hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
          {/* Monserrat Mendoza */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-12">
            <div className="space-y-6">
              <h3 className="text-4xl font-headline font-bold text-primary">{translations.home.monserratName}</h3>
              <p className="text-lg text-secondary font-bold uppercase tracking-widest">{translations.home.monserratRole}</p>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                {translations.home.monserratBio}
              </p>
              <div className="flex gap-4">
                <Share2 className="w-6 h-6 text-primary cursor-pointer hover:scale-110 transition-transform" />
                <AtSign className="w-6 h-6 text-primary cursor-pointer hover:scale-110 transition-transform" />
              </div>
            </div>
            <div ref={parallaxRef2} className="parallax-container relative">
              <Image
                src="/monse.avif"
                alt="portrait of Monserrat Mendoza, co-founder of Viva Resource Foundation, a confident woman in a casual but professional outfit standing in front of a neutral background"
                width={400}
                height={600}
                className="parallax-image rounded-[4rem] rounded-br-none shadow-2xl h-[500px] w-full object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. OUR PARTNERS */}
      <section ref={partnersSection.ref} className={`py-20 px-6 border-y border-outline-low/20 animate-on-scroll animate-scale-up ${partnersSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-60">{translations.home.partnersTitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center justify-items-center opacity-70 hover:opacity-100 transition-opacity">
            <a href="https://www.facebook.com/lanzatumarcadigital" target="_blank" rel="noopener noreferrer" className="text-xl font-bold font-headline text-slate-400 hover:text-primary transition-colors">
              Lanza tu Marca Digital
            </a>
            <a href="https://www.codigoguerrero.dev" target="_blank" rel="noopener noreferrer" className="text-xl font-bold font-headline text-slate-400 hover:text-primary transition-colors">
              Código Guerrero Dev
            </a>
          </div>
        </div>
      </section>

      {/* 8. DRIVING CHANGE CTA */}
      <section ref={drivingChangeSection.ref} className={`py-24 px-6 bg-[#1E4D7B] text-white animate-on-scroll animate-scale-up ${drivingChangeSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-4xl mx-auto text-center space-y-8 lg:space-y-12">
          <Sparkles className="w-16 h-16 text-secondary-container mx-auto" />
          <h2 className="text-5xl lg:text-7xl font-headline font-extrabold tracking-tight">
            {translations.home.ctaDrivingTitle} <br />{translations.home.ctaDrivingSubtitle}
          </h2>
          <p className="text-xl opacity-80 leading-relaxed font-light">
            {translations.home.ctaDrivingDesc}
          </p>
          <div className="pt-4">
            <Link href="/get-involved" className="bg-secondary-container text-on-secondary-container px-12 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-primary transition-all">
              {translations.home.ctaButton1}
            </Link>
          </div>
        </div>
      </section>

      {/* 9. ENGAGEMENT PATHWAYS */}
      <section ref={pathwaysSection.ref} className={`py-12 md:py-24 px-6 animate-on-scroll animate-fade-in ${pathwaysSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-8 md:mb-16 text-center">{translations.home.pathwaysTitle}</h2>
          <div ref={pathwaysStagger.ref} className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 stagger-container ${pathwaysStagger.isInView ? 'in-view' : ''}`}>
            {/* Program 01 */}
            <div className="group cursor-pointer stagger-item">
              <div className="relative h-60 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden mb-4 md:mb-6">
                <Image
                  src="/photo-bank/vivaresource (5).jpg"
                  alt="community workshop training session"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-md w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-primary text-lg md:text-xl shadow-lg">01</div>
              </div>
              <h4 className="text-xl md:text-2xl font-headline font-bold mb-2 md:mb-3 group-hover:text-primary transition-colors">{translations.home.pathway01Title}</h4>
              <p className="text-on-surface-variant line-clamp-3 text-sm md:text-base">{translations.home.pathway01Desc}</p>
              <Link href="/get-involved" className="mt-3 md:mt-4 flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                {translations.home.learnMore} <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
            {/* Program 02 */}
            <div className="group cursor-pointer stagger-item">
              <div className="relative h-60 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden mb-4 md:mb-6">
                <Image
                  src="/photo-bank/vivaresource (6).jpg"
                  alt="volunteers organizing food donations"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-md w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-primary text-lg md:text-xl shadow-lg">02</div>
              </div>
              <h4 className="text-xl md:text-2xl font-headline font-bold mb-2 md:mb-3 group-hover:text-primary transition-colors">{translations.home.pathway02Title}</h4>
              <p className="text-on-surface-variant line-clamp-3 text-sm md:text-base">{translations.home.pathway02Desc}</p>
              <Link href="/get-help" className="mt-3 md:mt-4 flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                {translations.home.learnMore} <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
            {/* Program 03 */}
            <div className="group cursor-pointer stagger-item">
              <div className="relative h-60 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden mb-4 md:mb-6">
                <Image
                  src="/photo-bank/vivaresource (8).jpg"
                  alt="community collaboration meeting"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-md w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-primary text-lg md:text-xl shadow-lg">03</div>
              </div>
              <h4 className="text-xl md:text-2xl font-headline font-bold mb-2 md:mb-3 group-hover:text-primary transition-colors">{translations.home.pathway03Title}</h4>
              <p className="text-on-surface-variant line-clamp-3 text-sm md:text-base">{translations.home.pathway03Desc}</p>
              <Link href="/resources" className="mt-3 md:mt-4 flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                {translations.home.learnMore} <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section ref={faqSection.ref} className={`py-12 md:py-24 px-6 bg-surface-low animate-on-scroll animate-slide-up ${faqSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">{translations.home.faqTitle}</h2>
            <p className="mt-2 md:mt-4 text-sm md:text-base text-on-surface-variant">{translations.home.faqSubtitle}</p>
          </div>
          <div ref={faqStagger.ref} className={`space-y-3 md:space-y-4 stagger-container ${faqStagger.isInView ? 'in-view' : ''}`}>
            <FAQItem
              question={translations.home.faqQ1}
              answer={translations.home.faqA1}
              isOpen={openFAQ === 0}
              onToggle={() => toggleFAQ(0)}
              index={0}
              isInView={faqSection.isInView}
            />
            <FAQItem
              question={translations.home.faqQ2}
              answer={translations.home.faqA2}
              isOpen={openFAQ === 1}
              onToggle={() => toggleFAQ(1)}
              index={1}
              isInView={faqSection.isInView}
            />
            <FAQItem
              question={translations.home.faqQ3}
              answer={translations.home.faqA3}
              isOpen={openFAQ === 2}
              onToggle={() => toggleFAQ(2)}
              index={2}
              isInView={faqSection.isInView}
            />
            <FAQItem
              question={translations.home.faqQ4}
              answer={translations.home.faqA4}
              isOpen={openFAQ === 3}
              onToggle={() => toggleFAQ(3)}
              index={3}
              isInView={faqSection.isInView}
            />
            <FAQItem
              question={translations.home.faqQ5}
              answer={translations.home.faqA5}
              isOpen={openFAQ === 4}
              onToggle={() => toggleFAQ(4)}
              index={4}
              isInView={faqSection.isInView}
            />
            <FAQItem
              question={translations.home.faqQ6}
              answer={translations.home.faqA6}
              isOpen={openFAQ === 5}
              onToggle={() => toggleFAQ(5)}
              index={5}
              isInView={faqSection.isInView}
            />
            <FAQItem
              question={translations.home.faqQ7}
              answer={translations.home.faqA7}
              isOpen={openFAQ === 6}
              onToggle={() => toggleFAQ(6)}
              index={6}
              isInView={faqSection.isInView}
            />
          </div>
        </div>
      </section>

      {/* 11. CONTACT SECTION */}
      <section ref={contactSection.ref} className={`py-12 md:py-24 px-6 animate-on-scroll animate-slide-up ${contactSection.isInView ? 'in-view' : ''}`}>
        <div className="max-w-7xl mx-auto bg-white rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 bg-primary p-8 md:p-12 lg:p-20 text-on-primary space-y-6 md:space-y-12">
            <div className="space-y-2 md:space-y-4">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">{translations.home.contactTitle}</h2>
              <p className="opacity-80 text-sm md:text-base">{translations.home.contactDesc}</p>
            </div>
            <div className="space-y-4 md:space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-container rounded-lg">
                  <Mail className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest opacity-60 mb-1">{translations.home.emailUs}</p>
                  <p className="text-base md:text-lg">{translations.home.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-container rounded-lg">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest opacity-60 mb-1">{translations.home.ourOffice}</p>
                  <p className="text-base md:text-lg">{translations.home.address}</p>
                </div>
              </div>
            </div>
            <div className="pt-4 md:pt-8">
              <p className="text-xs uppercase font-bold tracking-widest opacity-60 mb-4">{translations.home.followJourney}</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-container rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary transition-colors">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-container rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary transition-colors">
                  <Camera className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
          </div>
          {/* Form */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-20 bg-surface">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">{translations.home.labelFirstName}</label>
                <input
                  type="text"
                  className="w-full bg-surface-highest border-none rounded-xl p-3 md:p-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">{translations.home.labelLastName}</label>
                <input
                  type="text"
                  className="w-full bg-surface-highest border-none rounded-xl p-3 md:p-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">{translations.home.labelEmail}</label>
                <input
                  type="email"
                  className="w-full bg-surface-highest border-none rounded-xl p-3 md:p-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">{translations.home.labelPhone}</label>
                <input
                  type="tel"
                  className="w-full bg-surface-highest border-none rounded-xl p-3 md:p-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">{translations.home.labelOrganization}</label>
                <input
                  type="text"
                  className="w-full bg-surface-highest border-none rounded-xl p-3 md:p-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">{translations.home.labelMessage}</label>
                <textarea
                  rows={4}
                  className="w-full bg-surface-highest border-none rounded-xl p-3 md:p-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="news"
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="news" className="text-sm text-on-surface-variant">
                  {translations.home.subscribeNewsletter}
                </label>
              </div>
              <div className="md:col-span-2 pt-2 md:pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-4 md:py-5 rounded-xl font-bold text-base md:text-lg hover:shadow-xl transition-all"
                >
                  {translations.home.sendMessage}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

    </main>
  );
}
