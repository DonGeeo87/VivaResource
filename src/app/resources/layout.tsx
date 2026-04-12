import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Resources - Directorio de Recursos en Colorado",
  description: "Find verified immigrant resources and community services in Colorado. Free bilingual support for housing, food, legal aid, healthcare, and education in Denver and Peyton.",
  path: "/resources",
  keywords: ["immigrant resources Colorado", "recursos para inmigrantes", "Denver immigrant services", "food assistance Colorado", "housing help Peyton"],
});

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
