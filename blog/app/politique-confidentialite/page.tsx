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
        description="Cette politique explique les données traitées, leur finalité et la manière d&apos;exercer tes droits."
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
            <h2 className="text-2xl font-black text-foreground">Finalités et base de traitement</h2>
            <p className="mt-3">
              Les données servent à répondre aux demandes envoyées, administrer les comptes
              d&apos;administration, prévenir les abus et, avec le consentement demandé, gérer
              l&apos;inscription à la newsletter. Elles ne sont pas vendues à des tiers.
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
            <h2 className="text-2xl font-black text-foreground">Cookies et mesures techniques</h2>
            <p className="mt-3">
              Le site utilise un cookie de session strictement nécessaire pour sécuriser
              l&apos;administration. Des journaux techniques limités peuvent être conservés pour
              détecter les tentatives abusives, protéger les formulaires et diagnostiquer une erreur.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Droits</h2>
            <p className="mt-3">
              Toute personne peut demander l&apos;acces, la correction ou la suppression de ses donnees
              en utilisant les coordonnees de contact du site.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Destinataires et sécurité</h2>
            <p className="mt-3">
              Les données sont accessibles uniquement aux personnes autorisées à traiter la
              demande et aux prestataires techniques nécessaires au fonctionnement du site,
              notamment l&apos;hébergeur, la base de données et le service d&apos;envoi d&apos;emails. Des
              mesures de sécurité raisonnables sont mises en œuvre, sans qu&apos;aucun système ne puisse garantir un risque nul.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-black text-foreground">Nous contacter</h2>
            <p className="mt-3">
              Pour demander l&apos;accès, la correction, l&apos;effacement ou la limitation de tes données,
              utilise le formulaire de contact et indique l&apos;adresse email concernée. Une réponse sera apportée dans un délai raisonnable.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
