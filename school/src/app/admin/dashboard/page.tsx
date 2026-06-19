import { Activity, Settings, ShieldCheck, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getAdminDashboardData } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requirePageSession(["admin"], "/admin/dashboard");
  const dashboard = await getAdminDashboardData();

  return (
    <DashboardShell role="admin" title="Dashboard admin" description="Supervision globale de la plateforme, des roles, des parametres et de l'audit.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={UsersRound} label="Utilisateurs" value={String(dashboard.users)} detail="Tous roles confondus." />
        <StatCard icon={ShieldCheck} label="Formateurs" value={String(dashboard.trainers)} detail="Principal et secondaires." tone="cyan" />
        <StatCard icon={Settings} label="Parametres" value={String(dashboard.settings)} detail="SMTP, WhatsApp, relances." tone="amber" />
        <StatCard icon={Activity} label="Logs" value={String(dashboard.logs.length)} detail="Actions recentes." />
      </div>
      <section className="mt-6 rounded-lg border border-line bg-surface p-6">
        <h2 className="text-2xl font-black">Derniers logs</h2>
        <div className="mt-5 grid gap-3">
          {dashboard.logs.map((log) => (
            <div className="rounded-lg border border-line bg-foreground/[0.04] p-4" key={log.id}>
              <p className="font-black">{log.action}</p>
              <p className="mt-2 text-sm text-muted">{log.actor ? fullName(log.actor) : "Systeme"} - {log.target} - {formatDate(log.createdAt)}</p>
            </div>
          ))}
          {!dashboard.logs.length ? <p className="text-sm text-muted">Aucun log pour le moment.</p> : null}
        </div>
      </section>
    </DashboardShell>
  );
}
