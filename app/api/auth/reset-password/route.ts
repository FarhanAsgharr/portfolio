import { NextResponse } from "next/server";

import { resetPassword } from "@/lib/admin-auth";
import { consumeVerifiedOtp } from "@/lib/otp";
import { isPasswordValid } from "@/lib/password-policy";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { verifyResetToken } from "@/lib/reset-token";

/**
 * Set a new password, having proven control of the phone.
 *
 * The order matters: consume the one-time proof *before* writing the password.
 * `consumeVerifiedOtp` is an atomic UPDATE that succeeds exactly once, so even
 * two racing requests can't both reset — the second finds the code already
 * consumed and is turned away.
 *
 * On success the session version is bumped inside `resetPassword`, invalidating
 * every session that existed before this reset.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "reset-password"), 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let resetToken: unknown;
  let newPassword: unknown;
  try {
    ({ resetToken, newPassword } = (await request.json()) as {
      resetToken?: unknown;
      newPassword?: unknown;
    });
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof resetToken !== "string" || typeof newPassword !== "string") {
    return NextResponse.json({ error: "Missing reset token or password." }, { status: 400 });
  }

  if (!isPasswordValid(newPassword)) {
    return NextResponse.json(
      {
        error:
          "Password must be at least 8 characters and include upper and lower case, a number and a special character.",
      },
      { status: 422 },
    );
  }

  const proof = await verifyResetToken(resetToken);
  if (!proof) {
    return NextResponse.json(
      { error: "This reset link has expired. Start again." },
      { status: 401 },
    );
  }

  // Burn the one-time code. If this fails the token was already used or the code
  // expired — either way the reset must not proceed.
  const consumed = await consumeVerifiedOtp(proof.otpId, proof.phone);
  if (!consumed) {
    return NextResponse.json(
      { error: "This reset has already been used. Start again." },
      { status: 409 },
    );
  }

  const ok = await resetPassword(newPassword);
  if (!ok) {
    return NextResponse.json(
      { error: "Couldn't save the new password. Is the database connected?" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, message: "Password changed successfully." });
}
