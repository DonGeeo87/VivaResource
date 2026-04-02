import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Viva Resource Foundation - Colorado Immigrant Support",
  description:
    "Learn about Viva Resource Foundation's mission to empower immigrant communities in Colorado. Our history, team, values, and 15+ years of serving rural communities in Denver, Peyton, and beyond.",
  keywords: [
    "about Viva Resource Foundation",
    "Colorado immigrant nonprofit",
    "community foundation history",
    "immigrant support team Colorado",
  ],
  openGraph: {
    title: "About Us | Viva Resource Foundation",
    description: "15+ years empowering immigrant communities in Colorado with bilingual support, advocacy, and essential services.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
