import { LegalContact, LegalDocument, LegalList, LegalSection, type LegalDetails } from "@/components/legal-document";
import { PrivacyPolicyEnglish } from "@/components/legal-content-en";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSettingsMap } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
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
    return <PrivacyPolicyEnglish details={details} />;
  }

  return (
    <LegalDocument
      eyebrow="Confidentialite"
      title="Vos donnees restent au service de votre parcours."
      description="Cette politique explique quelles donnees sont traitees par la plateforme, pourquoi elles le sont et comment exercer vos droits depuis le Benin."
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          {details.legalPublisherName || details.platformName} exploite {details.platformName}, une plateforme privee de formation destinee aux utilisateurs situes au Benin et, le cas echeant, a l&apos;etranger. Le responsable du traitement est etabli a {details.legalAddress || "Benin"}.
        </p>
        <LegalContact details={details} />
      </LegalSection>

      <LegalSection title="2. Donnees traitees">
        <p>Nous limitons la collecte aux donnees utiles au fonctionnement et au suivi de la formation :</p>
        <LegalList>
          <li>identite et contact : prenom, nom, adresse email et numero WhatsApp ;</li>
          <li>donnees de compte : statut, role, mot de passe chiffre de maniere non reversible et historique de connexion ;</li>
          <li>donnees pedagogiques : demandes d&apos;acces, inscriptions, progression, resultats de quiz, appels, messages et certificats ;</li>
          <li>donnees de securite : tentatives de connexion, journaux d&apos;audit et informations necessaires a la protection du service.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Finalites et fondements">
        <LegalList>
          <li>creer et administrer votre compte, verifier votre adresse email et ouvrir les acces autorises ;</li>
          <li>vous fournir les contenus, le suivi pedagogique, les quiz, les notifications et les certificats ;</li>
          <li>prevenir les acces non autorises, assurer la tracabilite des actions sensibles et proteger la plateforme ;</li>
          <li>repondre a vos demandes et respecter les obligations legales applicables.</li>
        </LegalList>
        <p>Ces traitements reposent sur l&apos;execution du service demande, le respect des obligations applicables et l&apos;interet legitime de securiser la plateforme et son contenu.</p>
      </LegalSection>

      <LegalSection title="4. Destinataires et partage">
        <p>
          Les donnees sont accessibles uniquement aux personnes autorisees selon leur mission : vous-meme, les personnes chargees du suivi pedagogique et les administrateurs techniques habilites. Elles ne sont ni vendues ni louees a des tiers.
        </p>
        <p>Un partage peut intervenir avec les prestataires techniques strictement necessaires au fonctionnement du service, dans la limite de leurs missions et avec des mesures de protection appropriees.</p>
      </LegalSection>

      <LegalSection title="5. Duree de conservation">
        <p>
          Les donnees de compte et de parcours sont conservees pendant la duree d&apos;utilisation du compte, puis pour la duree necessaire a la gestion des demandes, a la securite et aux obligations applicables. Les journaux de securite et les preuves de certification sont conserves pendant une duree proportionnee a leur finalite.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies et stockage local">
        <p>
          La plateforme utilise des mecanismes techniques indispensables au fonctionnement, notamment un cookie de session securise et un stockage local du choix de theme clair ou sombre. Elle ne depose pas de cookie publicitaire et ne vend pas de profil de navigation.
        </p>
      </LegalSection>

      <LegalSection title="7. Securite">
        <p>
          Nous appliquons des mesures adaptees au service : mots de passe chiffres, sessions signees, controles d&apos;acces par role, limitation des tentatives de connexion, journalisation des actions sensibles et protection des fichiers de formation. Aucun dispositif ne supprimant tout risque, vous devez egalement garder vos identifiants confidentiels.
        </p>
      </LegalSection>

      <LegalSection title="8. Vos droits">
        <p>
          Conformement aux dispositions applicables du Code du numerique en Republique du Benin relatives aux donnees personnelles, vous pouvez demander l&apos;acces, la rectification, la mise a jour, l&apos;opposition ou l&apos;effacement de vos donnees, dans les limites prevues par la loi. Vous pouvez egalement saisir l&apos;Autorite de Protection des Donnees a Caractere Personnel (APDP) si vous estimez que vos droits ne sont pas respectes.
        </p>
        <LegalContact details={details} />
      </LegalSection>

      <LegalSection title="9. Evolution de cette politique">
        <p>
          Cette politique peut evoluer lorsque le service, la securite ou le cadre applicable le necessitent. La date de mise a jour indiquee en tete du document permet d&apos;identifier la version en vigueur.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
