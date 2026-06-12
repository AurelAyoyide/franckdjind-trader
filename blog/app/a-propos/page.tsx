import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { RichContent } from "@/components/rich-content";
import { ButtonLink } from "@/components/ui/button-link";
import { readData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "A propos",
  description:
    "Decouvrir l'approche du trader-formateur : discipline, pédagogie, risk management et education responsable.",
  path: "/a-propos"
});

export default async function AboutPage() {
  const data = await readData();
  const page = data.pages.find((entry) => entry.slug === "a-propos" && entry.status === "PUBLISHED");

  return (
    <>
      <PageHero
        eyebrow="A propos"
        title="Un positionnement sobre : apprendre, pratiquer, proteger son capital."
        description="Le site met en avant une approche orientee methode, discipline et transmission. Pas de promesse magique, pas de mise en scene inutile."
      />
      <section className="site-shell grid gap-10 py-12 md:grid-cols-[0.9fr_1.1fr] md:py-16">
        <div className="rounded-lg border border-line bg-surface p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
            Principes
          </p>
          <ul className="mt-6 grid gap-4 text-base leading-8 text-muted">
            <li>Former avant de vendre une performance.</li>
            <li>Rendre le risque visible avant le gain potentiel.</li>
            <li>Parler aux debutants sans simplifier abusivement le marche.</li>
            <li>Construire une communaute autour de la repetition et du feedback.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl font-black leading-tight md:text-5xl">
            Le blog doit installer la confiance avant la conversion.
          </h2>
          <p className="mt-6 text-base leading-8 text-muted md:text-lg">
            Un visiteur mobile arrive souvent par un article. Il doit comprendre rapidement
            qui parle, pourquoi le contenu est credible et quelle prochaine action a du sens.
            Cette page sert a renforcer cette lecture sans surcharger l&apos;experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/blog" showArrow>
              Lire le blog
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contacter
            </ButtonLink>
          </div>
          {page?.content ? (
            <div className="mt-10 rounded-lg border border-line bg-surface p-6">
              <RichContent content={page.content} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
