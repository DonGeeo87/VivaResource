import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Get Help — Free Community Resources",
  description: "Request personalized help and resources from Viva Resource. Free bilingual support for housing, food, healthcare, education, and legal aid referrals in Colorado.",
  path: "/get-help",
  keywords: ["get help Colorado", "solicitar ayuda Colorado", "community assistance request", "Colorado family services", "help for rural families"],
});

export default function GetHelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
