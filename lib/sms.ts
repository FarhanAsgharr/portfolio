import "server-only";

/**
 * Sending an SMS.
 *
 * Real delivery needs a provider with paid credentials — there's no way around
 * that, so this is written to degrade honestly:
 *
 *   Twilio configured  → sends a real text message.
 *   Not configured     → "console delivery": the code is logged server-side,
 *                        and outside production it's handed back to the caller
 *                        so the whole reset flow is testable without paying for
 *                        SMS. In production without Twilio it is logged only,
 *                        never returned.
 *
 * Swapping Twilio for another provider means changing only `sendViaTwilio`.
 */

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );
}

export interface SmsResult {
  delivered: boolean;
  /** Present only in non-production dev delivery, so the UI can show the code. */
  devCode?: string;
}

export async function sendOtpSms(toPhone: string, code: string): Promise<SmsResult> {
  const message = `Your portfolio admin verification code is ${code}. It expires in 5 minutes.`;

  if (isSmsConfigured()) {
    await sendViaTwilio(toPhone, message);
    return { delivered: true };
  }

  // No provider: log it, and in dev only, return it.
  console.info(`[sms] (dev delivery, no provider) → ${toPhone}: ${message}`);
  const isProduction = process.env.NODE_ENV === "production";
  return { delivered: false, devCode: isProduction ? undefined : code };
}

async function sendViaTwilio(toPhone: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const body_ = new URLSearchParams({ To: toPhone, From: from, Body: body });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body_.toString(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    // Surface the provider's failure rather than pretending the SMS was sent.
    throw new Error(`Twilio send failed (${response.status}): ${detail.slice(0, 200)}`);
  }
}
