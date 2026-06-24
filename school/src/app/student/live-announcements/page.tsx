import { Radio } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import { requirePageSession } from "@/lib/authorization";
import { getVisibleLiveAnnouncements } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { paginate, parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function StudentLivesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const session = await requirePageSession(["student"], "/student/live-announcements");

  const liveAnnouncements = await getVisibleLiveAnnouncements(session.userId);
  const pagedLives = paginate(liveAnnouncements, parsePage(pageParam));

  return (
    <DashboardShell role="student" title="Lives externes" description="Annonces de sessions organisees sur Zoom, Meet ou un outil externe.">
      <div className="grid gap-5 md:grid-cols-2">
        {pagedLives.items.map((live) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={live.id}>
            <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">{live.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{formatDate(live.scheduledAt)}</p>
            <a className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-market px-3 text-sm font-black text-on-market" href={live.externalUrl} rel="noreferrer" target="_blank">Rejoindre le live</a>
            <div className="mt-5">
              <StatusBadge tone="market">{live.course?.title ?? "Tous les apprenants"}</StatusBadge>
            </div>
          </article>
        ))}
        {!pagedLives.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucun live programme</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Les annonces apparaitront ici des leur planification.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedLives.page} path="/student/live-announcements" totalPages={pagedLives.totalPages} />
    </DashboardShell>
  );
}
