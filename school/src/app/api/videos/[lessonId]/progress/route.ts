import { EnrollmentStatus } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getRequestAuthorizedSession } from "@/lib/authorization";
import { createCertificateIfCourseCompleted } from "@/lib/certificates";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> },
) {
  const session = await getRequestAuthorizedSession(request, ["student"]);

  if (!session) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const { lessonId } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    videoPosition?: number;
    watchedPercent?: number;
  } | null;

  const videoPosition = Math.max(0, Math.floor(Number(body?.videoPosition ?? 0)));
  const watchedPercent = Math.max(0, Math.min(100, Number(body?.watchedPercent ?? 0)));

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      type: "VIDEO",
      module: {
        course: {
          enrollments: {
            some: {
              learnerId: session.userId,
              status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
              OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
            },
          },
        },
      },
    },
    select: { id: true, module: { select: { courseId: true } } },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lecon video non autorisee" }, { status: 403 });
  }

  const completed = watchedPercent >= 90;

  await prisma.lessonProgress.upsert({
    where: {
      learnerId_lessonId: {
        learnerId: session.userId,
        lessonId,
      },
    },
    update: {
      videoPosition,
      completed,
      completedAt: completed ? new Date() : undefined,
      lastActivityAt: new Date(),
    },
    create: {
      learnerId: session.userId,
      lessonId,
      videoPosition,
      completed,
      completedAt: completed ? new Date() : undefined,
    },
  });

  if (completed) {
    await createCertificateIfCourseCompleted(session.userId, lesson.module.courseId);
  }

  return NextResponse.json({ ok: true, completed });
}
