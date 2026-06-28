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
      description="Ces conditions encadrent l&apos;utilisation de la plateforme privée de formation et de ses contenus."
    >
      <LegalSection title="1. Objet et acceptation">
        <p>
          Les présentes conditions régissent l&apos;utilisation de {details.platformName}. En créant un compte, en demandant un accès ou en utilisant un contenu, vous acceptez ce cadre. Si vous utilisez la plateforme pour le compte d&apos;un mineur ou d&apos;une organisation, vous confirmez disposer de l&apos;autorisation nécessaire.
        </p>
      </LegalSection>

      <LegalSection title="2. Nature de la formation">
        <p>
          Les contenus ont une finalité pédagogique. Ils ne constituent ni un conseil en investissement personnalisé, ni une recommandation d&apos;achat ou de vente, ni une offre de produit financier, ni une promesse de résultat ou de gain. Toute décision de trading ou d&apos;investissement reste prise sous votre seule responsabilité.
        </p>
      </LegalSection>

      <LegalSection title="3. Compte, accès et responsabilité">
        <LegalList>
          <li>vous fournissez des informations exactes et maintenez vos coordonnées à jour ;</li>
          <li>vous gardez votre mot de passe et votre session confidentiels ;</li>
          <li>les accès aux formations sont personnels, limités aux parcours autorisés et peuvent être suspendus en cas d&apos;usage non conforme ;</li>
          <li>vous signalez rapidement toute utilisation non autorisée de votre compte.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Demande d'accès et paiements">
        <p>
          La plateforme enregistre les demandes d&apos;accès et facilite les échanges avec le responsable du parcours. Les paiements, lorsqu&apos;ils existent, sont conclus et traités hors de la plateforme. Un paiement effectué en dehors de celle-ci ne donne pas automatiquement accès à une formation : l&apos;ouverture de l&apos;accès reste soumise à vérification.
        </p>
      </LegalSection>

      <LegalSection title="5. Contenus et propriété intellectuelle">
        <p>
          Les vidéos, documents, textes, quiz, marques et autres contenus de la plateforme restent protégés. Ils sont mis à votre disposition pour votre usage personnel de formation. Sans accord écrit préalable, vous ne pouvez pas les reproduire, enregistrer, partager, revendre, publier ou permettre à un tiers d&apos;y accéder.
        </p>
      </LegalSection>

      <LegalSection title="6. Communauté et comportement attendu">
        <p>
          Les espaces communautaires sont modérés. Sont notamment interdits les propos illicites, trompeurs, diffamataires, discriminatoires, le partage de contenus sans droit, le démarchage non autorisé et toute tentative de nuire à la plateforme ou à ses membres. Les contenus non conformes peuvent être retirés et l&apos;accès peut être limité ou suspendu.
        </p>
      </LegalSection>

      <LegalSection title="7. Certificats">
        <p>
          Un certificat atteste de la réalisation du parcours selon les règles prévues par la plateforme. Il ne constitue pas un diplôme d&apos;État, une licence professionnelle, une garantie de compétence financière ou une promesse de performance. Sa validité peut être vérifiée par son code public et il peut être révoqué en cas d&apos;erreur, de fraude ou d&apos;usage abusif.
        </p>
      </LegalSection>

      <LegalSection title="8. Disponibilité du service">
        <p>
          Nous cherchons à maintenir la plateforme accessible et sécurisée. Des interruptions, maintenances, évolutions ou indisponibilités liées aux réseaux et prestataires peuvent toutefois survenir. Lorsque cela est raisonnablement possible, les interruptions importantes sont communiquées aux utilisateurs concernés.
        </p>
      </LegalSection>

      <LegalSection title="9. Données personnelles">
        <p>
          L&apos;utilisation de la plateforme implique les traitements décrits dans notre politique de confidentialité. Nous vous invitons à la consulter avant toute inscription.
        </p>
      </LegalSection>

      <LegalSection title="10. Droit applicable et contact">
        <p>
          Ces conditions sont régies par le droit applicable en République du Bénin, sous réserve des règles impératives qui protégeraient un utilisateur. En cas de difficulté, les parties recherchent d&apos;abord une solution amiable avant toute saisine de la juridiction compétente.
        </p>
        <LegalContact details={details} />
      </LegalSection>
    </LegalDocument>
  );
}
