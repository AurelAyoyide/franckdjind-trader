import { AccountStatus, type UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  decryptSession,
  prismaRoleToAppRole,
  roleHome,
  SESSION_COOKIE,
  type AppRole,
  type AppSession,
} from "@/lib/session-core";
import { getAppSession } from "@/lib/session";

type AuthorizedSession = AppSession & {
  userId: string;
  email: string;
  name: string;
  role: AppRole;
  prismaRole: UserRole;
};

function isAllowed(role: AppRole, allowedRoles: AppRole[]) {
  return allowedRoles.includes(role);
}

export async function validateSession(
  session: AppSession | null,
  allowedRoles: AppRole[],
): Promise<AuthorizedSession | null> {
  if (!session?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      sessionInvalidatedAt: true,
    },
  });

  if (
    !user ||
    user.status === AccountStatus.SUSPENDED ||
    user.status === AccountStatus.DELETED ||
    user.status === AccountStatus.EMAIL_PENDING
  ) {
    return null;
  }

  if (
    user.sessionInvalidatedAt &&
    (!session.issuedAt || session.issuedAt * 1000 + 1000 < user.sessionInvalidatedAt.getTime())
  ) {
    return null;
  }

  const role = prismaRoleToAppRole(user.role);

  if (!isAllowed(role, allowedRoles)) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    role,
    prismaRole: user.role,
  };
}

export async function getAuthorizedSession(allowedRoles: AppRole[]) {
  return validateSession(await getAppSession(), allowedRoles);
}

export async function requirePageSession(allowedRoles: AppRole[], next: string) {
  const rawSession = await getAppSession();
  const session = await validateSession(rawSession, allowedRoles);

  if (session) {
    return session;
  }

  if (rawSession?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: rawSession.userId },
      select: { role: true, status: true },
    });

    if (user?.status === AccountStatus.SUSPENDED || user?.status === AccountStatus.DELETED) {
      redirect("/login?error=suspended");
    }

    if (user?.status === AccountStatus.EMAIL_PENDING) {
      redirect("/verify-email");
    }

    if (user) {
      redirect(roleHome[prismaRoleToAppRole(user.role)]);
    }
  }

  redirect(`/login?next=${encodeURIComponent(next)}`);
}

export async function getRequestAuthorizedSession(request: NextRequest, allowedRoles: AppRole[]) {
  return validateSession(await decryptSession(request.cookies.get(SESSION_COOKIE)?.value), allowedRoles);
}
