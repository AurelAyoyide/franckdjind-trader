"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/reset-password/actions";
import { PasswordField } from "@/components/password-field";
import { useLocale, useTranslate } from "@/components/locale-provider";
import { localePath } from "@/lib/i18n";

const initialState: ResetPasswordState = {
  ok: false,
  message: "",
};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const locale = useLocale();
  const t = useTranslate();

  return (
    <form action={formAction} className="max-w-2xl rounded-lg border border-line bg-surface p-6">
      <input name="token" type="hidden" value={token} />
      <h2 className="text-2xl font-black">{t("Choisir un nouveau mot de passe")}</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{t("Utilise au moins 8 caracteres, avec une lettre et un chiffre.")}</p>
      <PasswordField
        autoComplete="new-password"
        className="mt-5"
        error={state.errors?.password?.[0]}
        id="password"
        label="Nouveau mot de passe"
        name="password"
      />
      <PasswordField
        autoComplete="new-password"
        className="mt-4"
        error={state.errors?.confirmPassword?.[0]}
        id="confirmPassword"
        label="Confirmation"
        name="confirmPassword"
      />
      {state.message ? (
        <p className="mt-5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">
          {state.message}
        </p>
      ) : null}
      <button
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market transition hover:bg-market-strong disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {t(pending ? "Mise a jour..." : "Changer le mot de passe")}
      </button>
      <p className="mt-5 text-center text-sm text-muted">
        {t("Vous souhaitez vous connecter ?")} {" "}
        <Link className="font-black text-market hover:text-market-strong" href={localePath(locale, "/login")}>
          {t("Retour connexion")}
        </Link>
      </p>
    </form>
  );
}
