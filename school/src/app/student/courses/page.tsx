import Link from "next/link";
import { BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressBar } from "@/components/progress-bar";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { requirePageSession } from "@/lib/authorization";
import { getStudentCourseCards } from "@/lib/platform-data";
import { paginate, parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function StudentCoursesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const session = await requirePageSession(["student"], "/student/courses");

  const courses = await getStudentCourseCards(session.userId);
  const pagedCourses = paginate(courses, parsePage(pageParam));

  return (
    <DashboardShell
      role="student"
      title="Mes formations"
      description="Les formations apparaissent ici uniquement apres attribution par le formateur."
      action={<ButtonLink href="/access-choice" showArrow>Demander une autre formation</ButtonLink>}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {pagedCourses.items.map((course) => (
          <Link className="flex flex-col h-full rounded-lg border border-line bg-surface p-5 transition hover:border-line-strong" href={`/student/courses/${course.id}`} key={course.id}>
            <div className="flex items-start justify-between gap-3">
              <BookOpen className="h-5 w-5 text-market shrink-0" aria-hidden="true" />
              <StatusBadge tone={course.type === "Gratuite" ? "cyan" : "amber"}>{course.type}</StatusBadge>
            </div>
            <h2 className="mt-6 text-xl font-black">{course.title}</h2>
            <p className="mt-3 min-h-20 text-sm leading-7 text-muted line-clamp-3 break-words">{course.description}</p>
            <div className="mt-auto pt-6">
              <ProgressBar value={course.progress} />
            </div>
          </Link>
        ))}
        {!pagedCourses.total ? (
          <div className="rounded-lg border border-line bg-surface p-5">
            <BookOpen className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-6 text-xl font-black">Aucune formation attribuee</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Demande un acces, puis le formateur l&apos;activera apres verification.</p>
          </div>
        ) : null}
      </div>
      <Pagination page={pagedCourses.page} path="/student/courses" totalPages={pagedCourses.totalPages} />
    </DashboardShell>
  );
}
