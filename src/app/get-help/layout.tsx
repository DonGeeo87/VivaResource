import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Get Help: Free Support for Your Family",
    description: "Request help for your family: food, housing, healthcare, school and legal referrals. A bilingual team member follows up, free for El Paso County residents.",
    titleEs: "Obtén ayuda gratis: apoyo en español en Colorado",
    descriptionEs:
      "Solicita ayuda para tu familia: comida, vivienda, salud, escuela y referencias legales. Te responde una persona bilingüe. Gratis en el Condado de El Paso.",
    path: "/get-help",
    keywords: ["get help Colorado", "solicitar ayuda Colorado", "community assistance request", "ayuda para familias Colorado", "help for rural families"],
  });
}

export default function GetHelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
