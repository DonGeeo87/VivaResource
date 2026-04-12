import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "About Us - Nuestra Historia y Misión",
  description: "Learn about Viva Resource Foundation's mission to support immigrant families in Colorado. Our history, values, and commitment to community empowerment in Denver and Peyton.",
  path: "/about",
  keywords: ["about Viva Resource", "inmigrant nonprofit Colorado", "nuestra misión", "immigrant advocacy Denver", "community foundation Peyton"],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
