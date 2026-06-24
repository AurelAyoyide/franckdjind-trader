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
          ? "La progression video est enregistree pendant la lecture."
          : "Consulte la ressource, puis marque la lecon comme terminee pour continuer le parcours."
      }
    >
      <NoticeBanner message={notice === "completed" ? "Lecon marquee comme terminee. Ta progression a ete mise a jour." : null} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {lesson.kind === "VIDEO" ? (
          <VideoLessonPlayer
            initialPosition={lesson.videoPosition}
            lessonId={lesson.id}
            title={lesson.title}
            watermark={session.email ?? "apprenant"}
          />
        ) : lesson.kind === "DOCUMENT" ? (
          <section className="rounded-lg border border-line bg-surface p-6">
            <FileText className="h-7 w-7 text-cyan" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">Document de la lecon</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Ouvre le document associe a cette lecon, puis reviens ici pour valider ta progression.
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
                Aucun document n&apos;est encore associe a cette lecon.
              </p>
            )}
          </section>
        ) : (
          <section className="rounded-lg border border-line bg-surface p-6">
            <FileText className="h-7 w-7 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">Contenu de la lecon</h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-8 text-muted">
              {lesson.content || "Le contenu texte de cette lecon sera ajoute prochainement."}
            </div>
          </section>
        )}

        <aside className="rounded-lg border border-line bg-surface p-6">
          <StatusBadge tone="cyan">{lesson.kind}</StatusBadge>
          <h2 className="mt-5 text-2xl font-black">Progression</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Marque la lecon comme terminee quand tu as fini. La suite du parcours se debloque selon ta progression.
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
                <button className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market" type="submit">
                  {lesson.completed ? "Lecon terminee" : "Marquer comme termine"}
                </button>
              </form>
            ) : (
              <p className="rounded-lg border border-cyan/30 bg-cyan/10 p-3 text-sm font-semibold text-cyan">
                Cette lecon se valide automatiquement apres 90 % de la lecture reelle de la video.
              </p>
            )}
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
