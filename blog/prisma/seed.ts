import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { writeData } from "../lib/data-store";
import { buildStarterContent } from "./starter-content";


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

const roleDefinitions = {
  ADMIN: { label: "Administrateur", permissions: permissions.map(([key]) => key) },
  EDITOR: { label: "Éditeur", permissions: ["manage_posts", "manage_categories", "manage_tags", "manage_pages", "manage_media", "manage_testimonials", "manage_services", "manage_links"] },
  CONTENT_MANAGER: { label: "Responsable de contenu", permissions: ["manage_posts", "manage_categories", "manage_tags", "manage_pages", "manage_testimonials", "manage_services"] },
  MEDIA_MANAGER: { label: "Responsable médias", permissions: ["manage_media", "manage_links"] },
  AUTHOR: { label: "Auteur", permissions: ["manage_posts"] }
} as const;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || (!process.env.ADMIN_PASSWORD_HASH && !password)) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH (recommended) or ADMIN_PASSWORD before running the seed.");
  }

  const passwordForHash = password ?? "";
  const passwordHash =
    process.env.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash(passwordForHash, 12));

  const permissionIds = new Map<string, string>();
  for (const [key, label] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: { label },
      create: { key, label }
    });

    permissionIds.set(key, permission.id);
  }

  const roles = new Map<string, string>();
  for (const [name, definition] of Object.entries(roleDefinitions)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { label: definition.label },
      create: { name, label: definition.label }
    });
    roles.set(name, role.id);

    for (const permissionKey of definition.permissions) {
      const permissionId = permissionIds.get(permissionKey);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId }
      });
    }
  }

  const adminRoleId = roles.get("ADMIN");
  if (!adminRoleId) throw new Error("The ADMIN role could not be created.");

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Administrateur",
      passwordHash,
      status: "ACTIVE",
      roleId: adminRoleId
    },
    create: {
      name: "Administrateur",
      email,
      passwordHash,
      status: "ACTIVE",
      roleId: adminRoleId
    }
  });

  await writeData(buildStarterContent({ email, passwordHash }), { preserveInteractionData: true });
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
