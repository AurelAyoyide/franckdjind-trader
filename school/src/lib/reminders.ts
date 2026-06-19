import { AccountStatus, UserRole } from "@prisma/client";
import { getLearnerRows } from "@/lib/platform-data";
import { prisma } from "@/lib/prisma";
import { getNumberSetting } from "@/lib/settings";

export type ReminderCandidate = {
  learnerId: string;
  learner: string;
  email: string;
  reason: string;
  channel: "EMAIL" | "INTERNAL";
  priority: "LOW" | "MEDIUM" | "HIGH";
};

export async function evaluateReminderCandidates(): Promise<ReminderCandidate[]> {
  const cooldownDays = await getNumberSetting("reminderCooldownDays");
  const inactiveCutoff = new Date(Date.now() - cooldownDays * 24 * 60 * 60 * 1000);

  const [pendingEmail, verifiedWithoutRequest, failedQuizUsers, learnerRows] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.STUDENT, status: AccountStatus.EMAIL_PENDING },
      select: { id: true, firstName: true, lastName: true, email: true },
      take: 100,
    }),
    prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        status: AccountStatus.EMAIL_VERIFIED,
        trainingRequests: { none: {} },
      },
      select: { id: true, firstName: true, lastName: true, email: true },
      take: 100,
    }),
    prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        quizAttempts: { some: { passed: false, createdAt: { gte: inactiveCutoff } } },
      },
      select: { id: true, firstName: true, lastName: true, email: true },
      take: 100,
    }),
    getLearnerRows(),
  ]);

  const candidates: ReminderCandidate[] = [];

  for (const user of pendingEmail) {
    candidates.push({
      learnerId: user.id,
      learner: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      reason: "Email non valide",
      channel: "EMAIL",
      priority: "HIGH",
    });
  }

  for (const user of verifiedWithoutRequest) {
    candidates.push({
      learnerId: user.id,
      learner: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      reason: "Compte valide sans demande de formation",
      channel: "INTERNAL",
      priority: "MEDIUM",
    });
  }

  for (const user of failedQuizUsers) {
    candidates.push({
      learnerId: user.id,
      learner: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      reason: "Quiz echoue recemment",
      channel: "INTERNAL",
      priority: "MEDIUM",
    });
  }

  for (const learner of learnerRows) {
    if (learner.status === "A relancer") {
      candidates.push({
        learnerId: learner.id,
        learner: learner.name,
        email: learner.email,
        reason: "Progression inactive ou formation non commencee",
        channel: "EMAIL",
        priority: "HIGH",
      });
    }

    if (learner.progress >= 80 && learner.progress < 100) {
      candidates.push({
        learnerId: learner.id,
        learner: learner.name,
        email: learner.email,
        reason: "Formation presque terminee, certificat a encourager",
        channel: "INTERNAL",
        priority: "LOW",
      });
    }
  }

  return candidates.filter(
    (candidate, index, all) =>
      all.findIndex((item) => item.learnerId === candidate.learnerId && item.reason === candidate.reason) === index,
  );
}
