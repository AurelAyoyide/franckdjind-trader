import { NextResponse, type NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE } from "@/lib/session-core";

const protectedPrefixes = [
  { prefix: "/student", role: "student", fallback: "/student/dashboard" },
  { prefix: "/trainer", role: "trainer", fallback: "/trainer/dashboard" },
  { prefix: "/admin", role: "admin", fallback: "/admin/dashboard" },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matched = protectedPrefixes.find((item) => pathname.startsWith(item.prefix));

  if (!matched) {
    return NextResponse.next();
  }

  const session = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== matched.role) {
    const ownSpace = protectedPrefixes.find((item) => item.role === session.role)?.fallback ?? "/login";
    return NextResponse.redirect(new URL(ownSpace, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)",
  ],
};
