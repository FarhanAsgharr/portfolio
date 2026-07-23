import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { listActivity } from "@/lib/activity";
import { verifyActiveSession } from "@/lib/admin-auth";
import { SESSION_COOKIE } from "@/lib/auth";

/** The full activity log for the Activity panel. */
export async function GET() {
  const store = await cookies();
  if (!(await verifyActiveSession(store.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ activity: await listActivity(100) });
}
