import { Radio } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LiveAnnouncementForm } from "@/components/live-announcement-form";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { getTrainerCourses, getVisibleLiveAnnouncements, statusLabel } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TrainerLivesPage() {
  await requirePageSession(["trainer", "admin"], "/trainer/lives");
  const [liveAnnouncements, courses] = await Promise.all([
    getVisibleLiveAnnouncements(),
    getTrainerCourses(),
  ]);

  return (
    <DashboardShell role="trainer" title="Annonces live" description="Creation et diffusion de sessions externes ciblees.">
      <LiveAnnouncementForm courses={courses.map((course) => ({ id: course.id, title: course.title }))} />
      <div className="grid gap-5 md:grid-cols-2">
        {liveAnnouncements.map((live) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={live.id}>
            <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">{live.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{formatDate(live.scheduledAt)} - {live.externalUrl}</p>
            <div className="mt-5">
              <StatusBadge tone="market">{live.course?.title ?? statusLabel(live.status)}</StatusBadge>
            </div>
          </article>
        ))}
        {!liveAnnouncements.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucun live</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Les annonces publiees apparaitront ici.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
