import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Contact Us: Bilingual Community Support",
    description: "Questions, partnership ideas or a family that needs help? Write to Viva Resource and a bilingual team member answers. Serving El Paso County, Colorado.",
    titleEs: "Contáctanos: apoyo comunitario bilingüe",
    descriptionEs:
      "¿Tienes preguntas, una idea de colaboración o una familia que necesita ayuda? Escríbenos y te responde una persona bilingüe. Servimos al Condado de El Paso.",
    path: "/contact",
    keywords: ["contact Viva Resource", "contactar organización comunitaria", "Colorado nonprofit contact", "community support phone Colorado"],
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
