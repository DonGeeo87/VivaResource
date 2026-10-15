import type { Metadata } from "next";
import { langContext } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const isEs = langContext().lang === "es";
  return {
    title: isEs ? "Registro de eventos" : "Event Registration",
    description: isEs
      ? "Regístrate en un taller o evento comunitario de Viva Resource. Recibirás la confirmación con la fecha, la hora (hora de Colorado) y el lugar."
      : "Register for an upcoming Viva Resource workshop or community event. You will receive a confirmation with the date, the time (Colorado time) and the location.",
  };
}

export default function EventRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
