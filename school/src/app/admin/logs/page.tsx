import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Pagination } from "@/components/pagination";
import { requirePageSession } from "@/lib/authorization";
import { fullName, getAuditLogs } from "@/lib/platform-data";
import { formatDate } from "@/lib/utils";
import { paginate, parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

function formatMetadata(metadata: unknown) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return null;
  }
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; target?: string; page?: string }>;
}) {
  await requirePageSession(["admin"], "/admin/logs");
  const filters = await searchParams;
  const auditLogs = await getAuditLogs({
    action: filters.action?.trim(),
    target: filters.target?.trim(),
  });
  const pagedLogs = paginate(auditLogs, parsePage(filters.page));

  return (
    <DashboardShell role="admin" title="Logs et audit" description="Journalisation des actions sensibles, consultable par l'admin.">
      <form className="mb-5 grid gap-3 rounded-lg border border-line bg-surface p-4 md:grid-cols-[1fr_1fr_auto]">
        <input
          className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm"
          defaultValue={filters.action ?? ""}
          name="action"
          placeholder="Action"
        />
        <input
          className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm"
          defaultValue={filters.target ?? ""}
          name="target"
          placeholder="Cible"
        />
        <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market" type="submit">
          Filtrer
        </button>
      </form>
      <div className="grid gap-3">
        {pagedLogs.items.map((log) => {
          const metadata = formatMetadata(log.metadata);

          return (
            <article className="rounded-lg border border-line bg-surface p-5" key={log.id}>
              <h2 className="text-lg font-black">{log.action}</h2>
              <p className="mt-2 text-sm text-muted">
                {log.actor ? `${fullName(log.actor)} (${log.actor.email})` : "Systeme"} - {log.target}
              </p>
              <p className="mt-2 font-mono text-xs text-muted">{formatDate(log.createdAt)}</p>
              {metadata ? (
                <pre className="mt-3 max-h-52 overflow-auto rounded-lg border border-line bg-background p-3 text-xs leading-6 text-muted">
                  {metadata}
                </pre>
              ) : null}
            </article>
          );
        })}
        {!pagedLogs.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-lg font-black">Aucun log</h2>
            <p className="mt-2 text-sm text-muted">Les actions sensibles seront journalisees ici.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedLogs.page} path="/admin/logs" query={{ action: filters.action?.trim(), target: filters.target?.trim() }} totalPages={pagedLogs.totalPages} />
    </DashboardShell>
  );
}
