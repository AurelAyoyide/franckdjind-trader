import { prisma } from "@/lib/prisma";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export async function createUniqueCourseSlug(title: string) {
  const base = slugify(title) || "formation";
  let slug = base;
  let index = 2;

  while (await prisma.course.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}
