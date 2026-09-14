import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Events - Eventos Comunitarios",
  description: "Join community events, workshops, and gatherings organized by Viva Resource in Colorado. Free bilingual events for rural families.",
  path: "/events",
  keywords: ["community events Colorado", "eventos comunitarios Colorado", "Colorado community events", "free workshops Peyton", "Viva Resource events"],
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
