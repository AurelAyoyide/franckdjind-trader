import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  // A relative Location preserves the host actually used by the browser
  // (localhost or 127.0.0.1) instead of switching origin during logout.
  response.headers.set("Location", "/login");
  response.cookies.delete(SESSION_COOKIE);

  return response;
}
