import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissions = [
  ["manage_posts", "Gerer les articles"],
  ["manage_categories", "Gerer les categories"],
  ["manage_tags", "Gerer les tags"],
  ["manage_pages", "Gerer les pages"],
  ["manage_media", "Gerer les medias"],
  ["manage_testimonials", "Gerer les temoignages"],
  ["manage_services", "Gerer les services"],
  ["manage_links", "Gerer les liens"],
  ["manage_contact_messages", "Gerer les messages contact"],
  ["manage_redirects", "Gerer les redirections"],
  ["manage_settings", "Gerer les parametres"],
  ["manage_users", "Gerer les utilisateurs"]
] as const;

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin12345!";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash(password, 12));

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { label: "Administrateur" },
    create: { name: "ADMIN", label: "Administrateur" }
  });

  for (const [key, label] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: { label },
      create: { key, label }
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    });
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Administrateur",
      passwordHash,
      status: "ACTIVE",
      roleId: adminRole.id
    },
    create: {
      name: "Administrateur",
      email,
      passwordHash,
      status: "ACTIVE",
      roleId: adminRole.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
