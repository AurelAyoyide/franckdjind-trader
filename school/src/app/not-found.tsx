import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { localePath, translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function NotFound() {
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <>
      <PageHero
        eyebrow="404"
        title={t("Page introuvable.")}
        description={t("Le parcours demandé n'existe pas ou n'est pas encore disponible.")}
      />
      <section className="site-shell py-12">
        <ButtonLink href={localePath(locale, "/")} variant="secondary">{t("Retour accueil")}</ButtonLink>
      </section>
    </>
  );
}
