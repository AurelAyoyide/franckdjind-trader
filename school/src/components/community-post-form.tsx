"use client";

import { MessageCirclePlus } from "lucide-react";
import { useActionState, useState } from "react";
import {
  createCommunityPostAction,
  type CommunityPostState,
} from "@/app/trainer/community/actions";
import { CommunityRichTextEditor } from "@/components/community-rich-text-editor";

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
  const [body, setBody] = useState("");

  return (
    <form action={formAction} className="mb-8 rounded-lg border border-line bg-surface p-1 shadow-sm transition-all focus-within:border-market/40 focus-within:ring-2 focus-within:ring-market/20 hover:shadow-md">
      <div className="rounded-lg bg-background p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-market/10 text-market">
            <MessageCirclePlus className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <input
              name="title"
              placeholder="Titre de votre annonce..."
              required
              className="w-full bg-transparent text-lg font-black text-foreground placeholder-muted focus:outline-none mb-2"
            />
            <input name="body" type="hidden" value={body} />
            <CommunityRichTextEditor
              onChange={setBody}
              placeholder="Partagez quelque chose avec la communaute..."
              value={body}
            />
          </div>
        </div>

        {(state.errors?.title || state.errors?.body) && (
          <div className="mb-4 sm:ml-16">
            {state.errors.title && <span className="block text-xs font-bold text-danger">{state.errors.title[0]}</span>}
            {state.errors.body && <span className="block text-xs font-bold text-danger">{state.errors.body[0]}</span>}
          </div>
        )}

        <div className="mt-2 flex flex-col gap-4 border-t border-line/40 pt-4 sm:ml-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <select name="courseId" className="h-9 cursor-pointer rounded-lg border border-line bg-surface px-3 text-xs font-bold text-foreground transition hover:bg-foreground/[0.04] focus:border-market focus:outline-none focus:ring-1 focus:ring-market">
              <option value="">Public general</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold transition hover:bg-foreground/[0.04]">
              <input className="accent-[var(--market)]" name="pinned" type="checkbox" />
              Epingler
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold transition hover:bg-foreground/[0.04]">
              <input className="accent-[var(--market)]" defaultChecked name="commentsEnabled" type="checkbox" />
              Commentaires
            </label>
          </div>

          <button
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-sm transition hover:bg-market-strong disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>

      {state.message && (
        <div className="px-5 pb-3 pt-1 sm:ml-16">
          <p className={`text-xs font-bold ${state.ok ? "text-market" : "text-danger"}`}>
            {state.message}
          </p>
        </div>
      )}
    </form>
  );
}
