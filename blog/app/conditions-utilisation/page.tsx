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
        description="Ces conditions encadrent l&apos;accès aux contenus, formulaires, services et espaces d&apos;administration du site."
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
            <h2 className="text-2xl font-black text-foreground">Usage responsable</h2>
            <p className="mt-3">
              L&apos;utilisateur s&apos;engage à ne pas perturber le fonctionnement du site, contourner
              ses protections, soumettre des informations trompeuses ou utiliser les formulaires
              à des fins de spam. L&apos;accès à l&apos;administration est strictement réservé aux comptes autorisés.
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
            <h2 className="text-2xl font-black text-foreground">Liens et services tiers</h2>
            <p className="mt-3">
              Les liens vers des sites tiers sont fournis pour faciliter l&apos;accès à une ressource
              ou à un partenaire. Leur contenu, leurs conditions et leur disponibilité relèvent
              de leurs éditeurs respectifs. Il appartient à chaque visiteur de les vérifier avant usage.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Evolution du site</h2>
            <p className="mt-3">
              Les contenus, services et pages peuvent evoluer afin d&apos;ameliorer la qualite editoriale,
              la securite et l&apos;experience utilisateur.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Droit applicable et contact</h2>
            <p className="mt-3">
              En cas de question sur l&apos;utilisation du site, contacte Bono Trading via le formulaire.
              Les présentes conditions peuvent évoluer afin de refléter une modification du service,
              de la sécurité ou des obligations applicables ; la version publiée sur cette page fait foi.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
