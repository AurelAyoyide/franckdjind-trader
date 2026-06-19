import { MessageCircle } from "lucide-react";
import { CommunityPostForm } from "@/components/community-post-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getCommunityPosts, getTrainerCourses, statusLabel } from "@/lib/platform-data";
import {
  deleteCommunityCommentAction,
  setCommunityPostStatusAction,
  toggleCommunityCommentsAction,
} from "./actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  "post-status": "Statut de la publication mis a jour.",
  comments: "Reglage des commentaires mis a jour.",
  "comment-deleted": "Commentaire supprime.",
};

export default async function TrainerCommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  await requirePageSession(["trainer", "admin"], "/trainer/community");
  const [communityPosts, courses] = await Promise.all([
    getCommunityPosts(undefined, true),
    getTrainerCourses(),
  ]);

  return (
    <DashboardShell role="trainer" title="Moderation communaute" description="Annonces, commentaires autorises et moderation.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} />
      <CommunityPostForm courses={courses.map((course) => ({ id: course.id, title: course.title }))} />
      <div className="grid gap-4">
        {communityPosts.map((post) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={post.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <MessageCircle className="h-5 w-5 text-market" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-black">{post.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{post.body}</p>
                <p className="mt-3 text-sm text-muted">
                  Par {fullName(post.author)} - {post.course?.title ?? "Tous les apprenants"} - {post.comments.length} commentaire(s)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={post.status === "HIDDEN" ? "danger" : "market"}>{statusLabel(post.status)}</StatusBadge>
                {post.pinned ? <StatusBadge tone="amber">Epingle</StatusBadge> : null}
                <StatusBadge tone={post.commentsEnabled ? "cyan" : "muted"}>
                  {post.commentsEnabled ? "Commentaires ouverts" : "Commentaires fermes"}
                </StatusBadge>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <form action={setCommunityPostStatusAction}>
                <input name="postId" type="hidden" value={post.id} />
                <input name="status" type="hidden" value={post.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN"} />
                <button className="inline-flex min-h-10 items-center rounded-lg border border-line bg-background px-3 text-sm font-black" type="submit">
                  {post.status === "HIDDEN" ? "Republier" : "Masquer"}
                </button>
              </form>
              <form action={toggleCommunityCommentsAction}>
                <input name="postId" type="hidden" value={post.id} />
                <input name="commentsEnabled" type="hidden" value={post.commentsEnabled ? "false" : "true"} />
                <button className="inline-flex min-h-10 items-center rounded-lg border border-line bg-background px-3 text-sm font-black" type="submit">
                  {post.commentsEnabled ? "Fermer commentaires" : "Ouvrir commentaires"}
                </button>
              </form>
            </div>
            <div className="mt-5 grid gap-3">
              {post.comments.map((comment) => (
                <div className="rounded-lg border border-line bg-foreground/[0.04] p-3" key={comment.id}>
                  <p className="text-sm font-black">{fullName(comment.author)}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{comment.body}</p>
                  <form action={deleteCommunityCommentAction} className="mt-3">
                    <input name="commentId" type="hidden" value={comment.id} />
                    <button className="inline-flex min-h-9 items-center rounded-lg border border-danger/30 bg-danger/10 px-3 text-xs font-black text-danger" type="submit">
                      Supprimer
                    </button>
                  </form>
                </div>
              ))}
              {!post.comments.length ? <p className="text-sm text-muted">Aucun commentaire pour cette publication.</p> : null}
            </div>
          </article>
        ))}
        {!communityPosts.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <MessageCircle className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucune publication</h2>
            <p className="mt-3 text-sm text-muted">Les annonces et discussions publiees apparaitront ici.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
