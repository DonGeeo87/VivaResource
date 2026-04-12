import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Contact Us - Contáctanos",
  description: "Contact Viva Resource Foundation for questions, partnerships, or support. We're here to help immigrant families in Colorado with bilingual services.",
  path: "/contact",
  keywords: ["contact Viva Resource", "contactar organización inmigrante", "Colorado nonprofit contact", "Denver immigrant support phone"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
