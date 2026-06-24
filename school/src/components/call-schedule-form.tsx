"use client";

import { CalendarPlus } from "lucide-react";
import { useActionState } from "react";
import { scheduleCallAction, type CallScheduleState } from "@/app/trainer/calendar/actions";

type LearnerOption = {
  id: string;
  name: string;
  email: string;
};

const initialState: CallScheduleState = {
  ok: false,
  message: "",
};

export function CallScheduleForm({ learners }: { learners: LearnerOption[] }) {
  const [state, formAction, pending] = useActionState(scheduleCallAction, initialState);

  return (
    <form action={formAction} className="mb-5 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <CalendarPlus className="h-5 w-5 text-market" aria-hidden="true" />
        <h2 className="text-xl font-black">Programmer un appel</h2>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-black">
          Apprenant
          <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="learnerId" required>
            {learners.map((learner) => (
              <option key={learner.id} value={learner.id}>
                {learner.name} - {learner.email}
              </option>
            ))}
          </select>
          {state.errors?.learnerId ? <span className="mt-2 block text-xs text-danger">{state.errors.learnerId[0]}</span> : null}
        </label>
        <label className="text-sm font-black">
          Date et heure
          <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" min={new Date().toISOString().slice(0, 16)} name="scheduledAt" required type="datetime-local" />
          {state.errors?.scheduledAt ? <span className="mt-2 block text-xs text-danger">{state.errors.scheduledAt[0]}</span> : null}
        </label>
        <label className="text-sm font-black">
          Titre
          <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="title" placeholder="Ex. Bilan de progression" required />
          {state.errors?.title ? <span className="mt-2 block text-xs text-danger">{state.errors.title[0]}</span> : null}
        </label>
        <label className="text-sm font-black">
          Notes internes
          <textarea className="mt-2 min-h-20 w-full rounded-lg border border-line bg-background p-3 text-sm" name="notes" placeholder="Objectif, points a aborder, suivi..." />
        </label>
      </div>
      {state.message ? (
        <p
          className={`mt-5 rounded-lg border p-3 text-sm font-semibold ${
            state.ok ? "border-market/30 bg-market/10 text-market" : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60"
        disabled={pending || learners.length === 0}
        type="submit"
      >
        {pending ? "Planification..." : "Programmer"}
      </button>
    </form>
  );
}
