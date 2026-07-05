import { PageHero } from "@/components/page-hero";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { LocaleProvider } from "@/components/locale-provider";
import { ButtonLink } from "@/components/ui/button-link";
import { localePath, translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <>
      <PageHero
        eyebrow={t("Nouveau mot de passe")}
        title={t("Définir un nouveau mot de passe.")}
        description={t("Choisissez un mot de passe solide, puis reconnectez-vous à votre espace.")}
      />
      <section className="site-shell py-12 md:py-16">
        {token ? (
          <LocaleProvider locale={locale}>
            <ResetPasswordForm token={token} />
          </LocaleProvider>
        ) : (
          <div className="max-w-2xl rounded-lg border border-line bg-surface p-6">
            <h2 className="text-2xl font-black">{t("Lien manquant")}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{t("Demande un nouveau lien de réinitialisation.")}</p>
            <div className="mt-6">
              <ButtonLink href={localePath(locale, "/forgot-password")} showArrow>
                {t("Demander un lien")}
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
