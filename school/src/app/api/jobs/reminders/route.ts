import { NextResponse, type NextRequest } from "next/server";
import { evaluateReminderCandidates } from "@/lib/reminders";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { getNumberSetting, getSetting } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Cron non autorise" }, { status: 401 });
  }

  if ((await getSetting("remindersEnabled")) !== "true") {
    return NextResponse.json({ ok: true, candidates: 0, sent: 0, disabled: true });
  }

  const candidates = await evaluateReminderCandidates();
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentStart = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const maxEmailsPerWeek = await getNumberSetting("reminderMaxEmailsPerWeek");
  const sentCandidates = [];

  for (const candidate of candidates) {
    const subject = `Relance School - ${candidate.reason}`;

    if (candidate.channel === "INTERNAL") {
      const recentInternal = await prisma.notification.findFirst({
        where: {
          userId: candidate.learnerId,
          title: "Relance formation",
          body: candidate.reason,
          createdAt: { gte: recentStart },
        },
        select: { id: true },
      });

      if (recentInternal) {
        continue;
      }

      await prisma.notification.create({
        data: {
          userId: candidate.learnerId,
          type: "INTERNAL",
          title: "Relance formation",
          body: candidate.reason,
        },
      });
      sentCandidates.push(candidate);
    } else {
      const [weeklyEmails, recentSame] = await Promise.all([
        prisma.emailLog.count({
          where: {
            userId: candidate.learnerId,
            createdAt: { gte: weekStart },
          },
        }),
        prisma.emailLog.findFirst({
          where: {
            userId: candidate.learnerId,
            subject,
            createdAt: { gte: recentStart },
          },
          select: { id: true },
        }),
      ]);

      if (weeklyEmails >= maxEmailsPerWeek || recentSame) {
        continue;
      }

      await deliverLoggedEmail(prisma, {
        to: candidate.email,
        userId: candidate.learnerId,
        subject,
        html: `<p>Bonjour ${escapeHtml(candidate.learner)},</p><p>${escapeHtml(candidate.reason)}</p>`,
      });
      sentCandidates.push(candidate);
    }
  }

  await prisma.auditLog.create({
    data: {
      action: "REMINDERS_EVALUATED",
      target: "cron",
      metadata: { candidates: candidates.length, sent: sentCandidates.length },
    },
  });

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    sent: sentCandidates.length,
    supportedRules: [
      "EMAIL_PENDING",
      "VERIFIED_WITHOUT_REQUEST",
      "ENROLLED_NOT_STARTED",
      "STARTED_INACTIVE",
      "FAILED_QUIZ",
      "ALMOST_FINISHED",
      "CERTIFICATE_AVAILABLE",
    ],
  });
}
