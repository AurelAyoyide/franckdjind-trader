import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Disclaimer trading",
  description:
    "Avertissement sur les risques lies au trading, aux formations et aux contenus educatifs du site.",
  path: "/disclaimer"
});

export default function DisclaimerPage() {
  return (
    <>
      <PageHero
        eyebrow="Disclaimer"
        title="Le trading comporte un risque reel de perte en capital."
        description="Cette page pose le cadre : les contenus sont educatifs, les performances passees ne garantissent aucun resultat futur."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="max-w-3xl space-y-8 text-base leading-8 text-muted">
          <section>
            <h2 className="text-2xl font-black text-foreground">Contenu educatif</h2>
            <p className="mt-3">
              Les articles, formations, analyses et exemples publies sur ce site ont une
              finalite pedagogique. Ils ne constituent pas un conseil financier, juridique
              ou fiscal personnalise.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Aucune promesse de résultat</h2>
            <p className="mt-3">
              Les exemples, graphiques, méthodes et retours d&apos;expérience ne garantissent
              aucun gain. Les performances passées, réelles ou simulées, ne préjugent pas
              des performances futures. Les résultats dépendent notamment du marché, du
              capital, de l&apos;expérience, des coûts et de la capacité à respecter un plan.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Décision personnelle</h2>
            <p className="mt-3">
              Avant toute décision, évalue tes connaissances, ta situation financière et
              le niveau de risque que tu peux réellement supporter. Si nécessaire,
              rapproche-toi d&apos;un professionnel autorisé à fournir un conseil adapté à ta
              situation. Ne finance jamais une activité de trading avec de l&apos;argent dont tu as besoin.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Risque de perte</h2>
            <p className="mt-3">
              Le trading peut entrainer la perte partielle ou totale du capital engage.
              Chaque visiteur reste responsable de ses decisions, de sa gestion du risque
              et de la verification des informations avant toute action.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Plateformes et partenaires</h2>
            <p className="mt-3">
              Les services de plateformes, brokers ou partenaires restent soumis à leurs
              propres conditions, frais, règles d&apos;éligibilité et restrictions géographiques.
              Le visiteur doit les lire directement avant toute inscription ou transaction.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Affiliation</h2>
            <p className="mt-3">
              Certains liens peuvent etre des liens affilies. Lorsqu&apos;un lien de ce type
              est utilise, il doit etre presente clairement et ne doit pas modifier le prix
              ou le niveau de risque pour le visiteur.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
