import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationForm } from "@/components/notification-form";
import { requirePageSession } from "@/lib/authorization";

export default async function TrainerNotificationsPage() {
  await requirePageSession(["trainer", "admin"], "/trainer/notifications");

  return (
    <DashboardShell role="trainer" title="Notifications manuelles" description="Envoyer une notification interne ou email ciblee.">
      <NotificationForm />
    </DashboardShell>
  );
}
