import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function consumeAnonymousRateLimit(scope: string, maxAttempts: number, windowMinutes: number) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const source = forwardedFor || requestHeaders.get("x-real-ip") || "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";
  const key = `rate:${scope}:${fingerprint(`${source}:${userAgent}`)}`;
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const attempts = await prisma.loginAttempt.count({
    where: {
      email: key,
      createdAt: { gte: windowStart },
    },
  });

  if (attempts >= maxAttempts) {
    return false;
  }

  await prisma.loginAttempt.create({
    data: {
      email: key,
      success: false,
    },
  });

  return true;
}
