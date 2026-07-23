import { NextResponse } from "next/server";

import { checkSendAllowed, issueOtp } from "@/lib/otp";
import { isValidPhone, phonesMatch } from "@/lib/phone";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getRegisteredPhone } from "@/lib/registered-phone";
import { isSmsConfigured, sendOtpSms } from "@/lib/sms";

/**
 * Send a real 6-digit OTP over Twilio SMS.
 *
 * Two anti-abuse principles shape the responses:
 *   1. Don't reveal whether a number is registered — a matching and a
 *      non-matching number get the same success response, so the endpoint can't
 *      be used to discover the owner's number.
 *   2. Only ever text the owner's registered number, never one the caller typed.
 *
 * The code is never logged and never returned. It exists only in the SMS and as
 * a bcrypt hash in the database.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "send-otp"), 6, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let phone: unknown;
  try {
    ({ phone } = (await request.json()) as { phone?: unknown });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (typeof phone !== "string" || !isValidPhone(phone)) {
    return NextResponse.json(
      { success: false, message: "Enter a valid phone number, including the country code." },
      { status: 422 },
    );
  }

  // Fail clearly when SMS isn't set up, rather than pretending a code went out.
  if (!isSmsConfigured()) {
    console.error("[send-otp] Twilio is not configured; cannot send OTP.");
    return NextResponse.json(
      { success: false, message: "SMS service is not configured. Contact the site owner." },
      { status: 503 },
    );
  }

  const registered = await getRegisteredPhone();

  // Unregistered number: identical success response, but nothing is sent.
  if (!registered || !phonesMatch(phone, registered)) {
    return NextResponse.json({ success: true, message: "OTP sent successfully." });
  }

  const gate = await checkSendAllowed(registered);
  if (!gate.ok) {
    const message =
      gate.reason === "cooldown"
        ? `Please wait ${gate.retryAfterSec}s before requesting another code.`
        : "Too many codes requested. Try again later.";
    return NextResponse.json({ success: false, message }, { status: 429 });
  }

  const issued = await issueOtp(registered);
  if (!issued) {
    return NextResponse.json(
      { success: false, message: "Couldn't start a reset. Try again shortly." },
      { status: 503 },
    );
  }

  try {
    await sendOtpSms(registered, issued.code);
  } catch (error) {
    // Log the failure, never the code.
    console.error("[send-otp] Twilio send failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, message: "Couldn't send the code. Try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, message: "OTP sent successfully." });
}
