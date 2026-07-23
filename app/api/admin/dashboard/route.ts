import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { listActivity } from "@/lib/activity";
import { verifyActiveSession } from "@/lib/admin-auth";
import { getAnalytics } from "@/lib/analytics";
import { SESSION_COOKIE } from "@/lib/auth";
import { countUnread } from "@/lib/contact-store";
import { getContentForEditing } from "@/lib/content";

/**
 * Everything the dashboard home needs, in one round trip: visitor analytics,
 * unread message count, recent activity, and a few content counts for the
 * summary cards. Batched so the landing screen makes one request, not five.
 */
export async function GET() {
  const store = await cookies();
  if (!(await verifyActiveSession(store.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [analytics, unread, activity, content] = await Promise.all([
    getAnalytics(),
    countUnread(),
    listActivity(8),
    getContentForEditing(),
  ]);

  return NextResponse.json({
    analytics,
    unread,
    activity,
    counts: {
      projects: content.projects.length,
      skills: content.skillGroups.reduce((n, g) => n + g.skills.length, 0),
      experience: content.experiences.length,
      testimonials: content.testimonials.length,
    },
  });
}
