import {
  AccountStatus,
  CommunityPostStatus,
  CourseStatus,
  CourseType,
  LessonType,
  LiveStatus,
  PrismaClient,
  QuizQuestionType,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Mot de passe sécurisé pour le compte Administrateur
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Création du compte administrateur unique (Pas de fausses données)
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      firstName: "Super",
      lastName: "Admin",
      phone: "+22900000000",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  // Paramètres par défaut essentiels du système
  await prisma.setting.upsert({
    where: { key: "certificatePrefix" },
    update: { value: "SCH" },
    create: { key: "certificatePrefix", value: "SCH" },
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
