import { NextResponse } from "next/server";

import { verifyActiveSession } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity";
import { SESSION_COOKIE } from "@/lib/auth";
import { defaultContent, getContentForEditing, saveContent } from "@/lib/content";
import { isDatabaseConfigured } from "@/lib/db";
import { CONTENT_VERSION, type PortfolioContent } from "@/types/content";
import { cookies } from "next/headers";

/**
 * Read and write the whole content document.
 *
 * The middleware already gates this path, but the session is verified here too:
 * a route that can rewrite the entire site shouldn't depend on exactly one
 * layer being configured correctly.
 */
async function requireSession() {
  const store = await cookies();
  return verifyActiveSession(store.get(SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  return NextResponse.json({
    content: await getContentForEditing(),
    databaseConfigured: isDatabaseConfigured(),
  });
}

/**
 * Reject anything that isn't recognisably a content document.
 *
 * This is a shape check, not a deep validation: the only writer is the owner's
 * own admin panel, and `migrateContent` already fills any gap on read. The
 * point is to catch a truncated or wrong-shaped body before it replaces a
 * working site.
 */
function looksLikeContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PortfolioContent>;

  return (
    typeof candidate.profile === "object" &&
    candidate.profile !== null &&
    typeof candidate.profile.name === "string" &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.socials) &&
    typeof candidate.site === "object" &&
    candidate.site !== null
  );
}

export async function PUT(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "No database is connected, so there's nowhere to save. Add DATABASE_URL — see README.md.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!looksLikeContent(body)) {
    return NextResponse.json(
      { error: "That doesn't look like a complete portfolio document. Nothing was saved." },
      { status: 422 },
    );
  }

  try {
    await saveContent({ ...body, version: CONTENT_VERSION });
    await logActivity("content_saved");
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[admin] save failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save." },
      { status: 500 },
    );
  }
}

/** Reset every field back to the content shipped in the repo. */
export async function DELETE() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    await saveContent(defaultContent);
    await logActivity("content_reset");
    return NextResponse.json({ ok: true, content: defaultContent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reset." },
      { status: 500 },
    );
  }
}
