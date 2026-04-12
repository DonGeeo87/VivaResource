import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Donate - Donaciones y Apoyo Financiero",
  description: "Support immigrant families in Colorado with your donation to Viva Resource Foundation. Tax-deductible 501(c)(3) donations fund housing, food, legal aid, and education.",
  path: "/donate",
  keywords: ["donate immigrant Colorado", "donaciones inmigrante", "tax deductible donation Colorado", "nonprofit donation Denver", "support immigrant families"],
});

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
