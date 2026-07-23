import "server-only";

import { ensureSchema, getSql } from "@/lib/db";

/**
 * A lightweight audit trail of admin actions.
 *
 * Every entry answers "what changed, and when" — a sign-in, a save, an upload,
 * a password change. It's fire-and-forget: logging must never delay or fail the
 * action it records, so writes swallow their errors.
 */

export type ActivityAction =
  | "login"
  | "logout"
  | "content_saved"
  | "content_reset"
  | "asset_uploaded"
  | "password_changed"
  | "password_reset"
  | "message_received"
  | "login_failed";

export interface ActivityEntry {
  id: number;
  action: ActivityAction;
  detail: string;
  created_at: string;
}

export async function logActivity(action: ActivityAction, detail = ""): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  try {
    await ensureSchema(sql);
    await sql`INSERT INTO portfolio_activity (action, detail) VALUES (${action}, ${detail.slice(0, 256)})`;
  } catch (error) {
    console.error("[activity] log failed:", error);
  }
}

export async function listActivity(limit = 50): Promise<ActivityEntry[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    await ensureSchema(sql);
    return await sql<ActivityEntry[]>`
      SELECT id, action, detail,
             to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') AS created_at
      FROM portfolio_activity
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } catch (error) {
    console.error("[activity] list failed:", error);
    return [];
  }
}
