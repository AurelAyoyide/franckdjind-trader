"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { loginAction } from "@/app/login/actions";
import { PasswordField } from "@/components/password-field";
import { useLocale, useTranslate } from "@/components/locale-provider";
import { localePath } from "@/lib/i18n";

type LoginFormProps = {
  errorMessage?: string | null;
  next?: string;
  reset?: string;
};

export function LoginForm({ errorMessage, next, reset }: LoginFormProps) {
  const locale = useLocale();
  const t = useTranslate();
  return (
    <form action={loginAction} className="rounded-lg border border-line bg-surface p-6">
      <div className="flex items-center gap-3">
        <KeyRound className="h-5 w-5 text-cyan" aria-hidden="true" />
        <h2 className="text-2xl font-black">{t("Connexion")}</h2>
      </div>
      <p className="mt-3 text-sm leading-7 text-muted">
        {t("Utilisez l'adresse email associée à votre compte pour accéder à votre espace privé.")}
      </p>
      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">
          {errorMessage}
        </p>
      ) : null}
      {reset ? (
        <p className="mt-4 rounded-lg border border-market/30 bg-market/10 p-3 text-sm font-semibold text-market">
          {t("Mot de passe mis à jour. Tu peux te connecter.")}
        </p>
      ) : null}
      <input name="next" type="hidden" value={next ?? ""} />
      <label className="mt-6 block text-sm font-black" htmlFor="email">
        Email
      </label>
      <input
        autoComplete="email"
        className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm outline-none transition focus:border-market"
        id="email"
        name="email"
        placeholder="vous@example.com"
        type="email"
      />
      <PasswordField
        autoComplete="current-password"
        className="mt-4"
        id="password"
        label="Mot de passe"
        name="password"
        placeholder="Votre mot de passe"
      />
      <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-3 font-semibold text-muted">
          <input className="h-4 w-4 accent-[var(--market)]" name="rememberMe" type="checkbox" />
          <span>{t("Rester connecté")}</span>
        </label>
        <Link className="font-black text-market hover:text-market-strong" href={localePath(locale, "/forgot-password")}>
          {t("Mot de passe oublié")}
        </Link>
      </div>
      <button
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market transition hover:bg-market-strong"
        type="submit"
      >
        {t("Se connecter")}
      </button>
      <p className="mt-5 text-center text-sm text-muted">
        {t("Vous n'avez pas encore de compte ?")} {" "}
        <Link className="font-black text-market hover:text-market-strong" href={localePath(locale, "/register")}>
          {t("Creer un compte")}
        </Link>
      </p>
    </form>
  );
}
