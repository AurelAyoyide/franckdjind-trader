import nodemailer from "nodemailer";
import { EmailStatus, type PrismaClient } from "@prisma/client";

type ResendResponse = {
  id?: string;
  message?: string;
};

function getMailFrom() {
  return process.env.CONTACT_FROM_EMAIL ?? process.env.SMTP_FROM ?? "Bono Trading <contact@bonotrading.com>";
}

function getMailBrand() {
  const sender = getMailFrom();
  const match = sender.match(/^\s*"?([^"<]+?)"?\s*</);
  return match?.[1]?.trim() || "Bono Trading";
}

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

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function htmlToText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function renderTransactionalEmail(subject: string, content: string) {
  const brand = escapeHtml(getMailBrand());
  const title = escapeHtml(subject);
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f3f6f1;color:#101512;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f3f6f1;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #d9e0d8;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:28px 32px;background:#08110c;color:#ffffff;">
            <div style="font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#72e7b5;">Formation privee</div>
            <div style="margin-top:10px;font-size:25px;font-weight:800;line-height:1.2;">${brand}</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 18px;font-size:25px;line-height:1.25;color:#101512;">${title}</h1>
            <div style="font-size:15px;line-height:1.75;color:#506159;">${content}</div>
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #e1e7df;background:#f8faf7;font-size:12px;line-height:1.6;color:#728078;">
            Cet email est envoye dans le cadre de votre utilisation de ${brand}. Si vous ne reconnaissez pas cette demande, vous pouvez ignorer ce message ou contacter l&apos;assistance.
            <br />&copy; ${year} ${brand}. Tous droits reserves.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

async function sendWithResend(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getMailFrom(),
      to: [to],
      reply_to: process.env.CONTACT_TO_EMAIL || undefined,
      subject,
      html,
      text: htmlToText(html),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as ResendResponse;
  if (!response.ok) {
    throw new Error(payload.message || `Resend a refuse l'envoi (${response.status}).`);
  }

  return payload;
}

export async function sendTransactionalEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    return sendWithResend(to, subject, html);
  }

  const transporter = createSmtpTransport();
  return transporter.sendMail({
    from: getMailFrom(),
    to,
    replyTo: process.env.CONTACT_TO_EMAIL || undefined,
    subject,
    html,
    text: htmlToText(html),
  });
}

export function hasEmailConfig() {
  return Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && getMailFrom()));
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
  const html = renderTransactionalEmail(input.subject, input.html);

  if (!hasEmailConfig()) {
    console.warn("Email en attente : aucune configuration de livraison n'est disponible.");
    return {
      status: EmailStatus.PENDING,
      logId: log.id,
      skipped: true,
    };
  }

  try {
    await sendTransactionalEmail(input.to, input.subject, html);
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
        error: error instanceof Error ? error.message : "Erreur d'envoi inconnue",
      },
    });

    return {
      status: EmailStatus.FAILED,
      logId: log.id,
      skipped: false,
    };
  }
}
