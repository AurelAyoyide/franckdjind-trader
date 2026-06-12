import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Politique de confidentialite",
  description: "Politique de confidentialite du site et traitement des donnees de contact.",
  path: "/politique-confidentialite"
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Confidentialite"
        title="Les donnees collectees doivent rester limitees, utiles et protegees."
        description="Cette base sera ajustee avec les informations legales finales du client avant mise en production."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="max-w-3xl space-y-8 text-base leading-8 text-muted">
          <section>
            <h2 className="text-2xl font-black text-foreground">Donnees collectees</h2>
            <p className="mt-3">
              Le site peut collecter les informations transmises via le formulaire de contact :
              nom, email, sujet et message. Ces donnees servent uniquement a repondre a la demande.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Conservation</h2>
            <p className="mt-3">
              Les messages doivent etre conserves pendant une duree raisonnable, definie avec le client,
              puis supprimes lorsqu&apos;ils ne sont plus necessaires.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Droits</h2>
            <p className="mt-3">
              Toute personne peut demander l&apos;acces, la correction ou la suppression de ses donnees
              en utilisant les coordonnees de contact du site.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
