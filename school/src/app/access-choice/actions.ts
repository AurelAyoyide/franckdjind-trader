"use server";

import { AccountStatus, CourseStatus, CourseType, TrainingRequestType } from "@prisma/client";
import { getAuthorizedSession } from "@/lib/authorization";
import { accessChoiceSchema } from "@/lib/validation";
import { buildTrainingRequestMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

export type AccessChoiceState = {
  ok: boolean;
  message: string;
  whatsappUrl?: string;
  whatsappInstruction?: string;
  errors?: Record<string, string[] | undefined>;
};

export async function requestAccessAction(
  _state: AccessChoiceState,
  formData: FormData,
): Promise<AccessChoiceState> {
  const parsed = accessChoiceSchema.safeParse({
    kind: formData.get("kind"),
    courseId: formData.get("courseId") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Complete les champs avant de preparer le message WhatsApp.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const session = await getAuthorizedSession(["student"]);

  if (!session) {
    return {
      ok: false,
      message: "Connecte-toi avec ton compte apprenant avant de demander l'acces.",
    };
  }

  const requestType =
    parsed.data.kind === "free"
      ? TrainingRequestType.FREE
      : TrainingRequestType.PAID_ALREADY_PAID;

  const learner = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true },
  });

  if (!learner) {
    return {
      ok: false,
      message: "Cree d'abord ton compte puis valide ton email avant la demande.",
      errors: { email: ["Compte introuvable"] },
    };
  }

  if (learner.status === AccountStatus.EMAIL_PENDING) {
    return {
      ok: false,
      message: "Valide ton email avant de demander l'acces.",
      errors: { email: ["Email non valide"] },
    };
  }

  if (learner.status === AccountStatus.SUSPENDED) {
    return {
      ok: false,
      message: "Ce compte est suspendu. Contacte l'administrateur.",
    };
  }

  const course = parsed.data.courseId
    ? await prisma.course.findFirst({
      where: {
        id: parsed.data.courseId,
        status: CourseStatus.PUBLISHED,
        type: parsed.data.kind === "free" ? CourseType.FREE : CourseType.PAID,
      },
      select: { id: true, title: true },
    })
    : null;

  if (parsed.data.courseId && !course) {
    return {
      ok: false,
      message: "La formation selectionnee n'est plus disponible pour cette demande.",
      errors: { courseId: ["Formation indisponible"] },
    };
  }

  const message = buildTrainingRequestMessage(
    parsed.data.kind,
    `${learner.firstName} ${learner.lastName}`.trim(),
    learner.email,
    learner.phone,
    course?.title,
  );

  const recentPendingRequest = await prisma.trainingRequest.findFirst({
    where: {
      learnerId: learner.id,
      type: requestType,
      courseId: course?.id ?? null,
      status: "PENDING",
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
    },
    select: { id: true },
  });

  if (recentPendingRequest) {
    return {
      ok: true,
      message: parsed.data.kind === "paid"
        ? "Une demande payante est deja en attente. Rouvre WhatsApp pour finaliser ou verifier le paiement avec le formateur."
        : "Une demande gratuite est deja en attente. Rouvre WhatsApp pour prevenir le formateur et accelerer l'activation.",
      whatsappUrl: buildWhatsAppLink(message),
      whatsappInstruction: parsed.data.kind === "paid"
        ? "Etape 2 : ouvre WhatsApp pour finaliser le paiement ou envoyer la preuve demandee."
        : "Etape 2 : ouvre WhatsApp pour demander l'activation gratuite de ton acces.",
    };
  }

  await prisma.trainingRequest.create({
    data: {
      learnerId: learner.id,
      type: requestType,
      courseId: course?.id ?? null,
      whatsappText: message,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: learner.id,
      action: "TRAINING_REQUEST_CREATED",
      target: parsed.data.kind,
      metadata: { type: requestType, courseId: course?.id ?? null },
    },
  });

  return {
    ok: true,
    message: parsed.data.kind === "paid"
      ? "Demande enregistree. Continue sur WhatsApp pour finaliser le paiement ou confirmer ta preuve avec le formateur."
      : "Demande gratuite enregistree. Continue sur WhatsApp pour prevenir le formateur et demander l'activation de ton acces.",
    whatsappUrl: buildWhatsAppLink(message),
    whatsappInstruction: parsed.data.kind === "paid"
      ? "Etape 2 : ouvre WhatsApp pour finaliser le paiement ou envoyer la preuve demandee."
      : "Etape 2 : ouvre WhatsApp pour demander l'activation gratuite de ton acces.",
  };
}
