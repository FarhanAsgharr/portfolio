import { NextResponse } from "next/server";

import { checkSendAllowed, issueOtp } from "@/lib/otp";
import { isValidPhone, maskPhone, phonesMatch } from "@/lib/phone";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getRegisteredPhone } from "@/lib/reset-token";
import { isSmsConfigured, sendOtpSms } from "@/lib/sms";

/**
 * Start a password reset: send a code to the registered phone.
 *
 * Two anti-abuse principles shape the responses:
 *
 *   1. Don't reveal whether a number is registered. Whether or not the entered
 *      number matches, the success response is the same ("if this is the
 *      registered number, a code was sent"). Only a genuinely malformed number
 *      is rejected, because that's a client mistake, not an enumeration signal.
 *
 *   2. Never text a number the requester chose. A code only actually goes out
 *      when the entered number matches the owner's registered one.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "send-otp"), 6, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let phone: unknown;
  try {
    ({ phone } = (await request.json()) as { phone?: unknown });
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof phone !== "string" || !isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Enter a valid phone number, including the country code." },
      { status: 422 },
    );
  }

  const registered = await getRegisteredPhone();
  const genericOk = NextResponse.json({
    ok: true,
    message: "If that number is registered, a verification code is on its way.",
    smsConfigured: isSmsConfigured(),
    maskedPhone: registered ? maskPhone(registered) : undefined,
  });

  // Silently stop for an unregistered number: same response as success, so a
  // guesser learns nothing.
  if (!registered || !phonesMatch(phone, registered)) {
    return genericOk;
  }

  const gate = await checkSendAllowed(registered);
  if (!gate.ok) {
    const message =
      gate.reason === "cooldown"
        ? `Please wait ${gate.retryAfterSec}s before requesting another code.`
        : "Too many codes requested. Try again in a little while.";
    return NextResponse.json({ error: message }, { status: 429 });
  }

  const issued = await issueOtp(registered);
  if (!issued) {
    return NextResponse.json(
      { error: "Couldn't start a reset. Is the database connected?" },
      { status: 503 },
    );
  }

  const delivery = await sendOtpSms(registered, issued.code);

  // In dev with no SMS provider, the code comes back so the flow is testable.
  // `sendOtpSms` only ever returns it outside production.
  return NextResponse.json({
    ok: true,
    message: delivery.delivered
      ? "A verification code has been sent to your phone."
      : "SMS isn't configured, so the code is shown here for testing.",
    smsConfigured: delivery.delivered,
    maskedPhone: maskPhone(registered),
    expiresInSec: Math.floor(issued.ttlMs / 1000),
    devCode: delivery.devCode,
  });
}
