"use server";

import { AccountStatus } from "@prisma/client";
import { createSecureToken, getFutureDate, hashToken } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { consumeAnonymousRateLimit } from "@/lib/rate-limit";
import { getNumberSetting } from "@/lib/settings";
import { forgotPasswordSchema } from "@/lib/validation";

export type ForgotPasswordState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function forgotPasswordAction(
  _state: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim()) {
    return {
      ok: true,
      message: "Si ce compte existe, un lien temporaire a ete prepare.",
    };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Email invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!(await consumeAnonymousRateLimit("password-reset", 5, 15))) {
    return {
      ok: true,
      message: "Si ce compte existe, un lien temporaire a ete prepare.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, firstName: true, status: true },
  });

  if (!user || user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.DELETED) {
    return {
      ok: true,
      message: "Si ce compte existe, un lien temporaire a ete prepare.",
    };
  }

  const recentTokens = await prisma.passwordResetToken.count({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
    },
  });

  if (recentTokens >= 3) {
    return {
      ok: true,
      message: "Si ce compte existe, un lien temporaire a ete prepare.",
    };
  }

  const token = createSecureToken();
  const ttlHours = await getNumberSetting("resetPasswordTokenTtlHours");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: getFutureDate(ttlHours),
    },
  });

  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await deliverLoggedEmail(prisma, {
    to: user.email,
    userId: user.id,
    subject: "Reinitialisez votre mot de passe Bono Trading",
    html: `<p>Bonjour ${escapeHtml(user.firstName)},</p><p>Voici ton lien temporaire de reinitialisation :</p><p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p>`,
  });

  return {
    ok: true,
    message: "Si ce compte existe, un lien temporaire a ete prepare.",
  };
}
