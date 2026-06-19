import { Radio } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { getVisibleLiveAnnouncements } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentLivesPage() {
  const session = await requirePageSession(["student"], "/student/live-announcements");

  const liveAnnouncements = await getVisibleLiveAnnouncements(session.userId);

  return (
    <DashboardShell role="student" title="Lives externes" description="Annonces de sessions organisees sur Zoom, Meet ou un outil externe.">
      <div className="grid gap-5 md:grid-cols-2">
        {liveAnnouncements.map((live) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={live.id}>
            <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">{live.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{formatDate(live.scheduledAt)} - {live.externalUrl}</p>
            <div className="mt-5">
              <StatusBadge tone="market">{live.course?.title ?? "Tous les apprenants"}</StatusBadge>
            </div>
          </article>
        ))}
        {!liveAnnouncements.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucun live programme</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Les annonces apparaitront ici des leur planification.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
