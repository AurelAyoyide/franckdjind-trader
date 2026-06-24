import { headers } from "next/headers";
import type { Locale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  return headerStore.get("x-school-locale") === "en" ? "en" : "fr";
}
