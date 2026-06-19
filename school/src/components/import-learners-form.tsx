"use client";

import { Upload } from "lucide-react";
import { useActionState } from "react";
import {
  importLearnersAction,
  type ImportLearnersState,
} from "@/app/trainer/import-export/actions";

const initialState: ImportLearnersState = {
  ok: false,
  message: "",
};

export function ImportLearnersForm() {
  const [state, formAction, pending] = useActionState(importLearnersAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-surface p-6">
      <Upload className="h-5 w-5 text-market" aria-hidden="true" />
      <h2 className="mt-5 text-2xl font-black">Importer des apprenants</h2>
      <p className="mt-3 text-sm leading-7 text-muted">Colonnes attendues : Email, Prenom, Nom, WhatsApp, Formation.</p>
      <input
        accept=".xlsx,.csv"
        className="mt-6 block w-full rounded-lg border border-line bg-background p-3 text-sm"
        name="file"
        type="file"
      />
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
        {pending ? "Import..." : "Importer"}
      </button>
    </form>
  );
}
