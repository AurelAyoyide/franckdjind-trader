import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse, type NextRequest } from "next/server";
import { getRequestAuthorizedSession } from "@/lib/authorization";
import { mimeTypeForCommunityMedia, resolveCommunityMediaFile } from "@/lib/community-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseRange(rangeHeader: string | null, fileSize: number) {
  if (!rangeHeader?.startsWith("bytes=")) {
    return null;
  }

  const [rawStart, rawEnd] = rangeHeader.replace("bytes=", "").split("-");
  const start = Number.parseInt(rawStart, 10);
  const end = rawEnd ? Number.parseInt(rawEnd, 10) : fileSize - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || end >= fileSize) {
    return null;
  }

  return { start, end };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileName: string }> },
) {
  const session = await getRequestAuthorizedSession(request, ["student", "trainer", "admin"]);

  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const { fileName } = await context.params;
  const resolved = resolveCommunityMediaFile(fileName);

  if (!resolved) {
    return NextResponse.json({ error: "Media introuvable." }, { status: 404 });
  }

  let fileStat;

  try {
    fileStat = await stat(/*turbopackIgnore: true*/ resolved);
  } catch {
    return NextResponse.json({ error: "Media introuvable." }, { status: 404 });
  }

  const mimeType = mimeTypeForCommunityMedia(fileName);
  const range = parseRange(request.headers.get("range"), fileStat.size);
  const headers = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=86400",
    "Content-Disposition": `inline; filename="${path.basename(fileName)}"`,
    "Content-Type": mimeType,
    "X-Content-Type-Options": "nosniff",
  };

  if (range) {
    const stream = createReadStream(/*turbopackIgnore: true*/ resolved, { start: range.start, end: range.end });

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        ...headers,
        "Content-Length": String(range.end - range.start + 1),
        "Content-Range": `bytes ${range.start}-${range.end}/${fileStat.size}`,
      },
    });
  }

  const stream = createReadStream(/*turbopackIgnore: true*/ resolved);

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      ...headers,
      "Content-Length": String(fileStat.size),
    },
  });
}
