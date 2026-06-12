import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  createAdminToken,
  sessionCookieName,
  verifyAdminToken,
  type AdminSession
} from "@/lib/auth-edge";
import { readData } from "@/lib/data-store";

const sessionMaxAge = 60 * 60 * 8;

function getAdminEmail() {
  return process.env.ADMIN_EMAIL ?? "admin@example.com";
}

function getDevPassword() {
  return process.env.NODE_ENV === "production" ? undefined : "Admin12345!";
}

async function isValidPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (hash) {
    return bcrypt.compare(password, hash);
  }

  const plainPassword = process.env.ADMIN_PASSWORD ?? getDevPassword();

  if (!plainPassword) {
    return false;
  }

  return password === plainPassword;
}

export async function validateAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const data = await readData();
  const user = data.users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.status === "ACTIVE"
  );

  if (user?.passwordHash) {
    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return null;
    }

    return {
      email: normalizedEmail,
      role: user.role,
      name: user.name
    };
  }

  if (normalizedEmail !== getAdminEmail().toLowerCase()) {
    return null;
  }

  const validPassword = await isValidPassword(password);

  if (!validPassword) {
    return null;
  }

  return {
    email: normalizedEmail,
    role: "ADMIN" as const,
    name: "Administrateur"
  };
}

export async function createAdminSession(session: AdminSession) {
  const token = await createAdminToken(session, sessionMaxAge);

  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionMaxAge,
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(sessionCookieName)?.value);
}
