import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateTrainerForm } from "@/components/create-trainer-form";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getAdminUsers, statusLabel } from "@/lib/platform-data";
import { setUserStatusAction } from "@/app/admin/users/actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  "status-updated": "Statut utilisateur mis a jour et anciennes sessions invalidees.",
  "self-protected": "Impossible de suspendre ou supprimer ton propre compte.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  await requirePageSession(["admin"], "/admin/users");
  const users = await getAdminUsers();

  return (
    <DashboardShell role="admin" title="Utilisateurs" description="Creation formateurs, suspension et supervision des comptes.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} tone={notice === "self-protected" ? "warning" : "success"} />
      <div className="mb-5">
        <CreateTrainerForm />
      </div>
      <div className="grid gap-4">
        {users.map((user) => (
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
              {user.status !== "DELETED" ? (
                <form action={setUserStatusAction}>
                  <input name="userId" type="hidden" value={user.id} />
                  <input name="status" type="hidden" value="DELETED" />
                  <button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-black text-danger" type="submit">
                    Supprimer logique
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
        {!users.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Aucun utilisateur</h2>
            <p className="mt-2 text-sm text-muted">Les comptes apparaitront apres inscription ou seed.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
