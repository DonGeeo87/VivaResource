import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Get Involved - Únete como Voluntario o Embajador",
  description: "Join Viva Resource Foundation as a volunteer or community ambassador. Make a difference in immigrant communities across Colorado, Denver, and Peyton.",
  path: "/get-involved",
  keywords: ["volunteer Colorado", "voluntariado inmigrante", "community ambassador", "Colorado nonprofit volunteer", "join Viva Resource"],
});

export default function GetInvolvedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
