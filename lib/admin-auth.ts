import "server-only";

import bcrypt from "bcryptjs";

import { getSessionTokenVersion, verifyEnvPassword } from "@/lib/auth";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/db";

/**
 * Password verification and change, backed by the database.
 *
 * This is the layer that lets the password be changed from the admin panel and
 * reset over SMS. Environment variables are read-only at runtime on most hosts
 * (Vercel included), so a new password can't be written back to
 * `ADMIN_PASSWORD` — it lives in the database.
 *
 * Precedence: a stored password wins; with none set, the check falls back to
 * `ADMIN_PASSWORD`, so first-time login works before anything is stored, and
 * clearing the row restores the env password (documented in SETUP.md).
 *
 * Kept separate from `lib/auth.ts` on purpose: that file is imported by the Edge
 * middleware and must not pull in the database driver. This one is server-only.
 */

const BCRYPT_ROUNDS = 12;
const encoder = new TextEncoder();

/* -------------------------------------------------------------------------- */
/*  Legacy PBKDF2 support                                                     */
/*  Rows written before the bcrypt switch stored a hash plus a separate salt.  */
/*  They still verify, so nobody is locked out by the upgrade.                 */
/* -------------------------------------------------------------------------- */

async function pbkdf2(password: string, saltHex: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(saltHex), iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* -------------------------------------------------------------------------- */
/*  Stored auth row                                                           */
/* -------------------------------------------------------------------------- */

interface AuthRow {
  password_hash: string;
  password_salt: string;
  session_version: number;
}

async function readAuth(): Promise<AuthRow | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    await ensureSchema(sql);
    const rows = await sql<AuthRow[]>`
      SELECT password_hash, password_salt, session_version
      FROM portfolio_auth WHERE id = 1
    `;
    return rows[0] ?? null;
  } catch (error) {
    console.error("[admin-auth] read failed:", error);
    return null;
  }
}

export async function hasStoredPassword(): Promise<boolean> {
  return (await readAuth()) !== null;
}

/**
 * Verify a candidate password against whichever scheme the stored row uses,
 * falling back to the environment password when nothing is stored. A database
 * read failure falls through to the env check rather than locking the owner out.
 */
export async function verifyPassword(candidate: string): Promise<boolean> {
  const auth = await readAuth();

  if (auth) {
    // bcrypt hashes start with "$2"; anything else is a legacy PBKDF2 row.
    if (auth.password_hash.startsWith("$2")) {
      return bcrypt.compare(candidate, auth.password_hash);
    }
    if (auth.password_salt) {
      const attempt = await pbkdf2(candidate, auth.password_salt);
      return timingSafeEqual(attempt, auth.password_hash);
    }
  }

  return verifyEnvPassword(candidate);
}

/* -------------------------------------------------------------------------- */
/*  Session versioning — the lever that invalidates old sessions              */
/* -------------------------------------------------------------------------- */

/**
 * The current session version.
 *
 * A token carries the version it was minted under; when this number moves,
 * every earlier token is stale. Returns 1 (the default) when no row exists yet,
 * so tokens issued against the env password validate before any reset.
 */
export async function getSessionVersion(): Promise<number> {
  const auth = await readAuth();
  return auth?.session_version ?? 1;
}

/**
 * The full session check for Node routes: signature, expiry *and* version.
 *
 * The Edge middleware can only do the first two. This closes the gap by
 * confirming the token's version still matches the database, so a session
 * minted before a password reset is rejected everywhere it counts — content
 * writes, uploads, the password screen and the editor's own data load.
 */
export async function verifyActiveSession(token: string | undefined): Promise<boolean> {
  const version = await getSessionTokenVersion(token);
  if (version === null) return false;
  return version === (await getSessionVersion());
}

async function writePassword(newPassword: string, bumpVersion: boolean): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await ensureSchema(sql);

  // Tokens minted before any row existed carry the default version, 1. So a
  // reset — which must invalidate them — starts the row at 2 even on the first
  // write, not just on subsequent bumps. A plain change (bumpVersion false)
  // starts at 1 so the signed-in owner keeps their session.
  const bump = bumpVersion ? 1 : 0;

  await sql`
    INSERT INTO portfolio_auth (id, password_hash, password_salt, session_version, updated_at)
    VALUES (1, ${hash}, '', ${1 + bump}, now())
    ON CONFLICT (id) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          password_salt = '',
          session_version = portfolio_auth.session_version + ${bump},
          updated_at = now()
  `;
  return true;
}

export type PasswordChangeResult =
  | { ok: true }
  | { ok: false; reason: "no-database" | "wrong-current" | "too-short" };

/**
 * Change the password from the signed-in panel.
 *
 * Requires the current password so a briefly-hijacked session can't silently
 * rotate it. Does *not* bump the session version — the person is already signed
 * in and shouldn't be kicked out by their own change.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<PasswordChangeResult> {
  if (!isDatabaseConfigured()) return { ok: false, reason: "no-database" };
  if (newPassword.length < 8) return { ok: false, reason: "too-short" };
  if (!(await verifyPassword(currentPassword))) return { ok: false, reason: "wrong-current" };

  await writePassword(newPassword, false);
  return { ok: true };
}

/**
 * Reset the password after an OTP has been verified.
 *
 * This *does* bump the session version, so every session that existed before
 * the reset — including any an attacker may hold — stops validating. The person
 * resetting is sent back to the login screen to sign in fresh.
 */
export async function resetPassword(newPassword: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  return writePassword(newPassword, true);
}
