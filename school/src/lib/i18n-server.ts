import { headers } from "next/headers";
import type { Locale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  return headerStore.get("x-school-locale") === "en" ? "en" : "fr";
}

export async function getRequestPathname() {
  const headerStore = await headers();
  return headerStore.get("x-school-pathname") || "/";
}

export async function getRequestSearch() {
  const headerStore = await headers();
  return headerStore.get("x-school-search") || "";
}
