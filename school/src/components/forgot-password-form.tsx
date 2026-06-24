"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  type ForgotPasswordState,
} from "@/app/forgot-password/actions";
import { useLocale, useTranslate } from "@/components/locale-provider";
import { localePath } from "@/lib/i18n";

const initialState: ForgotPasswordState = {
  ok: false,
  message: "",
};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);
  const locale = useLocale();
  const t = useTranslate();

  return (
    <form action={formAction} className="max-w-2xl rounded-lg border border-line bg-surface p-6">
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Site web</label>
        <input autoComplete="off" id="website" name="website" tabIndex={-1} type="text" />
      </div>
      <KeyRound className="h-5 w-5 text-market" aria-hidden="true" />
      <h2 className="mt-4 text-2xl font-black">{t("Recevoir un lien de connexion")}</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        {t("Saisissez l'adresse email de votre compte. Si elle est reconnue, un lien temporaire sera prepare.")}
      </p>
      <label className="mt-5 block text-sm font-black" htmlFor="email">
        {t("Email du compte")}
      </label>
      <input
        className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm outline-none transition focus:border-market"
        id="email"
        name="email"
        placeholder="vous@example.com"
        type="email"
      />
      {state.errors?.email ? <p className="mt-2 text-xs font-semibold text-danger">{state.errors.email[0]}</p> : null}
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
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market transition hover:bg-market-strong disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {t(pending ? "Preparation..." : "Preparer le lien")}
      </button>
      <p className="mt-5 text-center text-sm text-muted">
        {t("Vous connaissez votre mot de passe ?")} {" "}
        <Link className="font-black text-market hover:text-market-strong" href={localePath(locale, "/login")}>
          {t("Retour connexion")}
        </Link>
      </p>
    </form>
  );
}
