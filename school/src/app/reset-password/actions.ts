"use server";

import { redirect } from "next/navigation";
import { hashPassword, hashToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

export type ResetPasswordState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function resetPasswordAction(
  _state: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Mot de passe invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return {
      ok: false,
      message: "Lien invalide ou expire.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        sessionInvalidatedAt: new Date(),
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: { not: resetToken.id },
      },
      data: { usedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        actorId: resetToken.userId,
        action: "PASSWORD_RESET",
        target: "self",
      },
    }),
  ]);

  redirect("/login?reset=1");
}
