import "server-only";

import { ensureSchema, getSql } from "@/lib/db";

/**
 * First-party visitor analytics.
 *
 * Deliberately in-house rather than a third-party script: no cookie banner, no
 * data leaving the owner's database, no external request on every page load.
 * The trade-off is that it counts what this site can see — page views and
 * coarse device type — not a full funnel. For a portfolio that's the right
 * amount.
 *
 * Privacy is a design constraint, not an afterthought. No IP address is ever
 * stored. Uniqueness is approximated with a hash that is salted per day, so the
 * same visitor is countable within a day but cannot be linked across days or
 * back to a person.
 */

const encoder = new TextEncoder();

/** A day-salted anonymous hash of a visitor id. Not reversible, not durable. */
export async function hashVisitor(visitorId: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "analytics-salt";
  const data = encoder.encode(`${day}:${secret}:${visitorId}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface TrackInput {
  path: string;
  referrer: string;
  device: "desktop" | "tablet" | "mobile";
  visitorHash: string;
}

export async function recordEvent(event: TrackInput): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  try {
    await ensureSchema(sql);
    await sql`
      INSERT INTO portfolio_events (path, referrer, device, visitor_hash)
      VALUES (${event.path.slice(0, 512)}, ${event.referrer.slice(0, 256)}, ${event.device}, ${event.visitorHash})
    `;
  } catch (error) {
    // Analytics must never break a page. Swallow and move on.
    console.error("[analytics] record failed:", error);
  }
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  views7d: number;
  views30d: number;
  /** Views per day for the last 14 days, oldest first — drives the sparkline. */
  daily: Array<{ date: string; views: number }>;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  devices: Array<{ device: string; views: number }>;
}

const EMPTY: AnalyticsSummary = {
  totalViews: 0,
  uniqueVisitors: 0,
  viewsToday: 0,
  views7d: 0,
  views30d: 0,
  daily: [],
  topPages: [],
  topReferrers: [],
  devices: [],
};

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const sql = getSql();
  if (!sql) return EMPTY;

  try {
    await ensureSchema(sql);

    const [totals, daily, pages, referrers, devices] = await Promise.all([
      sql<{ total: number; uniques: number; today: number; d7: number; d30: number }[]>`
        SELECT
          count(*)::int AS total,
          count(DISTINCT visitor_hash)::int AS uniques,
          count(*) FILTER (WHERE created_at >= date_trunc('day', now()))::int AS today,
          count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS d7,
          count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS d30
        FROM portfolio_events
      `,
      sql<{ date: string; views: number }[]>`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, count(*)::int AS views
        FROM portfolio_events
        WHERE created_at >= now() - interval '13 days'
        GROUP BY 1 ORDER BY 1 ASC
      `,
      sql<{ path: string; views: number }[]>`
        SELECT path, count(*)::int AS views FROM portfolio_events
        GROUP BY path ORDER BY views DESC LIMIT 6
      `,
      sql<{ referrer: string; views: number }[]>`
        SELECT referrer, count(*)::int AS views FROM portfolio_events
        WHERE referrer <> '' GROUP BY referrer ORDER BY views DESC LIMIT 6
      `,
      sql<{ device: string; views: number }[]>`
        SELECT device, count(*)::int AS views FROM portfolio_events
        GROUP BY device ORDER BY views DESC
      `,
    ]);

    const t = totals[0];

    // Fill any missing days with zero so the sparkline has an even 14-point axis.
    const filled = fillDailyGaps(daily);

    return {
      totalViews: t?.total ?? 0,
      uniqueVisitors: t?.uniques ?? 0,
      viewsToday: t?.today ?? 0,
      views7d: t?.d7 ?? 0,
      views30d: t?.d30 ?? 0,
      daily: filled,
      topPages: pages,
      topReferrers: referrers,
      devices,
    };
  } catch (error) {
    console.error("[analytics] summary failed:", error);
    return EMPTY;
  }
}

function fillDailyGaps(rows: Array<{ date: string; views: number }>): Array<{ date: string; views: number }> {
  const byDate = new Map(rows.map((r) => [r.date, r.views]));
  const out: Array<{ date: string; views: number }> = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, views: byDate.get(key) ?? 0 });
  }
  return out;
}
