import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Paths that DO NOT require authentication.
 * Checked with startsWith so nested paths (e.g. /verify?token=...) are covered.
 */
const PUBLIC_PATHS = ["/", "/login", "/signup", "/verify"];

/**
 * Paths that authenticated users should NOT see (redirect them home).
 */
const AUTH_ONLY_PATHS = ["/login", "/signup"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "?") || pathname.startsWith(p + "/"),
  );
}

function isAuthOnly(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read JWT from cookie — auth-context sets this on login, removes on logout
  const token = request.cookies.get(STORAGE_KEYS.TOKEN)?.value;

  // Logged-in user visits /login or /signup → send home
  if (token && isAuthOnly(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated user visits a protected route → send to login
  if (!token && !isPublic(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except Next.js internals and static assets
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
