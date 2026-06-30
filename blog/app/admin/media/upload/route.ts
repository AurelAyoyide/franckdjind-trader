import { MediaType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/media-storage";
import { canManageResource } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { hashValue, isSameOriginRequest } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();

  if (!session || (!canManageResource(session, "media", "save") && !canManageResource(session, "posts", "save"))) {
    return NextResponse.json({ error: "Session admin requise." }, { status: 401 });
  }

  if (!isSameOriginRequest(request.headers)) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const uploadKey = hashValue(session.email);
  const uploadsThisHour = await prisma.activityLog.count({
    where: {
      action: "media_uploaded",
      entityId: uploadKey,
      createdAt: { gte: oneHourAgo }
    }
  });

  if (uploadsThisHour >= 20) {
    return NextResponse.json({ error: "Limite de 20 imports d'images par heure atteinte." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier image manquant." }, { status: 400 });
  }

  const saved = await saveUploadedImage(file);

  if (!saved.ok) {
    return NextResponse.json({ error: saved.message }, { status: 400 });
  }

  const title = String(formData.get("title") ?? "").trim() || file.name.replace(/\.[^.]+$/, "");

  await prisma.$transaction([
    prisma.media.create({
      data: {
        title,
        alt: title,
        mimeType: saved.image.mimeType,
        size: saved.image.size,
        type: MediaType.IMAGE,
        url: saved.image.url
      }
    }),
    prisma.activityLog.create({
      data: {
        action: "media_uploaded",
        entity: "media",
        entityId: uploadKey,
        metadata: {
          mimeType: saved.image.mimeType,
          size: saved.image.size,
          source: "rich-editor"
        }
      }
    })
  ]);

  revalidatePath("/admin/media");

  return NextResponse.json({
    title,
    ...saved.image
  });
}
