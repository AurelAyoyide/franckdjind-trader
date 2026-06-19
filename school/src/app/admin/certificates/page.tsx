import { Award } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getAdminCertificates } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { revokeCertificateAction } from "./actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  revoked: "Certificat revoque. La verification publique indiquera qu'il n'est plus valide.",
};

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  await requirePageSession(["admin"], "/admin/certificates");
  const certificates = await getAdminCertificates();

  return (
    <DashboardShell role="admin" title="Certificats" description="Supervision, verification et revocation des certificats emis.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} />
      <div className="grid gap-4">
        {certificates.map((certificate) => (
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
                <button className="inline-flex min-h-10 items-center rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-black text-danger" type="submit">
                  Revoquer
                </button>
              </form>
            ) : null}
          </article>
        ))}
        {!certificates.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <Award className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucun certificat</h2>
            <p className="mt-3 text-sm text-muted">Les certificats generes apparaitront ici.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
