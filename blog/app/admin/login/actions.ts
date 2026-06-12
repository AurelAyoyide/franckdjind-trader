"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSession, validateAdminCredentials } from "@/lib/auth";
import { addActivity } from "@/lib/data-store";
import { isSafeInternalPath } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional()
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined
  });

  if (!parsed.success) {
    redirect("/admin/login?error=invalid");
  }

  const session = await validateAdminCredentials(parsed.data.email, parsed.data.password);

  if (!session) {
    await addActivity("login_failed", "auth", parsed.data.email);
    redirect("/admin/login?error=credentials");
  }

  await createAdminSession(session);
  await addActivity("login_success", "auth", session.email);

  const next = parsed.data.next;
  redirect(next && isSafeInternalPath(next) ? next : "/admin");
}
