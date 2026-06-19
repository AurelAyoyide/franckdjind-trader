"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegistrationState } from "@/app/register/actions";
import { PasswordField } from "@/components/password-field";

const initialState: RegistrationState = {
  ok: false,
  message: "",
};

const fields = [
  { id: "firstName", label: "Prenom", type: "text", placeholder: "Amina" },
  { id: "lastName", label: "Nom", type: "text", placeholder: "K." },
  { id: "email", label: "Email", type: "email", placeholder: "amina@example.com" },
  { id: "phone", label: "WhatsApp", type: "tel", placeholder: "+229 00 00 00 00" },
];

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-surface p-6">
      <h2 className="text-2xl font-black">Compte apprenant</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Apres inscription, un lien de validation est envoye par email avant la demande d&apos;acces.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-black" htmlFor={field.id}>
              {field.label}
            </label>
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm outline-none transition focus:border-market"
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              type={field.type}
            />
            {state.errors?.[field.id]?.length ? (
              <p className="mt-2 text-xs font-semibold text-danger">{state.errors[field.id]?.[0]}</p>
            ) : null}
          </div>
        ))}
        <PasswordField
          autoComplete="new-password"
          error={state.errors?.password?.[0]}
          id="password"
          label="Mot de passe"
          name="password"
          placeholder="Minimum 8 caracteres"
        />
        <PasswordField
          autoComplete="new-password"
          error={state.errors?.confirmPassword?.[0]}
          id="confirmPassword"
          label="Confirmation"
          name="confirmPassword"
          placeholder="Repeter le mot de passe"
        />
      </div>
      <label className="mt-5 flex items-start gap-3 text-sm font-semibold text-muted">
        <input className="mt-1 accent-[var(--market)]" name="acceptedTerms" type="checkbox" />
        <span>
          J&apos;accepte les{" "}
          <Link className="font-black text-market hover:text-market-strong" href="/terms">
            conditions d&apos;utilisation
          </Link>{" "}
          et la{" "}
          <Link className="font-black text-market hover:text-market-strong" href="/privacy-policy">
            politique de confidentialite
          </Link>
          .
        </span>
      </label>
      {state.errors?.acceptedTerms?.length ? (
        <p className="mt-2 text-xs font-semibold text-danger">{state.errors.acceptedTerms[0]}</p>
      ) : null}
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
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market transition hover:bg-market-strong disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Verification..." : "Creer le compte"}
      </button>
      <p className="mt-5 text-center text-sm text-muted">
        Tu as deja un compte ?{" "}
        <Link className="font-black text-market hover:text-market-strong" href="/login">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
