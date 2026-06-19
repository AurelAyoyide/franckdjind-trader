"use server";

import { AccountStatus, EnrollmentStatus, TrainingRequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

async function requireTrainer() {
  return getAuthorizedSession(["trainer", "admin"]);
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

  if (!request || request.status !== TrainingRequestStatus.PENDING) {
    return;
  }

  const course =
    request.course ??
    (await prisma.course.findFirst({
      where: {
        status: "PUBLISHED",
        type: request.type === "FREE" ? "FREE" : "PAID",
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
        title: "Acces formation active",
        body: `Ton acces a la formation ${course.title} est maintenant actif.`,
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
    subject: "Acces formation active",
    html: `<p>Bonjour ${escapeHtml(request.learner.firstName)},</p><p>Ton acces a la formation ${escapeHtml(course.title)} est maintenant actif.</p>`,
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

  await prisma.trainingRequest.update({
    where: { id: requestId },
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
      target: requestId,
    },
  });

  revalidatePath("/trainer/requests");
  redirect("/trainer/requests?notice=rejected");
}
