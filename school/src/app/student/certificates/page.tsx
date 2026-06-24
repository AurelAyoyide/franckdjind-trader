import { Award } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Pagination } from "@/components/pagination";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getStudentCertificates } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { paginate, parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function StudentCertificatesPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: pageParam, q } = await searchParams;
  const session = await requirePageSession(["student"], "/student/certificates");

  const certificates = await getStudentCertificates(session.userId, q);
  const pagedCertificates = paginate(certificates, parsePage(pageParam));

  return (
    <DashboardShell role="student" title="Mes certificats" description="Les certificats sont generes quand les conditions de fin sont remplies.">
      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par formation..."
          className="h-11 flex-1 rounded-lg border border-line bg-surface px-4 text-sm focus:border-market focus:ring-1 focus:ring-market"
        />
        <button type="submit" className="h-11 rounded-lg bg-foreground/[0.06] px-5 text-sm font-black transition hover:bg-foreground/[0.1] sm:hidden">
          Rechercher
        </button>
      </form>

      <div className="grid gap-5 md:grid-cols-2">
        {pagedCertificates.items.map((certificate) => (
          <article className="flex h-full flex-col rounded-lg border border-line bg-surface p-6" key={certificate.code}>
            <Award className="h-6 w-6 text-market shrink-0" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">{certificate.course.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Attribue a {fullName(certificate.learner)} le {formatDate(certificate.issuedAt)}.
            </p>
            <div className="mt-5">
              <StatusBadge tone="cyan">{certificate.code}</StatusBadge>
            </div>
            <div className="mt-auto pt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`/certificates/verify/${certificate.code}`} showArrow>Verifier</ButtonLink>
              <ButtonLink href={`/api/certificates/${certificate.code}/pdf`} variant="secondary">PDF</ButtonLink>
            </div>
          </article>
        ))}
        {!pagedCertificates.total ? (
          <article className="rounded-lg border border-line bg-surface p-6">
            <Award className="h-6 w-6 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">Aucun certificat</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Les certificats apparaitront ici apres validation complete d&apos;une formation.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedCertificates.page} path="/student/certificates" totalPages={pagedCertificates.totalPages} />
    </DashboardShell>
  );
}
