import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, ArrowRight, HeartHandshake } from "lucide-react";
import { locations } from "@/data/locations";
import { generatePageMeta, langContext } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Locations: Where We Serve in Colorado",
    description: "Find Viva Resource services near you: Peyton, Colorado Springs, Pueblo, Fountain, Monument and across El Paso County, Colorado.",
    titleEs: "Ubicaciones: dónde servimos en Colorado",
    descriptionEs:
      "Encuentra los servicios de Viva Resource cerca de ti: Peyton, Colorado Springs, Pueblo, Fountain, Monument y todo el Condado de El Paso, Colorado.",
    path: "/locations",
    keywords: ["Viva Resource locations", "ubicaciones Colorado", "Colorado community services", "Peyton CO", "El Paso County nonprofit"],
  });
}

export default function LocationsIndexPage() {
  const { lang } = langContext();
  const isEs = lang === "es";
  return (
    <main className="bg-surface text-on-surface font-body">
      {/* Hero */}
      <section className="relative min-h-[350px] flex items-center py-20 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-container">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-secondary-container/20 border border-secondary-container/30 px-4 py-1.5 rounded-full mb-4">
              <MapPin className="w-4 h-4 text-secondary-container" />
              <span className="text-secondary-container text-sm font-bold tracking-wider uppercase">
                Colorado
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-white leading-tight tracking-tighter mb-4">
              {isEs ? "Nuestras Ubicaciones" : "Our Locations"}
            </h1>
            <p className="text-xl text-on-primary-container font-body leading-relaxed max-w-2xl">
              {isEs
                ? "Sirviendo a comunidades rurales en todo Colorado. Encuentra los servicios y el apoyo que necesitas cerca de ti."
                : "Serving rural communities across Colorado. Find the services and support you need near you."}
            </p>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4">
              {isEs ? "Comunidades que Servimos" : "Communities We Serve"}
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              {isEs
                ? "Desde nuestra sede en Peyton, extendemos servicios por todo el Condado de El Paso y más allá."
                : "From our headquarters in Peyton, we extend services across El Paso County and beyond."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/locations/${loc.slug}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-on-surface-variant bg-surface-low px-2 py-1 rounded-full">
                    {loc.distanceFromPeyton}
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                  {isEs ? loc.nameEs : loc.name}
                </h3>
                <p className="text-sm text-on-surface-variant mb-3">{isEs ? loc.countyEs : loc.county}</p>
                <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">
                  {isEs ? loc.descriptionEs : loc.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(isEs ? loc.servicesEs : loc.services).slice(0, 3).map((service) => (
                    <span
                      key={service}
                      className="text-xs bg-primary/5 text-primary px-2 py-1 rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                  {(isEs ? loc.servicesEs : loc.services).length > 3 && (
                    <span className="text-xs text-on-surface-variant px-2 py-1">
                      +{(isEs ? loc.servicesEs : loc.services).length - 3} {isEs ? "más" : "more"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                  {isEs ? "Ver Servicios" : "View Services"}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-low py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <HeartHandshake className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4">
            {isEs ? "¿No ves tu zona?" : "Don't See Your Area?"}
          </h2>
          <p className="text-on-surface-variant text-lg mb-8 max-w-2xl mx-auto">
            {isEs
              ? "Servimos a toda la región del Condado de El Paso. Contáctanos para encontrar servicios cerca de ti."
              : "We serve the entire El Paso County region. Contact us to find services near you."}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all"
          >
            {isEs ? "Contáctenos" : "Contact Us"}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </main>
  );
}
