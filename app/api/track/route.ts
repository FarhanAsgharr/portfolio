import { NextResponse } from "next/server";

import { hashVisitor, recordEvent } from "@/lib/analytics";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Public page-view beacon.
 *
 * Called once per page load by the site's analytics component. It stays cheap
 * and forgiving: a malformed or spammy call is dropped with a 204, never an
 * error, because a broken beacon must never surface to a visitor. The device
 * type is derived from the User-Agent server-side so the client sends nothing
 * that could identify anyone.
 */
export async function POST(request: Request) {
  // Generous limit — real navigation, not a hot path worth policing hard.
  const limit = rateLimit(clientKey(request, "track"), 120, 60 * 1000);
  if (!limit.allowed) return new NextResponse(null, { status: 204 });

  let body: { path?: unknown; referrer?: unknown; visitorId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const path = typeof body.path === "string" ? body.path : "";
  if (!path.startsWith("/")) return new NextResponse(null, { status: 204 });

  // Keep only the referrer's host, never a full URL with its query string.
  let referrer = "";
  if (typeof body.referrer === "string" && body.referrer) {
    try {
      referrer = new URL(body.referrer).hostname;
    } catch {
      referrer = "";
    }
  }

  const ua = request.headers.get("user-agent") ?? "";
  const device = /Mobi|Android|iPhone/i.test(ua)
    ? "mobile"
    : /iPad|Tablet/i.test(ua)
      ? "tablet"
      : "desktop";

  const visitorId = typeof body.visitorId === "string" ? body.visitorId : "anon";
  const visitorHash = await hashVisitor(visitorId);

  await recordEvent({ path, referrer, device, visitorHash });

  return new NextResponse(null, { status: 204 });
}
