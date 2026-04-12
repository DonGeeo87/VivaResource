import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Get Help - Solicitar Ayuda y Recursos",
  description: "Request personalized help and resources from Viva Resource Foundation. Free bilingual support for housing, food, legal aid, healthcare, and education in Colorado.",
  path: "/get-help",
  keywords: ["get help Colorado", "solicitar ayuda inmigrante", "immigrant assistance request", "Colorado refugee services", "help for immigrants Denver"],
});

export default function GetHelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
