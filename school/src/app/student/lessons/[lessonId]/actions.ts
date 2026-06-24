"use server";

import { EnrollmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { createCertificateIfCourseCompleted } from "@/lib/certificates";
import { prisma } from "@/lib/prisma";

export async function completeLessonAction(formData: FormData) {
  const session = await getAuthorizedSession(["student"]);
  if (!session) {
    return;
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              enrollments: {
                where: {
                  learnerId: session.userId,
                  status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
                  OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
                },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (
    !lesson ||
    lesson.type === "QUIZ" ||
    lesson.type === "VIDEO" ||
    lesson.module.course.enrollments.length === 0
  ) {
    return;
  }

  const previousLessons = await prisma.lesson.findMany({
    where: {
      module: { courseId: lesson.module.courseId },
      OR: [
        { module: { position: { lt: lesson.module.position } } },
        { moduleId: lesson.moduleId, position: { lt: lesson.position } },
      ],
    },
    include: { progress: { where: { learnerId: session.userId } } },
  });

  if (previousLessons.some((item) => !item.progress.some((progress) => progress.completed))) {
    return;
  }

  await prisma.lessonProgress.upsert({
    where: {
      learnerId_lessonId: {
        learnerId: session.userId,
        lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
      lastActivityAt: new Date(),
    },
    create: {
      learnerId: session.userId,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  await createCertificateIfCourseCompleted(session.userId, lesson.module.courseId);

  const nextUrl = formData.get("nextLessonUrl") as string | null;

  revalidatePath(`/student/lessons/${lessonId}`);
  revalidatePath(`/student/courses/${lesson.module.courseId}`);

  if (nextUrl) {
    redirect(nextUrl);
  } else {
    redirect(`/student/courses/${lesson.module.courseId}?notice=completed`);
  }
}
