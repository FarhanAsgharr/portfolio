import type { MetadataRoute } from "next";

import { posts } from "@/data/blog";
import { getContent } from "@/lib/content";

/**
 * Rendered per request: it reads content the admin panel can change (the site
 * address), so prerendering it would freeze whatever was true at deploy time.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, site } = await getContent();
  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...projects.map((project) => ({
      url: `${site.url}/projects/${project.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
