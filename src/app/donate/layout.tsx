import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Donate to Rural Colorado Families",
    description: "Your tax-deductible 501(c)(3) donation funds food distribution, housing support, workshops and emergency aid for rural families in El Paso County, Colorado.",
    titleEs: "Dona a familias rurales de Colorado",
    descriptionEs:
      "Tu donación es deducible de impuestos (501(c)(3)) y financia distribución de alimentos, apoyo de vivienda, talleres y ayuda de emergencia en el Condado de El Paso.",
    path: "/donate",
    keywords: ["donate Colorado nonprofit", "donaciones comunidad Colorado", "tax deductible donation Colorado", "nonprofit donation El Paso County", "support rural families"],
  });
}

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
