"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import {
  createCommunityCommentAction,
  type CommunityCommentState,
} from "@/app/student/community/actions";

const initialState: CommunityCommentState = {
  ok: false,
  message: "",
};

export function CommunityCommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(createCommunityCommentAction, initialState);

  return (
    <form action={formAction} className="mt-5 rounded-lg border border-line bg-background p-3">
      <input name="postId" type="hidden" value={postId} />
      <label className="block text-sm font-black">
        Repondre
        <textarea className="mt-2 min-h-20 w-full rounded-lg border border-line bg-surface p-3 text-sm" name="body" />
        {state.errors?.body ? <span className="mt-2 block text-xs text-danger">{state.errors.body[0]}</span> : null}
      </label>
      {state.message ? (
        <p
          className={`mt-3 rounded-lg border p-3 text-sm font-semibold ${
            state.ok ? "border-market/30 bg-market/10 text-market" : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-market px-3 text-sm font-black text-on-market disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {pending ? "Envoi..." : "Commenter"}
      </button>
    </form>
  );
}
