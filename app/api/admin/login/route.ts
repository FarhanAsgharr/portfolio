import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  createSessionToken,
  isAuthConfigured,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

/** Simple in-memory throttle: enough to make brute force impractical. */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function tooManyAttempts(key: string) {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "No admin password is set. Add ADMIN_PASSWORD to your environment." },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait 15 minutes and try again." },
      { status: 429 },
    );
  }

  let password: unknown;
  try {
    ({ password } = (await request.json()) as { password?: unknown });
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof password !== "string" || !(await verifyPassword(password))) {
    // Deliberately vague: naming which part was wrong helps an attacker and
    // nobody else — there's only one field.
    return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  }

  const token = await createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Could not start a session." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);

  // A successful sign-in clears the throttle for that address.
  attempts.delete(ip);

  return response;
}
