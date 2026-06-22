import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { RichContent } from "@/components/rich-content";
import { ButtonLink } from "@/components/ui/button-link";
import { readData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "A propos",
  description:
    "Découvrir l&apos;approche de Bono Trading : pédagogie, discipline, gestion du risque et apprentissage responsable.",
  path: "/a-propos"
});

export default async function AboutPage() {
  const data = await readData();
  const page = data.pages.find((entry) => entry.slug === "a-propos" && entry.status === "PUBLISHED");

  return (
    <>
      <PageHero
        eyebrow="A propos"
        title="Apprendre, pratiquer et protéger son capital."
        description="Bono Trading privilégie une pédagogie claire : comprendre le contexte, préparer ses décisions et progresser sans promesse irréaliste."
      />
      <section className="site-shell grid gap-10 py-12 md:grid-cols-[0.9fr_1.1fr] md:py-16">
        <div className="rounded-lg border border-line bg-surface p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
            Principes
          </p>
          <ul className="mt-6 grid gap-4 text-base leading-8 text-muted">
            <li>Transmettre une méthode avant de parler de résultat.</li>
            <li>Rendre le risque visible avant le gain potentiel.</li>
            <li>Parler aux débutants sans simplifier abusivement le marché.</li>
            <li>Construire une communauté autour de la répétition et du feedback.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl font-black leading-tight md:text-5xl">
            Une approche construite pour durer.
          </h2>
          <p className="mt-6 text-base leading-8 text-muted md:text-lg">
            Les contenus s&apos;adressent à celles et ceux qui veulent apprendre à structurer
            leurs décisions de trading. L&apos;objectif est d&apos;installer de bonnes habitudes :
            préparer, exécuter avec prudence, journaliser et ajuster. Chaque parcours doit
            rester adapté au niveau, au temps disponible et à la tolérance au risque de chacun.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/blog" showArrow>
              Explorer le blog
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
