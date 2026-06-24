import { Radio } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LiveAnnouncementForm } from "@/components/live-announcement-form";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { canManageTrainerData, requirePageSession } from "@/lib/authorization";
import { getTrainerCourses, getTrainerLiveAnnouncements, statusLabel } from "@/lib/platform-data";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { paginate, parsePage } from "@/lib/pagination";
import {
  cancelLiveAnnouncementAction,
  deleteLiveAnnouncementAction,
  updateLiveAnnouncementAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function TrainerLivesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const session = await requirePageSession(["trainer", "admin"], "/trainer/lives");
  if (!canManageTrainerData(session)) {
    redirect("/trainer/dashboard");
  }
  const scope = { userId: session.userId, isAdmin: session.role === "admin" };
  const [liveAnnouncements, courses] = await Promise.all([
    getTrainerLiveAnnouncements(scope),
    getTrainerCourses(scope),
  ]);
  const pagedLives = paginate(liveAnnouncements, parsePage(pageParam));

  return (
    <DashboardShell role={session.role} title="Annonces live" description="Creation et diffusion de sessions externes ciblees.">
      <LiveAnnouncementForm courses={courses.map((course) => ({ id: course.id, title: course.title }))} />
      <div className="grid gap-5 md:grid-cols-2">
        {pagedLives.items.map((live) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={live.id}>
            <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">{live.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{formatDate(live.scheduledAt)} - {live.externalUrl}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge tone={live.status === "CANCELLED" ? "danger" : "market"}>{statusLabel(live.status)}</StatusBadge>
              <StatusBadge tone="cyan">{live.course?.title ?? "Tous les apprenants"}</StatusBadge>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {live.status !== "CANCELLED" ? (
                <form action={cancelLiveAnnouncementAction}>
                  <input name="liveId" type="hidden" value={live.id} />
                  <button className="inline-flex min-h-10 items-center rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-black text-danger" type="submit">Annuler le live</button>
                </form>
              ) : (
                <form action={deleteLiveAnnouncementAction}>
                  <input name="liveId" type="hidden" value={live.id} />
                  <button className="inline-flex min-h-10 items-center rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-black text-danger" type="submit">Supprimer definitivement</button>
                </form>
              )}
            </div>
            {live.status !== "CANCELLED" ? (
              <details className="mt-5 rounded-lg border border-line bg-foreground/[0.04] p-4">
                <summary className="cursor-pointer text-sm font-black">Modifier le live</summary>
                <form action={updateLiveAnnouncementAction} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input name="liveId" type="hidden" value={live.id} />
                  <label className="text-sm font-black">Titre<input className="mt-2 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={live.title} name="title" required /></label>
                  <label className="text-sm font-black">Date et heure<input className="mt-2 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={live.scheduledAt.toISOString().slice(0, 16)} name="scheduledAt" required type="datetime-local" /></label>
                  <label className="text-sm font-black">Lien HTTPS<input className="mt-2 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={live.externalUrl} name="externalUrl" required type="url" /></label>
                  <label className="text-sm font-black">Cible
                    <select className="mt-2 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={live.courseId ?? ""} name="courseId">
                      <option value="">Tous les apprenants</option>
                      {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-black md:col-span-2">Description<textarea className="mt-2 min-h-24 w-full rounded-lg border border-line bg-background p-3 text-sm" defaultValue={live.body} name="body" required /></label>
                  <button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-market px-3 text-sm font-black text-on-market md:col-span-2" type="submit">Enregistrer les modifications</button>
                </form>
              </details>
            ) : null}
          </article>
        ))}
        {!pagedLives.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucun live</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Les annonces publiees apparaitront ici.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedLives.page} path="/trainer/lives" totalPages={pagedLives.totalPages} />
    </DashboardShell>
  );
}
