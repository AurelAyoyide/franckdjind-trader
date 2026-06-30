import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { EnrollmentStatus } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getRequestAuthorizedSession } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolvePrivateFile(filePath: string) {
  const configuredUploadDir = process.env.PRIVATE_UPLOAD_DIR;
  const privateRoot =
    configuredUploadDir && path.isAbsolute(configuredUploadDir)
      ? path.resolve(configuredUploadDir)
      : path.join(/*turbopackIgnore: true*/ process.cwd(), configuredUploadDir ?? "private_uploads");
  const resolved = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(privateRoot, filePath);

  if (resolved !== privateRoot && !resolved.startsWith(`${privateRoot}${path.sep}`)) {
    return null;
  }

  return resolved;
}

function documentContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
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

type AuditMetadata = Record<string, string | number | boolean | null>;

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function clippedHeader(value: string | null, maxLength = 240) {
  if (!value) {
    return null;
  }

  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function requestTraceMetadata(request: NextRequest, extra: AuditMetadata = {}) {
  const metadata: AuditMetadata = { ...extra };
  const ip =
    firstHeaderValue(request.headers.get("cf-connecting-ip")) ??
    firstHeaderValue(request.headers.get("x-real-ip")) ??
    firstHeaderValue(request.headers.get("x-forwarded-for"));
  const userAgent = clippedHeader(request.headers.get("user-agent"));
  const referer = clippedHeader(request.headers.get("referer"), 500);
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (ip) {
    metadata.ip = ip;
  }

  if (userAgent) {
    metadata.userAgent = userAgent;
  }

  if (referer) {
    metadata.referer = referer;
  }

  if (secFetchSite) {
    metadata.secFetchSite = secFetchSite;
  }

  return metadata;
}

function isCrossSiteRequest(request: NextRequest) {
  return request.headers.get("sec-fetch-site") === "cross-site";
}

function documentDisposition(filePath: string, lessonId: string) {
  const extension = path.extname(filePath).toLowerCase();
  const inlineExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg"]);
  const mode = inlineExtensions.has(extension) ? "inline" : "attachment";

  return `${mode}; filename="${lessonId}${extension}"`;
}

function protectedDocumentHeaders(filePath: string, lessonId: string) {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": documentDisposition(filePath, lessonId),
    "Content-Type": documentContentType(filePath),
    "Cross-Origin-Resource-Policy": "same-origin",
    "Pragma": "no-cache",
    "Referrer-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await context.params;
  const session = await getRequestAuthorizedSession(request, ["student", "trainer", "admin"]);

  if (!session) {
    await prisma.auditLog.create({
      data: {
        action: "DOCUMENT_ACCESS_DENIED",
        target: lessonId,
        metadata: requestTraceMetadata(request, { reason: "NO_SESSION" }),
      },
    });
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  if (isCrossSiteRequest(request)) {
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "DOCUMENT_ACCESS_DENIED",
        target: lessonId,
        metadata: requestTraceMetadata(request, { reason: "CROSS_SITE_REQUEST" }),
      },
    });
    return NextResponse.json({ error: "Document non autorise" }, { status: 403 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      fileAssets: { where: { type: "DOCUMENT" }, take: 1 },
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

  if (!lesson || lesson.type !== "DOCUMENT") {
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "DOCUMENT_ACCESS_DENIED",
        target: lessonId,
        metadata: requestTraceMetadata(request, { reason: "NOT_FOUND" }),
      },
    });
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  if (session.role === "student") {
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
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "DOCUMENT_ACCESS_DENIED",
          target: lessonId,
          metadata: requestTraceMetadata(request, { reason: "LOCKED_LESSON" }),
        },
      });
      return NextResponse.json({ error: "Lecon verrouillee" }, { status: 403 });
    }
  }

  const canAccess =
    session.role === "admin" ||
    (session.role === "trainer" && lesson.module.course.trainerId === session.userId) ||
    lesson.module.course.enrollments.length > 0;
  if (!canAccess) {
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "DOCUMENT_ACCESS_DENIED",
        target: lessonId,
        metadata: requestTraceMetadata(request, { reason: "NO_ENROLLMENT" }),
      },
    });
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const asset = lesson.fileAssets[0];
  const filePath = lesson.documentPath ?? asset?.path;

  if (!filePath) {
    return NextResponse.json({ error: "Aucun document associe" }, { status: 404 });
  }

  const resolved = resolvePrivateFile(filePath);

  if (!resolved) {
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "DOCUMENT_ACCESS_DENIED",
        target: lessonId,
        metadata: requestTraceMetadata(request, { reason: "INVALID_PATH" }),
      },
    });
    return NextResponse.json({ error: "Chemin document non autorise" }, { status: 403 });
  }

  let fileStat;
  try {
    fileStat = await stat(/*turbopackIgnore: true*/ resolved);
  } catch {
    return NextResponse.json({ error: "Fichier document introuvable" }, { status: 404 });
  }

  const stream = createReadStream(/*turbopackIgnore: true*/ resolved);
  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "DOCUMENT_ACCESSED",
      target: lessonId,
      metadata: requestTraceMetadata(request, {
        bytes: fileStat.size,
        disposition: documentDisposition(filePath, lessonId).startsWith("inline") ? "inline" : "attachment",
      }),
    },
  });

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      ...protectedDocumentHeaders(filePath, lessonId),
      "Content-Length": String(fileStat.size),
    },
  });
}
