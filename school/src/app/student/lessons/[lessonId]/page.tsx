import { notFound } from "next/navigation";
import { Download, FileText, Play, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { VideoLessonPlayer } from "@/components/video-lesson-player";
import { requirePageSession } from "@/lib/authorization";
import { getStudentLesson } from "@/lib/platform-data";
import { completeLessonAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function StudentLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { lessonId } = await params;
  const { notice } = await searchParams;
  const session = await requirePageSession(["student"], `/student/lessons/${lessonId}`);

  const lesson = await getStudentLesson(session.userId, lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <DashboardShell
      role="student"
      title={lesson.title}
      description={
        lesson.kind === "VIDEO"
          ? "La progression vidéo est enregistrée pendant la lecture."
          : "Consulte la ressource, puis marque la leçon comme terminée pour continuer le parcours."
      }
    >
      <NoticeBanner message={notice === "completed" ? "Leçon marquée comme terminée. Ta progression a été mise à jour." : null} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
        {lesson.kind === "VIDEO" ? (
          <VideoLessonPlayer
            initialPosition={lesson.videoPosition}
            lessonId={lesson.id}
            title={lesson.title}
            watermark={session.email ?? "apprenant"}
            nextLessonUrl={lesson.nextLessonUrl}
          />
        ) : lesson.kind === "DOCUMENT" ? (
          <section className="rounded-lg border border-line bg-surface p-6">
            <FileText className="h-7 w-7 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">Document de la leçon</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Ouvre le document associé à cette leçon, puis reviens ici pour valider ta progression.
            </p>
            {lesson.documentPath ? (
              <a
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market"
                href={`/api/documents/${lesson.id}`}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Ouvrir le document
              </a>
            ) : (
              <p className="mt-6 rounded-lg border border-amber/30 bg-amber/10 p-3 text-sm font-semibold text-amber">
                Aucun document n&apos;est encore associé à cette leçon.
              </p>
            )}
          </section>
        ) : (
          <section className="rounded-lg border border-line bg-surface p-6">
            <FileText className="h-7 w-7 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">Contenu de la leçon</h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-8 text-muted">
              {lesson.content || "Le contenu texte de cette leçon sera ajouté prochainement."}
            </div>
          </section>
        )}

        <aside className="rounded-lg border border-line bg-surface p-6">
          <StatusBadge tone="cyan">{lesson.kind}</StatusBadge>
          <h2 className="mt-5 text-2xl font-black">Progression</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Marque la leçon comme terminée quand tu as fini. La suite du parcours se débloque selon ta progression.
          </p>
          <div className="mt-5 grid gap-3">
            {lesson.kind === "VIDEO" ? (
              <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market" href={`/api/videos/${lesson.id}`}>
                <Play className="h-4 w-4" aria-hidden="true" />
                Ouvrir le flux video
              </a>
            ) : null}
            {lesson.kind === "DOCUMENT" && lesson.documentPath ? (
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market"
                href={`/api/documents/${lesson.id}`}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Ouvrir la ressource
              </a>
            ) : null}
            <ButtonLink href={`/student/courses/${lesson.courseId}`} variant="secondary">
              Retour formation
            </ButtonLink>
            {lesson.kind !== "VIDEO" ? (
              <form action={completeLessonAction}>
                <input name="lessonId" type="hidden" value={lesson.id} />
                <input name="nextLessonUrl" type="hidden" value={lesson.nextLessonUrl ?? ""} />
                <button className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market hover:bg-market/90 transition-colors" type="submit">
                  {lesson.completed ? "Leçon terminée" : "Marquer comme terminée"}
                </button>
              </form>
            ) : (
              <p className="rounded-lg border border-cyan/30 bg-cyan/10 p-3 text-sm font-medium text-cyan">
                Cette leçon se valide automatiquement après 90 % de lecture.
              </p>
            )}
            {(lesson.previousLessonUrl || lesson.nextLessonUrl) && (
              <div className="mt-2 flex items-center justify-between gap-3">
                {lesson.previousLessonUrl ? (
                  <ButtonLink className="flex-1 text-center" href={lesson.previousLessonUrl} variant="secondary">Précédent</ButtonLink>
                ) : <div className="flex-1" />}
                {lesson.nextLessonUrl ? (
                  <ButtonLink className="flex-1 text-center" href={lesson.nextLessonUrl} variant="secondary">Suivant</ButtonLink>
                ) : <div className="flex-1" />}
              </div>
            )}
          </div>
        </aside>
      </div>
    </DashboardShell >
  );
}
