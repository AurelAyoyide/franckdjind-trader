import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE = "school_session";

export type AppRole = "student" | "trainer" | "admin";

export type AppSession = {
  role: AppRole;
  name: string;
  userId?: string;
  email?: string;
  issuedAt?: number;
};

export const roleHome: Record<AppRole, string> = {
  student: "/student/dashboard",
  trainer: "/trainer/dashboard",
  admin: "/admin/dashboard",
};

export const roleLabels: Record<AppRole, string> = {
  student: "Apprenant",
  trainer: "Formateur",
  admin: "Admin",
};

const fallbackSecret = "school-local-development-secret-change-before-production";

function getSigningKey() {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET doit etre defini en production.");
  }

  return new TextEncoder().encode(process.env.SESSION_SECRET ?? fallbackSecret);
}

export function isAppRole(value: unknown): value is AppRole {
  return value === "student" || value === "trainer" || value === "admin";
}

export function prismaRoleToAppRole(role: UserRole): AppRole {
  if (role === "STUDENT") {
    return "student";
  }

  if (role === "SUPER_ADMIN") {
    return "admin";
  }

  return "trainer";
}

export async function encryptSession(payload: AppSession, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSigningKey());
}

export async function decryptSession(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      algorithms: ["HS256"],
    });

    if (!isAppRole(payload.role)) {
      return null;
    }

    const session: AppSession = {
      role: payload.role,
      name: typeof payload.name === "string" ? payload.name : roleLabels[payload.role],
      userId: typeof payload.userId === "string" ? payload.userId : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      issuedAt: typeof payload.iat === "number" ? payload.iat : undefined,
    };

    return session;
  } catch {
    return null;
  }
}
