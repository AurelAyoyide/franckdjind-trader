import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getActionLink, recordLinkClick } from "@/lib/data-store";
import { getClientIp, hashValue, isSafeActionUrl, isSafeInternalPath } from "@/lib/security";

type GoRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: GoRouteProps) {
  const { slug } = await params;
  const link = await getActionLink(slug);

  if (!link || !isSafeActionUrl(link.url)) {
    return NextResponse.redirect(new URL("/contact", request.url));
  }

  const requestHeaders = await headers();
  const ip = getClientIp(requestHeaders);

  await recordLinkClick(link.id, {
    ipHash: hashValue(ip),
    userAgent: requestHeaders.get("user-agent") ?? undefined,
    referrer: requestHeaders.get("referer") ?? undefined
  });

  return NextResponse.redirect(isSafeInternalPath(link.url) ? new URL(link.url, request.url) : link.url);
}
