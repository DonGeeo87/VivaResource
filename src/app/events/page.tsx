"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { EventsHeroSkeleton, EventsFilterSkeleton, EventsGridSkeleton } from "@/components/Skeleton";
import NewsletterForm from "@/components/NewsletterForm";

interface Event {
  id: string;
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  date: string | Date | { toDate: () => Date };
  time: string;
  location: string;
  image: string;
  image_url?: string;
  featured: boolean;
  category: string;
  status: string;
  badge?: string;
  cta?: string;
}

// Helper function to parse date
const parseDate = (date: string | Date | { toDate: () => Date } | undefined): Date => {
  if (!date) return new Date(0);
  if (date instanceof Date) return date;
  if (typeof date === 'object' && 'toDate' in date) return date.toDate();
  return new Date(date);
};

// Helper function to format date for display
const formatDate = (date: string | Date | { toDate: () => Date } | undefined): string => {
  const parsed = parseDate(date);
  return parsed.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export default function EventsPage(): JSX.Element {
  const { translations, language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Fetch all events without where/orderBy to avoid index requirements
      const q = query(collection(db, "events"));
      const snapshot = await getDocs(q);
      let eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Map image_url to image for compatibility with existing code
          image: data.image_url || data.image || "",
        };
      }) as Event[];

      // Filter published events client-side
      eventsData = eventsData.filter(e => e.status === "published");

      // Sort client-side by date
      eventsData.sort((a, b) => {
        return parseDate(a.date).getTime() - parseDate(b.date).getTime();
      });

      if (eventsData.length > 0) {
        setEvents(eventsData);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      console.log("Using empty events array (Firestore may not be connected)");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (event: Event) => language === "es" && event.title_es ? event.title_es : event.title_en;
  const getDescription = (event: Event) => language === "es" && event.description_es ? event.description_es : event.description_en;

  // Map selectedCategory number to category string values
  const categoryMap: Record<number, string> = {
    0: "", // All - no filter
    1: "workshops",
    2: "food",
    3: "meetings",
  };

  // Filter events by selected category
  const displayEvents = selectedCategory === 0
    ? events
    : events.filter((e: Event) => e.category === categoryMap[selectedCategory]);

  if (loading) {
    return (
      <main className="pt-20">
        <EventsHeroSkeleton />
        <EventsFilterSkeleton />
        <EventsGridSkeleton />
      </main>
    );
  }

  return (
    <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[500px] min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden bg-primary-container">
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              alt="Community gathering"
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDviyMaJX02LZ9Ba55WlNjs85RirUbGfuvJTNuJra4dxuGVv8ax834dQy9wy2draDRL3BRjBJAYpIcWoybX_Ff2ghIhZuFfmmZaVSJd88SrhwUPlrAHAwwzXRds1IwO3kE5vo6D1Z6SPPmjwwJChjxbeQDqIucv2mbK7aTulSZBkzjYHHT1YKQ-A_7COiBglupwTPy8J63IN-yAYnTNJ0ZLLmOOiT-ZN4liJpTr8hOzja-I73xe-pBoByAtgzlu0nPPenyYkKiE9bA"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/80 to-transparent z-10"></div>
          <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-8 w-full">
            <div className="max-w-2xl">
              <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase mb-4 md:mb-6">
                {translations.events?.title || "Upcoming / Próximos"}
              </span>
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tighter mb-4 md:mb-6">
                Community Events / <br />
                <span className="text-secondary-container">Eventos Comunitarios</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-xl">
                Join us in building a stronger, more connected community. Discover
                workshops, resources, and gatherings designed for you. / Únase a
                nosotros para construir una comunidad más fuerte y conectada.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter Chips */}
        <section className="py-12 bg-surface">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-headline font-bold text-on-surface-variant mr-4">
                Filter by / Filtrar por:
              </span>
              <button 
                onClick={() => setSelectedCategory(0)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === 0 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                All / Todos
              </button>
              <button 
                onClick={() => setSelectedCategory(1)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === 1 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Workshops / Talleres
              </button>
              <button 
                onClick={() => setSelectedCategory(2)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === 2 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Food Distribution / Distribución
              </button>
              <button 
                onClick={() => setSelectedCategory(3)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === 3 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Community Meetings / Reuniones
              </button>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="pb-24 px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayEvents.map((event: Event) => (
                <div key={event.id} className="group flex flex-col h-full bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
                  {/* Image Container */}
                  <div className="relative w-full aspect-video overflow-hidden">
                    {event.image ? (
                      <Image
                        alt={getTitle(event)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-500 group-hover:scale-110"
                        src={event.image}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-container flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-primary" />
                      </div>
                    )}
                    {/* Category Badge */}
                    {event.category && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-3 py-1 bg-secondary text-on-secondary text-xs font-bold rounded-full uppercase tracking-wide">
                          {event.category === "workshops" ? (language === "es" ? "Taller" : "Workshop") :
                           event.category === "food" ? (language === "es" ? "Distribución" : "Food") :
                           event.category === "meetings" ? (language === "es" ? "Reunión" : "Meeting") :
                           event.category}
                        </span>
                      </div>
                    )}
                    {/* Featured Badge */}
                    {event.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-block px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-full">
                          {language === "es" ? "Destacado" : "Featured"}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col flex-1 p-6">
                    {/* Title */}
                    <h3 className="font-headline text-xl font-bold text-primary mb-3 line-clamp-2 min-h-[3rem]">
                      {getTitle(event)}
                    </h3>
                    
                    {/* Date and Time */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-secondary" />
                        {formatDate(event.date)}
                      </span>
                      {event.time && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-secondary" />
                          {event.time}
                        </span>
                      )}
                    </div>
                    
                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center text-sm text-on-surface-variant mb-3">
                        <MapPin className="w-4 h-4 mr-1.5 text-secondary" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                    
                    {/* Description */}
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                      {getDescription(event)}
                    </p>
                    
                    {/* CTA Button */}
                    <Link
                      href={`/events/register/${event.id}`}
                      className="w-full py-3 bg-primary text-on-primary rounded-full font-bold transition-all duration-300 hover:bg-primary-container hover:shadow-md active:scale-95 text-center block mt-auto"
                    >
                      {event.cta || (language === "es" ? "Registrarse" : "Register")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          
          {/* No events message when filter returns no results */}
          {!loading && displayEvents.length === 0 && (
            <div className="mt-12 text-center py-12">
              <p className="text-on-surface-variant text-lg">
                {language === "es"
                  ? "No hay eventos disponibles. ¡Vuelve pronto!"
                  : "No events available. Check back soon!"}
              </p>
            </div>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="bg-surface-container-low py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-headline text-4xl font-bold text-primary mb-6">
                  Stay Updated / <br />
                  <span className="text-secondary">Manténgase Informado</span>
                </h2>
                <p className="text-on-surface-variant text-lg leading-relaxed mb-0">
                  Never miss a community event or resource update. Join our bilingual
                  monthly newsletter. / Nunca se pierda un evento comunitario o
                  actualización de recursos. Únase a nuestro boletín mensual bilingüe.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </section>

        {/* FAB for Donation */}
        <Link
          href="/donate"
          className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full editorial-shadow flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-40"
        >
          <Heart className="w-6 h-6 fill-current" />
        </Link>
    </main>
  );
}
