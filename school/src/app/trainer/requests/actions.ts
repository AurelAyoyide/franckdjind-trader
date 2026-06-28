"use server";

import { AccountStatus, EnrollmentStatus, TrainingRequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageTrainerData, getAuthorizedSession } from "@/lib/authorization";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

async function requireTrainer() {
  const session = await getAuthorizedSession(["trainer", "admin"]);
  return canManageTrainerData(session) ? session : null;
}

export async function approveTrainingRequestAction(formData: FormData) {
  const session = await requireTrainer();
  if (!session) {
    return;
  }

  const requestId = String(formData.get("requestId") ?? "");
  const request = await prisma.trainingRequest.findUnique({
    where: { id: requestId },
    include: { learner: true, course: true },
  });

  if (
    !request ||
    request.status !== TrainingRequestStatus.PENDING ||
    (session.role !== "admin" && request.course && request.course.trainerId !== session.userId)
  ) {
    return;
  }

  const formCourseId = formData.get("courseId") as string | null;

  const course =
    request.course ??
    (formCourseId
      ? await prisma.course.findFirst({
        where: {
          id: formCourseId,
          status: "PUBLISHED",
          type: request.type === "FREE" ? "FREE" : "PAID",
          ...(session.role !== "admin" ? { trainerId: session.userId } : {}),
        },
      })
      : await prisma.course.findFirst({
        where: {
          status: "PUBLISHED",
          type: request.type === "FREE" ? "FREE" : "PAID",
          ...(session.role !== "admin" ? { trainerId: session.userId } : {}),
        },
        orderBy: { createdAt: "asc" },
      }));

  if (!course) {
    return;
  }

  await prisma.$transaction([
    prisma.trainingRequest.update({
      where: { id: request.id },
      data: {
        status: TrainingRequestStatus.APPROVED,
        reviewedById: session.userId,
        reviewedAt: new Date(),
        courseId: course.id,
      },
    }),
    prisma.user.update({
      where: { id: request.learnerId },
      data: { status: AccountStatus.ACTIVE },
    }),
    prisma.enrollment.upsert({
      where: {
        learnerId_courseId: {
          learnerId: request.learnerId,
          courseId: course.id,
        },
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
        startsAt: new Date(),
        endsAt: null,
      },
      create: {
        learnerId: request.learnerId,
        courseId: course.id,
        status: EnrollmentStatus.ACTIVE,
      },
    }),
    prisma.notification.create({
      data: {
        userId: request.learnerId,
        senderId: session.userId,
        type: "INTERNAL",
        title: "Accès formation activé",
        body: `Ton accès à la formation ${course.title} est maintenant actif.`,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "TRAINING_REQUEST_APPROVED",
        target: request.id,
        metadata: { learnerId: request.learnerId, courseId: course.id },
      },
    }),
  ]);

  await deliverLoggedEmail(prisma, {
    to: request.learner.email,
    userId: request.learnerId,
    subject: "Accès formation activé",
    html: `<p>Bonjour ${escapeHtml(request.learner.firstName)},</p><p>Ton accès à la formation ${escapeHtml(course.title)} est maintenant actif.</p>`,
  });

  revalidatePath("/trainer/requests");
  revalidatePath("/trainer/students");
  redirect("/trainer/requests?notice=approved");
}

export async function rejectTrainingRequestAction(formData: FormData) {
  const session = await requireTrainer();
  if (!session) {
    return;
  }

  const requestId = String(formData.get("requestId") ?? "");
  const request = await prisma.trainingRequest.findUnique({
    where: { id: requestId },
    include: { course: { select: { trainerId: true } } },
  });

  if (!request || (session.role !== "admin" && request.course && request.course.trainerId !== session.userId)) {
    return;
  }

  await prisma.trainingRequest.update({
    where: { id: request.id },
    data: {
      status: TrainingRequestStatus.REJECTED,
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "TRAINING_REQUEST_REJECTED",
      target: request.id,
    },
  });

  revalidatePath("/trainer/requests");
  redirect("/trainer/requests?notice=rejected");
}
