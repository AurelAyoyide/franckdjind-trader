"use client";

import { useActionState } from "react";
import { createCourseAction, type CourseFormState } from "@/app/trainer/courses/new/actions";

const initialState: CourseFormState = {
  ok: false,
  message: "",
};

export function CourseForm() {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-surface p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-black">
          Titre
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm outline-none focus:border-market"
            name="title"
            placeholder="Fondations trading prive"
            required
          />
          {state.errors?.title ? <span className="mt-2 block text-xs text-danger">{state.errors.title[0]}</span> : null}
        </label>
        <label className="text-sm font-black">
          Type
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm outline-none focus:border-market"
            name="type"
          >
            <option value="FREE">Gratuite</option>
            <option value="PAID">Payante hors plateforme</option>
          </select>
        </label>
        <label className="text-sm font-black">
          Prix hors plateforme
          <div className="mt-2 flex gap-2">
            <input className="min-h-12 min-w-0 flex-1 rounded-lg border border-line bg-background px-4 text-sm outline-none focus:border-market" min="0" name="priceAmount" placeholder="Ex. 50 000" step="1" type="number" />
            <select className="min-h-12 rounded-lg border border-line bg-background px-3 text-sm" name="priceCurrency"><option value="XOF">FCFA</option><option value="EUR">EUR</option></select>
          </div>
        </label>
        <label className="text-sm font-black">
          Durée estimée <span className="font-medium text-muted">(facultatif)</span>
          <div className="mt-2 flex gap-2">
            <input className="min-h-12 min-w-0 flex-1 rounded-lg border border-line bg-background px-4 text-sm outline-none focus:border-market" min="1" name="durationValue" placeholder="Ex. 6" type="number" />
            <select className="min-h-12 rounded-lg border border-line bg-background px-3 text-sm" name="durationUnit">
              <option value="WEEKS">semaines</option><option value="DAYS">jours</option><option value="HOURS">heures</option><option value="MONTHS">mois</option>
            </select>
          </div>
          <span className="mt-2 block text-xs font-medium text-muted">Un simple repere pour l&apos;apprenant, jamais une obligation.</span>
          {state.errors?.duration ? <span className="mt-2 block text-xs text-danger">{state.errors.duration[0]}</span> : null}
        </label>
      </div>
      <label className="mt-4 block text-sm font-black">
        Description
        <textarea
          className="mt-2 min-h-36 w-full rounded-lg border border-line bg-background p-4 text-sm outline-none focus:border-market"
          name="description"
          required
        />
        {state.errors?.description ? <span className="mt-2 block text-xs text-danger">{state.errors.description[0]}</span> : null}
      </label>
      {state.message ? (
        <p
          className={`mt-5 rounded-lg border p-3 text-sm font-semibold ${state.ok ? "border-market/30 bg-market/10 text-market" : "border-danger/30 bg-danger/10 text-danger"
            }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Validation..." : "Enregistrer en brouillon"}
      </button>
    </form>
  );
}
