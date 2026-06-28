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
        eyebrow={t("Mot de passe oublié")}
        title={t("Retrouvez l'accès à votre compte.")}
        description={t("Un lien temporaire vous permet de choisir un nouveau mot de passe en toute securite.")}
      />
      <section className="site-shell py-12 md:py-16">
        <ForgotPasswordForm />
      </section>
    </>
  );
}
