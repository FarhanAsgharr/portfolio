import "server-only";

import { ensureSchema, getSql } from "@/lib/db";

/**
 * Uploaded files (profile photo, résumé, project covers) stored in Postgres.
 *
 * Base64 in a table rather than S3 or Vercel Blob, because those would each add
 * an account, a set of credentials and a second failure mode to a site whose
 * entire asset payload is one photo, one PDF and a handful of covers. Images
 * are downscaled in the browser before upload and hard-capped below, so a row
 * stays in the low hundreds of kilobytes.
 *
 * If this ever grows into a real media library, swap the two functions here for
 * a storage SDK — `/api/asset/[id]` is the only consumer.
 */

/** 4 MB of base64 ≈ 3 MB of file. Comfortably above a photo or a résumé. */
export const MAX_ASSET_BYTES = 4 * 1024 * 1024;

export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "application/pdf",
] as const;

export interface StoredAsset {
  id: string;
  mime: string;
  data: string;
  size: number;
}

export function isAllowedMime(mime: string): boolean {
  return (ALLOWED_MIME as readonly string[]).includes(mime);
}

/**
 * Asset ids appear in URLs, so constrain them to something that can't traverse
 * a path or collide with a route.
 */
export function isValidAssetId(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(id);
}

export async function getAsset(id: string): Promise<StoredAsset | null> {
  const sql = getSql();
  if (!sql || !isValidAssetId(id)) return null;

  try {
    await ensureSchema(sql);
    const rows = await sql<StoredAsset[]>`
      SELECT id, mime, data, size FROM portfolio_assets WHERE id = ${id}
    `;
    return rows[0] ?? null;
  } catch (error) {
    console.error("[assets] read failed:", error);
    return null;
  }
}

export async function putAsset(asset: StoredAsset): Promise<void> {
  const sql = getSql();
  if (!sql) {
    throw new Error("No database configured. Set DATABASE_URL to upload files — see README.md.");
  }

  await ensureSchema(sql);
  await sql`
    INSERT INTO portfolio_assets (id, mime, data, size, updated_at)
    VALUES (${asset.id}, ${asset.mime}, ${asset.data}, ${asset.size}, now())
    ON CONFLICT (id) DO UPDATE
      SET mime = EXCLUDED.mime,
          data = EXCLUDED.data,
          size = EXCLUDED.size,
          updated_at = now()
  `;
}

export async function listAssets(): Promise<Array<Omit<StoredAsset, "data">>> {
  const sql = getSql();
  if (!sql) return [];

  try {
    await ensureSchema(sql);
    return await sql<Array<Omit<StoredAsset, "data">>>`
      SELECT id, mime, size FROM portfolio_assets ORDER BY updated_at DESC
    `;
  } catch {
    return [];
  }
}

export async function deleteAsset(id: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema(sql);
  await sql`DELETE FROM portfolio_assets WHERE id = ${id}`;
}
