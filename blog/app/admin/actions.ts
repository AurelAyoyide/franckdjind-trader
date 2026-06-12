"use server";

import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/auth";
import { addActivity } from "@/lib/data-store";

export async function logoutAction() {
  await clearAdminSession();
  await addActivity("logout", "auth");
  redirect("/admin/login");
}
