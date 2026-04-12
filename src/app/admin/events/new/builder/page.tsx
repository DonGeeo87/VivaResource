"use client";

import EventForm from "@/components/forms/EventForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";

export default function EventBuilderPage(): JSX.Element {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const template = searchParams.get("template");

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-2">
          {language === "es" ? "Crear Nuevo Evento" : "Create New Event"}
        </h1>
        <p className="text-on-surface-variant">
          {language === "es"
            ? "Completa los detalles del evento"
            : "Fill out the event details"}
        </p>
      </div>

      <div className="bg-surface-lowest rounded-lg shadow p-6">
        <EventForm template={template} />
      </div>
    </div>
  );
}
