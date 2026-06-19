import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { randomUUID } from "node:crypto";
import { EnrollmentStatus } from "@prisma/client";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export type CertificatePdfInput = {
  code: string;
  learner: string;
  course: string;
  issuedAt: string;
};

export async function generateCertificatePdf(certificate: CertificatePdfInput) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 28,
    y: 28,
    width: 786,
    height: 539,
    borderColor: rgb(0.09, 0.79, 0.52),
    borderWidth: 3,
  });

  page.drawText("SCHOOL", {
    x: 70,
    y: 500,
    size: 18,
    font: titleFont,
    color: rgb(0.09, 0.79, 0.52),
  });

  page.drawText("Certificat de fin de formation", {
    x: 70,
    y: 410,
    size: 34,
    font: titleFont,
    color: rgb(0.06, 0.08, 0.07),
  });

  page.drawText("Ce certificat atteste que", {
    x: 70,
    y: 350,
    size: 15,
    font: bodyFont,
    color: rgb(0.31, 0.38, 0.35),
  });

  page.drawText(certificate.learner, {
    x: 70,
    y: 308,
    size: 30,
    font: titleFont,
    color: rgb(0.06, 0.08, 0.07),
  });

  page.drawText(`a termine la formation "${certificate.course}".`, {
    x: 70,
    y: 264,
    size: 16,
    font: bodyFont,
    color: rgb(0.31, 0.38, 0.35),
  });

  page.drawText(`Code public : ${certificate.code}`, {
    x: 70,
    y: 176,
    size: 13,
    font: titleFont,
    color: rgb(0.09, 0.54, 0.64),
  });

  page.drawText(`Date : ${certificate.issuedAt}`, {
    x: 70,
    y: 148,
    size: 13,
    font: bodyFont,
    color: rgb(0.31, 0.38, 0.35),
  });

  page.drawText("Verification publique disponible avec le code du certificat.", {
    x: 70,
    y: 74,
    size: 11,
    font: bodyFont,
    color: rgb(0.45, 0.5, 0.47),
  });

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
      subject: "Certificat School disponible",
      html: `<p>Bonjour ${escapeHtml(learner.firstName)},</p><p>Ton certificat ${escapeHtml(certificate.code)} pour ${escapeHtml(course.title)} est disponible dans ton espace.</p>`,
    });
  }

  return certificate;
}
