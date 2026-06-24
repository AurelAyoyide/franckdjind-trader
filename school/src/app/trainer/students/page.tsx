import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressBar } from "@/components/progress-bar";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { getLearnerRows } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { paginate, parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function TrainerStudentsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  const { page: pageParam, q, status } = await searchParams;
  const session = await requirePageSession(["trainer", "admin"], "/trainer/students");

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    redirect("/trainer/dashboard");
  }
  const learners = await getLearnerRows(
    { userId: session.userId, isAdmin: session.role === "admin" },
    { q, status }
  );
  const pagedLearners = paginate(learners, parsePage(pageParam));

  return (
    <DashboardShell role={session.role} title="Apprenants" description="Fiches rapides, progression et statut de relance.">
      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom ou email..."
          className="h-11 flex-1 rounded-lg border border-line bg-surface px-4 text-sm focus:border-market focus:ring-1 focus:ring-market"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm focus:border-market focus:ring-1 focus:ring-market"
        >
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="A relancer">A relancer</option>
          <option value="Suspendu">Suspendu</option>
        </select>
        <button type="submit" className="h-11 rounded-lg bg-foreground/[0.06] px-5 text-sm font-black transition hover:bg-foreground/[0.1]">
          Filtrer
        </button>
      </form>

      <div className="grid gap-4">
        {pagedLearners.items.map((learner) => (
          <article className="rounded-lg border border-line bg-surface p-5 transition hover:shadow-sm" key={learner.email}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-market/10 font-black text-market uppercase tracking-widest">
                  {learner.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black">{learner.name}</h2>
                  <p className="mt-1 text-sm text-muted">{learner.email} - vu {formatDate(learner.lastSeen)}</p>
                </div>
              </div>
              <StatusBadge tone={learner.status === "Actif" ? "market" : learner.status === "Suspendu" ? "danger" : "amber"}>{learner.status}</StatusBadge>
            </div>
            <div className="mt-5">
              <ProgressBar value={learner.progress} />
            </div>
          </article>
        ))}
        {!pagedLearners.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Aucun apprenant</h2>
            <p className="mt-2 text-sm text-muted">Les comptes apprenants apparaitront apres inscription.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedLearners.page} path="/trainer/students" totalPages={pagedLearners.totalPages} />
    </DashboardShell>
  );
}
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
