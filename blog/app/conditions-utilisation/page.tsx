import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation du site blog et vitrine de trading.",
  path: "/conditions-utilisation"
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Conditions"
        title="Un cadre simple pour utiliser le site et ses contenus."
        description="Les textes devront etre valides avec les informations juridiques finales du client."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="max-w-3xl space-y-8 text-base leading-8 text-muted">
          <section>
            <h2 className="text-2xl font-black text-foreground">Utilisation du contenu</h2>
            <p className="mt-3">
              Les contenus du site sont destines a l&apos;information et a l&apos;education. Toute reproduction
              ou reutilisation commerciale doit faire l&apos;objet d&apos;une autorisation.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Responsabilite</h2>
            <p className="mt-3">
              L&apos;utilisateur reste responsable de ses decisions de trading, de sa gestion du risque
              et de l&apos;adequation des informations avec sa situation personnelle.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Evolution du site</h2>
            <p className="mt-3">
              Les contenus, services et pages peuvent evoluer afin d&apos;ameliorer la qualite editoriale,
              la securite et l&apos;experience utilisateur.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
