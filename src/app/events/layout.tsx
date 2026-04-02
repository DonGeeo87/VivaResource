import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events in Colorado | Community Events & Workshops - Viva Resource",
  description:
    "Join Viva Resource Foundation community events in Colorado. Free bilingual workshops, food distribution, health fairs, and community meetings in Denver, Peyton, and rural Colorado areas.",
  keywords: [
    "community events Colorado",
    "immigrant workshops Denver",
    "food distribution Colorado",
    "bilingual events Peyton CO",
    "community meetings Colorado",
    "free workshops immigrant",
  ],
  openGraph: {
    title: "Community Events in Colorado | Viva Resource Foundation",
    description: "Free bilingual community events, workshops, and resources for immigrant families in Colorado.",
    type: "website",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
