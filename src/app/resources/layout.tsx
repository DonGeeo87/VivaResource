import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Free Resources in Colorado: Help in Spanish",
    description: "Directory of verified services in El Paso County, Colorado: food pantries, housing programs, clinics, workshops and legal referrals. Bilingual and kept current.",
    titleEs: "Recursos gratis en Colorado y ayuda en español",
    descriptionEs:
      "Directorio de servicios verificados en el Condado de El Paso, Colorado: despensas, programas de vivienda, clínicas, talleres y referencias legales. Bilingüe.",
    path: "/resources",
    keywords: ["community resources Colorado", "recursos comunitarios Colorado", "food assistance Colorado", "housing help Peyton", "directorio de recursos"],
  });
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
