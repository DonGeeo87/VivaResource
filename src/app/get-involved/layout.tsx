import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Get Involved — Volunteer & Ambassador Program",
  description: "Join Viva Resource as a volunteer or community ambassador. Make a difference in rural Colorado communities across El Paso County.",
  path: "/get-involved",
  keywords: ["volunteer Colorado", "voluntariado Colorado", "community ambassador", "Colorado nonprofit volunteer", "join Viva Resource"],
});

export default function GetInvolvedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
