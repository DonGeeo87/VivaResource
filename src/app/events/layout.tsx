import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Events - Eventos Comunitarios",
  description: "Join community events, workshops, and gatherings organized by Viva Resource Foundation in Colorado. Free bilingual events for immigrant families.",
  path: "/events",
  keywords: ["immigrant events Colorado", "eventos comunitarios Denver", "Colorado community events", "free workshops Peyton", "Viva Resource events"],
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
