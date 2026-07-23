import "server-only";

import twilio from "twilio";

/**
 * Real SMS delivery through Twilio.
 *
 * There is no test/dev fallback by design: a code is either delivered to a real
 * phone or the request fails loudly. Nothing about the code is ever logged or
 * returned to the client — the only place it appears is the recipient's phone.
 *
 * Credentials come exclusively from environment variables and are never logged.
 * `TWILIO_FROM_NUMBER` is accepted as an alias for `TWILIO_PHONE_NUMBER` so an
 * existing deployment keeps working after the rename.
 */

function fromNumber(): string | undefined {
  return process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;
}

export function isSmsConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && fromNumber());
}

/** The message body, in the exact format the brief specifies. */
function buildMessage(code: string): string {
  return `Your verification code is:\n\n${code}\n\nThis code expires in 5 minutes.\nDo not share this code with anyone.`;
}

/**
 * Send a code. Resolves on success, throws on any failure so the route can
 * return a truthful error. The thrown message never contains the code.
 */
export async function sendOtpSms(toPhone: string, code: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = fromNumber();

  if (!sid || !token || !from) {
    throw new Error("SMS service is not configured.");
  }

  const client = twilio(sid, token);

  await client.messages.create({
    to: toPhone,
    from,
    body: buildMessage(code),
  });
}
