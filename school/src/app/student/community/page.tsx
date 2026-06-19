import { MessageCircle } from "lucide-react";
import { CommunityCommentForm } from "@/components/community-comment-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getCommunityPosts } from "@/lib/platform-data";

export const dynamic = "force-dynamic";

export default async function StudentCommunityPage() {
  const session = await requirePageSession(["student"], "/student/community");

  const communityPosts = await getCommunityPosts(session.userId);

  return (
    <DashboardShell role="student" title="Communaute" description="Mini-espace communautaire pour annonces, questions et commentaires moderes.">
      <div className="grid gap-4">
        {communityPosts.map((post) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={post.id}>
            <div className="flex items-start justify-between gap-4">
              <MessageCircle className="h-5 w-5 text-market" aria-hidden="true" />
              {post.pinned ? <StatusBadge tone="amber">Epingle</StatusBadge> : null}
            </div>
            <h2 className="mt-5 text-xl font-black">{post.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{post.body}</p>
            <p className="mt-3 text-sm text-muted">
              Par {fullName(post.author)} - {post.course?.title ?? "Tous les apprenants"} - {post.comments.length} commentaire(s)
            </p>
            <div className="mt-5 grid gap-3">
              {post.comments.map((comment) => (
                <div className="rounded-lg border border-line bg-foreground/[0.04] p-3" key={comment.id}>
                  <p className="text-sm font-black">{fullName(comment.author)}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{comment.body}</p>
                </div>
              ))}
            </div>
            {post.commentsEnabled ? <CommunityCommentForm postId={post.id} /> : null}
          </article>
        ))}
        {!communityPosts.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <MessageCircle className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Aucune publication</h2>
            <p className="mt-3 text-sm text-muted">La communaute s&apos;affichera ici apres publication.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
