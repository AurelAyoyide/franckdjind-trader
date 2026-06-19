import { CheckCircle2, XCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getTrainingRequests, statusLabel } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { approveTrainingRequestAction, rejectTrainingRequestAction } from "@/app/trainer/requests/actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  approved: "Demande approuvee, acces attribue et apprenant notifie.",
  rejected: "Demande refusee.",
};

export default async function TrainerRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  await requirePageSession(["trainer", "admin"], "/trainer/requests");
  const trainingRequests = await getTrainingRequests();

  return (
    <DashboardShell role="trainer" title="Demandes de formation" description="Validation manuelle apres verification du paiement hors plateforme.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} />
      <div className="grid gap-4">
        {trainingRequests.map((request) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={request.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-black">{fullName(request.learner)}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {request.course?.title ?? "Formation a attribuer"} - {statusLabel(request.type)} - {formatDate(request.createdAt)}
                </p>
              </div>
              <StatusBadge tone={request.status === "PENDING" ? "amber" : "market"}>{statusLabel(request.status)}</StatusBadge>
            </div>
            {request.status === "PENDING" ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <form action={approveTrainingRequestAction}>
                  <input name="requestId" type="hidden" value={request.id} />
                  <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-market px-4 text-sm font-black text-on-market" type="submit">
                    <CheckCircle2 className="h-4 w-4" /> Attribuer
                  </button>
                </form>
                <form action={rejectTrainingRequestAction}>
                  <input name="requestId" type="hidden" value={request.id} />
                  <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-black" type="submit">
                    <XCircle className="h-4 w-4" /> Refuser
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
        {!trainingRequests.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Aucune demande</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Les nouvelles demandes d&apos;acces apparaitront ici.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
