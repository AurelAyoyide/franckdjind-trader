import {
  AccountStatus,
  CommunityPostStatus,
  CourseStatus,
  CourseType,
  LessonType,
  LiveStatus,
  PrismaClient,
  QuizQuestionType,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_DEMO_DATA !== "true") {
    console.info("Donnees de demonstration ignorees. Definissez SEED_DEMO_DATA=true uniquement en developpement.");
    return;
  }

  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!demoPassword) {
    throw new Error("SEED_DEMO_PASSWORD est requis lorsque SEED_DEMO_DATA=true.");
  }

  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const trainer = await prisma.user.upsert({
    where: { email: "formateur@example.com" },
    update: {},
    create: {
      email: "formateur@example.com",
      firstName: "Franck",
      lastName: "Djind",
      phone: "+22900000000",
      passwordHash,
      role: UserRole.MAIN_TRAINER,
      status: AccountStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "School",
      phone: "+22900000002",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "apprenant@example.com" },
    update: {},
    create: {
      email: "apprenant@example.com",
      firstName: "Kevin",
      lastName: "A.",
      phone: "+22901010101",
      passwordHash,
      role: UserRole.STUDENT,
      status: AccountStatus.ACTIVE,
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "fondations-trading-prive" },
    update: {},
    create: {
      title: "Fondations trading prive",
      slug: "fondations-trading-prive",
      description: "Comprendre le marche, structurer une routine et limiter le risque.",
      type: CourseType.FREE,
      status: CourseStatus.PUBLISHED,
      duration: "4 semaines",
      trainerId: trainer.id,
    },
  });

  const moduleOne = await prisma.courseModule.upsert({
    where: { courseId_position: { courseId: course.id, position: 1 } },
    update: {},
    create: {
      courseId: course.id,
      position: 1,
      title: "Demarrage propre",
      description: "Cadre de travail, journal et plan de progression.",
    },
  });

  await prisma.lesson.upsert({
    where: { moduleId_position: { moduleId: moduleOne.id, position: 1 } },
    update: {},
    create: {
      moduleId: moduleOne.id,
      position: 1,
      title: "Bienvenue et cadre",
      type: LessonType.TEXT,
      content: "Bienvenue dans la formation. Commence par clarifier tes objectifs et ton rythme.",
    },
  });

  await prisma.lesson.upsert({
    where: { moduleId_position: { moduleId: moduleOne.id, position: 2 } },
    update: {},
    create: {
      moduleId: moduleOne.id,
      position: 2,
      title: "Construire son plan",
      type: LessonType.TEXT,
      content: "Un plan simple doit definir le contexte, le risque et la sortie avant chaque execution.",
    },
  });

  const quizLesson = await prisma.lesson.upsert({
    where: { moduleId_position: { moduleId: moduleOne.id, position: 3 } },
    update: {},
    create: {
      moduleId: moduleOne.id,
      position: 3,
      title: "Quiz risk management",
      type: LessonType.QUIZ,
      content: "Validation des fondamentaux de gestion du risque.",
    },
  });

  const quiz = await prisma.quiz.upsert({
    where: { lessonId: quizLesson.id },
    update: {},
    create: {
      lessonId: quizLesson.id,
      title: "Quiz risk management",
      minimumScore: 70,
      maxAttempts: 3,
      blocking: true,
    },
  });

  await prisma.question.upsert({
    where: { quizId_position: { quizId: quiz.id, position: 1 } },
    update: {},
    create: {
      quizId: quiz.id,
      position: 1,
      type: QuizQuestionType.SINGLE_CHOICE,
      text: "Quelle action vient avant la recherche du gain ?",
      options: ["Definir le risque", "Augmenter le levier", "Entrer plus vite"],
      correctOptions: ["Definir le risque"],
    },
  });

  await prisma.question.upsert({
    where: { quizId_position: { quizId: quiz.id, position: 2 } },
    update: {},
    create: {
      quizId: quiz.id,
      position: 2,
      type: QuizQuestionType.SINGLE_CHOICE,
      text: "Quand faut-il documenter une execution ?",
      options: ["Avant et apres", "Seulement si elle gagne", "A la fin du mois"],
      correctOptions: ["Avant et apres"],
    },
  });

  await prisma.enrollment.upsert({
    where: { learnerId_courseId: { learnerId: student.id, courseId: course.id } },
    update: {},
    create: {
      learnerId: student.id,
      courseId: course.id,
    },
  });

  await prisma.liveAnnouncement.upsert({
    where: { id: "seed-live-weekly" },
    update: {},
    create: {
      id: "seed-live-weekly",
      title: "Session Q/R hebdomadaire",
      body: "Questions, cas pratiques et points de blocage de la semaine.",
      externalUrl: "https://meet.google.com/",
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: LiveStatus.SCHEDULED,
      courseId: course.id,
      creatorId: trainer.id,
    },
  });

  await prisma.communityPost.upsert({
    where: { id: "seed-community-bilan" },
    update: {},
    create: {
      id: "seed-community-bilan",
      title: "Bilan de la semaine",
      body: "Partage ton apprentissage principal et ton point a travailler.",
      pinned: true,
      status: CommunityPostStatus.PUBLISHED,
      authorId: trainer.id,
      courseId: course.id,
    },
  });

  await prisma.setting.upsert({
    where: { key: "certificatePrefix" },
    update: { value: "SCH" },
    create: { key: "certificatePrefix", value: "SCH" },
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
