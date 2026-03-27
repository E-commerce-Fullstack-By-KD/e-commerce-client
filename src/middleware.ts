import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEYS } from "@/lib/constants";

/** Paths that do NOT need auth */
const PUBLIC_PATHS = ["/", "/login", "/signup", "/verify"];

/** Paths that logged-in users should NOT see */
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

  const token    = request.cookies.get(STORAGE_KEYS.TOKEN)?.value;
  const userRole = request.cookies.get("user_role")?.value;          // "admin" | "user"

  // ── 1. Logged-in user hits /login or /signup → send home ──
  if (token && isAuthOnly(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ── 2. Unauthenticated user hits a protected route → login ──
  if (!token && !isPublic(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Non-admin user hits /admin/* → home ──
  if (token && pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except Next.js internals and static assets
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
