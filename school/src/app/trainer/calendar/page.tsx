import { CalendarDays } from "lucide-react";
import { CallScheduleForm } from "@/components/call-schedule-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusBadge } from "@/components/status-badge";
import { canManageTrainerData, requirePageSession } from "@/lib/authorization";
import { redirect } from "next/navigation";
import { fullName, getLearnerRows, getTrainerCalls, statusLabel } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { setCallStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  "status-updated": "Statut de l'appel mis a jour.",
};

export default async function TrainerCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const session = await requirePageSession(["trainer", "admin"], "/trainer/calendar");
  if (!canManageTrainerData(session)) {
    redirect("/trainer/dashboard");
  }
  const scope = { userId: session.userId, isAdmin: session.role === "admin" };
  const [calls, learners] = await Promise.all([getTrainerCalls(scope), getLearnerRows(scope)]);

  return (
    <DashboardShell role={session.role} title="Calendrier d'appels" description="Appels programmes et suggestions automatiques selon l'inactivite.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} />
      <CallScheduleForm learners={learners.map((learner) => ({ id: learner.id, name: learner.name, email: learner.email }))} />
      <div className="grid gap-5 md:grid-cols-2">
        {calls.map((call) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={call.id}>
            <CalendarDays className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">{fullName(call.learner)}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{call.title} - {formatDate(call.scheduledAt)}</p>
            {call.notes ? <p className="mt-3 text-sm leading-7 text-muted">{call.notes}</p> : null}
            <div className="mt-5">
              <StatusBadge tone={call.status === "SCHEDULED" ? "market" : "cyan"}>{statusLabel(call.status)}</StatusBadge>
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
            </div>
          </article>
        ))}
        {!calls.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <CalendarDays className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucun appel</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Les appels planifies et suggestions de relance apparaitront ici.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
