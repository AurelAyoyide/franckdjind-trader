import { createHash } from "node:crypto";

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getClientIp(requestHeaders: { get(name: string): string | null }) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "local";
  }

  return requestHeaders.get("x-real-ip") ?? "local";
}

export function isSameOriginRequest(requestHeaders: { get(name: string): string | null }) {
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!origin || !host) {
    return process.env.NODE_ENV !== "production";
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isSafeInternalPath(value: string) {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("://") &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

export function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafeActionUrl(value: string) {
  return isSafeInternalPath(value) || isSafeHttpUrl(value);
}

export function isSafeMediaUrl(value: string) {
  if (isSafeInternalPath(value)) {
    return true;
  }

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function normalizeHexColor(value: unknown, fallback = "#17c985") {
  const color = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

export function escapeJsonForHtml(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
