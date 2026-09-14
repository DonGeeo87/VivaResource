import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Contact Us — Bilingual Community Support",
  description: "Contact Viva Resource for questions, partnerships, or support. We're here to help rural Colorado communities with bilingual services.",
  path: "/contact",
  keywords: ["contact Viva Resource", "contactar organización comunitaria", "Colorado nonprofit contact", "community support phone Colorado"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
