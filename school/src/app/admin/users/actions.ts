"use server";

import { AccountStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAuthorizedSession } from "@/lib/authorization";
import { createSecureToken, getFutureDate, hashPassword, hashToken } from "@/lib/auth";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { trainerAccountSchema } from "@/lib/validation";
import { getRequestLocale } from "@/lib/i18n-server";
import { localePath } from "@/lib/i18n";

export type CreateTrainerState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

const userUpdateSchema = z.object({
  userId: z.string().min(1),
  firstName: z.string().trim().min(1, "Le prenom est requis.").max(80),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(80),
  email: z.string().trim().email("Email invalide.").max(160),
  phone: z.string().trim().max(40).optional(),
  role: z.enum([UserRole.STUDENT, UserRole.MAIN_TRAINER, UserRole.ASSISTANT_TRAINER]),
});

async function adminUsersPath(notice: string) {
  const locale = await getRequestLocale();
  return `${localePath(locale, "/admin/users")}?notice=${notice}`;
}

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
    subject: "Votre compte formateur Bono Trading",
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
    redirect(await adminUsersPath("self-protected"));
  }

  if (!Object.values(AccountStatus).includes(status as AccountStatus)) {
    return;
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) {
    redirect(await adminUsersPath("not-found"));
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
  redirect(await adminUsersPath(status === AccountStatus.DELETED ? "deactivated" : "status-updated"));
}

export async function updateUserAction(formData: FormData) {
  const session = await getAuthorizedSession(["admin"]);
  if (!session) {
    redirect(await adminUsersPath("auth-required"));
  }

  const parsed = userUpdateSchema.safeParse({
    userId: formData.get("userId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect(await adminUsersPath("invalid-user"));
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, role: true },
  });

  if (!target) {
    redirect(await adminUsersPath("not-found"));
  }

  if (target.role === UserRole.SUPER_ADMIN && target.id !== session.userId) {
    redirect(await adminUsersPath("super-admin-protected"));
  }

  if (target.email !== parsed.data.email) {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
    if (existing && existing.id !== target.id) {
      redirect(await adminUsersPath("email-in-use"));
    }
  }

  const role = target.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : parsed.data.role;
  await prisma.user.update({
    where: { id: target.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      role,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "USER_UPDATED",
      target: target.id,
      metadata: { role },
    },
  });

  revalidatePath("/admin/users");
  redirect(await adminUsersPath("user-updated"));
}
