import { Award, Bell, BookOpen, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressBar } from "@/components/progress-bar";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { requirePageSession } from "@/lib/authorization";
import { getStudentDashboardData, getStudentNotifications } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await requirePageSession(["student"], "/student/dashboard");

  const [dashboard, notifications] = await Promise.all([
    getStudentDashboardData(session.userId),
    getStudentNotifications(session.userId),
  ]);
  const activeCourse = dashboard.activeCourse;

  return (
    <DashboardShell
      role="student"
      title="Dashboard apprenant"
      description="Vue rapide des formations attribuees, de la progression, des quiz et des relances utiles."
      action={<div className="flex flex-wrap gap-3"><ButtonLink href="/student/courses" variant="secondary">Mes formations</ButtonLink><ButtonLink href="/access-choice" showArrow>Demander une formation</ButtonLink></div>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={BookOpen} label="Formations" value={String(dashboard.courses.length)} detail="Acces actifs attribues." />
        <StatCard icon={TrendingUp} label="Progression" value={`${activeCourse?.progress ?? 0}%`} detail="Parcours principal." tone="cyan" />
        <StatCard icon={Bell} label="Notifications" value={String(dashboard.unreadNotifications)} detail="Messages non lus." tone="amber" />
        <StatCard icon={Award} label="Certificats" value={String(dashboard.certificates)} detail="Disponible au telechargement." />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-lg border border-line bg-surface p-6">
          {activeCourse ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <StatusBadge tone="market">En cours</StatusBadge>
                  <h2 className="mt-4 text-2xl font-black">{activeCourse.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{activeCourse.description}</p>
                </div>
              </div>
              <div className="mt-6">
                <ProgressBar value={activeCourse.progress} />
              </div>
              <div className="mt-6">
                <ButtonLink href={`/student/courses/${activeCourse.id}`} variant="secondary" showArrow>
                  Ouvrir la formation
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <StatusBadge tone="amber">Aucun acces</StatusBadge>
              <h2 className="mt-4 text-2xl font-black">Aucune formation attribuee</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Une formation apparaitra ici des que le formateur validera ta demande.</p>
              <div className="mt-6">
                <ButtonLink href="/access-choice" variant="secondary" showArrow>
                  Demander un acces
                </ButtonLink>
              </div>
            </>
          )}
        </article>

        <div className="grid gap-4">
          {notifications.slice(0, 3).map((notification) => (
            <article className="rounded-lg border border-line bg-surface p-5" key={notification.id}>
              <StatusBadge tone={notification.readAt ? "muted" : "cyan"}>{notification.title}</StatusBadge>
              <p className="mt-4 text-sm leading-7 text-muted">{notification.body}</p>
            </article>
          ))}
          {!notifications.length ? (
            <article className="rounded-lg border border-line bg-surface p-5">
              <StatusBadge tone="muted">Calme</StatusBadge>
              <p className="mt-4 text-sm leading-7 text-muted">Aucune notification pour le moment.</p>
            </article>
          ) : null}
        </div>
      </div>

      <section className="mt-6 rounded-lg border border-line bg-surface p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan">Prochain live</p>
        <h2 className="mt-3 text-2xl font-black">{dashboard.nextLive?.title ?? "Aucun live programme"}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          {dashboard.nextLive
            ? `${formatDate(dashboard.nextLive.scheduledAt)} - ${dashboard.nextLive.externalUrl}`
            : "Les annonces apparaitront ici quand une session externe sera planifiee."}
        </p>
      </section>
    </DashboardShell>
  );
}
