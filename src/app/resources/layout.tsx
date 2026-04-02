import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources | Immigrant Resources Directory Colorado - Viva Resource",
  description:
    "Verified immigrant resources directory for Colorado. Find health insurance, food banks, housing assistance, legal aid, employment services, and mental health support in Denver, Peyton, and across Colorado.",
  keywords: [
    "immigrant resources Colorado",
    "Colorado 211 services",
    "food banks Colorado",
    "legal aid Colorado immigrant",
    "housing assistance Denver",
    "health insurance Colorado immigrant",
    "employment services Colorado",
    "mental health Colorado",
  ],
  openGraph: {
    title: "Immigrant Resources Directory | Colorado - Viva Resource",
    description: "Verified resources for immigrant families in Colorado: health, food, housing, legal aid, and more.",
    type: "website",
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
