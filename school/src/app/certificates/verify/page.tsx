import { PageHero } from "@/components/page-hero";
import { CertificateLookupForm } from "@/components/certificate-lookup-form";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function CertificateLookupPage() {
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <>
      <PageHero
        eyebrow={t("Certificat")}
        title={t("Verifier une preuve de fin de formation.")}
        description={t("La verification publique confirme le code du certificat sans ouvrir l'espace prive de l'apprenant.")}
      />
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <CertificateLookupForm />
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-2xl font-black">{t("Ce que tu peux confirmer")}</h2>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-muted">
              <p className="rounded-lg border border-line bg-foreground/[0.04] p-3">{t("Le code du certificat.")}</p>
              <p className="rounded-lg border border-line bg-foreground/[0.04] p-3">{t("La formation associee.")}</p>
              <p className="rounded-lg border border-line bg-foreground/[0.04] p-3">{t("La date d'emission.")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
