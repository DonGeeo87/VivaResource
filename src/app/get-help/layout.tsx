import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Help | Free Immigrant Assistance Colorado - Viva Resource",
  description:
    "Get free bilingual immigrant assistance in Colorado. Housing, food, healthcare, legal aid referrals, and education support. Submit a request and our team will contact you within 24-48 hours.",
  keywords: [
    "immigrant help Colorado",
    "free immigrant assistance Denver",
    "housing help Colorado",
    "food assistance immigrant CO",
    "legal aid referral Colorado",
    "bilingual case workers Colorado",
  ],
  openGraph: {
    title: "Get Help | Free Immigrant Assistance Colorado",
    description: "Free bilingual assistance for immigrant families in Colorado. Housing, food, health, legal aid.",
    type: "website",
  },
};

export default function GetHelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
