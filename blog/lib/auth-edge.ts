export const sessionCookieName = "admin_session";

export type AdminSession = {
  email: string;
  role: "ADMIN" | "EDITOR" | "CONTENT_MANAGER" | "MEDIA_MANAGER" | "AUTHOR";
  name?: string;
};

type SessionPayload = AdminSession & {
  exp: number;
};

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    if (process.env.NODE_ENV === "production" && secret.length < 32) {
      throw new Error("AUTH_SECRET must be at least 32 characters in production");
    }

    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }

  return "local-dev-secret-change-before-production-32chars";
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeJson(value: unknown) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as T;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(value: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getSigningKey(),
    new TextEncoder().encode(value)
  );

  return bytesToBase64Url(new Uint8Array(signature));
}

async function verify(value: string, signature: string) {
  return crypto.subtle.verify(
    "HMAC",
    await getSigningKey(),
    base64UrlToBytes(signature),
    new TextEncoder().encode(value)
  );
}

export async function createAdminToken(session: AdminSession, maxAgeSeconds: number) {
  const payload: SessionPayload = {
    ...session,
    exp: Date.now() + maxAgeSeconds * 1000
  };
  const encodedPayload = encodeJson(payload);
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminToken(token?: string): Promise<AdminSession | null> {
  if (!token) {
    return null;
  }

  const tokenParts = token.split(".");

  if (tokenParts.length !== 2) {
    return null;
  }

  const [payloadPart, signature] = tokenParts;

  if (!payloadPart || !signature) {
    return null;
  }

  let valid = false;

  try {
    valid = await verify(payloadPart, signature);
  } catch {
    return null;
  }

  if (!valid) {
    return null;
  }

  try {
    const payload = decodeJson<SessionPayload>(payloadPart);

    if (payload.exp < Date.now()) {
      return null;
    }

    if (
      payload.role !== "ADMIN" &&
      payload.role !== "EDITOR" &&
      payload.role !== "CONTENT_MANAGER" &&
      payload.role !== "MEDIA_MANAGER" &&
      payload.role !== "AUTHOR"
    ) {
      return null;
    }

    if (typeof payload.email !== "string") {
      return null;
    }

    return {
      email: payload.email,
      role: payload.role,
      name: typeof payload.name === "string" ? payload.name : undefined
    };
  } catch {
    return null;
  }
}
