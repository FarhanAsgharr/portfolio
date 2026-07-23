import type { Metadata } from "next";

import type { PortfolioContent } from "@/types/content";

/** Build page metadata from live content, overriding only what differs per page. */
export function buildMetadata(
  content: PortfolioContent,
  {
    title,
    description,
    path = "/",
    image,
    type = "website",
  }: {
    title?: string;
    description?: string;
    path?: string;
    /**
     * Page-specific share image. Leave undefined to let Next fill both the
     * Open Graph and Twitter tags from the `opengraph-image` file convention —
     * it appends a content hash to that URL, which a hardcoded path here would
     * miss, producing a 404 in the share preview.
     */
    image?: string;
    type?: "website" | "article";
  } = {},
): Metadata {
  const { profile, site } = content;
  const siteName = `${profile.name} — ${profile.role}`;

  const resolvedTitle = title ? `${title} — ${profile.name}` : siteName;
  const resolvedDescription = description ?? profile.bio;
  const url = new URL(path, site.url).toString();

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title: resolvedTitle,
      description: resolvedDescription,
      siteName: profile.name,
      locale: "en_US",
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: resolvedTitle }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(image ? { images: [image] } : {}),
      creator: socialHandle(content),
    },
  };
}

/**
 * schema.org Person graph.
 *
 * Search engines use this to render the knowledge panel and to connect the
 * profile to its social accounts, so it's derived from the same data file as
 * the visible page rather than maintained separately.
 */
export function buildPersonSchema(content: PortfolioContent) {
  const { profile, socials, skillGroups, education, experiences, site } = content;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    email: `mailto:${profile.email}`,
    url: site.url,
    image: new URL(profile.avatar, site.url).toString(),
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location,
    },
    sameAs: socials.filter((s) => !s.href.startsWith("mailto:")).map((s) => s.href),
    knowsAbout: skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)),
    alumniOf: education.map((item) => ({
      "@type": "CollegeOrUniversity",
      name: item.institution,
    })),
    worksFor: experiences
      .filter((item) => !item.end)
      .map((item) => ({ "@type": "Organization", name: item.company })),
  };
}

/** Structured data for an individual project page. */
export function buildProjectSchema(
  content: PortfolioContent,
  project: { title: string; description: string; slug: string; year: number; stack: string[] },
) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: new URL(`/projects/${project.slug}`, content.site.url).toString(),
    dateCreated: String(project.year),
    keywords: project.stack.join(", "),
    author: { "@type": "Person", name: content.profile.name },
  };
}

/** The X/Twitter handle, if one is listed. Used for the `twitter:creator` tag. */
function socialHandle(content: PortfolioContent) {
  const x = content.socials.find((social) => social.icon === "x");
  return x?.handle ?? undefined;
}
