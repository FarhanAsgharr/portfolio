import "server-only";

import postgres from "postgres";

/**
 * Postgres connection.
 *
 * Works with any Postgres — Neon, Supabase, Railway, a local server. The client
 * is created lazily and cached on `globalThis` so Next's dev-mode module
 * reloading doesn't open a new pool on every edit.
 *
 * `DATABASE_URL` is deliberately optional: when it's missing every call returns
 * null and the site falls back to the static content in `data/portfolio.ts`.
 * That's what lets the project run with no setup at all.
 */

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { sql?: Sql | null };

export function getSql(): Sql | null {
  if (globalForDb.sql !== undefined) return globalForDb.sql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    globalForDb.sql = null;
    return null;
  }

  globalForDb.sql = postgres(url, {
    ssl: resolveSsl(url),
    // Serverless functions are short-lived — a big pool just exhausts the
    // provider's connection limit.
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    // `CREATE TABLE IF NOT EXISTS` emits a NOTICE every time the table is
    // already there, which is every request after the first. Left on, that
    // buries real errors in the logs.
    onnotice: () => {},
  });

  return globalForDb.sql;
}

/**
 * Decide whether to negotiate TLS.
 *
 * Hosted Postgres (Neon, Supabase, Railway) requires it; a database running on
 * localhost usually isn't built with TLS at all, and demanding it there fails
 * the connection outright. An explicit `sslmode` in the URL always wins, so a
 * deliberate choice is never overridden.
 */
function resolveSsl(url: string): "require" | false {
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get("sslmode");

    if (mode === "disable") return false;
    if (mode) return "require";

    const host = parsed.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1";
    return isLocal ? false : "require";
  } catch {
    // Unparseable URL: let postgres.js surface the real error rather than
    // failing here on a TLS guess.
    return "require";
  }
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Create the two tables if they don't exist.
 *
 * Called on the first read rather than as a separate migration step, so setup
 * is "paste the connection string and reload" with nothing to run by hand.
 * Both statements are idempotent.
 */
let schemaReady: Promise<void> | null = null;

/**
 * Postgres error codes raised when two connections create the same table at the
 * same moment. `IF NOT EXISTS` checks then creates, and that gap is real: on a
 * cold start several serverless instances run this concurrently, and the losers
 * see one of these instead of a clean no-op. The table exists either way, which
 * is all this function promises.
 */
const ALREADY_EXISTS = new Set([
  "42P07", // duplicate_table
  "23505", // unique_violation on pg_type / pg_class
  "23P01", // exclusion_violation
]);

function isAlreadyExists(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    ALREADY_EXISTS.has((error as { code: string }).code)
  );
}

export function ensureSchema(sql: Sql): Promise<void> {
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_content (
        id          integer PRIMARY KEY DEFAULT 1,
        data        jsonb   NOT NULL,
        updated_at  timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT portfolio_content_single_row CHECK (id = 1)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_assets (
        id          text PRIMARY KEY,
        mime        text NOT NULL,
        data        text NOT NULL,
        size        integer NOT NULL,
        updated_at  timestamptz NOT NULL DEFAULT now()
      )
    `;
    // One row, holding the password chosen from the admin panel. Absent until
    // the password is changed there, at which point it overrides ADMIN_PASSWORD.
    // Only a hash is stored — never the password itself. `password_salt` is
    // retained for rows written by the earlier PBKDF2 scheme; bcrypt embeds its
    // own salt and leaves it empty. `session_version` is bumped on every reset
    // so tokens minted before the reset stop validating.
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_auth (
        id              integer PRIMARY KEY DEFAULT 1,
        password_hash   text NOT NULL,
        password_salt   text NOT NULL DEFAULT '',
        session_version integer NOT NULL DEFAULT 1,
        updated_at      timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT portfolio_auth_single_row CHECK (id = 1)
      )
    `;
    // Columns added after the table first shipped. IF NOT EXISTS makes each a
    // no-op on databases that already have them.
    await sql`ALTER TABLE portfolio_auth ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 1`;
    await sql`ALTER TABLE portfolio_auth ALTER COLUMN password_salt SET DEFAULT ''`;

    // One-time passwords for phone-based password reset. The code itself is
    // stored only as a bcrypt hash; `verified` and `consumed` enforce
    // single-use, `attempts` caps brute force, `expires_at` caps the window.
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_otp (
        id            text PRIMARY KEY,
        phone_number  text NOT NULL,
        otp_hash      text NOT NULL,
        expires_at    timestamptz NOT NULL,
        verified      boolean NOT NULL DEFAULT false,
        consumed      boolean NOT NULL DEFAULT false,
        attempts      integer NOT NULL DEFAULT 0,
        created_at    timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS portfolio_otp_phone_idx ON portfolio_otp (phone_number, created_at DESC)`;
  })().catch((error) => {
    if (isAlreadyExists(error)) return;

    // Reset so a transient failure (cold database, network blip) can be retried
    // on the next request instead of being cached forever.
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}
