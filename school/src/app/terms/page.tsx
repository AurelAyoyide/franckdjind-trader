import { LegalContact, LegalDocument, LegalList, LegalSection, type LegalDetails } from "@/components/legal-document";
import { TermsEnglish } from "@/components/legal-content-en";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSettingsMap } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await getSettingsMap();
  const details: LegalDetails = {
    platformName: settings.platformName,
    whatsappNumber: settings.whatsappNumber,
    legalPublisherName: settings.legalPublisherName,
    legalContactEmail: settings.legalContactEmail,
    legalAddress: settings.legalAddress,
    legalRegistrationNumber: settings.legalRegistrationNumber,
    hostingProvider: settings.hostingProvider,
  };

  if ((await getRequestLocale()) === "en") {
    return <TermsEnglish details={details} />;
  }

  return (
    <LegalDocument
      eyebrow="Conditions d'utilisation"
      title="Un cadre clair pour apprendre et progresser."
      description="Ces conditions encadrent l&apos;utilisation de la plateforme privee de formation et de ses contenus."
    >
      <LegalSection title="1. Objet et acceptation">
        <p>
          Les presentes conditions regissent l&apos;utilisation de {details.platformName}. En creant un compte, en demandant un acces ou en utilisant un contenu, vous acceptez ce cadre. Si vous utilisez la plateforme pour le compte d&apos;un mineur ou d&apos;une organisation, vous confirmez disposer de l&apos;autorisation necessaire.
        </p>
      </LegalSection>

      <LegalSection title="2. Nature de la formation">
        <p>
          Les contenus ont une finalite pedagogique. Ils ne constituent ni un conseil en investissement personnalise, ni une recommandation d&apos;achat ou de vente, ni une offre de produit financier, ni une promesse de resultat ou de gain. Toute decision de trading ou d&apos;investissement reste prise sous votre seule responsabilite.
        </p>
      </LegalSection>

      <LegalSection title="3. Compte, acces et responsabilite">
        <LegalList>
          <li>vous fournissez des informations exactes et maintenez vos coordonnees a jour ;</li>
          <li>vous gardez votre mot de passe et votre session confidentiels ;</li>
          <li>les acces aux formations sont personnels, limites aux parcours autorises et peuvent etre suspendus en cas d&apos;usage non conforme ;</li>
          <li>vous signalez rapidement toute utilisation non autorisee de votre compte.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Demande d'acces et paiements">
        <p>
          La plateforme enregistre les demandes d&apos;acces et facilite les echanges avec le responsable du parcours. Les paiements, lorsqu&apos;ils existent, sont conclus et traites hors de la plateforme. Un paiement effectue en dehors de celle-ci ne donne pas automatiquement acces a une formation : l&apos;ouverture de l&apos;acces reste soumise a verification.
        </p>
      </LegalSection>

      <LegalSection title="5. Contenus et propriete intellectuelle">
        <p>
          Les videos, documents, textes, quiz, marques et autres contenus de la plateforme restent proteges. Ils sont mis a votre disposition pour votre usage personnel de formation. Sans accord ecrit prealable, vous ne pouvez pas les reproduire, enregistrer, partager, revendre, publier ou permettre a un tiers d&apos;y acceder.
        </p>
      </LegalSection>

      <LegalSection title="6. Communaute et comportement attendu">
        <p>
          Les espaces communautaires sont moderes. Sont notamment interdits les propos illicites, trompeurs, diffamatoires, discriminatoires, le partage de contenus sans droit, le demarchage non autorise et toute tentative de nuire a la plateforme ou a ses membres. Les contenus non conformes peuvent etre retires et l&apos;acces peut etre limite ou suspendu.
        </p>
      </LegalSection>

      <LegalSection title="7. Certificats">
        <p>
          Un certificat atteste de la realisation du parcours selon les regles prevues par la plateforme. Il ne constitue pas un diplome d&apos;Etat, une licence professionnelle, une garantie de competence financiere ou une promesse de performance. Sa validite peut etre verifiee par son code public et il peut etre revoque en cas d&apos;erreur, de fraude ou d&apos;usage abusif.
        </p>
      </LegalSection>

      <LegalSection title="8. Disponibilite du service">
        <p>
          Nous cherchons a maintenir la plateforme accessible et securisee. Des interruptions, maintenances, evolutions ou indisponibilites liees aux reseaux et prestataires peuvent toutefois survenir. Lorsque cela est raisonnablement possible, les interruptions importantes sont communiquees aux utilisateurs concernes.
        </p>
      </LegalSection>

      <LegalSection title="9. Donnees personnelles">
        <p>
          L&apos;utilisation de la plateforme implique les traitements decrits dans notre politique de confidentialite. Nous vous invitons a la consulter avant toute inscription.
        </p>
      </LegalSection>

      <LegalSection title="10. Droit applicable et contact">
        <p>
          Ces conditions sont regies par le droit applicable en Republique du Benin, sous reserve des regles imperatives qui protegeraient un utilisateur. En cas de difficulte, les parties recherchent d&apos;abord une solution amiable avant toute saisine de la juridiction competente.
        </p>
        <LegalContact details={details} />
      </LegalSection>
    </LegalDocument>
  );
}
