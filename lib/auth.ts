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

/** Mint a session token valid for the next seven days. */
export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const signature = await hmac(String(expiresAt), secret);
  return `${expiresAt}.${signature}`;
}

/** Verify a cookie value. Returns false for tampered, malformed or expired tokens. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;

  const separator = token.lastIndexOf(".");
  if (separator === -1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  // Signature is checked *after* expiry so an expired token can't be reused,
  // and the comparison is constant-time so a near-miss reveals nothing.
  const expected = await hmac(expiresAt, secret);
  return timingSafeEqual(signature, expected);
}

/** Check the submitted password against `ADMIN_PASSWORD`. */
export async function verifyPassword(candidate: string): Promise<boolean> {
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
