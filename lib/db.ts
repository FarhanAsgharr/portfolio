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
    // Supabase's recommended connection string routes through pgbouncer in
    // transaction mode, which can't hold the server-side prepared statements
    // postgres.js uses by default — every query would fail. Disable prepared
    // statements when we detect a pooled host. Direct connections (Neon, a
    // local server, Supabase's direct string) keep them for the speed-up.
    prepare: !isPooledConnection(url),
    // `CREATE TABLE IF NOT EXISTS` emits a NOTICE every time the table is
    // already there, which is every request after the first. Left on, that
    // buries real errors in the logs.
    onnotice: () => {},
  });

  return globalForDb.sql;
}

/**
 * Whether the connection goes through a transaction-mode pooler.
 *
 * Covers Supabase's pooler host and the 6543 pgbouncer port, plus a generic
 * `pgbouncer=true` flag some providers add. Prepared statements must be off for
 * these or queries fail with "prepared statement already exists".
 */
function isPooledConnection(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes("pooler.supabase.com") ||
      parsed.port === "6543" ||
      parsed.searchParams.get("pgbouncer") === "true"
    );
  } catch {
    return false;
  }
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
        created_at    timestamptz NOT NULL DEFAULT now(),
        updated_at    timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`ALTER TABLE portfolio_otp ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()`;
    await sql`CREATE INDEX IF NOT EXISTS portfolio_otp_phone_idx ON portfolio_otp (phone_number, created_at DESC)`;

    // First-party visitor analytics. One row per page view. No IP or personal
    // data is stored — `visitor_hash` is a day-salted anonymous id used only to
    // count uniques, and can't be reversed to a person or followed across days.
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_events (
        id            bigserial PRIMARY KEY,
        path          text NOT NULL,
        referrer      text NOT NULL DEFAULT '',
        device        text NOT NULL DEFAULT 'desktop',
        visitor_hash  text NOT NULL DEFAULT '',
        created_at    timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS portfolio_events_created_idx ON portfolio_events (created_at DESC)`;

    // Contact-form submissions, so messages have somewhere to live besides an
    // inbox that may never have been configured.
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_contact (
        id          bigserial PRIMARY KEY,
        name        text NOT NULL,
        email       text NOT NULL,
        subject     text NOT NULL DEFAULT '',
        message     text NOT NULL,
        is_read     boolean NOT NULL DEFAULT false,
        created_at  timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS portfolio_contact_created_idx ON portfolio_contact (created_at DESC)`;

    // An audit trail of admin actions: sign-ins, saves, uploads, password
    // changes. Read-only in the panel; nothing here is user-editable.
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_activity (
        id          bigserial PRIMARY KEY,
        action      text NOT NULL,
        detail      text NOT NULL DEFAULT '',
        created_at  timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS portfolio_activity_created_idx ON portfolio_activity (created_at DESC)`;
  })().catch((error) => {
    if (isAlreadyExists(error)) return;

    // Reset so a transient failure (cold database, network blip) can be retried
    // on the next request instead of being cached forever.
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}
