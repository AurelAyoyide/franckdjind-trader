"use client";

import { MessageCircle } from "lucide-react";
import { useActionState } from "react";
import { requestAccessAction, type AccessChoiceState } from "@/app/access-choice/actions";
import { useTranslate } from "@/components/locale-provider";

const initialState: AccessChoiceState = {
  ok: false,
  message: "",
};

export function AccessChoiceForm() {
  const [state, formAction, pending] = useActionState(requestAccessAction, initialState);
  const t = useTranslate();

  return (
    <form action={formAction} className="rounded-lg border border-line bg-surface p-6">
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { value: "free", label: "Formation gratuite", text: "Demande simple a valider par le formateur." },
          { value: "paid", label: "Payee hors plateforme", text: "Paiement signale puis verifie manuellement." },
        ].map((choice) => (
          <label className="rounded-lg border border-line bg-foreground/[0.04] p-4" key={choice.value}>
            <input className="mr-2 accent-[var(--market)]" name="kind" type="radio" value={choice.value} />
            <span className="font-black">{t(choice.label)}</span>
            <span className="mt-2 block text-xs leading-6 text-muted">{t(choice.text)}</span>
          </label>
        ))}
      </div>
      {state.errors?.kind ? <p className="mt-2 text-xs font-semibold text-danger">{state.errors.kind[0]}</p> : null}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          { id: "name", label: "Nom complet", type: "text" },
          { id: "email", label: "Email", type: "email" },
          { id: "phone", label: "WhatsApp", type: "tel" },
        ].map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-black" htmlFor={field.id}>
              {t(field.label)}
            </label>
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm outline-none transition focus:border-market"
              id={field.id}
              name={field.id}
              type={field.type}
            />
            {state.errors?.[field.id]?.length ? (
              <p className="mt-2 text-xs font-semibold text-danger">{state.errors[field.id]?.[0]}</p>
            ) : null}
          </div>
        ))}
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market transition hover:bg-market-strong disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {t(pending ? "Preparation..." : "Preparer la demande")}
        </button>
        {state.whatsappUrl ? (
          <a
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-black transition hover:border-line-strong hover:bg-foreground/[0.1]"
            href={state.whatsappUrl}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t("Ouvrir WhatsApp")}
          </a>
        ) : null}
      </div>
    </form>
  );
}
