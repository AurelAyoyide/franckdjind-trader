import { PageHero } from "@/components/page-hero";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function ForgotPasswordPage() {
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <>
      <PageHero
        eyebrow={t("Mot de passe oublie")}
        title={t("Retrouvez l'acces a votre compte.")}
        description={t("Un lien temporaire vous permet de choisir un nouveau mot de passe en toute securite.")}
      />
      <section className="site-shell py-12 md:py-16">
        <ForgotPasswordForm />
      </section>
    </>
  );
}
