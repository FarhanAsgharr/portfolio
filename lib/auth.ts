/**
 * Admin session handling.
 *
 * A signed cookie rather than a session table: there is exactly one user, so
 * the only thing worth storing is "this browser proved it knows the password,
 * and that proof hasn't expired". An HMAC over an expiry timestamp says exactly
 * that with no state to keep.
 *
 * Written against Web Crypto so it runs unchanged in middleware (Edge) and in
 * route handlers (Node).
 */

export const SESSION_COOKIE = "portfolio_admin";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string | null {
  // Fall back to the password so a working setup needs one secret, not two.
  // ADMIN_SECRET is still worth setting: rotating it invalidates every existing
  // session without forcing a password change.
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || null;
}

export function isAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

const encoder = new TextEncoder();

async function hmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compare two strings without leaking where they differ.
 *
 * `===` on secrets returns as soon as it finds a mismatched byte, which makes
 * the comparison time a measurable oracle. This always walks the whole string.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Mint a session token valid for the next seven days.
 *
 * The token is `expiresAt.version.signature`, where the signature covers both
 * the expiry and the session version. The version lets a password reset
 * invalidate every earlier token: the reset bumps the stored version, and a
 * token minted under the old one no longer matches (checked by the Node-side
 * `sessionVersionMatches`, since the Edge check has no database access).
 */
export async function createSessionToken(version = 1): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${expiresAt}.${version}`;
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

interface DecodedToken {
  expiresAt: number;
  version: number;
}

/**
 * Validate a token's signature and expiry, returning its payload.
 *
 * Edge-safe: no database access. It proves the token was minted by this server
 * and hasn't expired, but *not* that its version is still current — that check
 * needs the database and lives in `sessionVersionMatches`.
 */
async function decodeAndVerify(token: string | undefined): Promise<DecodedToken | null> {
  const secret = getSecret();
  if (!secret || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [expiresAtRaw, versionRaw, signature] = parts;

  const expiry = Number(expiresAtRaw);
  const version = Number(versionRaw);
  if (!Number.isFinite(expiry) || !Number.isFinite(version)) return null;
  if (expiry < Date.now()) return null;

  // Signature checked after expiry so an expired token can't be reused, and the
  // comparison is constant-time so a near-miss reveals nothing.
  const expected = await hmac(`${expiresAtRaw}.${versionRaw}`, secret);
  if (!timingSafeEqual(signature, expected)) return null;

  return { expiresAt: expiry, version };
}

/**
 * Verify a cookie value. Returns false for tampered, malformed or expired
 * tokens. This is the Edge-safe gate; version currency is enforced separately
 * on the Node side.
 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  return (await decodeAndVerify(token)) !== null;
}

/** The version a valid token was minted under, or null if the token is invalid. */
export async function getSessionTokenVersion(token: string | undefined): Promise<number | null> {
  const decoded = await decodeAndVerify(token);
  return decoded ? decoded.version : null;
}

/**
 * Check the submitted password against the `ADMIN_PASSWORD` environment
 * variable.
 *
 * This is the *fallback* check. Once a password has been set from the admin
 * panel it lives in the database and `lib/admin-auth.ts` takes precedence — but
 * that path needs a database connection, which this file deliberately avoids so
 * it stays importable from the Edge middleware. Keep this env-only and
 * dependency-free.
 */
export async function verifyEnvPassword(candidate: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  // Hash both sides first: this makes the comparison fixed-length regardless of
  // what was submitted, so length itself isn't an oracle.
  const secret = getSecret() ?? password;
  const [a, b] = await Promise.all([hmac(candidate, secret), hmac(password, secret)]);
  return timingSafeEqual(a, b);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_DURATION_MS / 1000,
};
