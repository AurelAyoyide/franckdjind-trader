import { Award } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getStudentCertificates } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentCertificatesPage() {
  const session = await requirePageSession(["student"], "/student/certificates");

  const certificates = await getStudentCertificates(session.userId);

  return (
    <DashboardShell role="student" title="Mes certificats" description="Les certificats sont generes quand les conditions de fin sont remplies.">
      <div className="grid gap-5 md:grid-cols-2">
        {certificates.map((certificate) => (
          <article className="rounded-lg border border-line bg-surface p-6" key={certificate.code}>
            <Award className="h-6 w-6 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">{certificate.course.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Attribue a {fullName(certificate.learner)} le {formatDate(certificate.issuedAt)}.
            </p>
            <div className="mt-5">
              <StatusBadge tone="cyan">{certificate.code}</StatusBadge>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`/certificates/verify/${certificate.code}`} showArrow>Verifier</ButtonLink>
              <ButtonLink href={`/api/certificates/${certificate.code}/pdf`} variant="secondary">PDF</ButtonLink>
            </div>
          </article>
        ))}
        {!certificates.length ? (
          <article className="rounded-lg border border-line bg-surface p-6">
            <Award className="h-6 w-6 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">Aucun certificat</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Les certificats apparaitront ici apres validation complete d&apos;une formation.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
