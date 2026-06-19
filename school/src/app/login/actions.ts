"use server";

import { AccountStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prismaRoleToAppRole, roleHome, setAppSession } from "@/lib/session";
import { getNumberSetting } from "@/lib/settings";
import { loginSchema } from "@/lib/validation";

function getSafeNext(value: string | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
    rememberMe: formData.get("rememberMe"),
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const [maxAttempts, windowMinutes] = await Promise.all([
    getNumberSetting("securityMaxLoginAttempts"),
    getNumberSetting("securityLoginWindowMinutes"),
  ]);
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      email: parsed.data.email,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  if (failedAttempts >= maxAttempts) {
    await prisma.auditLog.create({
      data: {
        action: "LOGIN_LOCKED",
        target: parsed.data.email,
        metadata: { failedAttempts, windowMinutes },
      },
    });
    redirect("/login?error=locked");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      passwordHash: true,
      role: true,
      status: true,
    },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await prisma.loginAttempt.create({
      data: {
        email: parsed.data.email,
        userId: user?.id,
        success: false,
      },
    });
    await prisma.auditLog.create({
      data: {
        actorId: user?.id,
        action: "LOGIN_FAILED",
        target: parsed.data.email,
      },
    });
    redirect("/login?error=credentials");
  }

  if (user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.DELETED) {
    redirect("/login?error=suspended");
  }

  if (user.status === AccountStatus.EMAIL_PENDING) {
    redirect("/login?error=email");
  }

  const role = prismaRoleToAppRole(user.role);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await prisma.loginAttempt.create({
    data: {
      email: user.email,
      userId: user.id,
      success: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "LOGIN_SUCCESS",
      target: user.email,
    },
  });

  await setAppSession(
    {
      userId: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      role,
    },
    parsed.data.rememberMe === "on" ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
  );

  redirect(getSafeNext(parsed.data.next, roleHome[role]));
}
