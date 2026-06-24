"use server";

import { AccountStatus, EnrollmentStatus, NotificationType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { canManageTrainerData, getAuthorizedSession } from "@/lib/authorization";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { notificationSchema } from "@/lib/validation";

export type NotificationState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function sendNotificationAction(
  _state: NotificationState,
  formData: FormData,
): Promise<NotificationState> {
  const parsed = notificationSchema.safeParse({
    target: formData.get("target"),
    channel: formData.get("channel"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Notification invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const session = await getAuthorizedSession(["trainer", "admin"]);

  if (!canManageTrainerData(session)) {
    return {
      ok: false,
      message: "Action reservee a l'administrateur ou au formateur principal.",
    };
  }

  const inactiveLimit = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const mustFilterEnrollment = session.role !== "admin" || parsed.data.target === "Formation payante";
  const learners = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      status: { notIn: [AccountStatus.SUSPENDED, AccountStatus.DELETED] },
      ...(mustFilterEnrollment
        ? {
            enrollments: {
              some: {
                status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
                OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
                course: {
                  ...(session.role !== "admin" ? { trainerId: session.userId } : {}),
                  ...(parsed.data.target === "Formation payante" ? { type: "PAID" } : {}),
                },
              },
            },
          }
        : {}),
      ...(parsed.data.target === "Apprenants inactifs"
        ? {
            OR: [
              { lessonProgress: { none: {} } },
              { lessonProgress: { every: { lastActivityAt: { lt: inactiveLimit } } } },
            ],
          }
        : {}),
    },
    select: { id: true, email: true, firstName: true },
    take: 500,
  });

  if (!learners.length) {
    return {
      ok: false,
      message: "Aucun apprenant ne correspond a cette cible.",
    };
  }

  const type = parsed.data.channel as NotificationType;
  const shouldCreateInternal = type === NotificationType.INTERNAL || type === NotificationType.BOTH;
  const shouldSendEmail = type === NotificationType.EMAIL || type === NotificationType.BOTH;

  if (shouldCreateInternal) {
    await prisma.notification.createMany({
      data: learners.map((learner) => ({
        userId: learner.id,
        senderId: session.userId,
        type,
        title: "Message du formateur",
        body: parsed.data.message,
      })),
    });
  }

  if (shouldSendEmail) {
    for (const learner of learners) {
      await deliverLoggedEmail(prisma, {
        to: learner.email,
        userId: learner.id,
        subject: "Notification Bono Trading",
        html: `<p>Bonjour ${escapeHtml(learner.firstName)},</p><p>${escapeHtml(parsed.data.message)}</p>`,
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "NOTIFICATION_SENT",
      target: parsed.data.target,
      metadata: { channel: type, recipients: learners.length },
    },
  });

  revalidatePath("/student/notifications");

  return {
    ok: true,
    message: `Notification traitee pour ${learners.length} apprenant(s).`,
  };
}
