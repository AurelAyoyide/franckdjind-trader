"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSession, validateAdminCredentials } from "@/lib/auth";
import { createId, readData, writeData } from "@/lib/data-store";
import { getClientIp, hashValue, isSafeInternalPath, isSameOriginRequest } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional()
});

export async function loginAction(formData: FormData) {
  const requestHeaders = await headers();

  if (!isSameOriginRequest(requestHeaders)) {
    redirect("/admin/login?error=invalid");
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined
  });

  if (!parsed.success) {
    redirect("/admin/login?error=invalid");
  }

  const data = await readData();
  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const ipHash = hashValue(getClientIp(requestHeaders));
  const attemptKey = hashValue(`${ipHash}:${normalizedEmail}`);
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const recentFailures = data.activityLogs.filter(
    (log) =>
      log.action === "login_failed" &&
      log.entity === "auth" &&
      log.entityId === attemptKey &&
      new Date(log.createdAt).getTime() >= fifteenMinutesAgo
  );

  if (recentFailures.length >= 5) {
    redirect("/admin/login?error=limited");
  }

  const session = await validateAdminCredentials(parsed.data.email, parsed.data.password);

  if (!session) {
    data.activityLogs.unshift({
      id: createId("log"),
      action: "login_failed",
      entity: "auth",
      entityId: attemptKey,
      createdAt: new Date().toISOString()
    });
    data.activityLogs = data.activityLogs.slice(0, 200);
    await writeData(data);
    redirect("/admin/login?error=credentials");
  }

  await createAdminSession(session);
  data.activityLogs.unshift({
    id: createId("log"),
    action: "login_success",
    entity: "auth",
    entityId: session.email,
    createdAt: new Date().toISOString()
  });
  data.activityLogs = data.activityLogs.slice(0, 200);
  await writeData(data);

  const next = parsed.data.next;
  redirect(next && isSafeInternalPath(next) ? next : "/admin");
}
