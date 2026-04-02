import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate | Support Immigrant Families Colorado - Viva Resource",
  description:
    "Donate to Viva Resource Foundation and support immigrant families in Colorado. Tax-deductible 501(c)(3) donations provide food, housing assistance, healthcare navigation, and education for rural Colorado communities.",
  keywords: [
    "donate immigrant Colorado",
    "support immigrant families Denver",
    "tax deductible donation Colorado",
    "nonprofit donation Peyton CO",
    "501c3 donation Colorado immigrant",
    "help rural Colorado families",
  ],
  openGraph: {
    title: "Donate | Support Immigrant Families in Colorado",
    description: "Tax-deductible donations providing critical resources to immigrant families in rural Colorado.",
    type: "website",
  },
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
