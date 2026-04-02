import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Viva Resource Foundation",
  description:
    "Your trust is our most valuable resource. We are committed to protecting the dignity and data of the families we serve.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
