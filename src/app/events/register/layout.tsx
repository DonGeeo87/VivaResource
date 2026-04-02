import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Registration | Viva Resource Foundation",
  description:
    "Register for upcoming events, workshops, and community gatherings with Viva Resource Foundation.",
};

export default function EventRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
