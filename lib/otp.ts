import "server-only";

import bcrypt from "bcryptjs";

import { ensureSchema, getSql } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

/**
 * One-time password lifecycle: issue, verify, consume.
 *
 * Every rule from the brief is enforced here rather than in the routes, so the
 * routes stay thin and the guarantees live in one place:
 *   - the code is stored only as a bcrypt hash, never in the clear;
 *   - it expires 5 minutes after issue;
 *   - it is single-use — verifying marks it, resetting consumes it;
 *   - verification attempts are capped to blunt brute force;
 *   - a resend cooldown and a per-window send cap blunt abuse.
 */

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between sends
const MAX_SENDS_PER_WINDOW = 5;
const SEND_WINDOW_MS = 30 * 60 * 1000; // 5 sends per 30 minutes
const BCRYPT_ROUNDS = 10;

export type SendGate =
  | { ok: true }
  | { ok: false; reason: "cooldown"; retryAfterSec: number }
  | { ok: false; reason: "too-many" };

/** A random 6-digit code, zero-padded, from a cryptographic source. */
function generateCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return n.toString().padStart(6, "0");
}

function newId(): string {
  return crypto.randomUUID();
}

/**
 * May a new code be sent to this number right now?
 *
 * Enforces both a short cooldown (so "Resend" can't be hammered) and a longer
 * window cap (so the whole flow can't be used to spam someone's phone).
 */
export async function checkSendAllowed(phone: string): Promise<SendGate> {
  const sql = getSql();
  if (!sql) return { ok: true };

  await ensureSchema(sql);
  const normalized = normalizePhone(phone);
  const windowStart = new Date(Date.now() - SEND_WINDOW_MS);

  const rows = await sql<{ created_at: Date }[]>`
    SELECT created_at FROM portfolio_otp
    WHERE phone_number = ${normalized} AND created_at > ${windowStart}
    ORDER BY created_at DESC
  `;

  if (rows.length >= MAX_SENDS_PER_WINDOW) {
    return { ok: false, reason: "too-many" };
  }

  if (rows[0]) {
    const sinceLast = Date.now() - new Date(rows[0].created_at).getTime();
    if (sinceLast < RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        reason: "cooldown",
        retryAfterSec: Math.ceil((RESEND_COOLDOWN_MS - sinceLast) / 1000),
      };
    }
  }

  return { ok: true };
}

/**
 * Issue a code for a number and return the plaintext to hand to the SMS sender.
 *
 * Any earlier unconsumed codes for the same number are deleted first, so only
 * the most recent code is ever valid — an old code left in someone's messages
 * can't be reused.
 */
export async function issueOtp(phone: string): Promise<{ code: string; ttlMs: number } | null> {
  const sql = getSql();
  if (!sql) return null;

  await ensureSchema(sql);
  const normalized = normalizePhone(phone);

  const code = generateCode();
  const hash = await bcrypt.hash(code, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await sql`DELETE FROM portfolio_otp WHERE phone_number = ${normalized} AND consumed = false`;
  await sql`
    INSERT INTO portfolio_otp (id, phone_number, otp_hash, expires_at)
    VALUES (${newId()}, ${normalized}, ${hash}, ${expiresAt})
  `;

  return { code, ttlMs: OTP_TTL_MS };
}

export type VerifyResult =
  | { ok: true; otpId: string }
  | { ok: false; reason: "no-code" | "expired" | "locked" | "incorrect" };

/**
 * Check a submitted code against the newest outstanding one for a number.
 *
 * On success the row is flagged `verified` but not consumed — that happens at
 * the password-reset step, which keeps the code single-use across the two-step
 * flow. On failure the attempt counter climbs and locks the code out after the
 * cap, so guessing 6 digits isn't feasible.
 */
export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  const sql = getSql();
  if (!sql) return { ok: false, reason: "no-code" };

  await ensureSchema(sql);
  const normalized = normalizePhone(phone);

  const rows = await sql<
    { id: string; otp_hash: string; expires_at: Date; attempts: number }[]
  >`
    SELECT id, otp_hash, expires_at, attempts FROM portfolio_otp
    WHERE phone_number = ${normalized} AND consumed = false
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return { ok: false, reason: "no-code" };

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    return { ok: false, reason: "locked" };
  }

  const matches = await bcrypt.compare(code, row.otp_hash);

  if (!matches) {
    await sql`UPDATE portfolio_otp SET attempts = attempts + 1 WHERE id = ${row.id}`;
    return { ok: false, reason: "incorrect" };
  }

  await sql`UPDATE portfolio_otp SET verified = true WHERE id = ${row.id}`;
  return { ok: true, otpId: row.id };
}

/**
 * Confirm a code was verified and hasn't been used, then consume it.
 *
 * Called at the moment of password reset. The single UPDATE...WHERE consumed =
 * false is the atomic guard that makes a reset token usable exactly once, even
 * if two requests race.
 */
export async function consumeVerifiedOtp(otpId: string, phone: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  await ensureSchema(sql);
  const normalized = normalizePhone(phone);

  const rows = await sql<{ id: string }[]>`
    UPDATE portfolio_otp
    SET consumed = true
    WHERE id = ${otpId}
      AND phone_number = ${normalized}
      AND verified = true
      AND consumed = false
      AND expires_at > now()
    RETURNING id
  `;

  return rows.length > 0;
}
