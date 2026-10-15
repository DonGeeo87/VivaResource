import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Free Workshops and Classes in Colorado",
    description: "Upcoming free workshops and community gatherings for rural families in El Paso County, Colorado. Bilingual and open to everyone. See dates and register.",
    titleEs: "Talleres y clases gratis en Colorado",
    descriptionEs:
      "Próximos talleres gratuitos y encuentros comunitarios para familias rurales del Condado de El Paso, Colorado. Bilingües y abiertos a toda la comunidad.",
    path: "/events",
    keywords: ["community events Colorado", "eventos comunitarios Colorado", "talleres gratuitos Colorado", "free workshops Peyton", "Viva Resource events"],
  });
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
