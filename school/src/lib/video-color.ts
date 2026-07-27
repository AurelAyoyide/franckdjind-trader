import { execFile as execFileCallback } from "node:child_process";
import { access, rename, unlink, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const TRANSCODE_VERSION = "apple-bt709-v1";

export async function normalizeVideoColorMetadata(filePath: string, extension: string) {
  if (extension !== ".mp4" && extension !== ".mov") {
    return;
  }

  const markerPath = `${filePath}.${TRANSCODE_VERSION}`;
  try {
    await access(markerPath);
    return;
  } catch {
    // La vidéo n'a pas encore été convertie avec ce profil.
  }

  const normalizedPath = `${filePath}.normalized${extension}`;

  try {
    await execFile(
      process.env.FFMPEG_PATH ?? "ffmpeg",
      [
        "-v", "error",
        "-y",
        "-i", filePath,
        "-map", "0:v:0",
        "-map", "0:a?",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-profile:v", "high",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv",
        "-colorspace", "bt709",
        "-color_trc", "bt709",
        "-color_primaries", "bt709",
        "-tag:v", "avc1",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart+write_colr",
        normalizedPath,
      ],
      { timeout: 30 * 60_000 },
    );

    await unlink(filePath);
    await rename(normalizedPath, filePath);
    await writeFile(markerPath, `${TRANSCODE_VERSION}\n`, "utf8");
  } catch (error) {
    await unlink(normalizedPath).catch(() => undefined);
    throw error;
  }
}
