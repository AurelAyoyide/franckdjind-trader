import { createHash } from "node:crypto";

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function isSafeInternalPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("://");
}
