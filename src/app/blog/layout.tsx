import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Blog - Historias y Recursos para Inmigrantes",
  description: "Read stories, guides, and updates from Viva Resource Foundation. Bilingual content about immigrant life, resources, and community events in Colorado.",
  path: "/blog",
  keywords: ["immigrant blog Colorado", "blog para inmigrantes", "Colorado community stories", "immigrant guide Denver", "Viva Resource blog"],
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
