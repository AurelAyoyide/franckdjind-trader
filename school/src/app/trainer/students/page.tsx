import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressBar } from "@/components/progress-bar";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { getLearnerRows } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TrainerStudentsPage() {
  const session = await requirePageSession(["trainer", "admin"], "/trainer/students");

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    redirect("/trainer/dashboard");
  }
  const learners = await getLearnerRows({ userId: session.userId, isAdmin: session.role === "admin" });

  return (
    <DashboardShell role={session.role} title="Apprenants" description="Fiches rapides, progression et statut de relance.">
      <div className="grid gap-4">
        {learners.map((learner) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={learner.email}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-black">{learner.name}</h2>
                <p className="mt-2 text-sm text-muted">{learner.email} - vu {formatDate(learner.lastSeen)}</p>
              </div>
              <StatusBadge tone={learner.status === "Actif" ? "market" : "amber"}>{learner.status}</StatusBadge>
            </div>
            <div className="mt-5">
              <ProgressBar value={learner.progress} />
            </div>
          </article>
        ))}
        {!learners.length ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Aucun apprenant</h2>
            <p className="mt-2 text-sm text-muted">Les comptes apprenants apparaitront apres inscription.</p>
          </article>
        ) : null}
      </div>
    </DashboardShell>
  );
}
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
