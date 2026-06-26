import { CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { canManageTrainerData, requirePageSession } from "@/lib/authorization";
import { fullName, getTrainingRequests, statusLabel } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { paginate, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";
import { approveTrainingRequestAction, rejectTrainingRequestAction } from "@/app/trainer/requests/actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  approved: "Demande approuvee, acces attribue et apprenant notifie.",
  rejected: "Demande refusee.",
};

export default async function TrainerRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; page?: string; q?: string; status?: string }>;
}) {
  const { notice, page: pageParam, q, status } = await searchParams;
  const session = await requirePageSession(["trainer", "admin"], "/trainer/requests");
  if (!canManageTrainerData(session)) {
    redirect("/trainer/dashboard");
  }
  const [trainingRequests, publishedCourses] = await Promise.all([
    getTrainingRequests(
      { userId: session.userId, isAdmin: session.role === "admin" },
      { q, status }
    ),
    prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      orderBy: { title: "asc" },
      select: { id: true, title: true, type: true },
    }),
  ]);
  const pagedRequests = paginate(trainingRequests, parsePage(pageParam));

  return (
    <DashboardShell role={session.role} title="Demandes de formation" description="Validation manuelle des demandes gratuites et verification des paiements hors plateforme pour les formations payantes.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} />

      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom ou email..."
          className="h-11 flex-1 rounded-lg border border-line bg-surface px-4 text-sm focus:border-market focus:ring-1 focus:ring-market"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-lg border border-line bg-surface px-4 text-sm focus:border-market focus:ring-1 focus:ring-market"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Demande approuvee</option>
          <option value="REJECTED">Demande refusee</option>
        </select>
        <button type="submit" className="h-11 rounded-lg bg-foreground/[0.06] px-5 text-sm font-black transition hover:bg-foreground/[0.1]">
          Filtrer
        </button>
      </form>

      <div className="grid gap-4">
        {pagedRequests.items.map((request) => (
          <article className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition hover:shadow-md" key={request.id}>
            <div className="border-b border-line p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-black text-cyan uppercase tracking-widest">
                    {request.learner.firstName?.[0] ?? ""}{request.learner.lastName?.[0] ?? ""}
                  </div>
                  <div>
                    <h2 className="text-lg font-black">{fullName(request.learner)}</h2>
                    <p className="text-sm font-medium text-muted">{request.learner.email}</p>
                  </div>
                </div>
                <StatusBadge tone={request.status === "PENDING" ? "amber" : request.status === "APPROVED" ? "market" : "danger"}>
                  {statusLabel(request.status)}
                </StatusBadge>
              </div>

              <div className="mt-6 grid gap-4 rounded-lg bg-foreground/[0.02] p-4 sm:grid-cols-3">
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider">Date</span>
                  <span className="mt-1 block text-sm font-semibold">{formatDate(request.createdAt)}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider">Type</span>
                  <span className="mt-1 block text-sm font-semibold">{statusLabel(request.type)}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider">Formation cible</span>
                  <span className="mt-1 block text-sm font-semibold">{request.course?.title ?? "A definir par vous"}</span>
                </div>
              </div>

              {request.status === "PENDING" ? (
                <div className="mt-6 rounded-lg border border-amber/30 bg-amber/5 p-4 md:p-5">
                  <p className="text-sm font-black text-amber-900 dark:text-amber-300">Action requise</p>
                  <p className="mt-1 text-xs font-medium text-amber-800/70 dark:text-amber-200/70 mb-4">
                    {request.type === "FREE"
                      ? "Demande gratuite : verifiez simplement le compte et la formation souhaitee avant d'activer l'acces."
                      : "Formation payante : assurez-vous que le paiement hors plateforme a bien ete recu avant d'attribuer definitivement l'acces a cet apprenant."}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <form action={approveTrainingRequestAction} className="flex flex-1 flex-col sm:flex-row sm:items-end gap-3">
                      <input name="requestId" type="hidden" value={request.id} />
                      {!request.course ? (
                        <label className="flex-1 w-full relative">
                          <span className="mb-2 block text-xs font-black text-foreground">Selectionner la formation precise</span>
                          <select className="h-11 w-full rounded-lg border border-amber/30 bg-background px-3 text-sm focus:border-amber focus:ring-1 focus:ring-amber" name="courseId" required>
                            <option value="">-- Assigner --</option>
                            {publishedCourses.filter((c) => c.type === (request.type === "FREE" ? "FREE" : "PAID")).map((c) => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-market px-6 text-sm font-black text-on-market shadow-market transition hover:bg-market-strong focus:outline-none focus:ring-2 focus:ring-market focus:ring-offset-2" type="submit">
                        <CheckCircle2 className="h-4 w-4" /> Attribuer l&apos;acces
                      </button>
                    </form>
                    <form action={rejectTrainingRequestAction}>
                      <input name="requestId" type="hidden" value={request.id} />
                      <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-6 text-sm font-black transition hover:bg-foreground/[0.04] sm:w-auto" type="submit">
                        <XCircle className="h-4 w-4" /> Refuser
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        ))}
        {!pagedRequests.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Aucune demande</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Les nouvelles demandes d&apos;acces apparaitront ici.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedRequests.page} path="/trainer/requests" totalPages={pagedRequests.totalPages} />
    </DashboardShell>
  );
}
