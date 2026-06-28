import ExcelJS from "exceljs";
import { formatDate } from "@/lib/utils";

export type LearnerExportRow = {
  name: string;
  email: string;
  progress: number;
  status: string;
  lastSeen: Date;
};

export type ProgressExportRow = LearnerExportRow & {
  course?: string;
};

function addRowsToWorksheet(
  worksheet: ExcelJS.Worksheet,
  rows: Record<string, string | number>[],
) {
  worksheet.columns = Object.keys(rows[0] ?? {}).map((key) => ({
    header: key,
    key,
    width: Math.max(14, key.length + 4),
  }));

  worksheet.addRows(rows);
  worksheet.getRow(1).font = { bold: true };
}

export async function createLearnersWorkbook(learners: LearnerExportRow[]) {
  const rows = learners.map((learner) => ({
    Nom: learner.name,
    Email: learner.email,
    Progression: `${learner.progress}%`,
    Statut: learner.status,
    "Dernière activité": formatDate(learner.lastSeen),
  }));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "School";
  addRowsToWorksheet(workbook.addWorksheet("Apprenants"), rows);

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function createProgressWorkbook(learners: ProgressExportRow[]) {
  const rows = learners.map((learner) => ({
    Apprenant: learner.name,
    Email: learner.email,
    Formation: learner.course ?? "Toutes formations",
    Progression: learner.progress,
    "À relancer": learner.status === "A relancer" ? "Oui" : "Non",
  }));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "School";
  addRowsToWorksheet(workbook.addWorksheet("Progressions"), rows);

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export function bufferToArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}
