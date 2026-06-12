import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName, verifyAdminToken } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = await verifyAdminToken(request.cookies.get(sessionCookieName)?.value);
  const isLoginPage = pathname === "/admin/login";

  if (!session && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
