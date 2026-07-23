import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { MAX_ASSET_BYTES, isAllowedMime, isValidAssetId, putAsset } from "@/lib/assets";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";

/**
 * Accept a file from the admin panel and store it.
 *
 * Images are already downscaled in the browser before they get here; this
 * enforces the ceiling regardless, because a client-side limit is a convenience
 * and not a control.
 */
export async function POST(request: Request) {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "No database is connected, so there's nowhere to store files. Add DATABASE_URL." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }

  const file = form.get("file");
  const rawId = form.get("id");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was included." }, { status: 400 });
  }

  const id = typeof rawId === "string" ? rawId : "";
  if (!isValidAssetId(id)) {
    return NextResponse.json(
      { error: "Invalid file name. Use lowercase letters, numbers and dashes." },
      { status: 400 },
    );
  }

  if (!isAllowedMime(file.type)) {
    return NextResponse.json(
      { error: `${file.type || "That file type"} isn't supported. Use JPG, PNG, WebP or PDF.` },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_ASSET_BYTES) {
    const limitMb = Math.round(MAX_ASSET_BYTES / (1024 * 1024));
    return NextResponse.json(
      { error: `That file is too large. Keep it under ${limitMb} MB.` },
      { status: 413 },
    );
  }

  try {
    await putAsset({
      id,
      mime: file.type,
      data: buffer.toString("base64"),
      size: buffer.length,
    });
  } catch (error) {
    console.error("[admin] upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not store the file." },
      { status: 500 },
    );
  }

  // A version stamp that changes on every upload. It's stored *as part of the
  // saved URL* on purpose: an asset id is reused when a photo is replaced
  // (avatar stays "avatar"), so without a changing query the URL is identical
  // before and after, and every cache — the browser, the next/image optimiser,
  // any CDN — keeps serving the old picture. That's the "photo won't update"
  // bug. `next.config.ts` allows a query on `/api/asset/**`, so this is safe to
  // render. Cleaning up old versions isn't needed: the row is overwritten in
  // place, only the URL pointing at it changes.
  const versioned = `/api/asset/${id}?v=${Date.now()}`;

  return NextResponse.json({
    ok: true,
    url: versioned,
    previewUrl: versioned,
    size: buffer.length,
  });
}
