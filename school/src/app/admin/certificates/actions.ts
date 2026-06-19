"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function revokeCertificateAction(formData: FormData) {
  const session = await getAuthorizedSession(["admin"]);
  if (!session) {
    return;
  }

  const certificateId = String(formData.get("certificateId") ?? "");
  if (!certificateId) {
    return;
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: { id: true, code: true, learnerId: true, revokedAt: true },
  });

  if (!certificate || certificate.revokedAt) {
    return;
  }

  await prisma.certificate.update({
    where: { id: certificate.id },
    data: { revokedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "CERTIFICATE_REVOKED",
      target: certificate.code,
      metadata: { learnerId: certificate.learnerId },
    },
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/student/certificates");
  revalidatePath(`/certificates/verify/${certificate.code}`);
  redirect("/admin/certificates?notice=revoked");
}
