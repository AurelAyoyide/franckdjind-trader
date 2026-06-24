"use server";

import { randomUUID } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { AccountStatus, CourseStatus, EnrollmentStatus, FileAssetType, LessonType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { getNumberSetting } from "@/lib/settings";
import {
  courseStatusSchema,
  enrollmentStatusSchema,
  courseUpdateSchema,
  learnerAssignmentSchema,
  lessonCreateSchema,
  moduleCreateSchema,
  quizCreateSchema,
} from "@/lib/validation";

export type BuilderActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

async function canManageCourse(courseId: string, userId: string, role: "student" | "trainer" | "admin") {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, trainerId: true },
  });

  if (!course) {
    return null;
  }

  if (role !== "admin" && course.trainerId !== userId) {
    return null;
  }

  return course;
}

async function requireBuilderSession() {
  const session = await getAuthorizedSession(["trainer", "admin"]);

  if (!session || (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER)) {
    return null;
  }

  return session;
}

function getPrivateUploadRoot() {
  const configuredUploadDir = process.env.PRIVATE_UPLOAD_DIR;

  return configuredUploadDir && path.isAbsolute(configuredUploadDir)
    ? path.resolve(configuredUploadDir)
    : path.join(/*turbopackIgnore: true*/ process.cwd(), configuredUploadDir ?? "private_uploads");
}

const lessonFileTypes = {
  VIDEO: {
    extensions: new Set([".mp4", ".webm", ".mov"]),
    mimeTypes: new Set(["video/mp4", "video/webm", "video/quicktime"]),
  },
  DOCUMENT: {
    extensions: new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xlsx", ".png", ".jpg", ".jpeg"]),
    mimeTypes: new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
    ]),
  },
} as const;
const execFile = promisify(execFileCallback);

async function getVideoDurationSeconds(filePath: string) {
  try {
    const { stdout } = await execFile(process.env.FFPROBE_PATH ?? "ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath], { timeout: 30_000 });
    const duration = Math.round(Number(stdout.trim()));
    return Number.isFinite(duration) && duration > 0 && duration <= 24 * 60 * 60 ? duration : null;
  } catch {
    return null;
  }
}

function getSafeExtension(fileName: string, type: LessonType) {
  const extension = path.extname(fileName).toLowerCase();
  const allowedExtensions = type === LessonType.VIDEO ? lessonFileTypes.VIDEO.extensions : lessonFileTypes.DOCUMENT.extensions;

  if (allowedExtensions.has(extension)) {
    return extension;
  }

  return null;
}

function mimeTypeForExtension(extension: string) {
  const types: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
  };

  return types[extension] ?? "application/octet-stream";
}

function hasBytes(buffer: Buffer, bytes: number[], offset = 0) {
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

function hasFileSignature(buffer: Buffer, extension: string) {
  if (extension === ".pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  if (extension === ".png") {
    return hasBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    return hasBytes(buffer, [0xff, 0xd8, 0xff]);
  }

  if (extension === ".doc" || extension === ".ppt") {
    return hasBytes(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  }

  if (extension === ".docx" || extension === ".pptx" || extension === ".xlsx") {
    return hasBytes(buffer, [0x50, 0x4b, 0x03, 0x04]) || hasBytes(buffer, [0x50, 0x4b, 0x05, 0x06]);
  }

  if (extension === ".webm") {
    return hasBytes(buffer, [0x1a, 0x45, 0xdf, 0xa3]);
  }

  return buffer.subarray(4, 8).toString("ascii") === "ftyp";
}

async function savePrivateLessonFile(file: File, type: LessonType) {
  if (type !== LessonType.VIDEO && type !== LessonType.DOCUMENT) {
    return { ok: false as const, message: "Les fichiers sont reserves aux lecons video ou document." };
  }

  const maxMegabytes = await getNumberSetting("maxPrivateUploadMb");
  const maxBytes = maxMegabytes * 1024 * 1024;

  if (file.size <= 0) {
    return { ok: true as const, relativePath: null, mimeType: "", size: 0 };
  }

  if (file.size > maxBytes) {
    return { ok: false as const, message: `Fichier trop lourd. Limite: ${maxMegabytes} Mo.` };
  }

  const allowedMimeTypes = type === LessonType.VIDEO ? lessonFileTypes.VIDEO.mimeTypes : lessonFileTypes.DOCUMENT.mimeTypes;
  const extension = getSafeExtension(file.name, type);

  if (!extension || (file.type && !allowedMimeTypes.has(file.type))) {
    return { ok: false as const, message: "Type de fichier non autorise pour cette lecon." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasFileSignature(buffer, extension)) {
    return { ok: false as const, message: "Le contenu du fichier ne correspond pas au format annonce." };
  }

  const privateRoot = getPrivateUploadRoot();
  await mkdir(/*turbopackIgnore: true*/ privateRoot, { recursive: true });

  const relativePath = `${type.toLowerCase()}-${randomUUID()}${extension}`;
  const destination = path.resolve(privateRoot, relativePath);

  if (destination !== privateRoot && !destination.startsWith(`${privateRoot}${path.sep}`)) {
    return { ok: false as const, message: "Chemin de fichier non autorise." };
  }

  await writeFile(/*turbopackIgnore: true*/ destination, buffer);

  return {
    ok: true as const,
    relativePath,
    mimeType: mimeTypeForExtension(extension),
    size: file.size,
  };
}

export async function updateCourseAction(
  _state: BuilderActionState,
  formData: FormData,
): Promise<BuilderActionState> {
  const session = await requireBuilderSession();
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const parsed = courseUpdateSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    type: formData.get("type"),
    priceLabel: formData.get("priceLabel"),
    duration: formData.get("duration"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Formation invalide.", errors: parsed.error.flatten().fieldErrors };
  }

  const course = await canManageCourse(parsed.data.courseId, session.userId, session.role);
  if (!course) {
    return { ok: false, message: "Formation introuvable ou non autorisee." };
  }

  await prisma.course.update({
    where: { id: parsed.data.courseId },
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      priceLabel: parsed.data.priceLabel || null,
      duration: parsed.data.duration || null,
      description: parsed.data.description,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COURSE_UPDATED",
      target: parsed.data.courseId,
    },
  });

  revalidatePath(`/trainer/courses/${parsed.data.courseId}`);
  revalidatePath("/trainer/courses");

  return { ok: true, message: "Formation mise a jour." };
}

export async function setCourseStatusAction(formData: FormData) {
  const session = await requireBuilderSession();
  if (!session) {
    return;
  }

  const parsed = courseStatusSchema.safeParse({
    courseId: formData.get("courseId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return;
  }

  const course = await canManageCourse(parsed.data.courseId, session.userId, session.role);
  if (!course) {
    return;
  }

  if (parsed.data.status === CourseStatus.PUBLISHED) {
    const lessons = await prisma.lesson.findMany({
      where: { module: { courseId: course.id } },
      include: { quiz: { select: { id: true } }, fileAssets: { select: { type: true } } },
    });
    const hasIncompleteLesson = lessons.some((lesson) =>
      (lesson.type === LessonType.TEXT && !lesson.content?.trim()) ||
      (lesson.type === LessonType.QUIZ && !lesson.quiz) ||
      (lesson.type === LessonType.VIDEO &&
        (!lesson.videoPath ||
          !lesson.durationSeconds ||
          !lesson.fileAssets.some((asset) => asset.type === FileAssetType.VIDEO))) ||
      (lesson.type === LessonType.DOCUMENT &&
        (!lesson.documentPath || !lesson.fileAssets.some((asset) => asset.type === FileAssetType.DOCUMENT))),
    );

    if (!lessons.length || hasIncompleteLesson) {
      redirect(`/trainer/courses/${course.id}?notice=course-incomplete`);
    }
  }

  await prisma.course.update({
    where: { id: parsed.data.courseId },
    data: { status: parsed.data.status },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COURSE_STATUS_UPDATED",
      target: parsed.data.courseId,
      metadata: { status: parsed.data.status },
    },
  });

  revalidatePath(`/trainer/courses/${parsed.data.courseId}`);
  revalidatePath("/trainer/courses");
  redirect(`/trainer/courses/${parsed.data.courseId}?notice=course-status`);
}

export async function createModuleAction(
  _state: BuilderActionState,
  formData: FormData,
): Promise<BuilderActionState> {
  const session = await requireBuilderSession();
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const parsed = moduleCreateSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Module invalide.", errors: parsed.error.flatten().fieldErrors };
  }

  const course = await canManageCourse(parsed.data.courseId, session.userId, session.role);
  if (!course) {
    return { ok: false, message: "Formation introuvable ou non autorisee." };
  }

  const lastModule = await prisma.courseModule.findFirst({
    where: { courseId: parsed.data.courseId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.courseModule.create({
    data: {
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      position: (lastModule?.position ?? 0) + 1,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COURSE_MODULE_CREATED",
      target: parsed.data.courseId,
    },
  });

  revalidatePath(`/trainer/courses/${parsed.data.courseId}`);

  return { ok: true, message: "Module cree." };
}

export async function createLessonAction(
  _state: BuilderActionState,
  formData: FormData,
): Promise<BuilderActionState> {
  const session = await requireBuilderSession();
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const parsed = lessonCreateSchema.safeParse({
    moduleId: formData.get("moduleId"),
    title: formData.get("title"),
    type: formData.get("type"),
    content: formData.get("content") || undefined,
    videoPath: formData.get("videoPath") || undefined,
    documentPath: formData.get("documentPath") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Lecon invalide.", errors: parsed.error.flatten().fieldErrors };
  }

  const courseModule = await prisma.courseModule.findUnique({
    where: { id: parsed.data.moduleId },
    include: { course: { select: { id: true, trainerId: true } } },
  });

  if (!courseModule || (session.role !== "admin" && courseModule.course.trainerId !== session.userId)) {
    return { ok: false, message: "Module introuvable ou non autorise." };
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId: parsed.data.moduleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const lessonType = parsed.data.type as LessonType;
  const uploadedFile = formData.get("asset");
  const upload =
    uploadedFile instanceof File && uploadedFile.size > 0
      ? await savePrivateLessonFile(uploadedFile, lessonType)
      : null;

  if (upload && !upload.ok) {
    return { ok: false, message: upload.message };
  }

  if ((lessonType === LessonType.VIDEO || lessonType === LessonType.DOCUMENT) && !upload?.relativePath) {
    return { ok: false, message: "Ajoute le fichier prive associe a cette lecon." };
  }

  const durationSeconds = lessonType === LessonType.VIDEO && upload?.relativePath
    ? await getVideoDurationSeconds(path.resolve(getPrivateUploadRoot(), upload.relativePath))
    : null;
  if (lessonType === LessonType.VIDEO && !durationSeconds) return { ok: false, message: "Impossible de lire la duree de cette video. Verifie le fichier MP4, WebM ou MOV." };

  if (lessonType === LessonType.TEXT && !parsed.data.content) {
    return { ok: false, message: "Ajoute le contenu de la lecon texte." };
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: parsed.data.moduleId,
      title: parsed.data.title,
      type: lessonType,
      content: parsed.data.content || null,
      videoPath: parsed.data.type === "VIDEO" ? upload?.relativePath || parsed.data.videoPath || null : null,
      documentPath:
        parsed.data.type === "DOCUMENT"
          ? upload?.relativePath || parsed.data.documentPath || parsed.data.videoPath || null
          : null,
      durationSeconds,
      position: (lastLesson?.position ?? 0) + 1,
    },
  });

  if (upload?.relativePath) {
    await prisma.fileAsset.create({
      data: {
        lessonId: lesson.id,
        ownerId: session.userId,
        type: lessonType === LessonType.VIDEO ? FileAssetType.VIDEO : FileAssetType.DOCUMENT,
        path: upload.relativePath,
        mimeType: upload.mimeType,
        size: upload.size,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "LESSON_CREATED",
      target: courseModule.courseId,
      metadata: { moduleId: courseModule.id, type: parsed.data.type, upload: Boolean(upload?.relativePath) },
    },
  });

  revalidatePath(`/trainer/courses/${courseModule.courseId}`);

  return { ok: true, message: "Lecon creee." };
}

export async function createQuizAction(
  _state: BuilderActionState,
  formData: FormData,
): Promise<BuilderActionState> {
  const session = await requireBuilderSession();
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const parsed = quizCreateSchema.safeParse({
    lessonId: formData.get("lessonId"),
    title: formData.get("title"),
    minimumScore: formData.get("minimumScore"),
    maxAttempts: formData.get("maxAttempts"),
    blocking: formData.get("blocking") === "on",
    questionText: formData.get("questionText"),
    optionA: formData.get("optionA"),
    optionB: formData.get("optionB"),
    optionC: formData.get("optionC"),
    correctOption: formData.get("correctOption"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Quiz invalide.", errors: parsed.error.flatten().fieldErrors };
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsed.data.lessonId },
    include: {
      module: { include: { course: { select: { id: true, trainerId: true } } } },
      quiz: true,
    },
  });

  if (!lesson || lesson.type !== "QUIZ" || lesson.quiz || (session.role !== "admin" && lesson.module.course.trainerId !== session.userId)) {
    return { ok: false, message: "Lecon quiz introuvable, deja configuree ou non autorisee." };
  }

  const options = [parsed.data.optionA, parsed.data.optionB, parsed.data.optionC].filter(Boolean) as string[];
  const correctIndex = parsed.data.correctOption === "A" ? 0 : parsed.data.correctOption === "B" ? 1 : 2;

  if (!options[correctIndex]) {
    return { ok: false, message: "L'option correcte choisie n'existe pas." };
  }

  await prisma.quiz.create({
    data: {
      lessonId: lesson.id,
      title: parsed.data.title,
      minimumScore: parsed.data.minimumScore,
      maxAttempts: parsed.data.maxAttempts,
      blocking: Boolean(parsed.data.blocking),
      questions: {
        create: {
          type: "SINGLE_CHOICE",
          text: parsed.data.questionText,
          options,
          correctOptions: [options[correctIndex]],
          position: 1,
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "QUIZ_CREATED",
      target: lesson.id,
    },
  });

  revalidatePath(`/trainer/courses/${lesson.module.courseId}`);

  return { ok: true, message: "Quiz cree." };
}

export async function setEnrollmentStatusAction(formData: FormData) {
  const session = await requireBuilderSession();
  if (!session) {
    return;
  }

  const parsed = enrollmentStatusSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return;
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: parsed.data.enrollmentId },
    include: { course: { select: { id: true, title: true, trainerId: true } }, learner: true },
  });

  if (!enrollment || (session.role !== "admin" && enrollment.course.trainerId !== session.userId)) {
    return;
  }

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: parsed.data.status,
      endsAt: parsed.data.status === "REVOKED" ? new Date() : null,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : enrollment.completedAt,
    },
  });

  await prisma.notification.create({
    data: {
      userId: enrollment.learnerId,
      senderId: session.userId,
      type: "INTERNAL",
      title: parsed.data.status === "REVOKED" ? "Acces retire" : "Acces formation mis a jour",
      body:
        parsed.data.status === "REVOKED"
          ? `Ton acces a la formation ${enrollment.course.title} a ete retire.`
          : "Ton acces formation a ete mis a jour.",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "ENROLLMENT_STATUS_UPDATED",
      target: enrollment.id,
      metadata: { status: parsed.data.status, learnerId: enrollment.learnerId },
    },
  });

  if (parsed.data.status === EnrollmentStatus.REVOKED) {
    await deliverLoggedEmail(prisma, {
      to: enrollment.learner.email,
      userId: enrollment.learnerId,
      subject: "Acces formation retire",
      html: `<p>Bonjour ${escapeHtml(enrollment.learner.firstName)},</p><p>Ton acces a la formation ${escapeHtml(enrollment.course.title)} a ete retire.</p>`,
    });
  }

  revalidatePath(`/trainer/courses/${enrollment.courseId}`);
  revalidatePath("/trainer/students");
  redirect(`/trainer/courses/${enrollment.courseId}?notice=enrollment-status`);
}

export async function assignLearnerAction(
  _state: BuilderActionState,
  formData: FormData,
): Promise<BuilderActionState> {
  const session = await requireBuilderSession();
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const parsed = learnerAssignmentSchema.safeParse({
    courseId: formData.get("courseId"),
    learnerId: formData.get("learnerId"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Inscription invalide.", errors: parsed.error.flatten().fieldErrors };
  }

  const course = await canManageCourse(parsed.data.courseId, session.userId, session.role);
  if (!course) {
    return { ok: false, message: "Formation introuvable ou non autorisee." };
  }

  const learner = await prisma.user.findFirst({
    where: {
      id: parsed.data.learnerId,
      role: UserRole.STUDENT,
      status: { notIn: [AccountStatus.SUSPENDED, AccountStatus.DELETED] },
    },
    select: { id: true, email: true, firstName: true },
  });

  if (!learner) {
    return { ok: false, message: "Apprenant introuvable ou suspendu." };
  }

  await prisma.$transaction([
    prisma.enrollment.upsert({
      where: {
        learnerId_courseId: {
          learnerId: learner.id,
          courseId: course.id,
        },
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
        startsAt: new Date(),
        endsAt: null,
      },
      create: {
        learnerId: learner.id,
        courseId: course.id,
        status: EnrollmentStatus.ACTIVE,
      },
    }),
    prisma.user.update({
      where: { id: learner.id },
      data: { status: AccountStatus.ACTIVE },
    }),
    prisma.notification.create({
      data: {
        userId: learner.id,
        senderId: session.userId,
        type: "INTERNAL",
        title: "Nouvel acces formation",
        body: "Un formateur t'a inscrit a une formation.",
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "LEARNER_ASSIGNED_TO_COURSE",
        target: course.id,
        metadata: { learnerId: learner.id },
      },
    }),
  ]);

  await deliverLoggedEmail(prisma, {
    to: learner.email,
    userId: learner.id,
    subject: "Nouvel acces formation",
    html: `<p>Bonjour ${escapeHtml(learner.firstName)},</p><p>Ton acces a la formation ${escapeHtml(course.title)} est maintenant actif.</p>`,
  });

  revalidatePath(`/trainer/courses/${course.id}`);
  revalidatePath("/trainer/students");
  revalidatePath("/student/courses");
  revalidatePath("/student/notifications");

  return { ok: true, message: "Apprenant inscrit a la formation." };
}
