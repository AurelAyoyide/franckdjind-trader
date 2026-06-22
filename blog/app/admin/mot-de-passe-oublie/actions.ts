"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { hashValue, isSameOriginRequest } from "@/lib/security";

const emailSchema = z.object({
  email: z.string().trim().email().max(160)
});

const resetSchema = z
  .object({
    token: z.string().min(32).max(200),
    password: z.string().min(10).max(200).regex(/[A-Za-z]/).regex(/\d/),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"]
  });

function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://127.0.0.1:3001";

  try {
    const url = new URL(configured);
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export async function requestPasswordResetAction(formData: FormData) {
  const requestHeaders = await headers();

  if (!isSameOriginRequest(requestHeaders)) {
    redirect("/admin/mot-de-passe-oublie?status=invalid");
  }

  const parsed = emailSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    redirect("/admin/mot-de-passe-oublie?status=sent");
  }

  const email = parsed.data.email.toLowerCase();
  const requestKey = hashValue(email);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const requests = await prisma.activityLog.count({
    where: {
      action: "password_reset_requested",
      entity: "auth",
      entityId: requestKey,
      createdAt: { gte: oneHourAgo }
    }
  });

  if (requests >= 3) {
    redirect("/admin/mot-de-passe-oublie?status=sent");
  }

  const user = await prisma.user.findFirst({
    where: { email, status: "ACTIVE" }
  });

  await prisma.activityLog.create({
    data: {
      action: "password_reset_requested",
      entity: "auth",
      entityId: requestKey
    }
  });

  if (user) {
    const baseUrl = siteUrl();
    if (!baseUrl) {
      await prisma.activityLog.create({
        data: { action: "password_reset_email_failed", entity: "auth", entityId: user.id }
      });
      redirect("/admin/mot-de-passe-oublie?status=email-error");
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashValue(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt }
      })
    ]);

    const resetUrl = new URL("/admin/reinitialiser-mot-de-passe", baseUrl);
    resetUrl.searchParams.set("token", token);
    const emailResult = await sendPasswordResetEmail({ email: user.email, resetUrl: resetUrl.toString() });

    await prisma.activityLog.create({
      data: {
        action: emailResult.sent ? "password_reset_email_sent" : "password_reset_email_failed",
        entity: "auth",
        entityId: user.id
      }
    });

    if (!emailResult.sent) {
      redirect("/admin/mot-de-passe-oublie?status=email-error");
    }
  }

  redirect("/admin/mot-de-passe-oublie?status=sent");
}

export async function resetPasswordAction(formData: FormData) {
  const requestHeaders = await headers();

  if (!isSameOriginRequest(requestHeaders)) {
    redirect("/admin/reinitialiser-mot-de-passe?status=invalid");
  }

  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    redirect("/admin/reinitialiser-mot-de-passe?status=invalid");
  }

  const token = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashValue(parsed.data.token),
      usedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (!token) {
    redirect("/admin/reinitialiser-mot-de-passe?status=expired");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: token.userId, id: { not: token.id } } }),
    prisma.activityLog.create({
      data: { action: "password_reset_completed", entity: "auth", entityId: token.userId }
    })
  ]);

  redirect("/admin/login?reset=success");
}
