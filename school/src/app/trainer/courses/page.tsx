import Link from "next/link";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Pagination } from "@/components/pagination";
import { requirePageSession } from "@/lib/authorization";
import { getTrainerCourses, statusLabel } from "@/lib/platform-data";
import { paginate, parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function TrainerCoursesPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  const { page: pageParam, q, status } = await searchParams;
  const session = await requirePageSession(["trainer", "admin"], "/trainer/courses");

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    redirect("/trainer/dashboard");
  }
  const courses = await getTrainerCourses(
    { userId: session.userId, isAdmin: session.role === "admin" },
    { q, status }
  );
  const pagedCourses = paginate(courses, parsePage(pageParam));

  return (
    <DashboardShell
      role={session.role}
      title="Gestion des formations"
      description="Creation, publication, archivage, modules, lecons, quiz et supports."
      action={<ButtonLink href="/trainer/courses/new"><Plus className="h-4 w-4" /> Creer</ButtonLink>}
    >
      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher une formation..."
          className="h-11 flex-1 rounded-lg border border-line bg-surface px-4 text-sm focus:border-market focus:ring-1 focus:ring-market"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-lg border border-line bg-surface px-4 text-sm focus:border-market focus:ring-1 focus:ring-market"
        >
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publiee</option>
          <option value="ARCHIVED">Archivee</option>
        </select>
        <button type="submit" className="h-11 rounded-lg bg-foreground/[0.06] px-5 text-sm font-black transition hover:bg-foreground/[0.1]">
          Filtrer
        </button>
      </form>

      <div className="grid gap-5">
        {pagedCourses.items.map((course) => {
          const lessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);

          return (
            <article className="rounded-lg border border-line bg-surface p-5" key={course.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-black">{course.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted line-clamp-3 break-words">{course.description}</p>
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
        {!pagedCourses.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Aucune formation</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Cree une premiere formation pour ouvrir les inscriptions.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedCourses.page} path="/trainer/courses" totalPages={pagedCourses.totalPages} />
    </DashboardShell>
  );
}
