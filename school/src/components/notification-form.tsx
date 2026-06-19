"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { sendNotificationAction, type NotificationState } from "@/app/trainer/notifications/actions";

const initialState: NotificationState = {
  ok: false,
  message: "",
};

export function NotificationForm() {
  const [state, formAction, pending] = useActionState(sendNotificationAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-surface p-6">
      <Send className="h-5 w-5 text-market" aria-hidden="true" />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-black">
          Cible
          <select className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm" name="target">
            <option>Tous les apprenants</option>
            <option>Formation payante</option>
            <option>Apprenants inactifs</option>
          </select>
          {state.errors?.target ? <span className="mt-2 block text-xs text-danger">{state.errors.target[0]}</span> : null}
        </label>
        <label className="text-sm font-black">
          Canal
          <select className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm" name="channel">
            <option value="INTERNAL">Interne</option>
            <option value="EMAIL">Email</option>
            <option value="BOTH">Interne + email</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm font-black">
        Message
        <textarea className="mt-2 min-h-36 w-full rounded-lg border border-line bg-background p-4 text-sm" name="message" />
        {state.errors?.message ? <span className="mt-2 block text-xs text-danger">{state.errors.message[0]}</span> : null}
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
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Validation..." : "Envoyer"}
      </button>
    </form>
  );
}
