import { cookies } from "next/headers";
import {
  decryptSession,
  encryptSession,
  SESSION_COOKIE,
  type AppSession,
} from "@/lib/session-core";

export {
  isAppRole,
  prismaRoleToAppRole,
  roleHome,
  roleLabels,
  SESSION_COOKIE,
  type AppRole,
  type AppSession,
} from "@/lib/session-core";

export async function setAppSession(payload: AppSession, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const cookieStore = await cookies();
  const session = await encryptSession(payload, `${maxAgeSeconds}s`);

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearAppSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAppSession() {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
}
