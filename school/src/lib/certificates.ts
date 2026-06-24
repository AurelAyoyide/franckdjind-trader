import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { randomUUID } from "node:crypto";
import { EnrollmentStatus } from "@prisma/client";
import * as QRCode from "qrcode";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export type CertificatePdfInput = {
  code: string;
  learner: string;
  course: string;
  issuedAt: string;
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

export async function generateCertificatePdf(certificate: CertificatePdfInput) {
  const pdf = await PDFDocument.create();
  const width = 842;
  const height = 595;
  const page = pdf.addPage([width, height]);

  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const primaryColor = hexToRgb("#27584f");
  const accentColor = hexToRgb("#317467");
  const textColor = hexToRgb("#152119");
  const mutedColor = hexToRgb("#606a64");

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.98, 0.99, 0.98),
  });

  page.drawRectangle({
    x: 30, y: 30, width: width - 60, height: height - 60,
    borderColor: primaryColor,
    borderWidth: 6,
  });
  page.drawRectangle({
    x: 40, y: 40, width: width - 80, height: height - 80,
    borderColor: accentColor,
    borderWidth: 2,
  });

  const drawCenteredText = (text: string, y: number, font: any, size: number, color: any) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
  };

  drawCenteredText("BONO TRADING SCHOOL", 480, titleFont, 24, primaryColor);
  drawCenteredText("CERTIFICAT DE RÉUSSITE", 420, titleFont, 44, textColor);

  drawCenteredText("Ce certificat est fièrement décerné à", 350, italicFont, 16, mutedColor);
  drawCenteredText(certificate.learner.toUpperCase(), 290, titleFont, 36, primaryColor);

  drawCenteredText("Pour avoir suivi et complété avec succès le programme :", 230, bodyFont, 14, mutedColor);
  drawCenteredText(`« ${certificate.course} »`, 180, titleFont, 24, textColor);

  const dateFormatted = new Date(certificate.issuedAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  page.drawText("Fait le :", { x: 120, y: 110, size: 12, font: bodyFont, color: mutedColor });
  page.drawText(dateFormatted, { x: 120, y: 90, size: 16, font: titleFont, color: textColor });
  page.drawLine({ start: { x: 120, y: 80 }, end: { x: 280, y: 80 }, thickness: 1, color: mutedColor });

  page.drawText("Direction Pédagogique", { x: 550, y: 110, size: 12, font: bodyFont, color: mutedColor });
  page.drawText("BONO TRADING", { x: 550, y: 90, size: 16, font: titleFont, color: primaryColor });
  page.drawLine({ start: { x: 550, y: 80 }, end: { x: 710, y: 80 }, thickness: 1, color: mutedColor });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pre-prod.regart.online";
  const verificationUrl = `${baseUrl}/certificates/verify/${certificate.code}`;

  try {
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      margin: 1,
      color: { dark: "#152119", light: "#00000000" }, // Transparent background
    });
    const qrImage = await pdf.embedPng(qrBuffer);
    const qrSize = 80;
    page.drawImage(qrImage, {
      x: (width - qrSize) / 2,
      y: 60,
      width: qrSize,
      height: qrSize,
    });
    drawCenteredText(`ID: ${certificate.code}`, 45, titleFont, 10, mutedColor);
  } catch (error) {
    drawCenteredText(`Vérification : ${verificationUrl}`, 80, bodyFont, 11, mutedColor);
    drawCenteredText(`ID: ${certificate.code}`, 60, titleFont, 11, mutedColor);
  }

  return pdf.save();
}

async function createCertificateCode() {
  const prefix = await getSetting("certificatePrefix");
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const random = randomUUID().slice(0, 8).toUpperCase();
    const code = `${prefix}-${year}-${random}`;
    const existing = await prisma.certificate.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  return `${prefix}-${year}-${Date.now()}`;
}

export async function createCertificateIfCourseCompleted(learnerId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              progress: { where: { learnerId } },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  const lessons = course.modules.flatMap((module) => module.lessons);
  const completed = lessons.filter((lesson) => lesson.progress.some((item) => item.completed));

  if (lessons.length === 0 || completed.length < lessons.length) {
    return null;
  }

  await prisma.enrollment.updateMany({
    where: { learnerId, courseId },
    data: {
      status: EnrollmentStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  const existingCertificate = await prisma.certificate.findUnique({
    where: { learnerId_courseId: { learnerId, courseId } },
  });

  if (existingCertificate) {
    return existingCertificate;
  }

  const [certificate, learner] = await Promise.all([
    prisma.certificate.create({
      data: {
        learnerId,
        courseId,
        code: await createCertificateCode(),
      },
    }),
    prisma.user.findUnique({
      where: { id: learnerId },
      select: { email: true, firstName: true },
    }),
  ]);

  await prisma.notification.create({
    data: {
      userId: learnerId,
      type: "BOTH",
      title: "Certificat disponible",
      body: `Ton certificat ${certificate.code} est disponible.`,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: learnerId,
      action: "CERTIFICATE_GENERATED",
      target: certificate.code,
      metadata: { courseId },
    },
  });

  if (learner) {
    await deliverLoggedEmail(prisma, {
      to: learner.email,
      userId: learnerId,
      subject: "Votre certificat Bono Trading est disponible",
      html: `<p>Bonjour ${escapeHtml(learner.firstName)},</p><p>Ton certificat ${escapeHtml(certificate.code)} pour ${escapeHtml(course.title)} est disponible dans ton espace.</p>`,
    });
  }

  return certificate;
}
