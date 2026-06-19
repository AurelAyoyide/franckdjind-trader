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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await context.params;
  const session = await getRequestAuthorizedSession(request, ["student", "trainer", "admin"]);

  if (!session) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
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
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  const canAccess = session.role === "trainer" || session.role === "admin" || lesson.module.course.enrollments.length > 0;
  if (!canAccess) {
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "DOCUMENT_ACCESS_DENIED",
        target: lessonId,
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
    },
  });

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Length": String(fileStat.size),
      "Content-Type": asset?.mimeType ?? "application/pdf",
      "Content-Disposition": `inline; filename="${lesson.id}.pdf"`,
    },
  });
}
