import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes and Next.js internals through
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path);
  const isAuthenticated = request.cookies.has("ygpt-auth");

  // AUTH TEMPORARILY DISABLED — re-enable when login is working
  // if (!isAuthenticated && !isPublic) {
  //   const loginUrl = new URL("/login", request.url);
  //   return NextResponse.redirect(loginUrl);
  // }
  // if (isAuthenticated && pathname === "/login") {
  //   const homeUrl = new URL("/", request.url);
  //   return NextResponse.redirect(homeUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.avif).*)"],
};
