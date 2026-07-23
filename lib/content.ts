import "server-only";

import { cache } from "react";

import {
  aiProjects,
  certificates,
  education,
  experiences,
  githubStats,
  navigation,
  profile,
  projects,
  services,
  siteConfig,
  skillGroups,
  socials,
  spineSections,
  stats,
  techStack,
  testimonials,
} from "@/data/portfolio";
import { ensureSchema, getSql } from "@/lib/db";
import { CONTENT_VERSION, type PortfolioContent } from "@/types/content";

/**
 * The content shipped in the repo.
 *
 * Serves three jobs: the site renders from it when no database is configured,
 * it seeds the database on first save, and it's the "reset to defaults" target
 * in the admin panel.
 */
export const defaultContent: PortfolioContent = {
  version: CONTENT_VERSION,
  profile,
  socials,
  navigation,
  spineSections,
  stats,
  skillGroups,
  projects,
  aiProjects,
  experiences,
  education,
  certificates,
  services,
  testimonials,
  techStack,
  githubStats,
  site: { url: siteConfig.url, keywords: [...siteConfig.keywords] },
};

/**
 * Fill in anything a stored row is missing.
 *
 * A row written by an older version of the app — or hand-edited in a database
 * console — must never crash a page by omitting a key. Every field falls back
 * to the shipped default, so a partial row degrades to partial customisation
 * rather than a broken render.
 */
function migrateContent(stored: Partial<PortfolioContent> | null): PortfolioContent {
  if (!stored || typeof stored !== "object") return defaultContent;

  return {
    ...defaultContent,
    ...stored,
    version: CONTENT_VERSION,
    profile: { ...defaultContent.profile, ...stored.profile },
    githubStats: { ...defaultContent.githubStats, ...stored.githubStats },
    site: { ...defaultContent.site, ...stored.site },
  };
}

async function readContent(): Promise<PortfolioContent> {
  const sql = getSql();
  if (!sql) return defaultContent;

  try {
    await ensureSchema(sql);
    const rows = await sql<{ data: Partial<PortfolioContent> }[]>`
      SELECT data FROM portfolio_content WHERE id = 1
    `;
    return migrateContent(rows[0]?.data ?? null);
  } catch (error) {
    // A database outage degrades the site to its shipped content rather than
    // taking it down: loud in the logs, invisible to the visitor.
    console.error("[content] read failed, falling back to defaults:", error);
    return defaultContent;
  }
}

/**
 * Content for the public site.
 *
 * Wrapped in React's `cache` so a single page render — layout plus page plus
 * metadata — costs exactly one query rather than one per caller.
 *
 * Deliberately *not* wrapped in a persistent cache. The read is a single
 * primary-key lookup, and the alternative is an invalidation story where an
 * edit made on a phone may or may not appear depending on which node served the
 * request. For a site this size, "the edit is live the moment you save it" is
 * worth more than the milliseconds. With no database configured this returns a
 * constant and never touches the network at all.
 */
export const getContent = cache(readContent);

/** Content for the admin panel. Same read; named for intent at the call site. */
export const getContentForEditing = readContent;

/** Persist edited content. */
export async function saveContent(content: PortfolioContent): Promise<void> {
  const sql = getSql();
  if (!sql) {
    throw new Error("No database configured. Set DATABASE_URL to save changes — see README.md.");
  }

  await ensureSchema(sql);
  await sql`
    INSERT INTO portfolio_content (id, data, updated_at)
    VALUES (1, ${sql.json({ ...content, version: CONTENT_VERSION } as never)}, now())
    ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = now()
  `;
}
