import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Program Participants",
    description:
      "Registration and management for Viva Resource program participants in rural El Paso County, Colorado.",
    titleEs: "Participantes del Programa",
    descriptionEs:
      "Registro y gestión de participantes de los programas de Viva Resource en el Condado de El Paso, Colorado.",
    path: "/participants",
    keywords: ["program participants Colorado", "participantes programas"],
  });
}

export default function ParticipantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
