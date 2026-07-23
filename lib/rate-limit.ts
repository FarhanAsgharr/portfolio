/**
 * A tiny fixed-window rate limiter kept in process memory.
 *
 * Honest about its limits: this resets on a serverless cold start and isn't
 * shared across instances, so it slows abuse rather than stopping it dead. It's
 * the right size for a single-owner site; the OTP flow's real brute-force
 * defence is the per-code attempt counter in the database, which this only
 * backs up. Move to Redis if you ever need a hard guarantee.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateVerdict {
  allowed: boolean;
  retryAfterSec: number;
}

export function rateLimit(key: string, max: number, windowMs: number): RateVerdict {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfterSec: 0 };
}

/** Best-effort client key from proxy headers. */
export function clientKey(request: Request, scope: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return `${scope}:${ip}`;
}
