"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";
import { createTrainerAction, type CreateTrainerState } from "@/app/admin/users/actions";

const initialState: CreateTrainerState = {
  ok: false,
  message: "",
};

export function CreateTrainerForm() {
  const [state, formAction, pending] = useActionState(createTrainerAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <UserPlus className="h-5 w-5 text-market" aria-hidden="true" />
        <h2 className="text-xl font-black">Creer un formateur</h2>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[
          { name: "firstName", label: "Prenom", type: "text" },
          { name: "lastName", label: "Nom", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "WhatsApp", type: "tel" },
        ].map((field) => (
          <label className="text-sm font-black" key={field.name}>
            {field.label}
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm outline-none focus:border-market"
              name={field.name}
              type={field.type}
            />
            {state.errors?.[field.name] ? (
              <span className="mt-2 block text-xs text-danger">{state.errors[field.name]?.[0]}</span>
            ) : null}
          </label>
        ))}
        <label className="text-sm font-black">
          Role
          <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="role">
            <option value="MAIN_TRAINER">Formateur principal</option>
            <option value="ASSISTANT_TRAINER">Assistant</option>
          </select>
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
        {pending ? "Creation..." : "Creer le compte"}
      </button>
    </form>
  );
}
