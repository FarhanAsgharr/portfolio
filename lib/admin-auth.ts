import "server-only";

import { verifyEnvPassword } from "@/lib/auth";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/db";

/**
 * Password verification and change, backed by the database.
 *
 * This is the layer that lets the password be changed from the admin panel.
 * Environment variables are read-only at runtime on most hosts (Vercel
 * included), so a new password can't be written back to `ADMIN_PASSWORD` — it
 * has to live somewhere writable, which is the database.
 *
 * Precedence: a password set here wins; if none has been set, the check falls
 * back to `ADMIN_PASSWORD`. That keeps first-time login working before anything
 * is stored, and means "forgot the new password" is recoverable by clearing the
 * row (documented in SETUP.md).
 *
 * Kept separate from `lib/auth.ts` on purpose: that file is imported by the Edge
 * middleware and must not pull in the database driver. This one is server-only.
 */

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;

const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Derive a PBKDF2-SHA256 hash of a password with a given salt. */
async function derive(password: string, saltHex: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH_BITS,
  );

  return toHex(bits);
}

/** Constant-time hex-string comparison. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

interface StoredPassword {
  hash: string;
  salt: string;
}

async function readStored(): Promise<StoredPassword | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await ensureSchema(sql);
    const rows = await sql<{ password_hash: string; password_salt: string }[]>`
      SELECT password_hash, password_salt FROM portfolio_auth WHERE id = 1
    `;
    if (!rows[0]) return null;
    return { hash: rows[0].password_hash, salt: rows[0].password_salt };
  } catch (error) {
    console.error("[admin-auth] read failed:", error);
    return null;
  }
}

/** True once a password has been set from the admin panel. */
export async function hasStoredPassword(): Promise<boolean> {
  return (await readStored()) !== null;
}

/**
 * Verify a candidate password.
 *
 * Checks the stored password if one exists, otherwise the environment
 * password. A database read failure falls through to the env check rather than
 * locking the owner out of their own site.
 */
export async function verifyPassword(candidate: string): Promise<boolean> {
  const stored = await readStored();

  if (stored) {
    const attempt = await derive(candidate, stored.salt);
    return timingSafeEqual(attempt, stored.hash);
  }

  return verifyEnvPassword(candidate);
}

export type PasswordChangeResult =
  | { ok: true }
  | { ok: false; reason: "no-database" | "wrong-current" | "too-short" };

/**
 * Change the password.
 *
 * Requires the current password so a hijacked-but-brief session can't lock the
 * real owner out by silently rotating it. The new password is stored only as a
 * salted PBKDF2 hash.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<PasswordChangeResult> {
  if (!isDatabaseConfigured()) return { ok: false, reason: "no-database" };
  if (newPassword.length < 8) return { ok: false, reason: "too-short" };

  if (!(await verifyPassword(currentPassword))) {
    return { ok: false, reason: "wrong-current" };
  }

  const sql = getSql();
  if (!sql) return { ok: false, reason: "no-database" };

  const salt = randomHex(16);
  const hash = await derive(newPassword, salt);

  await ensureSchema(sql);
  await sql`
    INSERT INTO portfolio_auth (id, password_hash, password_salt, updated_at)
    VALUES (1, ${hash}, ${salt}, now())
    ON CONFLICT (id) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt,
          updated_at = now()
  `;

  return { ok: true };
}
