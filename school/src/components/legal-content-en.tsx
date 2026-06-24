import { LegalContact, LegalDocument, LegalList, LegalSection, type LegalDetails } from "@/components/legal-document";

export function PrivacyPolicyEnglish({ details }: { details: LegalDetails }) {
  return (
    <LegalDocument
      eyebrow="Privacy"
      title="Your data supports your learning journey."
      description="This policy explains what data the platform processes, why it is processed and how you can exercise your rights from Benin."
      updatedAt="Last updated: 23 June 2026"
    >
      <LegalSection title="1. Data controller">
        <p>
          {details.legalPublisherName || details.platformName} operates {details.platformName}, a private learning platform for users in Benin and, where applicable, abroad. The data controller is established in {details.legalAddress || "Benin"}.
        </p>
        <LegalContact details={details} locale="en" />
      </LegalSection>
      <LegalSection title="2. Data we process">
        <p>We limit collection to data needed to run and support the learning service:</p>
        <LegalList>
          <li>identity and contact data: first name, last name, email address and WhatsApp number;</li>
          <li>account data: account status, role, one-way encrypted password and sign-in history;</li>
          <li>learning data: access requests, enrolments, progress, quiz results, calls, messages and certificates;</li>
          <li>security data: sign-in attempts, audit logs and information needed to protect the service.</li>
        </LegalList>
      </LegalSection>
      <LegalSection title="3. Purposes and legal grounds">
        <LegalList>
          <li>to create and administer your account, verify your email address and grant approved access;</li>
          <li>to provide content, learning support, quizzes, notifications and certificates;</li>
          <li>to prevent unauthorised access, keep a record of sensitive actions and protect the platform;</li>
          <li>to respond to your requests and meet applicable legal obligations.</li>
        </LegalList>
        <p>Processing is based on providing the requested service, compliance with applicable obligations and our legitimate interest in securing the platform and its content.</p>
      </LegalSection>
      <LegalSection title="4. Recipients and sharing">
        <p>Data is available only to people authorised for their role: you, learning-support staff and approved technical administrators. It is never sold or rented to third parties.</p>
        <p>Data may be shared with technical providers strictly needed to operate the service, only for their assigned purpose and with appropriate safeguards.</p>
      </LegalSection>
      <LegalSection title="5. Retention period">
        <p>Account and learning data is retained while the account is used, then for the period needed to manage requests, security and applicable obligations. Security logs and certificate records are retained for a period proportionate to their purpose.</p>
      </LegalSection>
      <LegalSection title="6. Cookies and local storage">
        <p>The platform uses technical mechanisms required for operation, including a secure session cookie and local storage for the light or dark theme choice. It does not use advertising cookies or sell browsing profiles.</p>
      </LegalSection>
      <LegalSection title="7. Security">
        <p>We apply measures suited to the service: encrypted passwords, signed sessions, role-based access controls, sign-in attempt limits, sensitive-action logging and protected learning files. No system removes every risk, so you must also keep your credentials confidential.</p>
      </LegalSection>
      <LegalSection title="8. Your rights">
        <p>Under applicable provisions of the Digital Code of the Republic of Benin relating to personal data, you may request access, correction, updating, objection to processing or deletion of your data, within the limits set by law. You may also contact the Personal Data Protection Authority (APDP) if you believe your rights have not been respected.</p>
        <LegalContact details={details} locale="en" />
      </LegalSection>
      <LegalSection title="9. Changes to this policy">
        <p>This policy may change when the service, security or applicable rules require it. The update date at the top of this document identifies the current version.</p>
      </LegalSection>
    </LegalDocument>
  );
}

export function TermsEnglish({ details }: { details: LegalDetails }) {
  return (
    <LegalDocument
      eyebrow="Terms of use"
      title="A clear framework for learning and progress."
      description="These terms govern the use of the private learning platform and its content."
      updatedAt="Last updated: 23 June 2026"
    >
      <LegalSection title="1. Purpose and acceptance">
        <p>These terms govern the use of {details.platformName}. By creating an account, requesting access or using content, you accept them. If you use the platform for a minor or an organisation, you confirm that you have the required authority.</p>
      </LegalSection>
      <LegalSection title="2. Nature of the training">
        <p>Content is educational. It is not personalised investment advice, a recommendation to buy or sell, an offer of a financial product, or a promise of results or profits. Every trading or investment decision remains your sole responsibility.</p>
      </LegalSection>
      <LegalSection title="3. Account, access and responsibility">
        <LegalList>
          <li>you provide accurate information and keep your contact details up to date;</li>
          <li>you keep your password and session confidential;</li>
          <li>course access is personal, limited to approved learning paths and may be suspended for misuse;</li>
          <li>you promptly report any unauthorised use of your account.</li>
        </LegalList>
      </LegalSection>
      <LegalSection title="4. Access requests and payments">
        <p>The platform records access requests and supports exchanges with the person responsible for the learning path. Payments, where applicable, are agreed and processed outside the platform. A payment made outside the platform does not automatically grant access: access remains subject to verification.</p>
      </LegalSection>
      <LegalSection title="5. Content and intellectual property">
        <p>Videos, documents, text, quizzes, brands and other platform content remain protected. They are provided for your personal learning use. Without prior written consent, you may not reproduce, record, share, resell, publish or allow a third party to access them.</p>
      </LegalSection>
      <LegalSection title="6. Community and expected behaviour">
        <p>Community spaces are moderated. Illegal, misleading, defamatory or discriminatory statements, unauthorised content sharing, unauthorised solicitation and any attempt to harm the platform or its members are prohibited. Non-compliant content may be removed and access may be limited or suspended.</p>
      </LegalSection>
      <LegalSection title="7. Certificates">
        <p>A certificate confirms completion of a learning path according to the platform&apos;s rules. It is not a state diploma, professional licence, guarantee of financial competence or promise of performance. Its validity can be checked using its public code and it may be revoked for error, fraud or misuse.</p>
      </LegalSection>
      <LegalSection title="8. Service availability">
        <p>We aim to keep the platform accessible and secure. Interruptions, maintenance, changes or unavailability related to networks and providers may nevertheless occur. When reasonably possible, significant interruptions are communicated to affected users.</p>
      </LegalSection>
      <LegalSection title="9. Personal data">
        <p>Using the platform involves the processing described in our privacy policy. Please read it before registering.</p>
      </LegalSection>
      <LegalSection title="10. Applicable law and contact">
        <p>These terms are governed by the law applicable in the Republic of Benin, subject to mandatory rules that protect a user. In case of difficulty, the parties will first seek an amicable solution before referring the matter to the competent court.</p>
        <LegalContact details={details} locale="en" />
      </LegalSection>
    </LegalDocument>
  );
}

export function LegalNoticeEnglish({ details }: { details: LegalDetails }) {
  return (
    <LegalDocument
      eyebrow="Legal notice"
      title="Essential information about the publisher."
      description="This notice identifies the platform operator and the main rules that apply to its publication."
      updatedAt="Last updated: 23 June 2026"
    >
      <LegalSection title="Platform publisher">
        <p>{details.legalPublisherName || details.platformName}</p>
        <p>Address: {details.legalAddress || "Benin"}</p>
        {details.legalRegistrationNumber ? <p>Business registration: {details.legalRegistrationNumber}</p> : null}
        <LegalContact details={details} locale="en" />
      </LegalSection>
      <LegalSection title="Hosting">
        {details.hostingProvider ? <p>{details.hostingProvider}</p> : <p>Production hosting information will be published here before the platform opens to the public.</p>}
      </LegalSection>
      <LegalSection title="Intellectual property">
        <p>The platform structure, visual identity, texts, videos, documents and other content are protected. Any unauthorised reproduction or distribution is prohibited, except with written consent from the publisher or where the law provides an exception.</p>
      </LegalSection>
      <LegalSection title="Trading content notice">
        <p>{details.platformName} is a learning space. Published content is not personalised financial advice, an investment solicitation or a guarantee of results. Every user remains responsible for their decisions and risk management.</p>
      </LegalSection>
    </LegalDocument>
  );
}
