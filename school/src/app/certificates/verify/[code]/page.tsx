import { BadgeCheck, BadgeX } from "lucide-react";
import { CertificateLookupForm } from "@/components/certificate-lookup-form";
import { PageHero } from "@/components/page-hero";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { fullName, getPublicCertificate } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const certificate = await getPublicCertificate(code);
  const validCertificate = certificate && !certificate.revokedAt ? certificate : null;

  return (
    <>
      <PageHero
        eyebrow="Verification certificat"
        title={validCertificate ? "Certificat valide." : "Certificat introuvable."}
        description="La verification publique ne donne acces ni aux cours ni aux donnees privees de l'apprenant."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
          {validCertificate ? (
            <>
              <BadgeCheck className="h-7 w-7 text-market" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-black">{validCertificate.course.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Certificat attribue a {fullName(validCertificate.learner)} le {formatDate(validCertificate.issuedAt)}.
              </p>
              <div className="mt-5">
                <StatusBadge tone="market">{validCertificate.code}</StatusBadge>
              </div>
            </>
          ) : (
            <>
              <BadgeX className="h-7 w-7 text-danger" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-black">Aucun certificat ne correspond a ce code.</h2>
              <p className="mt-4 text-sm leading-7 text-muted">Verifie le code puis recommence la recherche.</p>
            </>
          )}
          <div className="mt-6">
            <ButtonLink href="/certificates/verify" variant="secondary">Nouvelle recherche</ButtonLink>
          </div>
        </div>
        <div className="mt-6">
          <CertificateLookupForm initialCode={code} />
        </div>
      </section>
    </>
  );
}
