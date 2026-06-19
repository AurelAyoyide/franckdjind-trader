import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, LockKeyhole, PlayCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressBar } from "@/components/progress-bar";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { getStudentCourseDetail } from "@/lib/platform-data";

export const dynamic = "force-dynamic";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await requirePageSession(["student"], `/student/courses/${courseId}`);

  const detail = await getStudentCourseDetail(session.userId, courseId);

  if (!detail) {
    notFound();
  }

  const { course, modules } = detail;

  return (
    <DashboardShell
      role="student"
      title={course.title}
      description={course.description}
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-lg border border-line bg-surface p-6">
          <StatusBadge tone="market">{course.status}</StatusBadge>
          <div className="mt-6">
            <ProgressBar value={course.progress} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <span className="rounded-lg border border-line bg-foreground/[0.04] p-3 font-semibold">{course.modules} modules</span>
            <span className="rounded-lg border border-line bg-foreground/[0.04] p-3 font-semibold">{course.lessons} lecons</span>
            <span className="rounded-lg border border-line bg-foreground/[0.04] p-3 font-semibold">{course.level}</span>
            <span className="rounded-lg border border-line bg-foreground/[0.04] p-3 font-semibold">{course.duration}</span>
          </div>
        </article>

        <div className="grid gap-5">
          {modules.map((module) => (
            <section className="rounded-lg border border-line bg-surface p-5" key={module.id}>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-black">{module.title}</h2>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-muted">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  {module.unlock}
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {module.lessons.map((lesson) => {
                  const content = (
                    <>
                      <span className="flex items-center gap-3">
                        {lesson.locked ? (
                          <LockKeyhole className="h-5 w-5 text-muted" />
                        ) : lesson.kind === "VIDEO" ? (
                          <PlayCircle className="h-5 w-5 text-market" />
                        ) : (
                          <FileText className="h-5 w-5 text-cyan" />
                        )}
                        <span>
                          <span className="block font-black">{lesson.title}</span>
                          <span className="mt-1 block text-xs font-semibold text-muted">{lesson.kind} - {lesson.duration}</span>
                        </span>
                      </span>
                      <StatusBadge tone={lesson.done ? "market" : lesson.locked ? "danger" : "muted"}>
                        {lesson.done ? "Fait" : lesson.locked ? "Bloque" : "A faire"}
                      </StatusBadge>
                    </>
                  );

                  return lesson.locked ? (
                    <div
                      className="flex items-center justify-between gap-4 rounded-lg border border-line bg-foreground/[0.04] p-4 opacity-75"
                      key={lesson.id}
                    >
                      {content}
                    </div>
                  ) : (
                    <Link
                      className="flex items-center justify-between gap-4 rounded-lg border border-line bg-foreground/[0.04] p-4 transition hover:border-market"
                      href={lesson.href}
                      key={lesson.id}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
