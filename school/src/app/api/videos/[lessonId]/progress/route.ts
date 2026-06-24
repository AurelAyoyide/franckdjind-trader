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
  const origin = request.headers.get("origin");
  const expectedHost = (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))?.split(",")[0]?.trim();
  const expectedProtocol = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", ""))
    .split(",")[0]
    ?.trim();
  let originUrl: URL | null = null;
  try {
    originUrl = origin ? new URL(origin) : null;
  } catch {
    originUrl = null;
  }

  if (
    !originUrl ||
    !expectedHost ||
    !expectedProtocol ||
    originUrl.host !== expectedHost ||
    originUrl.protocol !== `${expectedProtocol}:`
  ) {
    return NextResponse.json({ error: "Origine de requete non autorisee" }, { status: 403 });
  }

  const session = await getRequestAuthorizedSession(request, ["student"]);

  if (!session) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const { lessonId } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    videoPosition?: number;
  } | null;

  const requestedVideoPosition = Math.max(0, Math.floor(Number(body?.videoPosition ?? 0)));

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
    select: {
      id: true,
      position: true,
      moduleId: true,
      durationSeconds: true,
      module: { select: { courseId: true, position: true } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lecon video non autorisee" }, { status: 403 });
  }

  if (!lesson.durationSeconds) {
    return NextResponse.json({ error: "Duree de video non configuree" }, { status: 409 });
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
    return NextResponse.json({ error: "Lecon verrouillee" }, { status: 403 });
  }

  const existingProgress = await prisma.lessonProgress.findUnique({
    where: {
      learnerId_lessonId: {
        learnerId: session.userId,
        lessonId,
      },
    },
    select: { videoPosition: true, lastActivityAt: true, completed: true },
  });
  const now = new Date();
  const previousPosition = existingProgress?.videoPosition ?? 0;
  const elapsedSeconds = existingProgress
    ? Math.max(0, (now.getTime() - existingProgress.lastActivityAt.getTime()) / 1000)
    : 0;
  const maximumAllowedPosition = Math.min(
    lesson.durationSeconds,
    previousPosition + Math.max(5, Math.ceil(elapsedSeconds * 1.25 + 2)),
  );
  const videoPosition = Math.min(
    lesson.durationSeconds,
    Math.max(previousPosition, Math.min(requestedVideoPosition, maximumAllowedPosition)),
  );
  const completed = existingProgress?.completed || videoPosition >= Math.ceil(lesson.durationSeconds * 0.9);

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
      completedAt: completed ? now : undefined,
      lastActivityAt: now,
    },
    create: {
      learnerId: session.userId,
      lessonId,
      videoPosition,
      completed,
      completedAt: completed ? now : undefined,
    },
  });

  if (completed) {
    await createCertificateIfCourseCompleted(session.userId, lesson.module.courseId);
  }

  return NextResponse.json({ ok: true, completed });
}
