"use server";

import { AccountStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { createSecureToken, getFutureDate, hashPassword, hashToken } from "@/lib/auth";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { trainerAccountSchema } from "@/lib/validation";

export type CreateTrainerState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createTrainerAction(
  _state: CreateTrainerState,
  formData: FormData,
): Promise<CreateTrainerState> {
  const session = await getAuthorizedSession(["admin"]);
  if (!session) {
    return { ok: false, message: "Connexion admin requise." };
  }

  const parsed = trainerAccountSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Compte formateur invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      message: "Un utilisateur existe deja avec cet email.",
      errors: { email: ["Email deja utilise"] },
    };
  }

  const temporaryPassword = createSecureToken(12);
  const resetToken = createSecureToken();
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      role: parsed.data.role as UserRole,
      status: AccountStatus.ACTIVE,
      passwordHash: await hashPassword(temporaryPassword),
      passwordResetTokens: {
        create: {
          tokenHash: hashToken(resetToken),
          expiresAt: getFutureDate(24),
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "TRAINER_CREATED",
      target: user.email,
      metadata: { role: parsed.data.role },
    },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  await deliverLoggedEmail(prisma, {
    to: user.email,
    userId: user.id,
    subject: "Compte formateur School",
    html: `<p>Bonjour ${escapeHtml(user.firstName)},</p><p>Ton compte formateur est cree. Definis ton mot de passe avec ce lien temporaire :</p><p><a href="${escapeHtml(resetUrl)}">Definir mon mot de passe</a></p>`,
  });

  revalidatePath("/admin/users");

  return { ok: true, message: "Formateur cree et email journalise." };
}

export async function setUserStatusAction(formData: FormData) {
  const session = await getAuthorizedSession(["admin"]);
  if (!session) {
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (
    userId === session.userId &&
    (status === AccountStatus.SUSPENDED || status === AccountStatus.DELETED)
  ) {
    redirect("/admin/users?notice=self-protected");
  }

  if (!Object.values(AccountStatus).includes(status as AccountStatus)) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: status as AccountStatus,
      suspendedAt: status === AccountStatus.SUSPENDED ? new Date() : null,
      sessionInvalidatedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "USER_STATUS_UPDATED",
      target: userId,
      metadata: { status },
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?notice=status-updated");
}
