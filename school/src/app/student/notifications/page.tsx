import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { getStudentNotifications } from "@/lib/platform-data";
import { paginate, parsePage } from "@/lib/pagination";
import { markAllNotificationsReadAction, markNotificationReadAction } from "./actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  read: "Notification marquee comme lue.",
  "all-read": "Toutes les notifications sont marquees comme lues.",
};

export default async function StudentNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; page?: string }>;
}) {
  const { notice, page: pageParam } = await searchParams;
  const session = await requirePageSession(["student"], "/student/notifications");

  const notifications = await getStudentNotifications(session.userId);
  const pagedNotifications = paginate(notifications, parsePage(pageParam));

  return (
    <DashboardShell role="student" title="Notifications" description="Messages internes et relances visibles par l'apprenant.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} />
      {notifications.some((notification) => !notification.readAt) ? (
        <form action={markAllNotificationsReadAction} className="mb-5">
          <button className="inline-flex min-h-10 items-center rounded-lg border border-line bg-surface px-3 text-sm font-black" type="submit">
            Tout marquer comme lu
          </button>
        </form>
      ) : null}
      <div className="grid gap-4">
        {pagedNotifications.items.map((notification) => (
          <article className="rounded-lg border border-line bg-surface p-5" key={notification.id}>
            <StatusBadge tone={notification.readAt ? "muted" : "cyan"}>{notification.title}</StatusBadge>
            <p className="mt-4 text-sm leading-7 text-muted">{notification.body}</p>
            {!notification.readAt ? (
              <form action={markNotificationReadAction} className="mt-4">
                <input name="notificationId" type="hidden" value={notification.id} />
                <button className="inline-flex min-h-9 items-center rounded-lg border border-line bg-background px-3 text-xs font-black" type="submit">
                  Marquer comme lu
                </button>
              </form>
            ) : null}
          </article>
        ))}
        {!pagedNotifications.total ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <StatusBadge tone="muted">Aucune</StatusBadge>
            <p className="mt-4 text-sm leading-7 text-muted">Tu n&apos;as pas encore de notification.</p>
          </article>
        ) : null}
      </div>
      <Pagination page={pagedNotifications.page} path="/student/notifications" totalPages={pagedNotifications.totalPages} />
    </DashboardShell>
  );
}
