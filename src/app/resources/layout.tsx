import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Resources - Directorio de Recursos en Colorado",
  description: "Find verified community resources and services in Colorado. Free bilingual support for housing, food, healthcare, education, and legal aid referrals in El Paso County.",
  path: "/resources",
  keywords: ["community resources Colorado", "recursos comunitarios Colorado", "Colorado family services", "food assistance Colorado", "housing help Peyton"],
});

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
