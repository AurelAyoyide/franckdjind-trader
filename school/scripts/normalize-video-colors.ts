import { readdir } from "node:fs/promises";
import path from "node:path";
import { normalizeVideoColorMetadata } from "../src/lib/video-color";

const configuredUploadDir = process.env.PRIVATE_UPLOAD_DIR;
const uploadRoot = configuredUploadDir && path.isAbsolute(configuredUploadDir)
  ? path.resolve(configuredUploadDir)
  : path.resolve(process.cwd(), configuredUploadDir ?? "private_uploads");

async function main() {
  const entries = await readdir(uploadRoot, { withFileTypes: true });
  const videos = entries.filter(
    (entry) => entry.isFile() && [".mp4", ".mov"].includes(path.extname(entry.name).toLowerCase()),
  );

  for (const video of videos) {
    const extension = path.extname(video.name).toLowerCase();
    await normalizeVideoColorMetadata(path.join(uploadRoot, video.name), extension);
    console.log(`Couleurs BT.709 normalisées : ${video.name}`);
  }

  console.log(`${videos.length} vidéo(s) traitée(s).`);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
