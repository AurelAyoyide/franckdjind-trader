import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateTrainerForm } from "@/components/create-trainer-form";
import { NoticeBanner } from "@/components/notice-banner";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getAdminUsers, statusLabel } from "@/lib/platform-data";
import { paginate, parsePage } from "@/lib/pagination";
import { setUserStatusAction } from "@/app/admin/users/actions";
import { AdminUserEditor } from "@/components/admin-user-editor";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  "status-updated": "Statut utilisateur mis a jour et anciennes sessions invalidees.",
  "self-protected": "Impossible de suspendre ou supprimer ton propre compte.",
  deactivated: "Compte desactive. Il reste archive et peut etre reactive.",
  "user-updated": "Informations du compte mises a jour.",
  "invalid-user": "Les informations du compte sont invalides.",
  "email-in-use": "Cette adresse email est deja utilisee.",
  "super-admin-protected": "Le compte super-admin ne peut pas etre modifie depuis un autre compte.",
  "auth-required": "Connexion administrateur requise.",
  "not-found": "Compte introuvable.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; page?: string }>;
}) {
  const { notice, page: pageParam } = await searchParams;
  await requirePageSession(["admin"], "/admin/users");
  const users = await getAdminUsers();
  const pagedUsers = paginate(users, parsePage(pageParam));

  return (
    <DashboardShell role="admin" title="Utilisateurs" description="Creation formateurs, suspension et supervision des comptes.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} tone={notice === "self-protected" || notice === "super-admin-protected" ? "warning" : notice === "invalid-user" || notice === "email-in-use" || notice === "auth-required" || notice === "not-found" ? "danger" : "success"} />
      <div className="mb-5">
        <CreateTrainerForm />
      </div>
      <div className="grid gap-4">
        {pagedUsers.items.map((user) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={user.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">{fullName(user)}</h2>
                <p className="mt-2 text-sm text-muted">{user.email} - {statusLabel(user.role)}</p>
              </div>
              <StatusBadge tone={user.status === "SUSPENDED" || user.status === "DELETED" ? "danger" : "market"}>
                {statusLabel(user.status)}
              </StatusBadge>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <form action={setUserStatusAction}>
                <input name="userId" type="hidden" value={user.id} />
                <input name="status" type="hidden" value={user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"} />
                <button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] px-3 text-sm font-black" type="submit">
                  {user.status === "SUSPENDED" ? "Reactiver" : "Suspendre"}
                </button>
              </form>
              {user.status === "DELETED" ? (
                <form action={setUserStatusAction}>
                  <input name="userId" type="hidden" value={user.id} />
                  <input name="status" type="hidden" value="ACTIVE" />
                  <button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-market/30 bg-market/10 px-3 text-sm font-black text-market" type="submit">
                    Reactiver le compte
                  </button>
                </form>
              ) : (
                <form action={setUserStatusAction}>
                  <input name="userId" type="hidden" value={user.id} />
                  <input name="status" type="hidden" value="DELETED" />
                  <button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-black text-danger" type="submit">
                    Desactiver le compte
                  </button>
                </form>
              )}
            </div>
            <AdminUserEditor user={user} />
          </article>
        ))}
        {!pagedUsers.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Aucun utilisateur</h2>
            <p className="mt-2 text-sm text-muted">Les comptes apparaitront apres inscription ou seed.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedUsers.page} path="/admin/users" totalPages={pagedUsers.totalPages} />
    </DashboardShell>
  );
}
