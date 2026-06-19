"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/auth";
import { addActivity } from "@/lib/data-store";
import { isSameOriginRequest } from "@/lib/security";

export async function logoutAction() {
  const requestHeaders = await headers();

  if (!isSameOriginRequest(requestHeaders)) {
    redirect("/admin");
  }

  await clearAdminSession();
  await addActivity("logout", "auth");
  redirect("/admin/login");
}
