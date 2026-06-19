import nodemailer from "nodemailer";
import { EmailStatus, type PrismaClient } from "@prisma/client";

export function createSmtpTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
  });
}

export async function sendTransactionalEmail(to: string, subject: string, html: string) {
  const transporter = createSmtpTransport();

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}

export function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function createEmailLog(
  prisma: PrismaClient,
  input: {
    to: string;
    subject: string;
    userId?: string;
    status?: EmailStatus;
    error?: string;
  },
) {
  return prisma.emailLog.create({
    data: {
      to: input.to,
      subject: input.subject,
      userId: input.userId,
      status: input.status ?? EmailStatus.PENDING,
      error: input.error,
      sentAt: input.status === EmailStatus.SENT ? new Date() : undefined,
    },
  });
}

export async function deliverLoggedEmail(
  prisma: PrismaClient,
  input: {
    to: string;
    subject: string;
    html: string;
    userId?: string;
  },
) {
  const log = await createEmailLog(prisma, input);

  if (!hasSmtpConfig()) {
    return {
      status: EmailStatus.PENDING,
      logId: log.id,
      skipped: true,
    };
  }

  try {
    await sendTransactionalEmail(input.to, input.subject, input.html);
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    });

    return {
      status: EmailStatus.SENT,
      logId: log.id,
      skipped: false,
    };
  } catch (error) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: EmailStatus.FAILED,
        error: error instanceof Error ? error.message : "Erreur SMTP inconnue",
      },
    });

    return {
      status: EmailStatus.FAILED,
      logId: log.id,
      skipped: false,
    };
  }
}
