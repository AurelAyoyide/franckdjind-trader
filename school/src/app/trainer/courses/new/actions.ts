"use server";

import { CourseStatus, DurationUnit, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthorizedSession } from "@/lib/authorization";
import { createUniqueCourseSlug } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validation";

export type CourseFormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createCourseAction(
  _state: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    priceAmount: formData.get("priceAmount") || undefined,
    priceCurrency: formData.get("priceCurrency") || undefined,
    durationValue: formData.get("durationValue") || undefined,
    durationUnit: formData.get("durationUnit") || undefined,
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "La formation n'est pas encore valide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const session = await getAuthorizedSession(["trainer", "admin"]);

  if (!session) {
    return {
      ok: false,
      message: "Connexion formateur requise pour creer une formation.",
    };
  }

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    return {
      ok: false,
      message: "Action reservee au formateur principal.",
    };
  }

  try {
    const slug = await createUniqueCourseSlug(parsed.data.title);
    await prisma.course.create({
      data: {
        title: parsed.data.title,
        slug,
        type: parsed.data.type,
        priceAmount: parsed.data.priceAmount ?? null,
        priceCurrency: parsed.data.priceCurrency ?? null,
        durationValue: parsed.data.durationValue ?? null,
        durationUnit: parsed.data.durationUnit ? DurationUnit[parsed.data.durationUnit] : null,
        description: parsed.data.description,
        status: CourseStatus.DRAFT,
        trainerId: session.userId,
        modules: { create: { title: "Module 1", description: "Premier module a completer.", position: 1 } },
      },
    });
    await prisma.auditLog.create({ data: { actorId: session.userId, action: "COURSE_CREATED", target: slug, metadata: { status: CourseStatus.DRAFT } } });
  } catch (error) {
    console.error("COURSE_CREATE_FAILED", error);
    return { ok: false, message: "Impossible de creer la formation pour le moment. Reessaie dans quelques secondes." };
  }

  revalidatePath("/trainer/courses");

  return {
    ok: true,
    message: "Formation enregistree en brouillon.",
  };
}
