import { LegalContact, LegalDocument, LegalSection, type LegalDetails } from "@/components/legal-document";
import { LegalNoticeEnglish } from "@/components/legal-content-en";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSettingsMap } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LegalNoticePage() {
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
    return <LegalNoticeEnglish details={details} />;
  }

  return (
    <LegalDocument
      eyebrow="Mentions legales"
      title="Les informations essentielles sur l'editeur."
      description="Ces mentions identifient l&apos;exploitant de la plateforme et les principales regles applicables a sa publication."
    >
      <LegalSection title="Editeur de la plateforme">
        <p>{details.legalPublisherName || details.platformName}</p>
        <p>Adresse : {details.legalAddress || "Benin"}</p>
        {details.legalRegistrationNumber ? <p>Identification professionnelle : {details.legalRegistrationNumber}</p> : null}
        <LegalContact details={details} />
      </LegalSection>

      <LegalSection title="Hebergement">
        {details.hostingProvider ? (
          <p>{details.hostingProvider}</p>
        ) : (
          <p>
            Les informations de l&apos;hebergeur de production seront publiees ici avant l&apos;ouverture publique de la plateforme.
          </p>
        )}
      </LegalSection>

      <LegalSection title="Propriete intellectuelle">
        <p>
          La structure de la plateforme, son identite visuelle, ses textes, ses videos, ses documents et ses autres contenus sont proteges. Toute reproduction ou diffusion non autorisee est interdite, sauf accord ecrit de l&apos;editeur ou exception prevue par la loi.
        </p>
      </LegalSection>

      <LegalSection title="Information sur les contenus de trading">
        <p>
          {details.platformName}{" "}est un espace de formation. Les contenus publies ne constituent pas un conseil financier personnalise, une sollicitation d&apos;investissement ou une garantie de resultat. Chaque utilisateur demeure responsable de ses decisions et de la gestion de son risque.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
