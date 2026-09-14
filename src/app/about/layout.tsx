import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "About Us — Our Mission in Rural Colorado",
  description: "Learn about Viva Resource's mission to connect rural Colorado communities with essential resources. Our history, values, and commitment to community empowerment in El Paso County.",
  path: "/about",
  keywords: ["about Viva Resource", "rural Colorado nonprofit", "nuestra misión", "community empowerment Colorado", "community foundation Peyton"],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
