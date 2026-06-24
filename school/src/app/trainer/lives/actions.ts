"use server";

import { EnrollmentStatus, LiveStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { canManageTrainerData, getAuthorizedSession } from "@/lib/authorization";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { liveAnnouncementDeleteSchema, liveAnnouncementSchema, liveAnnouncementUpdateSchema } from "@/lib/validation";

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
  if (!canManageTrainerData(session)) {
    return { ok: false, message: "Action reservee a l'administrateur ou au formateur principal." };
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

  const course = parsed.data.courseId
    ? await prisma.course.findFirst({
        where: {
          id: parsed.data.courseId,
          ...(session.role !== "admin" ? { trainerId: session.userId } : {}),
        },
        select: { id: true },
      })
    : null;

  if (parsed.data.courseId && !course) {
    return { ok: false, message: "Formation introuvable ou non autorisee." };
  }

  const live = await prisma.liveAnnouncement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      externalUrl: parsed.data.externalUrl,
      scheduledAt: parsed.data.scheduledAt,
      status: LiveStatus.SCHEDULED,
      courseId: course?.id ?? null,
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
      ...(session.role !== "admin" && !live.courseId
        ? {
            enrollments: {
              some: {
                course: { trainerId: session.userId },
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
        subject: "Nouvelle session live Bono Trading",
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

async function findManageableLive(liveId: string, userId: string, isAdmin: boolean) {
  return prisma.liveAnnouncement.findFirst({
    where: {
      id: liveId,
      ...(isAdmin ? {} : { OR: [{ creatorId: userId }, { course: { trainerId: userId } }] }),
    },
    select: { id: true, creatorId: true, courseId: true, status: true },
  });
}

export async function updateLiveAnnouncementAction(formData: FormData) {
  const session = await getAuthorizedSession(["trainer", "admin"]);
  if (!canManageTrainerData(session)) {
    return;
  }

  const parsed = liveAnnouncementUpdateSchema.safeParse({
    liveId: formData.get("liveId"),
    title: formData.get("title"),
    body: formData.get("body"),
    externalUrl: formData.get("externalUrl"),
    scheduledAt: formData.get("scheduledAt"),
    courseId: formData.get("courseId") || undefined,
  });
  if (!parsed.success || parsed.data.scheduledAt.getTime() < Date.now() - 60_000) {
    return;
  }

  const live = await findManageableLive(parsed.data.liveId, session.userId, session.role === "admin");
  if (!live || live.status === LiveStatus.CANCELLED) {
    return;
  }

  const course = parsed.data.courseId
    ? await prisma.course.findFirst({
        where: { id: parsed.data.courseId, ...(session.role !== "admin" ? { trainerId: session.userId } : {}) },
        select: { id: true },
      })
    : null;
  if (parsed.data.courseId && !course) {
    return;
  }

  await prisma.liveAnnouncement.update({
    where: { id: live.id },
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      externalUrl: parsed.data.externalUrl,
      scheduledAt: parsed.data.scheduledAt,
      courseId: course?.id ?? null,
    },
  });
  await prisma.auditLog.create({
    data: { actorId: session.userId, action: "LIVE_UPDATED", target: live.id, metadata: { courseId: course?.id ?? null } },
  });
  revalidatePath("/trainer/lives");
  revalidatePath("/student/live-announcements");
}

export async function cancelLiveAnnouncementAction(formData: FormData) {
  const session = await getAuthorizedSession(["trainer", "admin"]);
  const parsed = liveAnnouncementDeleteSchema.safeParse({ liveId: formData.get("liveId") });
  if (!canManageTrainerData(session) || !parsed.success) {
    return;
  }

  const live = await findManageableLive(parsed.data.liveId, session.userId, session.role === "admin");
  if (!live || live.status === LiveStatus.CANCELLED) {
    return;
  }

  await prisma.liveAnnouncement.update({ where: { id: live.id }, data: { status: LiveStatus.CANCELLED } });
  await prisma.auditLog.create({ data: { actorId: session.userId, action: "LIVE_CANCELLED", target: live.id } });
  revalidatePath("/trainer/lives");
  revalidatePath("/student/live-announcements");
}

export async function deleteLiveAnnouncementAction(formData: FormData) {
  const session = await getAuthorizedSession(["trainer", "admin"]);
  const parsed = liveAnnouncementDeleteSchema.safeParse({ liveId: formData.get("liveId") });
  if (!canManageTrainerData(session) || !parsed.success) {
    return;
  }

  const live = await findManageableLive(parsed.data.liveId, session.userId, session.role === "admin");
  if (!live || live.status !== LiveStatus.CANCELLED) {
    return;
  }

  await prisma.$transaction([
    prisma.liveAnnouncement.delete({ where: { id: live.id } }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: "LIVE_DELETED", target: live.id } }),
  ]);
  revalidatePath("/trainer/lives");
}
