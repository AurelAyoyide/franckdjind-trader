"use client";

import { MessageCirclePlus } from "lucide-react";
import { useActionState } from "react";
import {
  createCommunityPostAction,
  type CommunityPostState,
} from "@/app/trainer/community/actions";

type CourseOption = {
  id: string;
  title: string;
};

const initialState: CommunityPostState = {
  ok: false,
  message: "",
};

export function CommunityPostForm({ courses }: { courses: CourseOption[] }) {
  const [state, formAction, pending] = useActionState(createCommunityPostAction, initialState);

  return (
    <form action={formAction} className="mb-5 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <MessageCirclePlus className="h-5 w-5 text-market" aria-hidden="true" />
        <h2 className="text-xl font-black">Publier dans la communaute</h2>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-black">
          Titre
          <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="title" />
          {state.errors?.title ? <span className="mt-2 block text-xs text-danger">{state.errors.title[0]}</span> : null}
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
        Message
        <textarea className="mt-2 min-h-28 w-full rounded-lg border border-line bg-background p-3 text-sm" name="body" />
        {state.errors?.body ? <span className="mt-2 block text-xs text-danger">{state.errors.body[0]}</span> : null}
      </label>
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-black">
          <input className="accent-[var(--market)]" name="pinned" type="checkbox" />
          Epingler
        </label>
        <label className="flex items-center gap-2 text-sm font-black">
          <input className="accent-[var(--market)]" defaultChecked name="commentsEnabled" type="checkbox" />
          Commentaires ouverts
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
        disabled={pending}
        type="submit"
      >
        {pending ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
