import { prisma } from "@/lib/prisma";

export const defaultSettings = {
  platformName: process.env.PLATFORM_NAME ?? "School",
  platformLogoUrl: process.env.PLATFORM_LOGO_URL ?? "",
  primaryColor: process.env.PLATFORM_PRIMARY_COLOR ?? "#17c985",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "School <no-reply@example.com>",
  whatsappNumber: process.env.CONTACT_WHATSAPP_NUMBER ?? process.env.TRAINER_WHATSAPP_NUMBER ?? "22961835529",
  legalPublisherName: process.env.LEGAL_PUBLISHER_NAME ?? "Bono Trading",
  legalContactEmail: process.env.LEGAL_CONTACT_EMAIL ?? process.env.CONTACT_TO_EMAIL ?? "",
  legalAddress: process.env.LEGAL_ADDRESS ?? "Benin",
  legalRegistrationNumber: process.env.LEGAL_REGISTRATION_NUMBER ?? "",
  hostingProvider: process.env.HOSTING_PROVIDER ?? "",
  emailTokenTtlHours: process.env.EMAIL_TOKEN_TTL_HOURS ?? "24",
  resetPasswordTokenTtlHours: process.env.RESET_PASSWORD_TOKEN_TTL_HOURS ?? "2",
  remindersEnabled: process.env.REMINDERS_ENABLED ?? "true",
  reminderCooldownDays: process.env.REMINDER_COOLDOWN_DAYS ?? "3",
  reminderMaxEmailsPerWeek: process.env.REMINDER_MAX_EMAILS_PER_WEEK ?? "3",
  certificatePrefix: process.env.CERTIFICATE_PREFIX ?? "SCH",
  maxPrivateUploadMb: process.env.MAX_PRIVATE_UPLOAD_MB ?? "200",
  securityMaxLoginAttempts: process.env.SECURITY_MAX_LOGIN_ATTEMPTS ?? "5",
  securityLoginWindowMinutes: process.env.SECURITY_LOGIN_WINDOW_MINUTES ?? "15",
};

export type SettingKey = keyof typeof defaultSettings;

export async function getSettingsMap() {
  const rows = await prisma.setting.findMany();
  const values = { ...defaultSettings };

  for (const row of rows) {
    if (row.key in values) {
      values[row.key as SettingKey] = row.value;
    }
  }

  return values;
}

export async function getSetting(key: SettingKey) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? defaultSettings[key];
}

export async function getNumberSetting(key: SettingKey) {
  const value = Number(await getSetting(key));
  const fallback = Number(defaultSettings[key]);
  return Number.isFinite(value) ? value : fallback;
}

export async function upsertSettings(values: Record<SettingKey, string>) {
  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
}
