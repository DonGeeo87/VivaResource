import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.org";

// Static routes that always exist
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${siteUrl}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/events`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/resources`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/get-help`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/get-involved`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/donate`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/privacy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Start with static routes
  const sitemapData: MetadataRoute.Sitemap = [...staticRoutes];

  // Add dynamic blog posts
  try {
    const { collection, getDocs, query, where } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase/config");

    const blogQuery = query(
      collection(db, "blog_posts"),
      where("status", "==", "published")
    );
    const blogSnapshot = await getDocs(blogQuery);

    blogSnapshot.forEach((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      const lastModified = data.published_at?.toDate?.() || new Date();

      sitemapData.push({
        url: `${siteUrl}/blog/${slug}`,
        lastModified: lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      });
    });
  } catch {
    // If Firestore is not available, continue without blog posts
    console.log("Could not fetch blog posts for sitemap");
  }

  // Add dynamic events
  try {
    const { collection, getDocs, query, where } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase/config");

    const eventQuery = query(
      collection(db, "events"),
      where("status", "==", "published")
    );
    const eventSnapshot = await getDocs(eventQuery);

    eventSnapshot.forEach((doc) => {
      const data = doc.data();
      const lastModified = data.date?.toDate?.() || new Date();

      sitemapData.push({
        url: `${siteUrl}/events/register/${doc.id}`,
        lastModified: lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    });
  } catch {
    // If Firestore is not available, continue without events
    console.log("Could not fetch events for sitemap");
  }

  // Add forms (if public)
  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase/config");

    const formSnapshot = await getDocs(collection(db, "forms"));

    formSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === "active" || data.isPublic) {
        sitemapData.push({
          url: `${siteUrl}/forms/${doc.id}`,
          lastModified: data.updated_at?.toDate?.() || new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        });
      }
    });
  } catch {
    // If Firestore is not available, continue without forms
    console.log("Could not fetch forms for sitemap");
  }

  return sitemapData;
}
