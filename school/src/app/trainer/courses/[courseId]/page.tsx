import { UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { FileText, HelpCircle, PlayCircle, UsersRound } from "lucide-react";
import { CourseBuilderForms } from "@/components/course-builder-forms";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmButton } from "@/components/confirm-button";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getLearnerRows, getTrainerCourseBuilder, statusLabel } from "@/lib/platform-data";
import { deleteLessonAction, deleteModuleAction, retireCourseAction, setEnrollmentStatusAction, updateLessonAction, updateModuleAction } from "./actions";

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
  const session = await requirePageSession(["trainer", "admin"], `/trainer/courses/${courseId}`);

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    redirect("/trainer/dashboard");
  }

  const [course, learners] = await Promise.all([
    getTrainerCourseBuilder(courseId, { userId: session.userId, isAdmin: session.role === "admin" }),
    getLearnerRows({ userId: session.userId, isAdmin: session.role === "admin" }),
  ]);

  if (!course) {
    notFound();
  }

  const quizLessons = course.modules
    .flatMap((module) => module.lessons)
    .filter((lesson) => lesson.type === "QUIZ" && !lesson.quiz)
    .map((lesson) => ({ id: lesson.id, title: lesson.title }));
  const configuredQuizzes = course.modules.flatMap((module) => module.lessons).flatMap((lesson) => lesson.quiz ? [{ id: lesson.quiz.id, title: lesson.quiz.title, questions: lesson.quiz.questions.map(q => ({ id: q.id, text: q.text })) }] : []);
  const activeLearnerIds = new Set(
    course.enrollments
      .filter((enrollment) => enrollment.status === "ACTIVE")
      .map((enrollment) => enrollment.learnerId),
  );

  const structureView = (
    <section className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-black">Structure actuelle</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{course.modules.length} module(s), {course.modules.flatMap((module) => module.lessons).length} leçon(s).</p>
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
                  <details><summary className="cursor-pointer text-xs font-black">Gérer</summary><form action={updateLessonAction} className="mt-2 grid gap-2"><input name="lessonId" type="hidden" value={lesson.id} /><input className="min-h-9 rounded border border-line px-2 text-xs" defaultValue={lesson.title} name="title" /><input name="content" type="hidden" value={lesson.content ?? ""} /><button className="inline-flex min-h-8 items-center justify-center rounded-md bg-market px-3 text-xs font-black text-on-market hover:bg-market/90 transition-colors" type="submit">Modifier</button></form><form action={deleteLessonAction}><input name="lessonId" type="hidden" value={lesson.id} /><ConfirmButton className="mt-2 inline-flex w-full min-h-8 items-center justify-center rounded-md border border-danger/30 bg-danger/10 px-3 text-xs font-black text-danger hover:bg-danger/20 transition-colors">Supprimer</ConfirmButton></form></details>
                </div>
              ))}
              {!module.lessons.length ? <p className="text-sm text-muted">Aucune leçon dans ce module.</p> : null}
            </div>
            <details className="mt-3"><summary className="cursor-pointer text-xs font-black">Modifier le module</summary><form action={updateModuleAction} className="mt-3 grid gap-2"><input name="moduleId" type="hidden" value={module.id} /><input className="min-h-9 rounded border border-line px-2 text-xs" defaultValue={module.title} name="title" /><input className="min-h-9 rounded border border-line px-2 text-xs" defaultValue={module.description ?? ""} name="description" /><button className="inline-flex min-h-8 items-center justify-center rounded-md bg-market px-3 text-xs font-black text-on-market hover:bg-market/90 transition-colors" type="submit">Enregistrer</button></form><form action={deleteModuleAction} className="mt-2"><input name="moduleId" type="hidden" value={module.id} /><ConfirmButton className="inline-flex w-full min-h-8 items-center justify-center rounded-md border border-danger/30 bg-danger/10 px-3 text-xs font-black text-danger hover:bg-danger/20 transition-colors">Supprimer le module vide</ConfirmButton></form></details>
          </article>
        ))}
        {!course.modules.length ? <p className="text-sm text-muted">Aucun module pour le moment.</p> : null}
      </div>
    </section>
  );

  const learnersView = (
    <section className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <UsersRound className="h-5 w-5 text-market" aria-hidden="true" />
        <h2 className="text-xl font-black">Apprenants inscrits</h2>
      </div>
      <div className="mt-5 grid gap-3">
        {course.enrollments.map((enrollment) => (
          <div className="rounded-lg border border-line bg-foreground/[0.04] p-3 flex flex-col md:flex-row md:items-center justify-between" key={enrollment.id}>
            <div>
              <p className="font-black">{fullName(enrollment.learner)}</p>
              <p className="mt-1 text-sm text-muted">{enrollment.learner.email} - {statusLabel(enrollment.status)}</p>
            </div>
            <form action={setEnrollmentStatusAction} className="mt-3 md:mt-0">
              <input name="enrollmentId" type="hidden" value={enrollment.id} />
              <input name="status" type="hidden" value={enrollment.status === "REVOKED" ? "ACTIVE" : "REVOKED"} />
              <button className="inline-flex min-h-9 items-center rounded-lg border border-line bg-background px-3 text-xs font-black" type="submit">
                {enrollment.status === "REVOKED" ? "Réactiver" : "Retirer l'accès"}
              </button>
            </form>
          </div>
        ))}
        {!course.enrollments.length ? <p className="text-sm text-muted">Aucun apprenant inscrit.</p> : null}
      </div>
    </section>
  );

  return (
    <DashboardShell
      role={session.role}
      title={course.title}
      description="Gestion de la formation en 4 étapes (Informations, Contenu, Quiz, Publication)."
    >
      <NoticeBanner
        message={
          notice === "course-status"
            ? "Statut de la formation mis à jour."
            : notice === "course-incomplete"
              ? "Ajoute au moins une leçon complète : texte rempli, quiz configuré ou fichier privé valide avant publication."
              : notice === "module-not-empty" ? "Supprime ou déplace les leçons du module avant de supprimer ce module."
                : notice === "lesson-tracked" ? "Cette leçon a déjà une progression ou des tentatives ; elle ne peut pas être supprimée."
                  : notice === "module-updated" || notice === "lesson-updated" ? "Structure mise à jour."
                    : notice === "module-deleted" || notice === "lesson-deleted" ? "Élément supprimé."
                      : notice === "question-deleted" ? "Question supprimée."
                        : notice === "question-tracked" ? "Ce quiz a déjà été tenté, impossible de supprimer des questions."
                          : notice === "enrollment-status"
                            ? "Accès apprenant mis à jour et notification envoyée."
                            : null
        }
      />

      <div className="mb-6 flex justify-end">
        <ConfirmActionForm action={retireCourseAction} description="Sans apprenant, la formation sera supprimée. Avec un historique apprenant, elle sera archivée pour protéger les données." label="Retirer cette formation" title="Retirer la formation ?" values={{ courseId: course.id }} />
      </div>

      <CourseBuilderForms
        course={{
          id: course.id,
          title: course.title,
          description: course.description,
          type: course.type,
          priceAmount: course.priceAmount,
          priceCurrency: course.priceCurrency,
          durationValue: course.durationValue,
          durationUnit: course.durationUnit,
          status: course.status,
        }}
        modules={course.modules.map((module) => ({ id: module.id, title: module.title }))}
        quizLessons={quizLessons}
        configuredQuizzes={configuredQuizzes}
        learners={learners
          .filter((learner) => !activeLearnerIds.has(learner.id))
          .map((learner) => ({ id: learner.id, name: learner.name, email: learner.email }))}
        structureView={structureView}
        learnersView={learnersView}
      />
    </DashboardShell>
  );
}
