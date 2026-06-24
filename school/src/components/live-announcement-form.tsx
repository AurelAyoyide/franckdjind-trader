"use client";

import { Radio } from "lucide-react";
import { useActionState } from "react";
import {
  createLiveAnnouncementAction,
  type LiveAnnouncementState,
} from "@/app/trainer/lives/actions";

type CourseOption = {
  id: string;
  title: string;
};

const initialState: LiveAnnouncementState = {
  ok: false,
  message: "",
};

export function LiveAnnouncementForm({ courses }: { courses: CourseOption[] }) {
  const [state, formAction, pending] = useActionState(createLiveAnnouncementAction, initialState);

  return (
    <form action={formAction} className="mb-5 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <Radio className="h-5 w-5 text-cyan" aria-hidden="true" />
        <h2 className="text-xl font-black">Annoncer un live</h2>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-black">
          Titre
          <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="title" placeholder="Ex. Session analyse marche" required />
          {state.errors?.title ? <span className="mt-2 block text-xs text-danger">{state.errors.title[0]}</span> : null}
        </label>
        <label className="text-sm font-black">
          Date et heure
          <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" min={new Date().toISOString().slice(0, 16)} name="scheduledAt" required type="datetime-local" />
          {state.errors?.scheduledAt ? <span className="mt-2 block text-xs text-danger">{state.errors.scheduledAt[0]}</span> : null}
        </label>
        <label className="text-sm font-black">
          Lien externe
          <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="externalUrl" placeholder="https://meet.google.com/..." required type="url" />
          {state.errors?.externalUrl ? <span className="mt-2 block text-xs text-danger">{state.errors.externalUrl[0]}</span> : null}
        </label>
        <label className="text-sm font-black">
          Cible
          <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="courseId">
            <option value="">Tous les apprenants</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm font-black">
        Description
        <textarea className="mt-2 min-h-24 w-full rounded-lg border border-line bg-background p-3 text-sm" name="body" placeholder="Ce qui sera traite pendant le live..." required />
        {state.errors?.body ? <span className="mt-2 block text-xs text-danger">{state.errors.body[0]}</span> : null}
      </label>
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
        disabled={pending}
        type="submit"
      >
        {pending ? "Publication..." : "Programmer le live"}
      </button>
    </form>
  );
}
