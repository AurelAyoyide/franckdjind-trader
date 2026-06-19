import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsForm } from "@/components/settings-form";
import { requirePageSession } from "@/lib/authorization";
import { getSettingsMap } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePageSession(["admin"], "/admin/settings");
  const values = await getSettingsMap();

  return (
    <DashboardShell role="admin" title="Parametres" description="Identite plateforme, SMTP, WhatsApp, durees de token, relances, uploads, securite et certificats.">
      <SettingsForm values={values} />
    </DashboardShell>
  );
}
