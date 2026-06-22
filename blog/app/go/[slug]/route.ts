import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getActionLink, recordLinkClick } from "@/lib/data-store";
import { getClientIp, hashValue, isSafeActionUrl, isSafeInternalPath } from "@/lib/security";
import { prisma } from "@/lib/prisma";

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
  const ipHash = hashValue(ip);
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentClicks = await prisma.linkClick.count({
    where: {
      actionLinkId: link.id,
      ipHash,
      createdAt: { gte: oneMinuteAgo }
    }
  });

  if (recentClicks >= 30) {
    return NextResponse.redirect(new URL("/contact", request.url));
  }

  await recordLinkClick(link.id, {
    ipHash,
    userAgent: requestHeaders.get("user-agent") ?? undefined,
    referrer: requestHeaders.get("referer") ?? undefined
  });

  return NextResponse.redirect(isSafeInternalPath(link.url) ? new URL(link.url, request.url) : link.url);
}
