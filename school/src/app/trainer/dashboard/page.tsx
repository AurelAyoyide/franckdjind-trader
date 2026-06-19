import { Bell, BookOpen, CalendarDays, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getTrainerCalls, getTrainerDashboardData, statusLabel } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TrainerDashboardPage() {
  await requirePageSession(["trainer", "admin"], "/trainer/dashboard");
  const [dashboard, callRows] = await Promise.all([getTrainerDashboardData(), getTrainerCalls()]);

  return (
    <DashboardShell
      role="trainer"
      title="Dashboard formateur"
      description="Une vue operationnelle pour traiter les demandes, suivre les apprenants inactifs et programmer les prochaines actions."
      action={<ButtonLink href="/trainer/courses/new" showArrow>Nouvelle formation</ButtonLink>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={UsersRound} label="Apprenants" value={String(dashboard.learners)} detail="Comptes actifs." />
        <StatCard icon={BookOpen} label="Formations" value={String(dashboard.courses)} detail="Tous statuts." tone="cyan" />
        <StatCard icon={Bell} label="Demandes" value={String(dashboard.requests)} detail="A verifier." tone="amber" />
        <StatCard icon={CalendarDays} label="Appels" value={String(dashboard.calls)} detail="Aujourd'hui et demain." />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-2xl font-black">Demandes recentes</h2>
          <div className="mt-5 grid gap-3">
            {dashboard.recentRequests.map((request) => (
              <div className="rounded-lg border border-line bg-foreground/[0.04] p-4" key={request.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black">{fullName(request.learner)}</p>
                  <StatusBadge tone="amber">{statusLabel(request.status)}</StatusBadge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{request.course?.title ?? "A attribuer"} - {statusLabel(request.type)}</p>
              </div>
            ))}
            {!dashboard.recentRequests.length ? <p className="text-sm text-muted">Aucune demande recente.</p> : null}
          </div>
        </section>
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-2xl font-black">Appels et relances</h2>
          <div className="mt-5 grid gap-3">
            {callRows.slice(0, 5).map((call) => (
              <div className="rounded-lg border border-line bg-foreground/[0.04] p-4" key={call.id}>
                <p className="font-black">{fullName(call.learner)}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{call.title} - {formatDate(call.scheduledAt)}</p>
              </div>
            ))}
            {!callRows.length ? <p className="text-sm text-muted">Aucun appel programme.</p> : null}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
