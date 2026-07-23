import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { changePassword, verifyActiveSession } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * Change the admin password.
 *
 * Requires a valid session *and* the current password: a session alone
 * shouldn't be enough to lock the real owner out, and re-entering the current
 * password is the standard proof for a sensitive change.
 *
 * The session cookie stays valid afterwards. It's signed with a server secret
 * (`ADMIN_SECRET`, or the env password as a fallback) that this doesn't touch,
 * so changing the password doesn't sign the current browser out. Other browsers
 * keep their sessions too; rotate `ADMIN_SECRET` to end those.
 */
export async function POST(request: Request) {
  const store = await cookies();
  if (!(await verifyActiveSession(store.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "Both the current and new password are required." },
      { status: 400 },
    );
  }

  const result = await changePassword(currentPassword, newPassword);

  if (result.ok) {
    await logActivity("password_changed");
    return NextResponse.json({ ok: true });
  }

  // Map each reason to a message the person can act on.
  const messages = {
    "no-database":
      "Changing the password needs a database. Add DATABASE_URL — see README.md.",
    "wrong-current": "That current password isn't right.",
    "too-short": "Use at least 8 characters for the new password.",
  } as const;

  const status = result.reason === "no-database" ? 503 : result.reason === "wrong-current" ? 401 : 422;
  return NextResponse.json({ error: messages[result.reason] }, { status });
}
