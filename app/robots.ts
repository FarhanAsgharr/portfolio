import type { MetadataRoute } from "next";

import { getContent } from "@/lib/content";

/**
 * Rendered per request: it reads content the admin panel can change (the site
 * address), so prerendering it would freeze whatever was true at deploy time.
 */
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await getContent();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing under /api is worth indexing, and /admin is a private editor —
      // this is a crawler hint, not a security boundary. The real protection is
      // the session check in `proxy.ts`.
      disallow: ["/api/", "/admin"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
