"use server";

import { AccountStatus, UserRole } from "@prisma/client";
import { registrationSchema } from "@/lib/validation";
import { getAppUrl } from "@/lib/app-url";
import { createSecureToken, getFutureDate, hashPassword, hashToken } from "@/lib/auth";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { consumeAnonymousRateLimit } from "@/lib/rate-limit";
import { getNumberSetting } from "@/lib/settings";

export type RegistrationState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function registerAction(
  _state: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim()) {
    return {
      ok: true,
      message: "Si l'inscription est possible, un lien de validation a ete prepare.",
    };
  }

  const parsed = registrationSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptedTerms: formData.get("acceptedTerms"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Corrige les champs signales avant de continuer.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!(await consumeAnonymousRateLimit("register", 5, 15))) {
    return {
      ok: true,
      message: "Si l'inscription est possible, un lien de validation a ete prepare.",
    };
  }

  const ttlHours = await getNumberSetting("emailTokenTtlHours");
  const expiresAt = getFutureDate(ttlHours);
  const appUrl = getAppUrl();
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, firstName: true, status: true },
  });

  if (existing) {
    if (existing.status === AccountStatus.EMAIL_PENDING) {
      const recentTokens = await prisma.verificationToken.count({
        where: {
          userId: existing.id,
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
      });

      if (recentTokens < 3) {
        const verificationToken = createSecureToken();
        await prisma.$transaction([
          prisma.verificationToken.updateMany({
            where: {
              userId: existing.id,
              usedAt: null,
            },
            data: { usedAt: new Date() },
          }),
          prisma.verificationToken.create({
            data: {
              userId: existing.id,
              tokenHash: hashToken(verificationToken),
              expiresAt,
            },
          }),
        ]);

        const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;
        await deliverLoggedEmail(prisma, {
          to: existing.email,
          userId: existing.id,
          subject: "Confirmez votre email Bono Trading",
          html: `<p>Bonjour ${escapeHtml(existing.firstName)},</p><p>Valide ton email en ouvrant ce lien temporaire :</p><p><a href="${escapeHtml(verifyUrl)}">${escapeHtml(verifyUrl)}</a></p>`,
        });
      }
    }

    return {
      ok: true,
      message: "Si l'inscription est possible, un lien de validation a ete prepare.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const verificationToken = createSecureToken();
  const verificationTokenHash = hashToken(verificationToken);

  const user = await prisma.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: UserRole.STUDENT,
      status: AccountStatus.EMAIL_PENDING,
      verificationTokens: {
        create: {
          tokenHash: verificationTokenHash,
          expiresAt,
        },
      },
      auditLogs: {
        create: {
          action: "USER_REGISTERED",
          target: parsed.data.email,
          metadata: { status: AccountStatus.EMAIL_PENDING },
        },
      },
    },
  });

  const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  await deliverLoggedEmail(prisma, {
    to: user.email,
    userId: user.id,
    subject: "Confirmez votre email Bono Trading",
    html: `<p>Bonjour ${escapeHtml(user.firstName)},</p><p>Valide ton email en ouvrant ce lien temporaire :</p><p><a href="${escapeHtml(verifyUrl)}">${escapeHtml(verifyUrl)}</a></p>`,
  });

  return {
    ok: true,
    message: "Si l'inscription est possible, un lien de validation a ete prepare.",
  };
}
