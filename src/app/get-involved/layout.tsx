import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Volunteer and Ambassador Program",
    description: "Join our volunteer network: event support, food distribution, translations and community outreach across El Paso County, Colorado. Flexible hours.",
    titleEs: "Voluntariado y programa de embajadores",
    descriptionEs:
      "Súmate a nuestra red de voluntarios: apoyo en eventos, distribución de alimentos, traducciones y trabajo comunitario en el Condado de El Paso, Colorado.",
    path: "/get-involved",
    keywords: ["volunteer Colorado", "voluntariado Colorado", "community ambassador", "Colorado nonprofit volunteer", "join Viva Resource"],
  });
}

export default function GetInvolvedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
