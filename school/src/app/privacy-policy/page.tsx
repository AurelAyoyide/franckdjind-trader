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
      eyebrow="Confidentialité"
      title="Vos données restent au service de votre parcours."
      description="Cette politique explique quelles données sont traitées par la plateforme, pourquoi elles le sont et comment exercer vos droits depuis le Bénin."
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          {details.legalPublisherName || details.platformName} exploite {details.platformName}, une plateforme privée de formation destinée aux utilisateurs situés au Bénin et, le cas échéant, à l&apos;étranger. Le responsable du traitement est établi au {details.legalAddress || "Bénin"}.
        </p>
        <LegalContact details={details} />
      </LegalSection>

      <LegalSection title="2. Données traitées">
        <p>Nous limitons la collecte aux données utiles au fonctionnement et au suivi de la formation :</p>
        <LegalList>
          <li>identité et contact : prénom, nom, adresse email et numéro WhatsApp ;</li>
          <li>données de compte : statut, rôle, mot de passe chiffré de manière non réversible et historique de connexion ;</li>
          <li>données pédagogiques : demandes d&apos;accès, inscriptions, progression, résultats de quiz, appels, messages et certificats ;</li>
          <li>données de sécurité : tentatives de connexion, journaux d&apos;audit et informations nécessaires à la protection du service.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Finalités et fondements">
        <LegalList>
          <li>créer et administrer votre compte, vérifier votre adresse email et ouvrir les accès autorisés ;</li>
          <li>vous fournir les contenus, le suivi pédagogique, les quiz, les notifications et les certificats ;</li>
          <li>prévenir les accès non autorisés, assurer la traçabilité des actions sensibles et protéger la plateforme ;</li>
          <li>répondre à vos demandes et respecter les obligations légales applicables.</li>
        </LegalList>
        <p>Ces traitements reposent sur l&apos;exécution du service demandé, le respect des obligations applicables et l&apos;intérêt légitime de sécuriser la plateforme et son contenu.</p>
      </LegalSection>

      <LegalSection title="4. Destinataires et partage">
        <p>
          Les données sont accessibles uniquement aux personnes autorisées selon leur mission : vous-même, les personnes chargées du suivi pédagogique et les administrateurs techniques habilités. Elles ne sont ni vendues ni louées à des tiers.
        </p>
        <p>Un partage peut intervenir avec les prestataires techniques strictement nécessaires au fonctionnement du service, dans la limite de leurs missions et avec des mesures de protection appropriées.</p>
      </LegalSection>

      <LegalSection title="5. Durée de conservation">
        <p>
          Les données de compte et de parcours sont conservées pendant la durée d&apos;utilisation du compte, puis pour la durée nécessaire à la gestion des demandes, à la sécurité et aux obligations applicables. Les journaux de sécurité et les preuves de certification sont conservés pendant une durée proportionnée à leur finalité.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies et stockage local">
        <p>
          La plateforme utilise des mécanismes techniques indispensables au fonctionnement, notamment un cookie de session sécurisé et un stockage local du choix de thème clair ou sombre. Elle ne dépose pas de cookie publicitaire et ne vend pas de profil de navigation.
        </p>
      </LegalSection>

      <LegalSection title="7. Sécurité">
        <p>
          Nous appliquons des mesures adaptées au service : mots de passe chiffrés, sessions signées, contrôles d&apos;accès par rôle, limitation des tentatives de connexion, journalisation des actions sensibles et protection des fichiers de formation. Aucun dispositif ne supprimant tout risque, vous devez également garder vos identifiants confidentiels.
        </p>
      </LegalSection>

      <LegalSection title="8. Vos droits">
        <p>
          Conformément aux dispositions applicables du Code du numérique en République du Bénin relatives aux données personnelles, vous pouvez demander l&apos;accès, la rectification, la mise à jour, l&apos;opposition ou l&apos;effacement de vos données, dans les limites prévues par la loi. Vous pouvez également saisir l&apos;Autorité de Protection des Données à Caractère Personnel (APDP) si vous estimez que vos droits ne sont pas respectés.
        </p>
        <LegalContact details={details} />
      </LegalSection>

      <LegalSection title="9. Évolution de cette politique">
        <p>
          Cette politique peut évoluer lorsque le service, la sécurité ou le cadre applicable le nécessitent. La date de mise à jour indiquée en tête du document permet d&apos;identifier la version en vigueur.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
