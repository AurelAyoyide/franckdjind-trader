"use server";

import { revalidatePath } from "next/cache";
import { getAuthorizedSession } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { upsertSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/validation";

export type SettingsState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function saveSettingsAction(
  _state: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = settingsSchema.safeParse({
    platformName: formData.get("platformName"),
    platformLogoUrl: formData.get("platformLogoUrl"),
    primaryColor: formData.get("primaryColor"),
    smtpHost: formData.get("smtpHost"),
    smtpFrom: formData.get("smtpFrom"),
    whatsappNumber: formData.get("whatsappNumber"),
    legalPublisherName: formData.get("legalPublisherName"),
    legalContactEmail: formData.get("legalContactEmail"),
    legalAddress: formData.get("legalAddress"),
    legalRegistrationNumber: formData.get("legalRegistrationNumber"),
    hostingProvider: formData.get("hostingProvider"),
    emailTokenTtlHours: formData.get("emailTokenTtlHours"),
    resetPasswordTokenTtlHours: formData.get("resetPasswordTokenTtlHours"),
    remindersEnabled: formData.get("remindersEnabled"),
    reminderCooldownDays: formData.get("reminderCooldownDays"),
    reminderMaxEmailsPerWeek: formData.get("reminderMaxEmailsPerWeek"),
    certificatePrefix: formData.get("certificatePrefix"),
    maxPrivateUploadMb: formData.get("maxPrivateUploadMb"),
    securityMaxLoginAttempts: formData.get("securityMaxLoginAttempts"),
    securityLoginWindowMinutes: formData.get("securityLoginWindowMinutes"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Certains parametres sont invalides.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const session = await getAuthorizedSession(["admin"]);

  if (!session) {
    return {
      ok: false,
      message: "Connexion admin requise.",
    };
  }

  await upsertSettings({
    platformName: parsed.data.platformName,
    platformLogoUrl: parsed.data.platformLogoUrl ?? "",
    primaryColor: parsed.data.primaryColor,
    smtpHost: parsed.data.smtpHost ?? "",
    smtpFrom: parsed.data.smtpFrom ?? "",
    whatsappNumber: parsed.data.whatsappNumber,
    legalPublisherName: parsed.data.legalPublisherName,
    legalContactEmail: parsed.data.legalContactEmail ?? "",
    legalAddress: parsed.data.legalAddress,
    legalRegistrationNumber: parsed.data.legalRegistrationNumber ?? "",
    hostingProvider: parsed.data.hostingProvider ?? "",
    emailTokenTtlHours: String(parsed.data.emailTokenTtlHours),
    resetPasswordTokenTtlHours: String(parsed.data.resetPasswordTokenTtlHours),
    remindersEnabled: parsed.data.remindersEnabled,
    reminderCooldownDays: String(parsed.data.reminderCooldownDays),
    reminderMaxEmailsPerWeek: String(parsed.data.reminderMaxEmailsPerWeek),
    certificatePrefix: parsed.data.certificatePrefix,
    maxPrivateUploadMb: String(parsed.data.maxPrivateUploadMb),
    securityMaxLoginAttempts: String(parsed.data.securityMaxLoginAttempts),
    securityLoginWindowMinutes: String(parsed.data.securityLoginWindowMinutes),
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "SETTINGS_UPDATED",
      target: "global",
      metadata: {
        keys: [
          "platformName",
          "platformLogoUrl",
          "primaryColor",
          "smtpHost",
          "smtpFrom",
          "whatsappNumber",
          "legalPublisherName",
          "legalContactEmail",
          "legalAddress",
          "legalRegistrationNumber",
          "hostingProvider",
          "emailTokenTtlHours",
          "resetPasswordTokenTtlHours",
          "remindersEnabled",
          "reminderCooldownDays",
          "reminderMaxEmailsPerWeek",
          "certificatePrefix",
          "maxPrivateUploadMb",
          "securityMaxLoginAttempts",
          "securityLoginWindowMinutes",
        ],
      },
    },
  });

  revalidatePath("/admin/settings");

  return {
    ok: true,
    message: "Parametres enregistres.",
  };
}
