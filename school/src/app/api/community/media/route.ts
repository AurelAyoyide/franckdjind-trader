import { NextResponse, type NextRequest } from "next/server";
import { getRequestAuthorizedSession } from "@/lib/authorization";
import { isCommunityMediaKind, saveCommunityMediaFile } from "@/lib/community-media";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getRequestAuthorizedSession(request, ["trainer", "admin"]);

  if (!session) {
    return NextResponse.json({ error: "Authentification formateur requise." }, { status: 401 });
  }

  const formData = await request.formData();
  const kind = formData.get("kind");
  const file = formData.get("file");

  if (!isCommunityMediaKind(kind)) {
    return NextResponse.json({ error: "Type de media invalide." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }

  const saved = await saveCommunityMediaFile(file, kind);

  if (!saved.ok) {
    return NextResponse.json({ error: saved.message }, { status: 400 });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "COMMUNITY_MEDIA_UPLOADED",
      target: saved.fileName,
      metadata: { kind, mimeType: saved.mimeType, size: saved.size },
    },
  });

  return NextResponse.json({
    fileName: saved.fileName,
    kind,
    mimeType: saved.mimeType,
    size: saved.size,
    url: saved.url,
  });
}
