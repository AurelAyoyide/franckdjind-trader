"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthorizedSession } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function markNotificationReadAction(formData: FormData) {
  const session = await getAuthorizedSession(["student"]);
  if (!session) {
    return;
  }

  const notificationId = String(formData.get("notificationId") ?? "");
  if (!notificationId) {
    return;
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: session.userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath("/student/notifications");
  revalidatePath("/student/dashboard");
  redirect("/student/notifications?notice=read");
}

export async function markAllNotificationsReadAction() {
  const session = await getAuthorizedSession(["student"]);
  if (!session) {
    return;
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath("/student/notifications");
  revalidatePath("/student/dashboard");
  redirect("/student/notifications?notice=all-read");
}
