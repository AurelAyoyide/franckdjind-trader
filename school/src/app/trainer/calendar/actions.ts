"use server";

import { AccountStatus, CallStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageTrainerData, getAuthorizedSession } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { callBatchScheduleSchema, callDeleteSchema, callStatusSchema, callUpdateSchema } from "@/lib/validation";

export type CallScheduleState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

async function requireTrainer() {
  const session = await getAuthorizedSession(["trainer", "admin"]);
  return canManageTrainerData(session) ? session : null;
}

export async function scheduleCallAction(
  _state: CallScheduleState,
  formData: FormData,
): Promise<CallScheduleState> {
  const session = await requireTrainer();
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const parsed = callBatchScheduleSchema.safeParse({
    learnerIds: formData.getAll("learnerIds").map(String),
    title: formData.get("title"),
    notes: formData.get("notes"),
    scheduledAt: formData.get("scheduledAt"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Appel invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.scheduledAt.getTime() < Date.now() - 60_000) {
    return { ok: false, message: "La date de l'appel doit etre future." };
  }

  const learners = await prisma.user.findMany({
    where: {
      id: { in: [...new Set(parsed.data.learnerIds)] },
      role: UserRole.STUDENT,
      status: { notIn: [AccountStatus.SUSPENDED, AccountStatus.DELETED] },
      ...(session.role !== "admin"
        ? {
            enrollments: {
              some: {
                course: { trainerId: session.userId },
                status: { in: ["ACTIVE", "COMPLETED"] },
              },
            },
          }
        : {}),
    },
    select: { id: true },
  });

  if (learners.length !== new Set(parsed.data.learnerIds).size) {
    return { ok: false, message: "Apprenant introuvable ou suspendu." };
  }

  await prisma.$transaction([
    prisma.callSchedule.createMany({ data: learners.map((learner) => ({ learnerId: learner.id, trainerId: session.userId, title: parsed.data.title, notes: parsed.data.notes || null, scheduledAt: parsed.data.scheduledAt, status: CallStatus.SCHEDULED })) }),
    prisma.notification.createMany({ data: learners.map((learner) => ({ userId: learner.id, senderId: session.userId, type: "INTERNAL", title: "Appel programme", body: `Un appel est programme : ${parsed.data.title}.` })) }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: "CALLS_SCHEDULED", target: "batch", metadata: { learners: learners.length, scheduledAt: parsed.data.scheduledAt.toISOString() } } }),
  ]);

  revalidatePath("/trainer/calendar");
  revalidatePath("/student/notifications");

  return { ok: true, message: `${learners.length} appel(s) programmes et notifications envoyees.` };
}

export async function setCallStatusAction(formData: FormData) {
  const session = await requireTrainer();
  if (!session) {
    return;
  }

  const parsed = callStatusSchema.safeParse({
    callId: formData.get("callId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return;
  }

  const call = await prisma.callSchedule.findUnique({
    where: { id: parsed.data.callId },
    select: { id: true, trainerId: true },
  });

  if (!call || (session.role !== "admin" && call.trainerId !== session.userId)) {
    return;
  }

  await prisma.callSchedule.update({
    where: { id: call.id },
    data: { status: parsed.data.status },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "CALL_STATUS_UPDATED",
      target: call.id,
      metadata: { status: parsed.data.status },
    },
  });

  revalidatePath("/trainer/calendar");
  redirect("/trainer/calendar?notice=status-updated");
}

export async function updateCallAction(formData: FormData) {
  const session = await requireTrainer();
  if (!session) {
    return;
  }

  const parsed = callUpdateSchema.safeParse({
    callId: formData.get("callId"),
    learnerId: formData.get("learnerId"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    scheduledAt: formData.get("scheduledAt"),
  });

  if (!parsed.success || parsed.data.scheduledAt.getTime() < Date.now() - 60_000) {
    redirect("/trainer/calendar?notice=invalid-call");
  }

  const call = await prisma.callSchedule.findUnique({
    where: { id: parsed.data.callId },
    select: { id: true, trainerId: true },
  });
  if (!call || (session.role !== "admin" && call.trainerId !== session.userId)) {
    redirect("/trainer/calendar?notice=call-not-found");
  }

  const learner = await prisma.user.findFirst({
    where: {
      id: parsed.data.learnerId,
      role: UserRole.STUDENT,
      status: { notIn: [AccountStatus.SUSPENDED, AccountStatus.DELETED] },
      ...(session.role !== "admin"
        ? { enrollments: { some: { course: { trainerId: session.userId }, status: { in: ["ACTIVE", "COMPLETED"] } } } }
        : {}),
    },
    select: { id: true },
  });
  if (!learner) {
    redirect("/trainer/calendar?notice=invalid-learner");
  }

  await prisma.callSchedule.update({
    where: { id: call.id },
    data: {
      learnerId: learner.id,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      scheduledAt: parsed.data.scheduledAt,
      status: CallStatus.SCHEDULED,
    },
  });
  await prisma.auditLog.create({
    data: { actorId: session.userId, action: "CALL_UPDATED", target: call.id, metadata: { learnerId: learner.id } },
  });
  revalidatePath("/trainer/calendar");
  redirect("/trainer/calendar?notice=call-updated");
}

export async function deleteCallAction(formData: FormData) {
  const session = await requireTrainer();
  const parsed = callDeleteSchema.safeParse({ callId: formData.get("callId") });
  if (!session || !parsed.success) {
    return;
  }

  const call = await prisma.callSchedule.findUnique({
    where: { id: parsed.data.callId },
    select: { id: true, trainerId: true },
  });
  if (!call || (session.role !== "admin" && call.trainerId !== session.userId)) {
    return;
  }

  await prisma.$transaction([
    prisma.callSchedule.delete({ where: { id: call.id } }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: "CALL_DELETED", target: call.id } }),
  ]);
  revalidatePath("/trainer/calendar");
  redirect("/trainer/calendar?notice=call-deleted");
}
