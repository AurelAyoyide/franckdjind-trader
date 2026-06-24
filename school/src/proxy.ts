import { NextResponse, type NextRequest } from "next/server";
import { localeFromPath } from "@/lib/i18n";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const language = request.nextUrl.searchParams.get("lang");

  if (language === "fr") {
    const destination = request.nextUrl.clone();
    destination.searchParams.delete("lang");
    return NextResponse.redirect(destination);
  }

  const pathLocale = localeFromPath(pathname);
  const normalizedPath = pathLocale.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-school-pathname", normalizedPath);

  if (pathLocale.locale !== "en") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const destination = request.nextUrl.clone();
  destination.pathname = normalizedPath;
  requestHeaders.set("x-school-locale", "en");
  return NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)",
  ],
};
