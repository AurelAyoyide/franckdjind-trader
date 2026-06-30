import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { LessonType, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedSession } from "@/lib/authorization";
import { getNumberSetting } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

const genericUploadMimeTypes = new Set(["", "application/octet-stream", "binary/octet-stream"]);

function getPrivateUploadRoot() {
  const configuredUploadDir = process.env.PRIVATE_UPLOAD_DIR;

  return configuredUploadDir && path.isAbsolute(configuredUploadDir)
    ? path.resolve(configuredUploadDir)
    : path.join(/*turbopackIgnore: true*/ process.cwd(), configuredUploadDir ?? "private_uploads");
}

function parseLessonType(value: FormDataEntryValue | null) {
  return value === LessonType.VIDEO || value === LessonType.DOCUMENT ? value : null;
}

function getSafeExtension(fileName: string, type: LessonType) {
  const extension = path.extname(fileName).toLowerCase();
  const allowedExtensions = type === LessonType.VIDEO ? lessonFileTypes.VIDEO.extensions : lessonFileTypes.DOCUMENT.extensions;

  return allowedExtensions.has(extension) ? extension : null;
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

function safeUploadPath(fileName: string) {
  const root = getPrivateUploadRoot();
  const destination = path.resolve(root, fileName);

  if (destination === root || !destination.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return { destination, root };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthorizedSession(["trainer", "admin"]);
    if (!session || (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER)) {
      return NextResponse.json({ error: "Authentification formateur requise." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const lessonType = parseLessonType(formData.get("type"));

    if (!lessonType) {
      return NextResponse.json({ error: "Type de leçon invalide." }, { status: 400 });
    }

    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "Aucun fichier envoyé." }, { status: 400 });
    }

    const maxMegabytes = await getNumberSetting("maxPrivateUploadMb");
    const maxBytes = maxMegabytes * 1024 * 1024;

    if (file.size > maxBytes) {
      return NextResponse.json({ error: `Fichier trop lourd. Limite: ${maxMegabytes} Mo.` }, { status: 413 });
    }

    const extension = getSafeExtension(file.name, lessonType);
    if (!extension || !isAllowedMimeType(file.type, lessonType)) {
      return NextResponse.json({ error: "Type de fichier non autorisé pour cette leçon." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasFileSignature(bytes, extension)) {
      return NextResponse.json({ error: "Le contenu du fichier ne correspond pas au format annoncé." }, { status: 400 });
    }

    const fileName = `${lessonType.toLowerCase()}-${randomUUID()}${extension}`;
    const safePath = safeUploadPath(fileName);

    if (!safePath) {
      return NextResponse.json({ error: "Chemin de fichier non autorisé." }, { status: 400 });
    }

    await fs.mkdir(/*turbopackIgnore: true*/ safePath.root, { recursive: true });
    await fs.writeFile(/*turbopackIgnore: true*/ safePath.destination, bytes);

    return NextResponse.json({
      fileName,
      mimeType: mimeTypeForExtension(extension),
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Échec de l'upload serveur." }, { status: 500 });
  }
}
