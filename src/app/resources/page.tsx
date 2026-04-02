"use client";

import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  HeartHandshake,
  Briefcase,
  Home,
  Utensils,
  Brain,
  Phone,
  Globe,
  Clock,
  Languages,
  AlertTriangle,
  Shirt,
  Bus,
  PartyPopper,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import resourcesData from "@/data/resources.json";

interface Resource {
  name: string;
  phone: string | null;
  email: string | null;
  web: string | null;
  description: string;
  descriptionEs: string;
  schedule?: string;
  languages?: string[];
  county?: string;
}

interface ResourcesJson {
  emergency: Resource[];
  housing: Resource[];
  food: Resource[];
  health_mental: Resource[];
  clothing: Resource[];
  employment: Resource[];
  utilities: Resource[];
  transportation: Resource[];
  free_activities: Resource[];
}

const typedResources = resourcesData as unknown as ResourcesJson;

type CategoryKey = keyof ResourcesJson;

interface CategoryInfo {
  id: CategoryKey;
  label: string;
  labelEs: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
}

const categories: CategoryInfo[] = [
  {
    id: "emergency",
    label: "Emergency",
    labelEs: "Emergencia",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    badgeColor: "bg-red-100 text-red-800",
  },
  {
    id: "housing",
    label: "Housing",
    labelEs: "Vivienda",
    icon: <Home className="w-5 h-5" />,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-500",
    badgeColor: "bg-teal-100 text-teal-800",
  },
  {
    id: "food",
    label: "Food",
    labelEs: "Comida",
    icon: <Utensils className="w-5 h-5" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-500",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  {
    id: "health_mental",
    label: "Health & Mental",
    labelEs: "Salud y Mental",
    icon: <Brain className="w-5 h-5" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-500",
    badgeColor: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "clothing",
    label: "Clothing",
    labelEs: "Ropa",
    icon: <Shirt className="w-5 h-5" />,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-500",
    badgeColor: "bg-pink-100 text-pink-800",
  },
  {
    id: "employment",
    label: "Employment",
    labelEs: "Empleo",
    icon: <Briefcase className="w-5 h-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  {
    id: "utilities",
    label: "Utilities",
    labelEs: "Servicios",
    icon: <Zap className="w-5 h-5" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-500",
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "transportation",
    label: "Transportation",
    labelEs: "Transporte",
    icon: <Bus className="w-5 h-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    id: "free_activities",
    label: "Free Activities",
    labelEs: "Actividades Gratis",
    icon: <PartyPopper className="w-5 h-5" />,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    badgeColor: "bg-green-100 text-green-800",
  },
];

function ResourceCard({ resource, category, language }: { resource: Resource; category: CategoryInfo; language: string }) {
  const isES = language === "es";
  const description = isES ? resource.descriptionEs : resource.description;

  return (
    <div
      className={`${category.bgColor} p-4 sm:p-6 rounded-xl hover:shadow-lg transition-all duration-300 border-l-4 ${category.borderColor} border-y border-r border-outline-variant/10`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`${category.color}`}>{category.icon}</span>
          <span className={`text-xs font-medium uppercase tracking-wider px-2 py-1 rounded-full ${category.badgeColor}`}>
            {isES ? category.labelEs : category.label}
          </span>
        </div>
      </div>
      
      <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
        {resource.name}
      </h3>
      
      <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
        {description}
      </p>

      <div className="space-y-2 text-sm">
        {resource.phone && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
            <a href={`tel:${resource.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-primary transition-colors">
              {resource.phone}
            </a>
          </div>
        )}
        
        {resource.web && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Globe className="w-4 h-4 flex-shrink-0 text-primary" />
            <a
              href={resource.web}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors truncate"
            >
              {resource.web.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
        
        {resource.schedule && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
            <span>{resource.schedule}</span>
          </div>
        )}
        
        {resource.languages && resource.languages.length > 0 && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Languages className="w-4 h-4 flex-shrink-0 text-primary" />
            <span>{resource.languages.join(", ")}</span>
          </div>
        )}
        
        {resource.county && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
            <span>{resource.county}</span>
          </div>
        )}
      </div>

      {resource.web && (
        <a
          href={resource.web}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline"
        >
          Visit Website / Visitar
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

// Import MapPin for county icon
import { MapPin } from "lucide-react";

export default function ResourcesPage() {
  const { language } = useLanguage();
  const isES = language === "es";
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "all">("all");

  // Get resources for a specific category (for category view)
  const getCategoryResources = (category: CategoryKey): Resource[] => {
    return typedResources[category] || [];
  };

  return (
    <main className="bg-surface text-on-surface font-body pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center py-20 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-container">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-secondary-container/20 border border-secondary-container/30 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              <span className="text-secondary-container text-sm font-bold tracking-wider uppercase font-label">
                {isES ? "Recursos Verificados" : "Verified Resources"}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold text-white leading-tight tracking-tighter">
              {isES ? "Directorio de Recursos de Colorado" : "Colorado Resource Directory"}
            </h1>
            <p className="text-xl text-on-primary-container font-body leading-relaxed max-w-xl">
              {isES
                ? "Encuentra recursos verificados de salud, comida, vivienda y más en Colorado"
                : "Find verified resources for health, food, housing, and more across Colorado"}
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-6 max-w-7xl mx-auto sticky top-16 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/10">
        <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-primary text-white shadow-md"
                : "bg-surface-low text-on-surface-variant hover:bg-surface-lowest hover:text-on-surface"
            }`}
          >
            {isES ? "Todos" : "All"}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                selectedCategory === category.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-low text-on-surface-variant hover:bg-surface-lowest hover:text-on-surface"
              }`}
            >
              <span className="hidden sm:inline">{category.icon}</span>
              {isES ? category.labelEs : category.label}
            </button>
          ))}
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        {selectedCategory === "all" ? (
          // Show all categories with their resources
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryResources = getCategoryResources(category.id);
              if (categoryResources.length === 0) return null;
              
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={category.color}>{category.icon}</span>
                    <h2 className="text-2xl font-headline font-bold text-on-surface">
                      {isES ? category.labelEs : category.label}
                    </h2>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${category.badgeColor}`}>
                      {categoryResources.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {categoryResources.map((resource, index) => (
                      <ResourceCard
                        key={index}
                        resource={resource}
                        category={category}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Show filtered category
          <div>
            {(() => {
              const category = categories.find((c) => c.id === selectedCategory);
              if (!category) return null;
              const categoryResources = getCategoryResources(selectedCategory as CategoryKey);
              
              return (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <span className={category.color}>{category.icon}</span>
                    <h2 className="text-2xl font-headline font-bold text-on-surface">
                      {isES ? category.labelEs : category.label}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {categoryResources.map((resource, index) => (
                      <ResourceCard
                        key={index}
                        resource={resource}
                        category={category}
                        language={language}
                      />
                    ))}
                  </div>
                  {categoryResources.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-on-surface-variant text-lg">
                        {isES ? "No hay recursos en esta categoría" : "No resources in this category"}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </section>

      {/* Additional Help Section */}
      <section className="bg-surface-low py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <HeartHandshake className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">
            {isES ? "¿No encuentras lo que necesitas?" : "Can't Find What You Need?"}
          </h2>
          <p className="text-on-surface-variant mb-8">
            {isES
              ? "Nuestro equipo puede ayudarte a encontrar los recursos adecuados"
              : "Our team can help you find the right resources"}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-3 bg-secondary text-on-secondary px-8 py-4 rounded-full font-bold text-lg hover:bg-secondary-hover transition-all"
          >
            {isES ? "Obtener Ayuda Directa" : "Get Direct Help"}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </main>
  );
}
