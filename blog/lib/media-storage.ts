import { promises as fs } from "node:fs";
import path from "node:path";

const allowedImageTypes = new Map<string, string[]>([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/webp", [".webp"]],
  ["image/avif", [".avif"]]
]);

export const maxImageUploadBytes = 5 * 1024 * 1024;

export type SavedImage = {
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
};

export function getPublicUploadRoot() {
  const configuredUploadDir = process.env.BLOG_UPLOAD_DIR;

  return configuredUploadDir && path.isAbsolute(configuredUploadDir)
    ? path.resolve(configuredUploadDir)
    : path.resolve(process.cwd(), configuredUploadDir ?? path.join("public", "uploads"));
}

function slugifyFileName(value: string) {
  const detectedExtension = path.extname(value).toLowerCase();
  const extension = detectedExtension === ".jpeg" ? ".jpg" : detectedExtension;
  const base = path
    .basename(value, detectedExtension)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  return `${base || "media"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
}

export function detectImageMime(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }

  if (bytes.length >= 12 && bytes.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = bytes.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") {
      return "image/avif";
    }
  }

  return undefined;
}

export function contentTypeForUploadedImage(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".avif") return "image/avif";

  return "application/octet-stream";
}

export function resolveUploadedImagePath(segments: string[]) {
  if (!segments.length || segments.some((segment) => !segment || segment.includes("\0"))) {
    return null;
  }

  const uploadRoot = getPublicUploadRoot();
  const resolved = path.resolve(uploadRoot, ...segments);

  if (resolved === uploadRoot || !resolved.startsWith(`${uploadRoot}${path.sep}`)) {
    return null;
  }

  return resolved;
}

export async function saveUploadedImage(file: File): Promise<
  | {
      ok: true;
      image: SavedImage;
    }
  | {
      ok: false;
      message: string;
    }
> {
  if (!file.size) {
    return { ok: false, message: "Choisis une image avant d'enregistrer." };
  }

  if (file.size > maxImageUploadBytes) {
    return { ok: false, message: "Image trop lourde. Limite: 5 Mo." };
  }

  const extension = path.extname(file.name).toLowerCase();
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = detectImageMime(bytes);
  const allowedExtensions = mimeType ? allowedImageTypes.get(mimeType) : undefined;

  if (!mimeType || !allowedExtensions?.includes(extension)) {
    return { ok: false, message: "Format image non autorise. Utilise JPG, PNG, WebP ou AVIF." };
  }

  const uploadsDir = getPublicUploadRoot();
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = slugifyFileName(file.name);
  const destination = path.resolve(uploadsDir, fileName);

  if (destination === uploadsDir || !destination.startsWith(`${uploadsDir}${path.sep}`)) {
    return { ok: false, message: "Chemin de fichier non autorise." };
  }

  await fs.writeFile(destination, bytes);

  return {
    ok: true,
    image: {
      fileName,
      mimeType,
      size: file.size,
      url: `/uploads/${fileName}`
    }
  };
}
