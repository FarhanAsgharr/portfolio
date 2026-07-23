import { NextResponse } from "next/server";

import { logActivity } from "@/lib/activity";
import { saveMessage } from "@/lib/contact-store";
import { contactSchema } from "@/lib/validation";

/**
 * Contact endpoint.
 *
 * Validates with the same schema the form uses, then hands the message to
 * whichever provider you wire up below. It deliberately ships without a
 * provider so the project runs with no environment variables — the message is
 * logged and the caller gets a truthful response either way.
 *
 * To send real email, add one of:
 *   • Resend    — https://resend.com/docs/send-with-nextjs
 *   • Postmark  — https://postmarkapp.com/developer
 *   • SendGrid  — https://docs.sendgrid.com
 * and replace the `deliver` function.
 */

/** Naive in-memory rate limit: enough to stop a script, not a botnet. */
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string) {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > RATE_LIMIT;
}

async function deliver(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    // No provider configured — record it so nothing is silently dropped.
    console.info("[contact] message received (no email provider configured)", {
      from: payload.email,
      subject: payload.subject,
    });
    return { delivered: false as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: payload.email,
      subject: `[Portfolio] ${payload.subject}`,
      text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email provider responded ${response.status}`);
  }

  return { delivered: true as const };
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages from this address. Try again in an hour." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some fields need attention.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  // Honeypot filled in — respond exactly as if it succeeded, but send nothing.
  // A distinguishable rejection would just teach the bot which field to skip.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  // Persist first so a message is never lost to a flaky email provider, then
  // attempt delivery. The admin inbox is the durable record.
  await saveMessage(parsed.data);
  await logActivity("message_received", `${parsed.data.name} — ${parsed.data.subject}`);

  try {
    const result = await deliver(parsed.data);
    return NextResponse.json({ ok: true, delivered: result.delivered });
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return NextResponse.json(
      { error: "The message couldn't be sent. Email me directly instead." },
      { status: 502 },
    );
  }
}
