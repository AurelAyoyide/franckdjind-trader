import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { AccountStatus, EmailStatus, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getAppUrl } from "../src/lib/app-url";
import { deliverLoggedEmail, escapeHtml } from "../src/lib/mail";

const prisma = new PrismaClient();

function loadEnvironmentFile(path: string, override = false) {
  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || (!override && process.env[match[1]])) {
      continue;
    }

    const value = match[2]?.replace(/^(["'])(.*)\1$/, "$2") ?? "";
    process.env[match[1]] = value;
  }
}

loadEnvironmentFile(".env");
loadEnvironmentFile(".env.local", true);

function createToken() {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function main() {
  if (!process.env.RESEND_API_KEY && !process.env.SMTP_HOST) {
    throw new Error("Configurez Resend ou SMTP avant de creer le super-admin.");
  }

  const email = (process.env.INITIAL_ADMIN_EMAIL ?? process.env.CONTACT_TO_EMAIL ?? "contact@bonotrading.com")
    .trim()
    .toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existing?.role === UserRole.SUPER_ADMIN) {
    console.info("Le super-admin cible existe deja. Aucun mot de passe n'a ete modifie.");
    return;
  }

  const temporaryPassword = randomBytes(48).toString("base64url");
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  const resetToken = createToken();
  const resetExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    await transaction.user.updateMany({
      where: {
        email: { in: ["admin@example.com", "formateur@example.com", "apprenant@example.com"] },
      },
      data: {
        status: AccountStatus.DELETED,
        sessionInvalidatedAt: now,
      },
    });

    const admin = existing
      ? await transaction.user.update({
          where: { id: existing.id },
          data: {
            firstName: "Bono",
            lastName: "Trading",
            phone: process.env.CONTACT_WHATSAPP_NUMBER ?? "22961835529",
            passwordHash,
            role: UserRole.SUPER_ADMIN,
            status: AccountStatus.ACTIVE,
            sessionInvalidatedAt: now,
          },
        })
      : await transaction.user.create({
          data: {
            email,
            firstName: "Bono",
            lastName: "Trading",
            phone: process.env.CONTACT_WHATSAPP_NUMBER ?? "22961835529",
            passwordHash,
            role: UserRole.SUPER_ADMIN,
            status: AccountStatus.ACTIVE,
          },
        });

    await transaction.passwordResetToken.updateMany({
      where: { userId: admin.id, usedAt: null },
      data: { usedAt: now },
    });
    await transaction.passwordResetToken.create({
      data: {
        userId: admin.id,
        tokenHash: hashToken(resetToken),
        expiresAt: resetExpiresAt,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: admin.id,
        action: "SUPER_ADMIN_BOOTSTRAPPED",
        target: email,
      },
    });
  });

  const emailResult = await deliverLoggedEmail(prisma, {
    to: email,
    subject: "Activez votre acces administrateur Bono Trading",
    html: `<p>Bonjour,</p><p>Votre compte super-administrateur Bono Trading est pret.</p><p><a href="${escapeHtml(resetUrl)}">Definir mon mot de passe</a></p><p>Ce lien est valable pendant deux heures. Si vous n&apos;etes pas a l&apos;origine de cette demande, ignorez cet email.</p>`,
  });

  if (emailResult.status !== EmailStatus.SENT) {
    console.warn("Le compte a ete cree, mais l'email d'activation n'a pas ete confirme comme envoye.");
    return;
  }

  console.info("Le compte super-admin a ete cree et l'email d'activation a ete envoye.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
