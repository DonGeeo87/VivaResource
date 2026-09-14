import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Registration | Viva Resource",
  description:
    "Register for upcoming events, workshops, and community gatherings with Viva Resource.",
};

export default function EventRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
