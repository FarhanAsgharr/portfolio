import "server-only";

import { getContent } from "@/lib/content";

/**
 * The short-lived proof that an OTP was verified.
 *
 * Issued by /verify-otp and required by /reset-password, so the reset step
 * can't be reached without having passed the code step. It's an HMAC over the
 * OTP id, the phone and an expiry — the client can't forge which OTP it cleared,
 * and it stops working after ten minutes even if the OTP row lingers.
 */

const RESET_TTL_MS = 10 * 60 * 1000;
const encoder = new TextEncoder();

function secret(): string {
  // The same server secret the session cookie uses. Always present in practice:
  // the reset flow only runs once an admin password (its fallback) exists.
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "insecure-fallback-secret";
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// base64url without padding, so the token is URL/JSON-safe.
function encode(payload: object): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}
function decode<T>(data: string): T | null {
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

interface ResetPayload {
  otpId: string;
  phone: string;
  exp: number;
}

export async function createResetToken(otpId: string, phone: string): Promise<string> {
  const payload = encode({ otpId, phone, exp: Date.now() + RESET_TTL_MS } satisfies ResetPayload);
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifyResetToken(
  token: string,
): Promise<{ otpId: string; phone: string } | null> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = await hmac(payload);
  if (!timingSafeEqual(sig, expected)) return null;

  const data = decode<ResetPayload>(payload);
  if (!data || data.exp < Date.now()) return null;

  return { otpId: data.otpId, phone: data.phone };
}

/**
 * The number a reset code may be sent to.
 *
 * Fixed by the owner, never chosen by the requester: `ADMIN_PHONE` if set,
 * otherwise the phone in the site content. Returns null when neither exists, in
 * which case the flow declines rather than texting an arbitrary number.
 */
export async function getRegisteredPhone(): Promise<string | null> {
  if (process.env.ADMIN_PHONE) return process.env.ADMIN_PHONE;
  try {
    const content = await getContent();
    return content.profile.phone ?? null;
  } catch {
    return null;
  }
}
