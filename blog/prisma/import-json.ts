import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { writeData, type BlogData } from "../lib/data-store";

async function main() {
  const source = process.argv[2] ?? path.join(process.cwd(), "data", "content.json");
  const replace = process.argv.includes("--replace");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to import the legacy content.");
  }

  const existingRows = await prisma.$transaction([
    prisma.user.count(),
    prisma.post.count(),
    prisma.category.count(),
    prisma.page.count(),
    prisma.contactMessage.count(),
    prisma.subscriber.count()
  ]);

  if (!replace && existingRows.some(Boolean)) {
    throw new Error("The database is not empty. Re-run with --replace only after taking a backup.");
  }

  const data = JSON.parse(await readFile(source, "utf8")) as BlogData;
  await writeData(data);
  console.info(`Legacy data imported from ${source}.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
