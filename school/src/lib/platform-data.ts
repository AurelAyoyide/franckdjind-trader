import { AccountStatus, CourseStatus, EnrollmentStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TrainerDataScope = {
  userId: string;
  isAdmin: boolean;
};

function courseScope(scope?: TrainerDataScope) {
  return scope && !scope.isAdmin ? { trainerId: scope.userId } : {};
}

function learnerScope(scope?: TrainerDataScope) {
  return scope && !scope.isAdmin
    ? {
        enrollments: {
          some: {
            course: { trainerId: scope.userId },
          },
        },
      }
    : {};
}

function requestScope(scope?: TrainerDataScope) {
  return scope && !scope.isAdmin
    ? {
        OR: [{ course: { trainerId: scope.userId } }, { courseId: null }],
      }
    : {};
}

function fullName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function percent(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export async function getStudentCourseCards(userId: string) {
  const now = new Date();
  const enrollments = await prisma.enrollment.findMany({
    where: {
      learnerId: userId,
      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  progress: { where: { learnerId: userId } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map(({ course }) => {
    const lessons = course.modules.flatMap((module) => module.lessons);
    const completed = lessons.filter((lesson) => lesson.progress.some((item) => item.completed)).length;

    return {
      id: course.id,
      title: course.title,
      type: course.type === "FREE" ? "Gratuite" : "Payante",
      status: course.status === CourseStatus.PUBLISHED ? "PUBLIEE" : statusLabel(course.status),
      level: course.type === "FREE" ? "Debutant" : "Intermediaire",
      progress: percent(completed, lessons.length),
      lessons: lessons.length,
      modules: course.modules.length,
      duration: course.duration || "A votre rythme",
      description: course.description,
    };
  });
}

export async function getStudentDashboardData(userId: string) {
  const now = new Date();
  const [courses, unreadNotifications, certificates, liveAnnouncements] = await Promise.all([
    getStudentCourseCards(userId),
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.certificate.count({ where: { learnerId: userId, revokedAt: null } }),
    prisma.liveAnnouncement.findMany({
      where: {
        status: "SCHEDULED",
        OR: [
          { courseId: null },
          {
            course: {
              enrollments: {
                some: {
                  learnerId: userId,
                  status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
                  OR: [{ endsAt: null }, { endsAt: { gt: now } }],
                },
              },
            },
          },
        ],
      },
      orderBy: { scheduledAt: "asc" },
      take: 1,
    }),
  ]);

  return {
    courses,
    unreadNotifications,
    certificates,
    activeCourse: courses[0] ?? null,
    nextLive: liveAnnouncements[0] ?? null,
  };
}

export async function getStudentCourseDetail(userId: string, courseId: string) {
  const now = new Date();
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      learnerId: userId,
      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      course: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
    },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { position: "asc" },
            include: {
              lessons: {
                orderBy: { position: "asc" },
                include: {
                  progress: { where: { learnerId: userId } },
                  quiz: { select: { id: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    return null;
  }

  const lessons = enrollment.course.modules.flatMap((module) => module.lessons);
  const completed = lessons.filter((lesson) => lesson.progress.some((item) => item.completed)).length;

  return {
    course: {
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      status: statusLabel(enrollment.course.status),
      progress: percent(completed, lessons.length),
      modules: enrollment.course.modules.length,
      lessons: lessons.length,
      level: enrollment.course.type === "FREE" ? "Debutant" : "Intermediaire",
      duration: enrollment.course.duration || "A votre rythme",
    },
    modules: (() => {
      let unlockedSoFar = true;

      return enrollment.course.modules.map((module, index) => {
        const moduleUnlocked = unlockedSoFar;

        return {
          id: module.id,
          title: module.title,
          unlock: moduleUnlocked ? (index === 0 ? "Immediat" : `Apres le module ${index}`) : "Bloque",
          lessons: module.lessons.map((lesson) => {
            const done = lesson.progress.some((item) => item.completed);
            const locked = !unlockedSoFar;
            const href =
              lesson.type === "QUIZ" && lesson.quiz?.id
                ? `/student/quizzes/${lesson.quiz.id}`
                : `/student/lessons/${lesson.id}`;

            unlockedSoFar = unlockedSoFar && done;

            return {
              id: lesson.id,
              title: lesson.title,
              kind: lesson.type,
              duration: lesson.type === "VIDEO" ? "Video" : lesson.type === "DOCUMENT" ? "Document" : "Lecture",
              done,
              locked,
              href,
            };
          }),
        };
      });
    })(),
  };
}

export async function getStudentLesson(userId: string, lessonId: string) {
  const now = new Date();
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      module: {
        course: {
          enrollments: {
            some: {
              learnerId: userId,
              status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
              OR: [{ endsAt: null }, { endsAt: { gt: now } }],
            },
          },
        },
      },
    },
    include: {
      module: { include: { course: true } },
      progress: { where: { learnerId: userId } },
    },
  });

  if (!lesson || lesson.type === "QUIZ") {
    return null;
  }

  const previousLessons = await prisma.lesson.findMany({
    where: {
      module: {
        courseId: lesson.module.courseId,
      },
      OR: [
        { module: { position: { lt: lesson.module.position } } },
        {
          moduleId: lesson.moduleId,
          position: { lt: lesson.position },
        },
      ],
    },
    include: {
      progress: { where: { learnerId: userId } },
    },
  });

  if (previousLessons.some((item) => !item.progress.some((progress) => progress.completed))) {
    return null;
  }

  return {
    id: lesson.id,
    title: lesson.title,
    kind: lesson.type,
    content: lesson.content,
    documentPath: lesson.documentPath,
    courseId: lesson.module.courseId,
    courseTitle: lesson.module.course.title,
    completed: lesson.progress.some((item) => item.completed),
    videoPosition: lesson.progress[0]?.videoPosition ?? 0,
    durationSeconds: lesson.durationSeconds,
  };
}

export async function getStudentQuiz(userId: string, quizId: string) {
  const now = new Date();
  const quiz = await prisma.quiz.findFirst({
    where: {
      OR: [{ id: quizId }, { lessonId: quizId }],
      lesson: {
        module: {
          course: {
            enrollments: {
              some: {
                learnerId: userId,
                status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
                OR: [{ endsAt: null }, { endsAt: { gt: now } }],
              },
            },
          },
        },
      },
    },
    include: {
      questions: { orderBy: { position: "asc" } },
      attempts: { where: { learnerId: userId }, orderBy: { createdAt: "desc" } },
      lesson: { include: { module: { include: { course: true } } } },
    },
  });

  if (!quiz) {
    return null;
  }

  if (quiz.lesson) {
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
        progress: { where: { learnerId: userId } },
      },
    });

    if (previousLessons.some((item) => !item.progress.some((progress) => progress.completed))) {
      return null;
    }
  }

  return {
    id: quiz.id,
    title: quiz.title,
    minimumScore: quiz.minimumScore,
    attempts: Math.max(quiz.maxAttempts - quiz.attempts.length, 0),
    questions: quiz.questions.map((question) => ({
      id: question.id,
      text: question.text,
      options: question.options,
      type: question.type,
    })),
  };
}

export async function getStudentCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { learnerId: userId, revokedAt: null },
    include: {
      learner: true,
      course: true,
    },
    orderBy: { issuedAt: "desc" },
  });
}

export async function getStudentNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getVisibleLiveAnnouncements(userId?: string) {
  const now = new Date();
  return prisma.liveAnnouncement.findMany({
    where: {
      status: { in: ["SCHEDULED", "SENT"] },
      ...(userId
        ? {
            OR: [
              { courseId: null },
              {
                course: {
                  enrollments: {
                    some: {
                      learnerId: userId,
                      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
                      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: { course: true },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });
}

export async function getTrainerLiveAnnouncements(scope: TrainerDataScope) {
  return prisma.liveAnnouncement.findMany({
    where:
      scope.isAdmin
        ? {}
        : {
            OR: [{ creatorId: scope.userId }, { course: { trainerId: scope.userId } }],
          },
    include: { course: true },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });
}

export async function getCommunityPosts(userId?: string, includeHidden = false) {
  const now = new Date();
  return prisma.communityPost.findMany({
    where: {
      ...(includeHidden ? {} : { status: "PUBLISHED" }),
      ...(userId
        ? {
            OR: [
              { courseId: null },
              {
                course: {
                  enrollments: {
                    some: {
                      learnerId: userId,
                      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
                      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      author: true,
      course: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function getTrainerDashboardData(scope?: TrainerDataScope) {
  const courseFilter = courseScope(scope);
  const requestFilter = requestScope(scope);
  const callFilter = scope && !scope.isAdmin ? { trainerId: scope.userId } : {};

  const [learners, courses, requests, calls, recentRequests] = await Promise.all([
    prisma.user.count({
      where: {
        role: UserRole.STUDENT,
        status: { notIn: [AccountStatus.SUSPENDED, AccountStatus.DELETED] },
        ...learnerScope(scope),
      },
    }),
    prisma.course.count({ where: courseFilter }),
    prisma.trainingRequest.count({ where: { status: "PENDING", ...requestFilter } }),
    prisma.callSchedule.count({
      where: {
        ...callFilter,
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.trainingRequest.findMany({
      where: requestFilter,
      include: { learner: true, course: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { learners, courses, requests, calls, recentRequests };
}

export async function getTrainerCourses(scope?: TrainerDataScope) {
  return prisma.course.findMany({
    where: courseScope(scope),
    include: {
      modules: { include: { lessons: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTrainerCourseBuilder(courseId: string, scope?: TrainerDataScope) {
  return prisma.course.findFirst({
    where: {
      OR: [{ id: courseId }, { slug: courseId }],
      ...courseScope(scope),
    },
    include: {
      trainer: true,
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              quiz: {
                include: {
                  questions: { orderBy: { position: "asc" } },
                },
              },
              fileAssets: true,
            },
          },
        },
      },
      enrollments: {
        include: { learner: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getTrainingRequests(scope?: TrainerDataScope) {
  return prisma.trainingRequest.findMany({
    where: requestScope(scope),
    include: { learner: true, course: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getLearnerRows(scope?: TrainerDataScope) {
  const learners = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      status: { not: AccountStatus.DELETED },
      ...learnerScope(scope),
    },
    include: {
      enrollments: {
        include: {
          course: { include: { modules: { include: { lessons: true } } } },
        },
      },
      lessonProgress: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return learners.map((learner) => {
    const lessonIds = new Set(
      learner.enrollments.flatMap((enrollment) =>
        enrollment.course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)),
      ),
    );
    const completed = learner.lessonProgress.filter(
      (item) => item.completed && lessonIds.has(item.lessonId),
    ).length;
    const lastActivity = learner.lessonProgress.reduce<Date | null>(
      (latest, item) => (!latest || item.lastActivityAt > latest ? item.lastActivityAt : latest),
      learner.lastLoginAt,
    );

    return {
      id: learner.id,
      name: fullName(learner),
      email: learner.email,
      progress: percent(completed, lessonIds.size),
      status:
        learner.status === AccountStatus.SUSPENDED
          ? "Suspendu"
          : lastActivity && Date.now() - lastActivity.getTime() < 7 * 24 * 60 * 60 * 1000
            ? "Actif"
            : "A relancer",
      lastSeen: lastActivity ?? learner.createdAt,
    };
  });
}

export async function getTrainerCalls(scope?: TrainerDataScope) {
  return prisma.callSchedule.findMany({
    where: scope && !scope.isAdmin ? { trainerId: scope.userId } : {},
    include: { learner: true, trainer: true },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });
}

export async function getAdminDashboardData() {
  const [users, trainers, settings, logs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: [UserRole.MAIN_TRAINER, UserRole.ASSISTANT_TRAINER] } } }),
    prisma.setting.count(),
    prisma.auditLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return { users, trainers, settings, logs };
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getAuditLogs(
  limit = 100,
  filters: { action?: string; target?: string } = {},
) {
  return prisma.auditLog.findMany({
    where: {
      ...(filters.action ? { action: { contains: filters.action, mode: "insensitive" } } : {}),
      ...(filters.target ? { target: { contains: filters.target, mode: "insensitive" } } : {}),
    },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminCertificates() {
  return prisma.certificate.findMany({
    include: {
      learner: true,
      course: true,
    },
    orderBy: { issuedAt: "desc" },
    take: 200,
  });
}

export async function getPublicCertificate(code: string) {
  return prisma.certificate.findUnique({
    where: { code },
    include: {
      learner: true,
      course: true,
    },
  });
}

export { fullName, statusLabel };
