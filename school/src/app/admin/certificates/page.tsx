import { Award } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmButton } from "@/components/confirm-button";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getAdminCertificates } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { paginate, parsePage } from "@/lib/pagination";
import { revokeCertificateAction, generateManualCertificateAction } from "./actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  revoked: "Certificat revoque. La verification publique indiquera qu'il n'est plus valide.",
  generated: "Certificat genere manuellement avec succes.",
  "already-exists": "Un certificat valide existe deja pour cet apprenant et cette formation."
};

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; page?: string; q?: string }>;
}) {
  const { notice, page: pageParam, q } = await searchParams;
  await requirePageSession(["admin"], "/admin/certificates");
  const certificates = await getAdminCertificates(q);
  const pagedCertificates = paginate(certificates, parsePage(pageParam));
  const { courses, learners } = await import("@/lib/platform-data").then(m => m.getManualCertificateOptions());

  return (
    <DashboardShell role="admin" title="Certificats" description="Supervision, verification et revocation des certificats emis.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} />

      <details className="mb-6 rounded-lg border border-line bg-surface p-5">
        <summary className="cursor-pointer font-black text-lg">Emettre un certificat manuellement</summary>
        <form action={generateManualCertificateAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black">
            Apprenant
            <select name="learnerId" className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm focus:border-market" required>
              <option value="">Selectionner un apprenant</option>
              {learners.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} ({l.email})</option>)}
            </select>
          </label>
          <label className="text-sm font-black">
            Formation
            <select name="courseId" className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm focus:border-market" required>
              <option value="">Selectionner une formation</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          <button type="submit" className="md:col-span-2 mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-6 text-sm font-black text-on-market">Emettre le certificat</button>
        </form>
      </details>

      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Code, nom, email ou formation..."
          className="h-11 flex-1 rounded-lg border border-line bg-surface px-4 text-sm focus:border-market focus:ring-1 focus:ring-market"
        />
        <button type="submit" className="h-11 rounded-lg bg-foreground/[0.06] px-5 text-sm font-black transition hover:bg-foreground/[0.1] sm:hidden">
          Rechercher
        </button>
      </form>

      <div className="grid gap-4">
        {pagedCertificates.items.map((certificate) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={certificate.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Award className="h-5 w-5 text-market" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-black">{certificate.course.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {fullName(certificate.learner)} - {certificate.code} - {formatDate(certificate.issuedAt)}
                </p>
              </div>
              <StatusBadge tone={certificate.revokedAt ? "danger" : "market"}>
                {certificate.revokedAt ? "Revoque" : "Valide"}
              </StatusBadge>
            </div>
            {!certificate.revokedAt ? (
              <form action={revokeCertificateAction} className="mt-5">
                <input name="certificateId" type="hidden" value={certificate.id} />
                <ConfirmButton className="inline-flex min-h-10 items-center rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-black text-danger" confirmMessage="Voulez-vous vraiment revoquer ce certificat ? Action irreversible.">
                  Revoquer
                </ConfirmButton>
              </form>
            ) : null}
          </article>
        ))}
        {!pagedCertificates.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <Award className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucun certificat</h2>
            <p className="mt-3 text-sm text-muted">Les certificats generes apparaitront ici.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedCertificates.page} path="/admin/certificates" totalPages={pagedCertificates.totalPages} />
    </DashboardShell>
  );
}
