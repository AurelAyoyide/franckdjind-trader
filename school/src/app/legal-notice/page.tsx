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
      eyebrow="Mentions légales"
      title="Les informations essentielles sur l'éditeur."
      description="Ces mentions identifient l&apos;exploitant de la plateforme et les principales règles applicables à sa publication."
    >
      <LegalSection title="Éditeur de la plateforme">
        <p>{details.legalPublisherName || details.platformName}</p>
        <p>Adresse : {details.legalAddress || "Bénin"}</p>
        {details.legalRegistrationNumber ? <p>Identification professionnelle : {details.legalRegistrationNumber}</p> : null}
        <LegalContact details={details} />
      </LegalSection>

      <LegalSection title="Hébergement">
        {details.hostingProvider ? (
          <p>{details.hostingProvider}</p>
        ) : (
          <p>
            Les informations de l&apos;hébergeur de production seront publiées ici avant l&apos;ouverture publique de la plateforme.
          </p>
        )}
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          La structure de la plateforme, son identité visuelle, ses textes, ses vidéos, ses documents et ses autres contenus sont protégés. Toute reproduction ou diffusion non autorisée est interdite, sauf accord écrit de l&apos;éditeur ou exception prévue par la loi.
        </p>
      </LegalSection>

      <LegalSection title="Information sur les contenus de trading">
        <p>
          {details.platformName}{" "}est un espace de formation. Les contenus publiés ne constituent pas un conseil financier personnalisé, une sollicitation d&apos;investissement ou une garantie de résultat. Chaque utilisateur demeure responsable de ses décisions et de la gestion de son risque.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
