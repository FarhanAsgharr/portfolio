import "server-only";

import { ensureSchema, getSql } from "@/lib/db";

/**
 * Storage for contact-form submissions.
 *
 * Kept separate from the email delivery in the contact route: email may never
 * be configured, and even when it is, a message shouldn't vanish just because a
 * provider had a bad minute. Persisting first means the admin inbox is the
 * durable record and email is a convenience on top.
 */

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function saveMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  try {
    await ensureSchema(sql);
    await sql`
      INSERT INTO portfolio_contact (name, email, subject, message)
      VALUES (${input.name}, ${input.email}, ${input.subject}, ${input.message})
    `;
  } catch (error) {
    console.error("[contact-store] save failed:", error);
  }
}

export async function listMessages(): Promise<ContactMessage[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    await ensureSchema(sql);
    return await sql<ContactMessage[]>`
      SELECT id, name, email, subject, message, is_read,
             to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') AS created_at
      FROM portfolio_contact
      ORDER BY created_at DESC
      LIMIT 200
    `;
  } catch (error) {
    console.error("[contact-store] list failed:", error);
    return [];
  }
}

export async function countUnread(): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  try {
    await ensureSchema(sql);
    const rows = await sql<{ n: number }[]>`
      SELECT count(*)::int AS n FROM portfolio_contact WHERE is_read = false
    `;
    return rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

export async function setRead(id: number, read: boolean): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema(sql);
  await sql`UPDATE portfolio_contact SET is_read = ${read} WHERE id = ${id}`;
}

export async function deleteMessage(id: number): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema(sql);
  await sql`DELETE FROM portfolio_contact WHERE id = ${id}`;
}
