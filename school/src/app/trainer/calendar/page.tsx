import { CalendarDays } from "lucide-react";
import { CallScheduleForm } from "@/components/call-schedule-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { canManageTrainerData, requirePageSession } from "@/lib/authorization";
import { redirect } from "next/navigation";
import { fullName, getLearnerRows, getTrainerCalls, statusLabel } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { paginate, parsePage } from "@/lib/pagination";
import { deleteCallAction, setCallStatusAction, updateCallAction } from "./actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  "status-updated": "Statut de l'appel mis a jour.",
  "call-updated": "Appel modifie.",
  "call-deleted": "Appel supprime.",
  "invalid-call": "Les informations de l'appel sont invalides.",
  "invalid-learner": "Cet apprenant ne peut pas etre associe a cet appel.",
  "call-not-found": "Appel introuvable ou non autorise.",
};

export default async function TrainerCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; page?: string }>;
}) {
  const { notice, page: pageParam } = await searchParams;
  const session = await requirePageSession(["trainer", "admin"], "/trainer/calendar");
  if (!canManageTrainerData(session)) {
    redirect("/trainer/dashboard");
  }
  const scope = { userId: session.userId, isAdmin: session.role === "admin" };
  const [calls, learners] = await Promise.all([getTrainerCalls(scope), getLearnerRows(scope)]);
  const pagedCalls = paginate(calls, parsePage(pageParam));

  return (
    <DashboardShell role={session.role} title="Calendrier d'appels" description="Appels programmes et suggestions automatiques selon l'inactivite.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} />
      <CallScheduleForm learners={learners.map((learner) => ({ id: learner.id, name: learner.name, email: learner.email }))} />
      <div className="grid gap-5 md:grid-cols-2">
        {pagedCalls.items.map((call) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={call.id}>
            <CalendarDays className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">{fullName(call.learner)}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{call.title} - {formatDate(call.scheduledAt)}</p>
            {call.notes ? <p className="mt-3 text-sm leading-7 text-muted">{call.notes}</p> : null}
            <div className="mt-5">
              <StatusBadge tone={call.status === "DONE" ? "market" : call.status === "MISSED" ? "amber" : call.status === "CANCELLED" ? "danger" : "cyan"}>{statusLabel(call.status)}</StatusBadge>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(["DONE", "MISSED", "CANCELLED"] as const).map((status) => (
                <form action={setCallStatusAction} key={status}>
                  <input name="callId" type="hidden" value={call.id} />
                  <input name="status" type="hidden" value={status} />
                  <button className="inline-flex min-h-9 items-center rounded-lg border border-line bg-background px-3 text-xs font-black" type="submit">
                    {statusLabel(status)}
                  </button>
                </form>
              ))}
              <form action={deleteCallAction}>
                <input name="callId" type="hidden" value={call.id} />
                <button className="inline-flex min-h-9 items-center rounded-lg border border-danger/30 bg-danger/10 px-3 text-xs font-black text-danger" type="submit">
                  Supprimer
                </button>
              </form>
            </div>
            <details className="mt-5 rounded-lg border border-line bg-foreground/[0.04] p-4">
              <summary className="cursor-pointer text-sm font-black">Modifier l&apos;appel</summary>
              <form action={updateCallAction} className="mt-4 grid gap-3 md:grid-cols-2">
                <input name="callId" type="hidden" value={call.id} />
                <label className="text-sm font-black">
                  Apprenant
                  <select className="mt-2 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={call.learnerId} name="learnerId" required>
                    {learners.map((learner) => <option key={learner.id} value={learner.id}>{learner.name} - {learner.email}</option>)}
                  </select>
                </label>
                <label className="text-sm font-black">
                  Date et heure
                  <input className="mt-2 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={call.scheduledAt.toISOString().slice(0, 16)} name="scheduledAt" required type="datetime-local" />
                </label>
                <label className="text-sm font-black">
                  Titre
                  <input className="mt-2 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={call.title} name="title" required />
                </label>
                <label className="text-sm font-black">
                  Notes internes
                  <input className="mt-2 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={call.notes ?? ""} name="notes" />
                </label>
                <button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-market px-3 text-sm font-black text-on-market md:col-span-2" type="submit">Enregistrer les modifications</button>
              </form>
            </details>
          </article>
        ))}
        {!pagedCalls.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <CalendarDays className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucun appel</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Les appels planifies et suggestions de relance apparaitront ici.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedCalls.page} path="/trainer/calendar" totalPages={pagedCalls.totalPages} />
    </DashboardShell>
  );
}
