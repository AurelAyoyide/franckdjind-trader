import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { requirePageSession } from "@/lib/authorization";
import { getTrainerCourses, statusLabel } from "@/lib/platform-data";

export const dynamic = "force-dynamic";

export default async function TrainerCoursesPage() {
  await requirePageSession(["trainer", "admin"], "/trainer/courses");
  const courses = await getTrainerCourses();

  return (
    <DashboardShell
      role="trainer"
      title="Gestion des formations"
      description="Creation, publication, archivage, modules, lecons, quiz et supports."
      action={<ButtonLink href="/trainer/courses/new"><Plus className="h-4 w-4" /> Creer</ButtonLink>}
    >
      <div className="grid gap-5">
        {courses.map((course) => {
          const lessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);

          return (
          <article className="rounded-lg border border-line bg-surface p-5" key={course.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-black">{course.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{course.description}</p>
              </div>
              <StatusBadge tone={course.status === "PUBLISHED" ? "market" : "muted"}>{statusLabel(course.status)}</StatusBadge>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link className="rounded-lg border border-line bg-foreground/[0.06] px-3 py-2 text-sm font-bold" href={`/trainer/courses/${course.id}`}>{course.modules.length} modules</Link>
              <Link className="rounded-lg border border-line bg-foreground/[0.06] px-3 py-2 text-sm font-bold" href={`/trainer/courses/${course.id}`}>{lessons} lecons</Link>
              <Link className="rounded-lg border border-line bg-foreground/[0.06] px-3 py-2 text-sm font-bold" href={`/trainer/courses/${course.id}`}>Gerer</Link>
            </div>
          </article>
        );
        })}
        {!courses.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Aucune formation</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Cree une premiere formation pour ouvrir les inscriptions.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
