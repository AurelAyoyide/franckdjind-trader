"use server";

import { Readable } from "node:stream";
import { AccountStatus, EnrollmentStatus, UserRole } from "@prisma/client";
import ExcelJS from "exceljs";
import { getAuthorizedSession } from "@/lib/authorization";
import { createSecureToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ImportLearnersState = {
  ok: boolean;
  message: string;
};

type ImportRow = {
  Email?: string;
  Prenom?: string;
  Nom?: string;
  WhatsApp?: string;
  Formation?: string;
};

const importHeaderMap: Record<string, keyof ImportRow> = {
  email: "Email",
  prenom: "Prenom",
  prénom: "Prenom",
  nom: "Nom",
  whatsapp: "WhatsApp",
  telephone: "WhatsApp",
  téléphone: "WhatsApp",
  formation: "Formation",
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

async function parseImportRows(file: File, extension: string) {
  const workbook = new ExcelJS.Workbook();
  const buffer = Buffer.from(await file.arrayBuffer()) as Buffer<ArrayBuffer>;
  const worksheet =
    extension === ".csv"
      ? await workbook.csv.read(Readable.from(buffer))
      : (await workbook.xlsx.read(Readable.from([buffer]))).worksheets[0];

  if (!worksheet) {
    return [];
  }

  const columns = new Map<number, keyof ImportRow>();
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    const key = importHeaderMap[normalizeHeader(cell.text)];
    if (key) {
      columns.set(columnNumber, key);
    }
  });

  const rows: ImportRow[] = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const parsedRow: ImportRow = {};
    columns.forEach((key, columnNumber) => {
      const value = row.getCell(columnNumber).text.trim();
      if (value) {
        parsedRow[key] = value;
      }
    });

    if (Object.keys(parsedRow).length > 0) {
      rows.push(parsedRow);
    }
  });

  return rows;
}

export async function importLearnersAction(
  _state: ImportLearnersState,
  formData: FormData,
): Promise<ImportLearnersState> {
  const session = await getAuthorizedSession(["trainer", "admin"]);
  if (!session) {
    return { ok: false, message: "Connexion formateur requise." };
  }

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    return { ok: false, message: "Action reservee au formateur principal." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choisis un fichier Excel." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, message: "Fichier trop volumineux. Limite : 5 Mo." };
  }

  const allowedExtensions = [".xlsx", ".csv"];
  const lowerFileName = file.name.toLowerCase();
  const extension = allowedExtensions.find((candidate) => lowerFileName.endsWith(candidate));
  const allowedMimeTypes = new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
  ]);

  if (!extension || (file.type && !allowedMimeTypes.has(file.type))) {
    return { ok: false, message: "Format invalide. Utilise un fichier .xlsx ou .csv." };
  }

  const rows = await parseImportRows(file, extension);

  if (!rows.length) {
    return { ok: false, message: "Le fichier ne contient aucune ligne." };
  }

  let imported = 0;
  let assigned = 0;
  let skipped = 0;
  const passwordHash = await hashPassword(createSecureToken(12));

  for (const row of rows) {
    const email = String(row.Email ?? "").trim().toLowerCase();
    const firstName = String(row.Prenom ?? "").trim();
    const lastName = String(row.Nom ?? "").trim();
    const phone = String(row.WhatsApp ?? "").trim();

    if (!email || !firstName || !lastName || !phone) {
      skipped += 1;
      continue;
    }

    const existingLearner = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, status: true },
    });

    if (
      existingLearner &&
      (existingLearner.role !== UserRole.STUDENT ||
        existingLearner.status === AccountStatus.SUSPENDED ||
        existingLearner.status === AccountStatus.DELETED)
    ) {
      skipped += 1;
      continue;
    }

    const learner = existingLearner
      ? await prisma.user.update({
          where: { id: existingLearner.id },
          data: { firstName, lastName, phone },
        })
      : await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            phone,
            passwordHash,
            role: UserRole.STUDENT,
            status: AccountStatus.EMAIL_PENDING,
          },
        });
    imported += 1;

    const courseLabel = String(row.Formation ?? "").trim();
    if (courseLabel) {
      const course = await prisma.course.findFirst({
        where: {
          ...(session.role !== "admin" ? { trainerId: session.userId } : {}),
          OR: [
            { title: { equals: courseLabel, mode: "insensitive" } },
            { slug: { equals: courseLabel, mode: "insensitive" } },
          ],
        },
      });

      if (course) {
        await prisma.enrollment.upsert({
          where: {
            learnerId_courseId: {
              learnerId: learner.id,
              courseId: course.id,
            },
          },
          update: {
            status: EnrollmentStatus.ACTIVE,
            startsAt: new Date(),
            endsAt: null,
          },
          create: {
            learnerId: learner.id,
            courseId: course.id,
            status: EnrollmentStatus.ACTIVE,
          },
        });
        assigned += 1;
      }
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "LEARNERS_IMPORTED",
      target: file.name,
      metadata: { imported, assigned, skipped },
    },
  });

  return {
    ok: true,
    message: `${imported} apprenant(s) importe(s), ${assigned} inscription(s) creee(s), ${skipped} ligne(s) ignoree(s).`,
  };
}
