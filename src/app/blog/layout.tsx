import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Blog: Community Guides and Local Resources",
    description: "Practical guides to food assistance, housing, healthcare and free workshops in El Paso County, Colorado. Written for families, in English and Spanish.",
    titleEs: "Blog: guías y recursos gratis para familias en Colorado",
    descriptionEs:
      "Guías prácticas sobre asistencia alimentaria, vivienda, salud y talleres gratuitos en el Condado de El Paso, Colorado. En español, escritas para familias.",
    path: "/blog",
    keywords: ["community blog Colorado", "blog comunitario Colorado", "Colorado community stories", "rural Colorado guide", "Viva Resource blog"],
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
