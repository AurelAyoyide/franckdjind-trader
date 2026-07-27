import { execFile as execFileCallback } from "node:child_process";
import { rename, unlink } from "node:fs/promises";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

export async function normalizeVideoColorMetadata(filePath: string, extension: string) {
  if (extension !== ".mp4" && extension !== ".mov") {
    return;
  }

  const { stdout } = await execFile(
    process.env.FFPROBE_PATH ?? "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { timeout: 30_000 },
  );
  const codec = stdout.trim();
  const metadataFilter = codec === "h264"
    ? "h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1"
    : codec === "hevc"
      ? "hevc_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1"
      : null;

  if (!metadataFilter) {
    return;
  }

  const normalizedPath = `${filePath}.normalized${extension}`;

  try {
    await execFile(
      process.env.FFMPEG_PATH ?? "ffmpeg",
      [
        "-v", "error",
        "-y",
        "-i", filePath,
        "-map", "0",
        "-c", "copy",
        "-bsf:v", metadataFilter,
        "-movflags", "+faststart",
        normalizedPath,
      ],
      { timeout: 120_000 },
    );

    await unlink(filePath);
    await rename(normalizedPath, filePath);
  } catch (error) {
    await unlink(normalizedPath).catch(() => undefined);
    throw error;
  }
}
