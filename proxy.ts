import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, isAuthConfigured, verifySessionToken } from "@/lib/auth";

/**
 * Gate everything under /admin.
 *
 * Runs before the page or route handler, so an unauthenticated request never
 * reaches code that can read or write content. The API routes verify the
 * session again themselves — this is the first line, not the only one.
 *
 * Named `proxy.ts` rather than `middleware.ts`: Next 16 renamed the convention
 * and warns on the old name.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page and its endpoint have to stay reachable, or there's no way in.
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // No password set means the admin panel isn't configured. Send visitors to
  // the login page, which explains what to do rather than failing opaquely.
  if (!isAuthConfigured()) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const authenticated = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!authenticated) {
    // API callers get a status code; browsers get the login page with a
    // `next` param so they land back where they were headed.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
