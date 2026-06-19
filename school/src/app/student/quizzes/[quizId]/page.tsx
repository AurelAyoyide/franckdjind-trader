import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { requirePageSession } from "@/lib/authorization";
import { getStudentQuiz } from "@/lib/platform-data";
import { submitQuizAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function StudentQuizPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ result?: string; score?: string }>;
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const { result, score } = await searchParams;
  const session = await requirePageSession(["student"], `/student/quizzes/${quizId}`);

  const quiz = await getStudentQuiz(session.userId, quizId);

  if (!quiz) {
    notFound();
  }

  return (
    <DashboardShell
      role="student"
      title={quiz.title}
      description="Quiz avec score minimum, tentatives et blocage possible de la progression."
    >
      <form action={submitQuizAction} className="rounded-lg border border-line bg-surface p-6">
        <input name="quizId" type="hidden" value={quiz.id} />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <StatusBadge tone="amber">Score minimum {quiz.minimumScore}%</StatusBadge>
          <span className="text-sm font-bold text-muted">{quiz.attempts} tentatives disponibles</span>
        </div>
        {result ? (
          <p
            className={`mt-5 rounded-lg border p-3 text-sm font-semibold ${
              result === "passed"
                ? "border-market/30 bg-market/10 text-market"
                : "border-danger/30 bg-danger/10 text-danger"
            }`}
          >
            {result === "passed"
              ? `Quiz valide avec ${score ?? 0}%.`
              : result === "failed"
                ? `Score ${score ?? 0}%. Revois la lecon avant de recommencer.`
                : "Quiz indisponible pour ce compte."}
          </p>
        ) : null}
        <div className="mt-6 grid gap-5">
          {quiz.questions.map((question, index) => (
            <fieldset className="rounded-lg border border-line bg-foreground/[0.04] p-5" key={question.id}>
              <legend className="px-1 text-sm font-black">Question {index + 1}</legend>
              <p className="mt-3 text-lg font-black">{question.text}</p>
              <div className="mt-4 grid gap-3">
                {question.type === "OPEN_TEXT" ? (
                  <textarea
                    className="min-h-28 rounded-lg border border-line bg-background p-3 text-sm"
                    name={`question-${question.id}`}
                  />
                ) : (
                  question.options.map((option) => (
                    <label className="flex items-center gap-3 rounded-lg border border-line bg-background p-3 text-sm font-semibold" key={option}>
                      <input
                        className="accent-[var(--market)]"
                        name={`question-${question.id}`}
                        type={question.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                        value={option}
                      />
                      {option}
                    </label>
                  ))
                )}
              </div>
            </fieldset>
          ))}
        </div>
        <button className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market disabled:opacity-60" disabled={quiz.attempts <= 0} type="submit">
          Soumettre le quiz
        </button>
      </form>
    </DashboardShell>
  );
}
