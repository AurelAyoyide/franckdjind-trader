import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { RegisterForm } from "@/components/register-form";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

const requirements = [
  "Confirmez votre adresse email apres l'inscription",
  "Deposez ensuite votre demande d'acces",
  "Gardez vos coordonnees a jour pour le suivi",
  "Connectez-vous avec la meme adresse email",
];

export default async function RegisterPage() {
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <>
      <PageHero
        eyebrow={locale === "en" ? "Register" : "Inscription"}
        title={t("Creez votre compte.")}
        description={t("Commencez votre parcours avec un compte personnel et securise.")}
      />
      <section className="site-shell grid gap-8 py-12 md:py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-2xl font-black">{t("Les prochaines etapes")}</h2>
          <div className="mt-5 grid gap-3">
            {requirements.map((item) => (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-foreground/[0.04] p-3" key={item}>
                <CheckCircle2 className="h-4 w-4 text-market" aria-hidden="true" />
                <span className="text-sm font-semibold">{t(item)}</span>
              </div>
            ))}
          </div>
        </div>
        <RegisterForm />
      </section>
    </>
  );
}
