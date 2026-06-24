"use server";

import { EnrollmentStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { createCertificateIfCourseCompleted } from "@/lib/certificates";
import { prisma } from "@/lib/prisma";

export async function submitQuizAction(formData: FormData) {
  const quizId = String(formData.get("quizId") ?? "");
  const session = await getAuthorizedSession(["student"]);

  if (!session) {
    redirect(`/login?next=/student/quizzes/${quizId}`);
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { orderBy: { position: "asc" } },
      lesson: { include: { module: { include: { course: true } } } },
      attempts: { where: { learnerId: session.userId } },
    },
  });

  if (!quiz?.lesson || !quiz.lessonId) {
    redirect(`/student/quizzes/${quizId}?result=missing`);
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      learnerId: session.userId,
      courseId: quiz.lesson.module.courseId,
      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
    select: { status: true },
  });

  if (!enrollment) {
    redirect(`/student/quizzes/${quizId}?result=denied`);
  }

  const previousLessons = await prisma.lesson.findMany({
    where: {
      module: {
        courseId: quiz.lesson.module.courseId,
      },
      OR: [
        { module: { position: { lt: quiz.lesson.module.position } } },
        {
          moduleId: quiz.lesson.moduleId,
          position: { lt: quiz.lesson.position },
        },
      ],
    },
    include: {
      progress: { where: { learnerId: session.userId } },
    },
  });

  if (previousLessons.some((item) => !item.progress.some((progress) => progress.completed))) {
    redirect(`/student/quizzes/${quizId}?result=denied`);
  }

  if (quiz.attempts.length >= quiz.maxAttempts) {
    redirect(`/student/quizzes/${quizId}?result=locked`);
  }

  const answers: Record<string, string[]> = {};
  let correct = 0;
  let gradableQuestions = 0;

  for (const question of quiz.questions) {
    const selected = formData.getAll(`question-${question.id}`).map(String);
    answers[question.id] = selected;

    if (question.type === "OPEN_TEXT" && question.correctOptions.length === 0) {
      continue;
    }

    const expected = [...question.correctOptions].sort();
    const actual = [...selected].sort();
    const isCorrect = expected.length === actual.length && expected.every((value, index) => value === actual[index]);

    gradableQuestions += 1;

    if (isCorrect) {
      correct += 1;
    }
  }

  const score = gradableQuestions ? Math.round((correct / gradableQuestions) * 100) : 100;
  const passed = score >= quiz.minimumScore;

  await prisma.quizAttempt.create({
    data: {
      learnerId: session.userId,
      quizId: quiz.id,
      score,
      passed,
      answers,
    },
  });

  if (passed) {
    await prisma.lessonProgress.upsert({
      where: {
        learnerId_lessonId: {
          learnerId: session.userId,
          lessonId: quiz.lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
        lastActivityAt: new Date(),
      },
      create: {
        learnerId: session.userId,
        lessonId: quiz.lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    await createCertificateIfCourseCompleted(session.userId, quiz.lesson.module.courseId);
    redirect(`/student/courses/${quiz.lesson.module.courseId}?notice=quiz-passed`);
  }

  redirect(`/student/quizzes/${quizId}?result=failed&score=${score}`);
}
