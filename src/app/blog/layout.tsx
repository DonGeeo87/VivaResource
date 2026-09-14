import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Blog - Historias y Recursos Comunitarios",
  description: "Read stories, guides, and updates from Viva Resource. Bilingual content about community life, local resources, and events in rural Colorado.",
  path: "/blog",
  keywords: ["community blog Colorado", "blog comunitario Colorado", "Colorado community stories", "rural Colorado guide", "Viva Resource blog"],
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
