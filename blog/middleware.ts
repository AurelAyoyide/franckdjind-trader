import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName, verifyAdminToken } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-pathname", pathname);

  const next = () => NextResponse.next({ request: { headers: requestHeaders } });

  if (!pathname.startsWith("/admin")) {
    return next();
  }

  const session = await verifyAdminToken(request.cookies.get(sessionCookieName)?.value);
  const isPublicAuthPage = [
    "/admin/login",
    "/admin/mot-de-passe-oublie",
    "/admin/reinitialiser-mot-de-passe"
  ].includes(pathname);

  if (!session && !isPublicAuthPage) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
