import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Immigrant Stories & Resources Colorado - Viva Resource",
  description:
    "Read stories of hope, impact, and community from Viva Resource Foundation. Bilingual blog covering immigrant resources, success stories, and community empowerment in Colorado, USA.",
  keywords: [
    "immigrant stories Colorado",
    "community impact blog",
    "Colorado nonprofit news",
    "immigrant success stories Denver",
    "bilingual blog Colorado",
  ],
  openGraph: {
    title: "Blog | Viva Resource Foundation - Colorado Stories",
    description: "Stories of hope, impact, and community empowerment from Colorado immigrant families.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
