"use server";

import { EnrollmentStatus, LiveStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthorizedSession } from "@/lib/authorization";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { liveAnnouncementSchema } from "@/lib/validation";

export type LiveAnnouncementState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createLiveAnnouncementAction(
  _state: LiveAnnouncementState,
  formData: FormData,
): Promise<LiveAnnouncementState> {
  const session = await getAuthorizedSession(["trainer", "admin"]);
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const parsed = liveAnnouncementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    externalUrl: formData.get("externalUrl"),
    scheduledAt: formData.get("scheduledAt"),
    courseId: formData.get("courseId") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Annonce live invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const live = await prisma.liveAnnouncement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      externalUrl: parsed.data.externalUrl,
      scheduledAt: parsed.data.scheduledAt,
      status: LiveStatus.SCHEDULED,
      courseId: parsed.data.courseId || null,
      creatorId: session.userId,
    },
  });

  const learners = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      status: "ACTIVE",
      ...(live.courseId
        ? {
            enrollments: {
              some: {
                courseId: live.courseId,
                status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
                OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
              },
            },
          }
        : {}),
    },
    select: { id: true, email: true, firstName: true },
    take: 500,
  });

  if (learners.length) {
    await prisma.notification.createMany({
      data: learners.map((learner) => ({
        userId: learner.id,
        senderId: session.userId,
        type: "BOTH",
        title: "Nouveau live",
        body: parsed.data.title,
      })),
    });

    for (const learner of learners) {
      await deliverLoggedEmail(prisma, {
        to: learner.email,
        userId: learner.id,
        subject: "Nouvelle session live School",
        html: `<p>Bonjour ${escapeHtml(learner.firstName)},</p><p>${escapeHtml(parsed.data.title)}</p><p>${escapeHtml(parsed.data.externalUrl)}</p>`,
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "LIVE_CREATED",
      target: live.id,
      metadata: { recipients: learners.length, courseId: live.courseId },
    },
  });

  revalidatePath("/trainer/lives");
  revalidatePath("/student/live-announcements");

  return { ok: true, message: `Live programme pour ${learners.length} apprenant(s).` };
}
