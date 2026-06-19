import { UserRole } from "@prisma/client";
import { Download } from "lucide-react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ImportLearnersForm } from "@/components/import-learners-form";
import { requirePageSession } from "@/lib/authorization";

export default async function TrainerImportExportPage() {
  const session = await requirePageSession(["trainer", "admin"], "/trainer/import-export");

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    redirect("/trainer/dashboard");
  }

  return (
    <DashboardShell role="trainer" title="Import / export Excel" description="Import apprenants, export progressions et controles de colonnes.">
      <div className="grid gap-5 md:grid-cols-2">
        <ImportLearnersForm />
        <article className="rounded-lg border border-line bg-surface p-6">
          <Download className="h-5 w-5 text-cyan" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-black">Exporter les donnees</h2>
          <p className="mt-3 text-sm leading-7 text-muted">Apprenants, demandes, inscriptions, progressions et certificats.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-black" href="/api/exports/learners">
              Apprenants
            </a>
            <a className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-black" href="/api/exports/progress">
              Progressions
            </a>
          </div>
        </article>
      </div>
    </DashboardShell>
  );
}
