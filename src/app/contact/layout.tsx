import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Viva Resource Foundation - Peyton, Colorado",
  description:
    "Contact Viva Resource Foundation for immigrant support services in Colorado. Located at 13055 Bradshaw Drive #301, Peyton, CO 80831. Bilingual assistance available Mon-Fri 9AM-5PM.",
  keywords: [
    "contact Viva Resource Foundation",
    "immigrant help Peyton Colorado",
    "nonprofit contact Denver",
    "bilingual services Colorado",
    "community help Colorado Springs",
  ],
  openGraph: {
    title: "Contact Us | Viva Resource Foundation",
    description: "Reach out for bilingual immigrant support services in Peyton, Colorado. Free consultations available.",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
