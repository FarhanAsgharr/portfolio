import { NextResponse } from "next/server";

import { verifyOtp } from "@/lib/otp";
import { isValidPhone } from "@/lib/phone";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getRegisteredPhone } from "@/lib/registered-phone";

/**
 * Verify a submitted code.
 *
 * The per-code attempt cap in the database is the real brute-force defence; the
 * IP limit here is a second layer. On success the code is flagged verified —
 * the reset step then checks for that flag, so it can't be reached without a
 * correct code first.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "verify-otp"), 12, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let phone: unknown;
  let otp: unknown;
  try {
    ({ phone, otp } = (await request.json()) as { phone?: unknown; otp?: unknown });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (typeof phone !== "string" || !isValidPhone(phone)) {
    return NextResponse.json({ success: false, message: "Enter a valid phone number." }, { status: 422 });
  }
  if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ success: false, message: "Enter the 6-digit code." }, { status: 422 });
  }

  // Verify against the registered number, not the request body, so a caller
  // can't point verification at a code issued for someone else.
  const registered = await getRegisteredPhone();
  if (!registered) {
    return NextResponse.json({ success: false, message: "Password reset isn't available." }, { status: 503 });
  }

  const result = await verifyOtp(registered, otp);

  if (result.ok) {
    return NextResponse.json({ success: true, message: "OTP verified." });
  }

  const messages = {
    "no-code": "No active code. Request a new one.",
    expired: "That code has expired. Request a new one.",
    locked: "Too many wrong attempts. Request a new code.",
    incorrect: "Incorrect code. Please try again.",
  } as const;

  const status = result.reason === "incorrect" ? 401 : result.reason === "locked" ? 429 : 410;
  return NextResponse.json({ success: false, message: messages[result.reason] }, { status });
}
