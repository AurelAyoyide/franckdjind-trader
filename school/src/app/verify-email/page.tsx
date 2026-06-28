import { MailCheck } from "lucide-react";
import { AccountStatus } from "@prisma/client";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { hashToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { localePath, translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

async function verifyToken(token?: string) {
  if (!token) {
    return {
      ok: false,
      title: "Lien de validation envoyé",
      message: "Ouvre le lien reçu par email pour valider ton compte.",
    };
  }

  const tokenHash = hashToken(token);
  const verification = await prisma.verificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
    return {
      ok: false,
      title: "Lien invalide ou expiré",
      message: "Demande un nouveau lien de validation puis recommence.",
    };
  }

  if (verification.user.status !== AccountStatus.EMAIL_PENDING) {
    return {
      ok: verification.user.status !== AccountStatus.SUSPENDED,
      title: "Lien déjà traité",
      message: "Ce lien ne peut plus modifier le compte.",
    };
  }

  await prisma.$transaction([
    prisma.verificationToken.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    }),
    prisma.verificationToken.updateMany({
      where: {
        userId: verification.userId,
        usedAt: null,
        id: { not: verification.id },
      },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: verification.userId },
      data: { status: AccountStatus.EMAIL_VERIFIED },
    }),
    prisma.auditLog.create({
      data: {
        actorId: verification.userId,
        action: "EMAIL_VERIFIED",
        target: verification.user.email,
      },
    }),
  ]);

  return {
    ok: true,
    title: "Email validé",
    message: "Ton email est confirmé. Tu peux maintenant te connecter et demander l'accès à une formation.",
  };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const state = await verifyToken(token);
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <>
      <PageHero
        eyebrow={t("Validation email")}
        title={t(state.ok ? "Compte valide." : "Vérifier son email avant toute demande.")}
        description={t("Le token est stocké haché, expire selon les paramètres globaux et ne peut pas être rejoué.")}
      />
      <section className="site-shell py-12 md:py-16">
        <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
          <MailCheck className="h-6 w-6 text-market" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-black">{t(state.title)}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            {t(state.message)}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, state.ok ? "/login" : "/register")} showArrow>
              {t(state.ok ? "Se connecter" : "Créer un compte")}
            </ButtonLink>
            <ButtonLink href={localePath(locale, "/register")} variant="secondary">
              {t("Renvoyer un lien")}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
