import { NextResponse } from "next/server";

import { resetPassword } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity";
import { consumeVerifiedReset, hasVerifiedOtp } from "@/lib/otp";
import { isPasswordValid } from "@/lib/password-policy";
import { isValidPhone, phonesMatch } from "@/lib/phone";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getRegisteredPhone } from "@/lib/registered-phone";

/**
 * Set a new password after the phone was verified.
 *
 * Authorised by a *verified, unconsumed, unexpired* code for the registered
 * number — not by a token the client holds. The verified code is consumed
 * (deleted) before the password is written, and that consume is atomic, so the
 * reset works exactly once even under a race.
 *
 * On success the session version is bumped inside `resetPassword`, invalidating
 * every session that existed before this reset.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "reset-password"), 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let phone: unknown;
  let newPassword: unknown;
  let confirmPassword: unknown;
  try {
    ({ phone, newPassword, confirmPassword } = (await request.json()) as {
      phone?: unknown;
      newPassword?: unknown;
      confirmPassword?: unknown;
    });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (typeof phone !== "string" || !isValidPhone(phone)) {
    return NextResponse.json({ success: false, message: "Enter a valid phone number." }, { status: 422 });
  }
  if (typeof newPassword !== "string" || typeof confirmPassword !== "string") {
    return NextResponse.json({ success: false, message: "Both password fields are required." }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ success: false, message: "The passwords don't match." }, { status: 422 });
  }
  if (!isPasswordValid(newPassword)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Password must be at least 8 characters and include upper and lower case, a number and a special character.",
      },
      { status: 422 },
    );
  }

  const registered = await getRegisteredPhone();
  if (!registered) {
    return NextResponse.json({ success: false, message: "Password reset isn't available." }, { status: 503 });
  }

  // Guard: the phone in the body must be the registered one, and it must have a
  // verified code waiting.
  if (!phonesMatch(phone, registered) || !(await hasVerifiedOtp(registered))) {
    return NextResponse.json(
      { success: false, message: "Verify your phone with a code before resetting." },
      { status: 401 },
    );
  }

  // Burn the code first — atomic, single-use.
  const consumed = await consumeVerifiedReset(registered);
  if (!consumed) {
    return NextResponse.json(
      { success: false, message: "This reset has already been used. Start again." },
      { status: 409 },
    );
  }

  const ok = await resetPassword(newPassword);
  if (!ok) {
    return NextResponse.json(
      { success: false, message: "Couldn't save the new password. Try again." },
      { status: 503 },
    );
  }

  await logActivity("password_reset", "Password reset via SMS OTP");
  return NextResponse.json({ success: true, message: "Password changed successfully." });
}
