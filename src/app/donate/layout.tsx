import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Donate — Support Rural Colorado Families",
  description: "Support rural Colorado communities with your donation to Viva Resource. Tax-deductible 501(c)(3) donations fund housing, food, healthcare, and education programs.",
  path: "/donate",
  keywords: ["donate Colorado nonprofit", "donaciones comunidad Colorado", "tax deductible donation Colorado", "nonprofit donation El Paso County", "support rural families"],
});

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
