"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Handshake,
  Users,
  Sparkles,
  Target,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  isLast?: boolean;
}

function TimelineItem({
  year,
  title,
  description,
  isLast = false,
}: TimelineItemProps) {
  return (
    <div className="relative pl-12">
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-secondary"></div>
      {!isLast && (
        <div className="absolute left-[11px] top-7 bottom-[-48px] w-[2px] bg-outline-low"></div>
      )}
      <h3 className="font-headline font-bold text-xl text-primary mb-2">
        {year}: {title}
      </h3>
      <p className="text-on-surface-variant">{description}</p>
    </div>
  );
}

interface TeamMemberProps {
  name: string;
  role: string;
  imageSrc: string;
}

function TeamMember({ name, role, imageSrc }: TeamMemberProps) {
  return (
    <div className="group">
      <div className="aspect-[2/3] rounded-xl overflow-hidden mb-4 relative">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <h3 className="font-headline font-bold text-xl text-on-surface">{name}</h3>
      <p className="text-secondary font-medium font-label">{role}</p>
    </div>
  );
}

export default function AboutPage(): JSX.Element {
  const { translations } = useLanguage();
  const stats = [
    { value: "45k+", label: translations.about.livesTouched, color: "text-primary" },
    { value: "12", label: translations.about.activePrograms, color: "text-secondary" },
    { value: "150+", label: translations.about.corporatePartners, color: "text-primary" },
    { value: "89%", label: translations.about.programSuccess, color: "text-secondary" },
  ];

  const timelineItems = [
    {
      year: "2008",
      title: translations.about.year2008,
      description: translations.about.year2008Desc,
    },
    {
      year: "2012",
      title: translations.about.year2012,
      description: translations.about.year2012Desc,
    },
    {
      year: "2018",
      title: translations.about.year2016,
      description: translations.about.year2016Desc,
    },
    {
      year: "2024",
      title: translations.about.year2024,
      description: translations.about.year2024Desc,
    },
  ];

  const teamMembers = [
    {
      name: "Eva Leon",
      role: "Co-Founder & Executive Director",
      imageSrc: "/eva.avif",
    },
    {
      name: "Monserrat Mendoza",
      role: "Co-Founder & Director of Operations",
      imageSrc: "/monse.avif",
    },
  ];

  return (
    <main className="bg-surface text-on-surface font-body pt-20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 bg-gradient-to-br from-primary to-primary-container overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-on-primary font-extrabold leading-tight tracking-tight font-headline">
              {translations.about.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-on-primary/80 max-w-lg leading-relaxed">
              {translations.about.heroSubtitle}
            </p>
          </div>
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl transform rotate-3">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Collaborative group of diverse professionals"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-secondary-container p-8 rounded-xl shadow-xl hidden md:block max-w-[240px]">
              <p className="text-on-secondary-container font-headline font-bold text-4xl mb-1">
                15+
              </p>
              <p className="text-on-secondary-container text-sm font-medium">
                {translations.about.history}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Mission */}
            <div className="md:col-span-7 bg-surface-low p-12 rounded-xl flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 bg-primary h-12"></div>
                <h2 className="text-3xl font-bold text-primary font-headline flex items-center gap-3">
                  <Target className="w-8 h-8" />
                  {translations.about.mission}
                </h2>
              </div>
              <p className="text-xl text-on-surface-variant italic mb-4 leading-relaxed">
                &ldquo;{translations.about.missionDesc}&rdquo;
              </p>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                {translations.about.storyDesc1}
              </p>
            </div>
            {/* Vision */}
            <div className="md:col-span-5 bg-primary-container p-12 rounded-xl text-on-primary">
              <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-3">
                <Eye className="w-8 h-8" />
                {translations.about.vision}
              </h2>
              <p className="text-lg leading-relaxed">
                {translations.about.visionDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History & Timeline */}
      <section className="py-24 px-6 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
              <h2 className="text-4xl font-bold text-primary mb-8 font-headline">
                {translations.about.timelineTitle}
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                {translations.about.storyDesc2}
              </p>
            </div>
            <div className="md:w-2/3 space-y-12">
              {timelineItems.map((item, index) => (
                <TimelineItem
                  key={item.year}
                  year={item.year}
                  title={item.title}
                  description={item.description}
                  isLast={index === timelineItems.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p
                className={`font-headline font-extrabold text-5xl ${stat.color}`}
              >
                {stat.value}
              </p>
              <p className="text-on-surface-variant font-label font-medium uppercase tracking-widest text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-24 px-6 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center font-headline">
            {translations.about.statsTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            <div className="col-span-2 row-span-2 rounded-xl overflow-hidden shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"
                alt="Children laughing in classroom"
                fill
                sizes="(max-width: 1024px) 50vw, 800px"
                className="object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className="col-span-1 rounded-xl overflow-hidden shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80"
                alt="Volunteers planting trees"
                fill
                sizes="(max-width: 1024px) 25vw, 400px"
                className="object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className="col-span-1 row-span-2 rounded-xl overflow-hidden shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=400&q=80"
                alt="Mobile clinic consultation"
                fill
                sizes="(max-width: 1024px) 25vw, 400px"
                className="object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className="col-span-1 rounded-xl overflow-hidden shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80"
                alt="Workplace training session"
                fill
                sizes="(max-width: 1024px) 25vw, 400px"
                className="object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4 font-headline">
            {translations.about.valuesTitle}
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            {translations.about.valuesSubtitle}
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-surface-lowest p-8 rounded-xl shadow-sm border-l-4 border-primary">
            <Handshake className="text-primary w-10 h-10 mb-6" />
            <h3 className="font-headline font-bold text-xl mb-3 text-on-surface">
              {translations.about.value1Title}
            </h3>
            <p className="text-on-surface-variant">
              {translations.about.value1Desc}
            </p>
          </div>
          <div className="bg-surface-lowest p-8 rounded-xl shadow-sm border-l-4 border-secondary">
            <Users className="text-secondary w-10 h-10 mb-6" />
            <h3 className="font-headline font-bold text-xl mb-3 text-on-surface">
              {translations.about.value2Title}
            </h3>
            <p className="text-on-surface-variant">
              {translations.about.value2Desc}
            </p>
          </div>
          <div className="bg-surface-lowest p-8 rounded-xl shadow-sm border-l-4 border-primary">
            <Sparkles className="text-primary w-10 h-10 mb-6" />
            <h3 className="font-headline font-bold text-xl mb-3 text-on-surface">
              {translations.about.value3Title}
            </h3>
            <p className="text-on-surface-variant">
              {translations.about.value3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-6 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-primary font-headline">
                {translations.about.teamTitle}
              </h2>
              <p className="text-lg text-on-surface-variant mt-4">
                {translations.about.teamSubtitle}
              </p>
            </div>
            <Link href="/get-involved" className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:bg-primary-container transition-colors">
              {translations.home.ctaButtonAlt}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <TeamMember
                key={member.name}
                name={member.name}
                role={member.role}
                imageSrc={member.imageSrc}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
