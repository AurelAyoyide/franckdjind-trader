import { notFound } from "next/navigation";
import { BookOpen, FileText, HelpCircle, PlayCircle, UsersRound } from "lucide-react";
import { CourseBuilderForms } from "@/components/course-builder-forms";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getLearnerRows, getTrainerCourseBuilder, statusLabel } from "@/lib/platform-data";
import { setEnrollmentStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TrainerCourseBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { courseId } = await params;
  const { notice } = await searchParams;
  await requirePageSession(["trainer", "admin"], `/trainer/courses/${courseId}`);

  const [course, learners] = await Promise.all([
    getTrainerCourseBuilder(courseId),
    getLearnerRows(),
  ]);

  if (!course) {
    notFound();
  }

  const quizLessons = course.modules
    .flatMap((module) => module.lessons)
    .filter((lesson) => lesson.type === "QUIZ" && !lesson.quiz)
    .map((lesson) => ({ id: lesson.id, title: lesson.title }));
  const activeLearnerIds = new Set(
    course.enrollments
      .filter((enrollment) => enrollment.status === "ACTIVE")
      .map((enrollment) => enrollment.learnerId),
  );

  return (
    <DashboardShell
      role="trainer"
      title={course.title}
      description="Gestion de la formation, des modules, des lecons, des quiz et des apprenants inscrits."
    >
      <NoticeBanner
        message={
          notice === "course-status"
            ? "Statut de la formation mis a jour."
            : notice === "enrollment-status"
              ? "Acces apprenant mis a jour et notification envoyee."
              : null
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-5">
          <section className="rounded-lg border border-line bg-surface p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Structure</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{course.modules.length} module(s), {course.modules.flatMap((module) => module.lessons).length} lecon(s).</p>
              </div>
              <StatusBadge tone={course.status === "PUBLISHED" ? "market" : "muted"}>{statusLabel(course.status)}</StatusBadge>
            </div>
            <div className="mt-5 grid gap-4">
              {course.modules.map((module) => (
                <article className="rounded-lg border border-line bg-foreground/[0.04] p-4" key={module.id}>
                  <h3 className="font-black">{module.position}. {module.title}</h3>
                  {module.description ? <p className="mt-2 text-sm leading-6 text-muted">{module.description}</p> : null}
                  <div className="mt-4 grid gap-2">
                    {module.lessons.map((lesson) => (
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-background p-3" key={lesson.id}>
                        <span className="flex items-center gap-3 text-sm font-semibold">
                          {lesson.type === "VIDEO" ? <PlayCircle className="h-4 w-4 text-market" /> : lesson.type === "QUIZ" ? <HelpCircle className="h-4 w-4 text-amber" /> : <FileText className="h-4 w-4 text-cyan" />}
                          {lesson.position}. {lesson.title}
                        </span>
                        <StatusBadge tone={lesson.quiz ? "market" : "muted"}>{lesson.type}</StatusBadge>
                      </div>
                    ))}
                    {!module.lessons.length ? <p className="text-sm text-muted">Aucune lecon dans ce module.</p> : null}
                  </div>
                </article>
              ))}
              {!course.modules.length ? <p className="text-sm text-muted">Aucun module pour le moment.</p> : null}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-market" aria-hidden="true" />
              <h2 className="text-2xl font-black">Apprenants inscrits</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {course.enrollments.map((enrollment) => (
                <div className="rounded-lg border border-line bg-foreground/[0.04] p-3" key={enrollment.id}>
                  <p className="font-black">{fullName(enrollment.learner)}</p>
                  <p className="mt-1 text-sm text-muted">{enrollment.learner.email} - {statusLabel(enrollment.status)}</p>
                  <form action={setEnrollmentStatusAction} className="mt-3">
                    <input name="enrollmentId" type="hidden" value={enrollment.id} />
                    <input name="status" type="hidden" value={enrollment.status === "REVOKED" ? "ACTIVE" : "REVOKED"} />
                    <button className="inline-flex min-h-9 items-center rounded-lg border border-line bg-background px-3 text-xs font-black" type="submit">
                      {enrollment.status === "REVOKED" ? "Reactiver" : "Retirer l'acces"}
                    </button>
                  </form>
                </div>
              ))}
              {!course.enrollments.length ? <p className="text-sm text-muted">Aucun apprenant inscrit.</p> : null}
            </div>
          </section>
        </div>

        <aside>
          <div className="mb-5 rounded-lg border border-line bg-surface p-5">
            <BookOpen className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">Builder</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Ajoute les modules, lecons, quiz et fichiers prives de la formation.</p>
          </div>
          <CourseBuilderForms
            course={{
              id: course.id,
              title: course.title,
              description: course.description,
              type: course.type,
              priceLabel: course.priceLabel,
              duration: course.duration,
              status: course.status,
            }}
            modules={course.modules.map((module) => ({ id: module.id, title: module.title }))}
            quizLessons={quizLessons}
            learners={learners
              .filter((learner) => !activeLearnerIds.has(learner.id))
              .map((learner) => ({ id: learner.id, name: learner.name, email: learner.email }))}
          />
        </aside>
      </div>
    </DashboardShell>
  );
}
