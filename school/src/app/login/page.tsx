import { ShieldCheck, UserPlus } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { LoginForm } from "@/components/login-form";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

const errorMessages: Record<string, string> = {
  invalid: "Renseigne un email valide et ton mot de passe.",
  credentials: "Email ou mot de passe incorrect.",
  suspended: "Ce compte est suspendu. Contacte l'administrateur.",
  email: "Valide ton email avant de te connecter.",
  locked: "Trop de tentatives. Réessaie dans quelques minutes.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; reset?: string }>;
}) {
  const { error, next, reset } = await searchParams;
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);
  const errorMessage = error ? t(errorMessages[error] ?? "Connexion impossible pour le moment.") : null;

  return (
    <>
      <PageHero
        eyebrow={t("Connexion")}
        title={t("Retrouvez votre espace.")}
        description={t("Accédez à vos formations, vos documents et à votre suivi depuis un point unique.")}
      />
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-line bg-surface p-6">
            <ShieldCheck className="h-6 w-6 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">{t("Accès sécurisé")}</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {t("Votre espace affiche uniquement les informations et les actions associées à votre parcours.")}
            </p>
            <div className="mt-6 rounded-lg border border-line bg-foreground/[0.04] p-4">
              <UserPlus className="h-5 w-5 text-cyan" aria-hidden="true" />
              <h3 className="mt-3 text-base font-black">{t("Première visite ?")}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                {t("Créez votre compte, confirmez votre adresse email, puis déposez votre demande d'accès.")}
              </p>
            </div>
          </div>

          <LoginForm errorMessage={errorMessage} next={next} reset={reset} />
        </div>
      </section>
    </>
  );
}
