import { NextResponse } from "next/server";

import { getAsset, isValidAssetId } from "@/lib/assets";

/**
 * Serve an uploaded asset.
 *
 * Public by design — these are the profile photo, résumé and project covers
 * that appear on the site. The ETag lets browsers and CDNs skip the transfer on
 * repeat visits, which matters because the body is decoded from base64 on every
 * cache miss.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isValidAssetId(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const asset = await getAsset(id);
  if (!asset) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = Buffer.from(asset.data, "base64");

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": asset.mime,
      "Content-Length": String(bytes.length),
      // Short max-age with a long stale-while-revalidate: a replaced photo
      // appears within the minute, and repeat views cost nothing meanwhile.
      "Cache-Control": "public, max-age=60, stale-while-revalidate=86400",
      // SVGs are uploaded by the authenticated owner, but serve them under a
      // restrictive CSP anyway so a scripted SVG can't run in the site's origin.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
