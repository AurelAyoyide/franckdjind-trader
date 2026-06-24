function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function isSecureCookieRequired() {
  const configuredUrl = process.env.APP_URL;

  if (!configuredUrl) {
    return process.env.NODE_ENV === "production";
  }

  try {
    return new URL(configuredUrl).protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export function isLocalAppUrl(value: string) {
  try {
    return isLocalHost(new URL(value).hostname);
  } catch {
    return false;
  }
}
