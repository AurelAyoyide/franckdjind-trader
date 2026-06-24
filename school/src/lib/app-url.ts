import { isLocalAppUrl } from "@/lib/cookie-security";

export function getAppUrl() {
  const configuredUrl = process.env.APP_URL ?? "http://localhost:3000";
  const url = new URL(configuredUrl);

  if (process.env.NODE_ENV === "production" && url.protocol !== "https:" && !isLocalAppUrl(configuredUrl)) {
    throw new Error("APP_URL doit utiliser HTTPS en production.");
  }

  return url.origin;
}
