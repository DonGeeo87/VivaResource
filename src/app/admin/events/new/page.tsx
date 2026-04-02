"use client";

import EventForm from "@/components/forms/EventForm";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewEventPage(): JSX.Element {
  const { language } = useLanguage();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-2">{language === "es" ? "Crear Nuevo Evento" : "Create New Event"}</h1>
        <p className="text-gray-600">{language === "es" ? "Completa el formulario para crear un nuevo evento" : "Fill out the form to create a new event"}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <EventForm />
      </div>
    </div>
  );
}
