import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationForm } from "@/components/notification-form";
import { canManageTrainerData, requirePageSession } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function TrainerNotificationsPage() {
  const session = await requirePageSession(["trainer", "admin"], "/trainer/notifications");
  if (!canManageTrainerData(session)) {
    redirect("/trainer/dashboard");
  }

  return (
    <DashboardShell role={session.role} title="Notifications manuelles" description="Envoyer une notification interne ou email ciblee.">
      <NotificationForm />
    </DashboardShell>
  );
}
