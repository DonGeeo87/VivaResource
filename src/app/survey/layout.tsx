import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Community Voice Survey",
    description:
      "Share what services and workshops your family needs in rural El Paso County, Colorado. A quick bilingual survey from Viva Resource.",
    titleEs: "Encuesta Voz Comunitaria",
    descriptionEs:
      "Cuéntanos qué servicios y talleres necesita tu familia en el Condado de El Paso, Colorado. Encuesta bilingüe y breve de Viva Resource.",
    path: "/survey",
    keywords: ["community survey Colorado", "encuesta comunitaria", "El Paso County services"],
  });
}

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
