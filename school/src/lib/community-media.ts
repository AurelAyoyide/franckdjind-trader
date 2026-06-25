import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type CommunityMediaKind = "image" | "audio" | "video";

type CommunityMediaConfig = {
  extensions: Set<string>;
  mimeTypes: Set<string>;
  maxMegabytes: number;
};

const mediaConfigs: Record<CommunityMediaKind, CommunityMediaConfig> = {
  image: {
    extensions: new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]),
    mimeTypes: new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]),
    maxMegabytes: Number(process.env.COMMUNITY_IMAGE_MAX_MB ?? 8),
  },
  audio: {
    extensions: new Set([".mp3", ".m4a", ".ogg", ".wav", ".webm"]),
    mimeTypes: new Set(["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/webm", "audio/x-wav"]),
    maxMegabytes: Number(process.env.COMMUNITY_AUDIO_MAX_MB ?? 50),
  },
  video: {
    extensions: new Set([".mp4", ".webm", ".mov"]),
    mimeTypes: new Set(["video/mp4", "video/webm", "video/quicktime"]),
    maxMegabytes: Number(process.env.COMMUNITY_VIDEO_MAX_MB ?? 200),
  },
};

const mimeTypesByExtension: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".m4a": "audio/mp4",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

function positiveMegabytes(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

mediaConfigs.image.maxMegabytes = positiveMegabytes(process.env.COMMUNITY_IMAGE_MAX_MB, 8);
mediaConfigs.audio.maxMegabytes = positiveMegabytes(process.env.COMMUNITY_AUDIO_MAX_MB, 50);
mediaConfigs.video.maxMegabytes = positiveMegabytes(process.env.COMMUNITY_VIDEO_MAX_MB, 200);

export function getCommunityUploadRoot() {
  const configuredUploadDir = process.env.COMMUNITY_UPLOAD_DIR;

  return configuredUploadDir && path.isAbsolute(configuredUploadDir)
    ? path.resolve(configuredUploadDir)
    : path.join(/*turbopackIgnore: true*/ process.cwd(), configuredUploadDir ?? "community_uploads");
}

export function isCommunityMediaKind(value: unknown): value is CommunityMediaKind {
  return value === "image" || value === "audio" || value === "video";
}

export function mimeTypeForCommunityMedia(fileName: string) {
  if (fileName.startsWith("community-audio-") && path.extname(fileName).toLowerCase() === ".webm") {
    return "audio/webm";
  }

  return mimeTypesByExtension[path.extname(fileName).toLowerCase()] ?? "application/octet-stream";
}

export function resolveCommunityMediaFile(fileName: string) {
  const safeName = path.basename(fileName);

  if (safeName !== fileName || !/^community-(image|audio|video)-[a-f0-9-]+\.[a-z0-9]+$/i.test(safeName)) {
    return null;
  }

  const uploadRoot = getCommunityUploadRoot();
  const resolved = path.resolve(uploadRoot, safeName);

  if (resolved !== uploadRoot && !resolved.startsWith(`${uploadRoot}${path.sep}`)) {
    return null;
  }

  return resolved;
}

function hasBytes(buffer: Buffer, bytes: number[], offset = 0) {
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

function isFtypContainer(buffer: Buffer) {
  return buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp";
}

function hasCommunityMediaSignature(buffer: Buffer, extension: string) {
  if (extension === ".png") {
    return hasBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    return hasBytes(buffer, [0xff, 0xd8, 0xff]);
  }

  if (extension === ".gif") {
    const header = buffer.subarray(0, 6).toString("ascii");
    return header === "GIF87a" || header === "GIF89a";
  }

  if (extension === ".webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }

  if (extension === ".webm") {
    return hasBytes(buffer, [0x1a, 0x45, 0xdf, 0xa3]);
  }

  if (extension === ".mp3") {
    return buffer.subarray(0, 3).toString("ascii") === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
  }

  if (extension === ".ogg") {
    return buffer.subarray(0, 4).toString("ascii") === "OggS";
  }

  if (extension === ".wav") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WAVE";
  }

  if (extension === ".m4a" || extension === ".mp4" || extension === ".mov") {
    return isFtypContainer(buffer);
  }

  return false;
}

export async function saveCommunityMediaFile(file: File, kind: CommunityMediaKind) {
  const config = mediaConfigs[kind];
  const maxBytes = config.maxMegabytes * 1024 * 1024;

  if (file.size <= 0) {
    return { ok: false as const, message: "Fichier vide." };
  }

  if (file.size > maxBytes) {
    return { ok: false as const, message: `Fichier trop lourd. Limite ${config.maxMegabytes} Mo.` };
  }

  const extension = path.extname(file.name).toLowerCase();

  if (!config.extensions.has(extension) || (file.type && !config.mimeTypes.has(file.type))) {
    return { ok: false as const, message: "Type de fichier non autorise pour la communaute." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!hasCommunityMediaSignature(buffer, extension)) {
    return { ok: false as const, message: "Le contenu du fichier ne correspond pas au format annonce." };
  }

  const uploadRoot = getCommunityUploadRoot();
  await mkdir(/*turbopackIgnore: true*/ uploadRoot, { recursive: true });

  const fileName = `community-${kind}-${randomUUID()}${extension}`;
  const destination = path.resolve(uploadRoot, fileName);

  if (destination !== uploadRoot && !destination.startsWith(`${uploadRoot}${path.sep}`)) {
    return { ok: false as const, message: "Chemin de fichier non autorise." };
  }

  await writeFile(/*turbopackIgnore: true*/ destination, buffer);

  return {
    ok: true as const,
    fileName,
    mimeType: mimeTypeForCommunityMedia(fileName),
    size: file.size,
    url: `/api/community/media/${fileName}`,
  };
}
