import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "About Us: Free Bilingual Help in Colorado",
    description: "Who we are: a 501(c)(3) nonprofit serving rural families in El Paso County with free bilingual support for food, housing, healthcare and education.",
    titleEs: "Quiénes somos: ayuda bilingüe y gratuita",
    descriptionEs:
      "Somos una organización 501(c)(3) que acompaña a familias rurales del Condado de El Paso con apoyo bilingüe y gratuito: comida, vivienda, salud y educación.",
    path: "/about",
    keywords: ["about Viva Resource", "rural Colorado nonprofit", "nuestra misión", "community empowerment Colorado", "Peyton Colorado nonprofit"],
  });
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
