import { NextResponse } from "next/server";

import { verifyOtp } from "@/lib/otp";
import { isValidPhone } from "@/lib/phone";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { createResetToken, getRegisteredPhone } from "@/lib/reset-token";

/**
 * Check a submitted code.
 *
 * The per-code attempt cap in the database is the real brute-force defence; the
 * IP rate limit here is a second layer. On success it returns a signed reset
 * token that the reset-password step requires — so that step can't be reached
 * without having cleared this one.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "verify-otp"), 12, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let phone: unknown;
  let code: unknown;
  try {
    ({ phone, code } = (await request.json()) as { phone?: unknown; code?: unknown });
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof phone !== "string" || !isValidPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 422 });
  }
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 422 });
  }

  // Verify against the registered number, not the one in the request body, so a
  // caller can't point verification at a code issued for someone else.
  const registered = await getRegisteredPhone();
  if (!registered) {
    return NextResponse.json({ error: "Password reset isn't available." }, { status: 503 });
  }

  const result = await verifyOtp(registered, code);

  if (result.ok) {
    const resetToken = await createResetToken(result.otpId, registered);
    return NextResponse.json({ ok: true, resetToken });
  }

  const messages = {
    "no-code": "No active code. Request a new one.",
    expired: "That code has expired. Request a new one.",
    locked: "Too many wrong attempts. Request a new code.",
    incorrect: "That code isn't right. Check it and try again.",
  } as const;

  const status = result.reason === "incorrect" ? 401 : result.reason === "locked" ? 429 : 410;
  return NextResponse.json({ error: messages[result.reason] }, { status });
}
