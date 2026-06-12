import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { RichContent } from "@/components/rich-content";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/content";
import { getPublicData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Formations trading",
  description:
    "Formations et accompagnements pour apprendre le trading avec methode, routine et risk management.",
  path: "/formations"
});

export default async function FormationsPage() {
  const { services } = await getPublicData();

  return (
    <>
      <PageHero
        eyebrow="Formations"
        title="Des accompagnements lisibles, centres sur la progression."
        description="Chaque offre doit aider le visiteur a choisir selon son niveau : comprendre, pratiquer, corriger."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {services.map((service, index) => (
            <article className="rounded-lg border border-line bg-surface p-6" key={service.title}>
              <span className="font-mono text-xs font-black text-market">
                0{index + 1}
              </span>
              <h2 className="mt-6 text-2xl font-black leading-tight">{service.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{service.description}</p>
              <p className="mt-4 inline-flex rounded-md border border-line bg-foreground/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-muted">
                {service.priceLabel}
              </p>
              <ul className="mt-6 grid gap-3 text-sm text-muted">
                {["Cadre clair", "Risque explicite", "Suivi oriente action"].map((item) => (
                  <li className="flex items-center gap-2" key={item}>
                    <CheckCircle2 className="h-4 w-4 text-market" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {service.content ? (
                <div className="mt-6 border-t border-line pt-5">
                  <RichContent content={service.content} />
                </div>
              ) : null}
              <div className="mt-7">
                <ButtonLink href={service.ctaUrl || "/contact"} className="w-full" showArrow>
                  {service.ctaLabel || "Demander l'orientation"}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-line bg-background-soft p-6 md:p-8">
          <h2 className="text-2xl font-black">Canaux directs</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Le visiteur peut demander une orientation par formulaire, WhatsApp ou Telegram selon son besoin.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact">Formulaire</ButtonLink>
            <ButtonLink href={siteConfig.whatsappPath} variant="secondary">
              WhatsApp
            </ButtonLink>
            <ButtonLink href={siteConfig.telegramPath} variant="secondary">
              Telegram
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
