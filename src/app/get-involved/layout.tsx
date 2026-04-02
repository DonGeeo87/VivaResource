import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Involved | Volunteer & Support Colorado Immigrant Community",
  description:
    "Join Viva Resource Foundation as a volunteer, ambassador, or supporter. Make a difference in Colorado immigrant communities through community outreach, education, and resource distribution in Denver, Peyton, and rural Colorado.",
  keywords: [
    "volunteer Colorado immigrant",
    "community ambassador Colorado",
    "nonprofit volunteer Denver",
    "support immigrant community CO",
    "Colorado volunteer opportunities",
  ],
  openGraph: {
    title: "Get Involved | Volunteer with Viva Resource Foundation",
    description: "Join our mission to empower immigrant communities in Colorado. Volunteer, donate, or become an ambassador.",
    type: "website",
  },
};

export default function GetInvolvedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
