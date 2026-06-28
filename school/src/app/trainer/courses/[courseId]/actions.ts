"use server";

import { randomUUID } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { mkdir, unlink, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { AccountStatus, CourseStatus, EnrollmentStatus, FileAssetType, LessonType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { getNumberSetting } from "@/lib/settings";
import { notifyUser } from "@/lib/notifications";
import {
  courseStatusSchema,
  enrollmentStatusSchema,
  courseUpdateSchema,
  learnerAssignmentSchema,
  lessonCreateSchema,
  moduleCreateSchema,
  moduleDeleteSchema,
  moduleUpdateSchema,
  lessonDeleteSchema,
  lessonUpdateSchema,
  quizCreateSchema,
  quizQuestionCreateSchema,
  quizQuestionDeleteSchema,
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
const genericUploadMimeTypes = new Set(["", "application/octet-stream", "binary/octet-stream"]);
const mp4ContainerBoxes = new Set(["moov", "trak", "mdia", "minf", "stbl"]);

function normalizeDurationSeconds(value: number) {
  const duration = Math.round(value);
  return Number.isFinite(duration) && duration > 0 && duration <= 24 * 60 * 60 ? duration : null;
}

async function getVideoDurationSeconds(filePath: string) {
  try {
    const { stdout } = await execFile(process.env.FFPROBE_PATH ?? "ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath], { timeout: 30_000 });
    return normalizeDurationSeconds(Number(stdout.trim()));
  } catch {
    return null;
  }
}

function readUInt64AsNumber(buffer: Buffer, offset: number) {
  if (offset + 8 > buffer.length) {
    return null;
  }

  const value = buffer.readBigUInt64BE(offset);
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
}

function getMp4BoxSize(buffer: Buffer, offset: number, limit: number) {
  if (offset + 8 > limit) {
    return null;
  }

  const size32 = buffer.readUInt32BE(offset);
  const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");

  if (!/^[\x20-\x7e]{4}$/.test(type)) {
    return null;
  }

  if (size32 === 1) {
    const size64 = readUInt64AsNumber(buffer, offset + 8);
    if (!size64 || size64 < 16) {
      return null;
    }
    return { type, size: size64, headerSize: 16 };
  }

  if (size32 === 0) {
    return { type, size: limit - offset, headerSize: 8 };
  }

  if (size32 < 8) {
    return null;
  }

  return { type, size: size32, headerSize: 8 };
}

function parseMp4DurationBox(buffer: Buffer, contentStart: number, contentEnd: number) {
  if (contentStart + 24 > contentEnd) {
    return null;
  }

  const version = buffer[contentStart];

  if (version === 1) {
    if (contentStart + 32 > contentEnd) {
      return null;
    }

    const timescale = buffer.readUInt32BE(contentStart + 20);
    const duration = readUInt64AsNumber(buffer, contentStart + 24);
    return timescale && duration ? normalizeDurationSeconds(duration / timescale) : null;
  }

  const timescale = buffer.readUInt32BE(contentStart + 12);
  const duration = buffer.readUInt32BE(contentStart + 16);
  return timescale && duration ? normalizeDurationSeconds(duration / timescale) : null;
}

function getMp4DurationSeconds(buffer: Buffer, start = 0, limit = buffer.length, depth = 0): number | null {
  if (depth > 6) {
    return null;
  }

  let offset = start;

  while (offset + 8 <= limit) {
    const box = getMp4BoxSize(buffer, offset, limit);

    if (!box || offset + box.size > limit) {
      return null;
    }

    const contentStart = offset + box.headerSize;
    const boxEnd = offset + box.size;

    if (box.type === "mvhd" || box.type === "mdhd") {
      const duration = parseMp4DurationBox(buffer, contentStart, boxEnd);
      if (duration) {
        return duration;
      }
    }

    if (mp4ContainerBoxes.has(box.type)) {
      const duration = getMp4DurationSeconds(buffer, contentStart, boxEnd, depth + 1);
      if (duration) {
        return duration;
      }
    }

    offset = boxEnd;
  }

  return null;
}

function readEbmlSize(buffer: Buffer, offset: number) {
  if (offset >= buffer.length) {
    return null;
  }

  const firstByte = buffer[offset];
  let mask = 0x80;
  let length = 1;

  while (length <= 8 && (firstByte & mask) === 0) {
    mask >>= 1;
    length += 1;
  }

  if (length > 8 || offset + length > buffer.length) {
    return null;
  }

  let value = firstByte & (mask - 1);
  for (let index = 1; index < length; index += 1) {
    value = (value * 256) + buffer[offset + index];
  }

  return { value, length };
}

function readEbmlUnsignedInteger(buffer: Buffer, offset: number, size: number) {
  if (size <= 0 || size > 8 || offset + size > buffer.length) {
    return null;
  }

  let value = 0;
  for (let index = 0; index < size; index += 1) {
    value = (value * 256) + buffer[offset + index];
  }

  return value;
}

function findEbmlNumericElement(buffer: Buffer, elementId: Buffer, readValue: (offset: number, size: number) => number | null) {
  let searchOffset = 0;

  while (searchOffset < buffer.length) {
    const idOffset = buffer.indexOf(elementId, searchOffset);
    if (idOffset === -1) {
      return null;
    }

    const sizeInfo = readEbmlSize(buffer, idOffset + elementId.length);
    if (!sizeInfo) {
      searchOffset = idOffset + 1;
      continue;
    }

    const dataOffset = idOffset + elementId.length + sizeInfo.length;
    if (dataOffset + sizeInfo.value > buffer.length) {
      searchOffset = idOffset + 1;
      continue;
    }

    const value = readValue(dataOffset, sizeInfo.value);
    if (value !== null && Number.isFinite(value) && value > 0) {
      return value;
    }

    searchOffset = idOffset + 1;
  }

  return null;
}

function getWebmDurationSeconds(buffer: Buffer) {
  const timecodeScale = findEbmlNumericElement(
    buffer,
    Buffer.from([0x2a, 0xd7, 0xb1]),
    (offset, size) => readEbmlUnsignedInteger(buffer, offset, size),
  ) ?? 1_000_000;

  const duration = findEbmlNumericElement(
    buffer,
    Buffer.from([0x44, 0x89]),
    (offset, size) => {
      if (size === 4) {
        return buffer.readFloatBE(offset);
      }
      if (size === 8) {
        return buffer.readDoubleBE(offset);
      }
      return null;
    },
  );

  return duration ? normalizeDurationSeconds((duration * timecodeScale) / 1_000_000_000) : null;
}

function getVideoDurationSecondsFromBuffer(buffer: Buffer, extension: string) {
  if (extension === ".webm") {
    return getWebmDurationSeconds(buffer);
  }

  if (extension === ".mp4" || extension === ".mov") {
    return getMp4DurationSeconds(buffer);
  }

  return null;
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

function isAllowedMimeType(fileType: string, type: LessonType) {
  const normalized = fileType.trim().toLowerCase();

  if (genericUploadMimeTypes.has(normalized)) {
    return true;
  }

  const allowedMimeTypes = type === LessonType.VIDEO ? lessonFileTypes.VIDEO.mimeTypes : lessonFileTypes.DOCUMENT.mimeTypes;

  if (allowedMimeTypes.has(normalized)) {
    return true;
  }

  return type === LessonType.VIDEO && normalized.startsWith("video/");
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
    return { ok: false as const, message: "Les fichiers sont réservés aux leçons vidéo ou document." };
  }

  const maxMegabytes = await getNumberSetting("maxPrivateUploadMb");
  const maxBytes = maxMegabytes * 1024 * 1024;

  if (file.size <= 0) {
    return { ok: true as const, relativePath: null, mimeType: "", size: 0 };
  }

  if (file.size > maxBytes) {
    return { ok: false as const, message: `Fichier trop lourd. Limite: ${maxMegabytes} Mo.` };
  }

  const extension = getSafeExtension(file.name, type);

  if (!extension || !isAllowedMimeType(file.type, type)) {
    return { ok: false as const, message: "Type de fichier non autorisé pour cette leçon." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasFileSignature(buffer, extension)) {
    return { ok: false as const, message: "Le contenu du fichier ne correspond pas au format annoncé." };
  }

  const privateRoot = getPrivateUploadRoot();
  await mkdir(/*turbopackIgnore: true*/ privateRoot, { recursive: true });

  const relativePath = `${type.toLowerCase()}-${randomUUID()}${extension}`;
  const destination = path.resolve(privateRoot, relativePath);

  if (destination !== privateRoot && !destination.startsWith(`${privateRoot}${path.sep}`)) {
    return { ok: false as const, message: "Chemin de fichier non autorisé." };
  }

  await writeFile(/*turbopackIgnore: true*/ destination, buffer);

  return {
    ok: true as const,
    relativePath,
    mimeType: mimeTypeForExtension(extension),
    size: file.size,
    durationSeconds: type === LessonType.VIDEO ? getVideoDurationSecondsFromBuffer(buffer, extension) : null,
  };
}

async function removePrivateLessonFile(relativePath: string) {
  const privateRoot = getPrivateUploadRoot();
  const destination = path.resolve(privateRoot, relativePath);

  if (destination === privateRoot || !destination.startsWith(`${privateRoot}${path.sep}`)) {
    return;
  }

  try {
    await unlink(/*turbopackIgnore: true*/ destination);
  } catch {
    // Rien a faire : l'upload a deja echoue ou le fichier a ete supprime.
  }
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
    priceAmount: formData.get("priceAmount") || undefined,
    priceCurrency: formData.get("priceCurrency") || undefined,
    durationValue: formData.get("durationValue") || undefined,
    durationUnit: formData.get("durationUnit") || undefined,
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Formation invalide.", errors: parsed.error.flatten().fieldErrors };
  }

  const course = await canManageCourse(parsed.data.courseId, session.userId, session.role);
  if (!course) {
    return { ok: false, message: "Formation introuvable ou non autorisée." };
  }

  await prisma.course.update({
    where: { id: parsed.data.courseId },
    data: {
      title: parsed.data.title,
      priceAmount: parsed.data.priceAmount ?? null,
      priceCurrency: parsed.data.priceCurrency ?? null,
      durationValue: parsed.data.durationValue ?? null,
      durationUnit: (parsed.data.durationUnit?.toUpperCase() as any) ?? null,
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

  return { ok: true, message: "Formation mise à jour." };
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

export async function retireCourseAction(formData: FormData) {
  const session = await requireBuilderSession();
  const courseId = String(formData.get("courseId") ?? "");
  if (!session || !courseId) return;
  const course = await canManageCourse(courseId, session.userId, session.role);
  if (!course) return;
  const enrollmentCount = await prisma.enrollment.count({ where: { courseId: course.id } });
  if (enrollmentCount) {
    await prisma.course.update({ where: { id: course.id }, data: { status: CourseStatus.ARCHIVED } });
    await prisma.auditLog.create({ data: { actorId: session.userId, action: "COURSE_RETIRED", target: course.id, metadata: { mode: "ARCHIVED", enrollmentCount } } });
  } else {
    await prisma.course.delete({ where: { id: course.id } });
    await prisma.auditLog.create({ data: { actorId: session.userId, action: "COURSE_DELETED", target: course.id, metadata: { mode: "DELETED" } } });
  }
  revalidatePath("/trainer/courses");
  redirect("/trainer/courses?notice=course-retired");
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
    return { ok: false, message: "Formation introuvable ou non autorisée." };
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

  return { ok: true, message: "Module créé." };
}

export async function updateModuleAction(formData: FormData) {
  const session = await requireBuilderSession(); const parsed = moduleUpdateSchema.safeParse({ moduleId: formData.get("moduleId"), title: formData.get("title"), description: formData.get("description") });
  if (!session || !parsed.success) return;
  const courseModule = await prisma.courseModule.findUnique({ where: { id: parsed.data.moduleId }, include: { course: true } });
  if (!courseModule || (session.role !== "admin" && courseModule.course.trainerId !== session.userId)) return;
  await prisma.courseModule.update({ where: { id: courseModule.id }, data: { title: parsed.data.title, description: parsed.data.description || null } });
  revalidatePath(`/trainer/courses/${courseModule.courseId}`); redirect(`/trainer/courses/${courseModule.courseId}?notice=module-updated`);
}
export async function deleteModuleAction(formData: FormData) {
  const session = await requireBuilderSession(); const parsed = moduleDeleteSchema.safeParse({ moduleId: formData.get("moduleId") }); if (!session || !parsed.success) return;
  const courseModule = await prisma.courseModule.findUnique({ where: { id: parsed.data.moduleId }, include: { course: true, lessons: { select: { id: true } } } });
  if (!courseModule || (session.role !== "admin" && courseModule.course.trainerId !== session.userId)) return;
  if (courseModule.lessons.length) redirect(`/trainer/courses/${courseModule.courseId}?notice=module-not-empty`);
  await prisma.courseModule.delete({ where: { id: courseModule.id } }); revalidatePath(`/trainer/courses/${courseModule.courseId}`); redirect(`/trainer/courses/${courseModule.courseId}?notice=module-deleted`);
}
export async function updateLessonAction(formData: FormData) {
  const session = await requireBuilderSession(); const parsed = lessonUpdateSchema.safeParse({ lessonId: formData.get("lessonId"), title: formData.get("title"), content: formData.get("content") || undefined }); if (!session || !parsed.success) return;
  const lesson = await prisma.lesson.findUnique({ where: { id: parsed.data.lessonId }, include: { module: { include: { course: true } } } });
  if (!lesson || (session.role !== "admin" && lesson.module.course.trainerId !== session.userId)) return;
  if (lesson.type === "TEXT" && !parsed.data.content) redirect(`/trainer/courses/${lesson.module.courseId}?notice=lesson-invalid`);
  await prisma.lesson.update({ where: { id: lesson.id }, data: { title: parsed.data.title, ...(lesson.type === "TEXT" ? { content: parsed.data.content } : {}) } }); revalidatePath(`/trainer/courses/${lesson.module.courseId}`); redirect(`/trainer/courses/${lesson.module.courseId}?notice=lesson-updated`);
}
export async function deleteLessonAction(formData: FormData) {
  const session = await requireBuilderSession(); const parsed = lessonDeleteSchema.safeParse({ lessonId: formData.get("lessonId") }); if (!session || !parsed.success) return;
  const lesson = await prisma.lesson.findUnique({ where: { id: parsed.data.lessonId }, include: { module: { include: { course: true } }, progress: { select: { id: true } }, quiz: { include: { attempts: { select: { id: true } } } } } });
  if (!lesson || (session.role !== "admin" && lesson.module.course.trainerId !== session.userId)) return;
  if (lesson.progress.length || lesson.quiz?.attempts.length) redirect(`/trainer/courses/${lesson.module.courseId}?notice=lesson-tracked`);
  await prisma.lesson.delete({ where: { id: lesson.id } }); revalidatePath(`/trainer/courses/${lesson.module.courseId}`); redirect(`/trainer/courses/${lesson.module.courseId}?notice=lesson-deleted`);
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
    return { ok: false, message: "Leçon invalide.", errors: parsed.error.flatten().fieldErrors };
  }

  const courseModule = await prisma.courseModule.findUnique({
    where: { id: parsed.data.moduleId },
    include: { course: { select: { id: true, trainerId: true } } },
  });

  if (!courseModule || (session.role !== "admin" && courseModule.course.trainerId !== session.userId)) {
    return { ok: false, message: "Module introuvable ou non autorisé." };
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId: parsed.data.moduleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const lessonType = parsed.data.type as LessonType;
  const uploadedFileName = String(formData.get("uploadedFileName") ?? "");
  const uploadedFile = formData.get("asset");

  let upload = null;
  if (uploadedFileName) {
    const p = path.resolve(getPrivateUploadRoot(), uploadedFileName);
    try {
      const st = await stat(p);
      const ext = path.extname(uploadedFileName).toLowerCase();
      upload = {
        ok: true as const,
        relativePath: uploadedFileName,
        mimeType: mimeTypeForExtension(ext as any) || "application/octet-stream",
        size: st.size,
        durationSeconds: null,
      };
    } catch {
      return { ok: false, message: "Fichier pré-uploadé introuvable." };
    }
  } else if (uploadedFile instanceof File && uploadedFile.size > 0) {
    upload = await savePrivateLessonFile(uploadedFile, lessonType);
  }

  if (upload && !upload.ok) {
    return { ok: false, message: upload.message };
  }

  if ((lessonType === LessonType.VIDEO || lessonType === LessonType.DOCUMENT) && !upload?.relativePath) {
    return { ok: false, message: "Ajoute le fichier privé associé à cette leçon." };
  }

  const durationSeconds = lessonType === LessonType.VIDEO && upload?.relativePath
    ? upload.durationSeconds ?? await getVideoDurationSeconds(path.resolve(getPrivateUploadRoot(), upload.relativePath))
    : null;

  if (lessonType === LessonType.VIDEO && upload?.relativePath && !durationSeconds) {
    await removePrivateLessonFile(upload.relativePath);
    return {
      ok: false,
      message: "Impossible de lire la durée de cette vidéo. Utilise un fichier MP4, WebM ou MOV finalisé, avec des métadonnées de durée lisibles.",
    };
  }

  if (lessonType === LessonType.TEXT && !parsed.data.content) {
    return { ok: false, message: "Ajoute le contenu de la leçon texte." };
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

  return { ok: true, message: "Leçon créée." };
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
    return { ok: false, message: "Leçon quiz introuvable, déjà configurée ou non autorisée." };
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

  return { ok: true, message: "Quiz créé." };
}

export async function addQuizQuestionAction(
  _state: BuilderActionState,
  formData: FormData,
): Promise<BuilderActionState> {
  const session = await requireBuilderSession();
  const parsed = quizQuestionCreateSchema.safeParse({ quizId: formData.get("quizId"), questionText: formData.get("questionText"), optionA: formData.get("optionA"), optionB: formData.get("optionB"), optionC: formData.get("optionC"), correctOption: formData.get("correctOption") });
  if (!session || !parsed.success) return { ok: false, message: "Question invalide.", errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors };
  const quiz = await prisma.quiz.findUnique({ where: { id: parsed.data.quizId }, include: { lesson: { include: { module: { include: { course: true } } } } } });
  if (!quiz?.lesson || (session.role !== "admin" && quiz.lesson.module.course.trainerId !== session.userId)) return { ok: false, message: "Quiz introuvable ou non autorisé." };
  const options = [parsed.data.optionA, parsed.data.optionB, parsed.data.optionC].filter(Boolean) as string[];
  const correctIndex = parsed.data.correctOption === "A" ? 0 : parsed.data.correctOption === "B" ? 1 : 2;
  if (!options[correctIndex]) return { ok: false, message: "La réponse correcte est absente." };
  const last = await prisma.question.findFirst({ where: { quizId: quiz.id }, orderBy: { position: "desc" }, select: { position: true } });
  await prisma.question.create({ data: { quizId: quiz.id, type: "SINGLE_CHOICE", text: parsed.data.questionText, options, correctOptions: [options[correctIndex]], position: (last?.position ?? 0) + 1 } });
  await prisma.auditLog.create({ data: { actorId: session.userId, action: "QUIZ_QUESTION_CREATED", target: quiz.id } });
  revalidatePath(`/trainer/courses/${quiz.lesson.module.courseId}`);
  return { ok: true, message: "Question ajoutée au quiz." };
}

export async function deleteQuizQuestionAction(formData: FormData) {
  const session = await requireBuilderSession();
  const parsed = quizQuestionDeleteSchema.safeParse({ questionId: formData.get("questionId") });
  if (!session || !parsed.success) return;
  const question = await prisma.question.findUnique({ where: { id: parsed.data.questionId }, include: { quiz: { include: { attempts: { select: { id: true } }, lesson: { include: { module: { include: { course: true } } } } } } } });
  if (!question || !question.quiz || !question.quiz.lesson) return;
  const quiz = question.quiz;
  const lesson = question.quiz.lesson;

  if (session.role !== "admin" && lesson.module.course.trainerId !== session.userId) return;

  if (quiz.attempts.length > 0) {
    redirect(`/trainer/courses/${lesson.module.courseId}?notice=question-tracked`);
  }

  await prisma.question.delete({ where: { id: question.id } });
  await prisma.auditLog.create({ data: { actorId: session.userId, action: "QUIZ_QUESTION_DELETED", target: question.quizId } });

  revalidatePath(`/trainer/courses/${lesson.module.courseId}`);
  redirect(`/trainer/courses/${lesson.module.courseId}?notice=question-deleted`);
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

  await notifyUser(prisma, { userId: enrollment.learnerId, senderId: session.userId, title: parsed.data.status === "REVOKED" ? "Accès retiré" : "Accès formation mis à jour", body: parsed.data.status === "REVOKED" ? `Ton accès à la formation ${enrollment.course.title} a été retiré.` : "Ton accès formation a été mis à jour.", email: true });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "ENROLLMENT_STATUS_UPDATED",
      target: enrollment.id,
      metadata: { status: parsed.data.status, learnerId: enrollment.learnerId },
    },
  });

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
    return { ok: false, message: "Formation introuvable ou non autorisée." };
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
        title: "Nouvel accès formation",
        body: "Un formateur t'a inscrit à une formation.",
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
    subject: "Nouvel accès formation",
    html: `<p>Bonjour ${escapeHtml(learner.firstName)},</p><p>Ton accès à la formation ${escapeHtml(course.title)} est maintenant actif.</p>`,
  });

  revalidatePath(`/trainer/courses/${course.id}`);
  revalidatePath("/trainer/students");
  revalidatePath("/student/courses");
  revalidatePath("/student/notifications");

  return { ok: true, message: "Apprenant inscrit à la formation." };
}

export async function bulkAssignLearnersAction(
  _state: BuilderActionState,
  formData: FormData,
): Promise<BuilderActionState> {
  const session = await requireBuilderSession();
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const course = await canManageCourse(courseId, session.userId, session.role);
  if (!course) {
    return { ok: false, message: "Formation introuvable ou non autorisée." };
  }

  const existingEnrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    select: { learnerId: true },
  });
  const alreadyEnrolledIds = new Set(existingEnrollments.map((e) => e.learnerId));

  const eligibleLearners = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      status: { notIn: [AccountStatus.SUSPENDED, AccountStatus.DELETED] },
      id: { notIn: [...alreadyEnrolledIds] },
    },
    select: { id: true, email: true, firstName: true },
  });

  if (eligibleLearners.length === 0) {
    return { ok: false, message: "Tous les apprenants sont déjà inscrits à cette formation." };
  }

  const operations: any[] = eligibleLearners.flatMap((learner) => [
    prisma.enrollment.create({
      data: {
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
        title: "Nouvel accès formation",
        body: `Tu as été inscrit à la formation ${course.title}.`,
      },
    }),
  ]);

  operations.push(
    prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "BULK_LEARNERS_ASSIGNED",
        target: course.id,
        metadata: { count: eligibleLearners.length },
      },
    }),
  );

  await prisma.$transaction(operations);

  revalidatePath(`/trainer/courses/${course.id}`);
  revalidatePath("/trainer/students");
  revalidatePath("/student/courses");
  revalidatePath("/student/notifications");

  return { ok: true, message: `${eligibleLearners.length} apprenant(s) inscrits à la formation.` };
}
