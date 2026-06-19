"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";

export async function updateProfileAction(formData: FormData) {
  const session = await getAuthorizedSession(["student"]);

  if (!session) {
    return;
  }

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    redirect("/student/profile?notice=invalid");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: parsed.data,
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "PROFILE_UPDATED",
      target: "self",
    },
  });

  revalidatePath("/student/profile");
  redirect("/student/profile?notice=saved");
}
