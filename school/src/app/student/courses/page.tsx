import Link from "next/link";
import { BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressBar } from "@/components/progress-bar";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { getStudentCourseCards } from "@/lib/platform-data";

export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  const session = await requirePageSession(["student"], "/student/courses");

  const courses = await getStudentCourseCards(session.userId);

  return (
    <DashboardShell
      role="student"
      title="Mes formations"
      description="Les formations apparaissent ici uniquement apres attribution par le formateur."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {courses.map((course) => (
          <Link className="rounded-lg border border-line bg-surface p-5 transition hover:border-line-strong" href={`/student/courses/${course.id}`} key={course.id}>
            <div className="flex items-start justify-between gap-3">
              <BookOpen className="h-5 w-5 text-market" aria-hidden="true" />
              <StatusBadge tone={course.type === "Gratuite" ? "cyan" : "amber"}>{course.type}</StatusBadge>
            </div>
            <h2 className="mt-6 text-xl font-black">{course.title}</h2>
            <p className="mt-3 min-h-20 text-sm leading-7 text-muted">{course.description}</p>
            <div className="mt-5">
              <ProgressBar value={course.progress} />
            </div>
          </Link>
        ))}
        {!courses.length ? (
          <div className="rounded-lg border border-line bg-surface p-5">
            <BookOpen className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-6 text-xl font-black">Aucune formation attribuee</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Demande un acces, puis le formateur l&apos;activera apres verification.</p>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
