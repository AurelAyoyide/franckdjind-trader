import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { resetPasswordAction } from "@/app/admin/mot-de-passe-oublie/actions";
import { PasswordField } from "@/components/password-field";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Nouveau mot de passe",
  description: "Création sécurisée d'un nouveau mot de passe administrateur.",
  path: "/admin/reinitialiser-mot-de-passe",
  noIndex: true
});

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; status?: string }> }) {
  const { token, status } = await searchParams;
  const validToken = Boolean(token && token.length >= 32);

  return (
    <section className="site-shell flex min-h-[70svh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-foreground/[0.05] text-market">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <ThemeToggle />
        </div>
        <h1 className="mt-6 text-3xl font-black">Choisir un nouveau mot de passe</h1>
        <p className="mt-3 text-sm leading-7 text-muted">Au moins 10 caractères, avec au minimum une lettre et un chiffre.</p>
        {status === "invalid" || status === "expired" || !validToken ? (
          <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
            {status === "expired" || !validToken ? "Ce lien est invalide ou a expiré." : "Vérifie les deux mots de passe."}
          </p>
        ) : null}
        {validToken ? (
          <form action={resetPasswordAction} className="mt-6 grid gap-4">
            <input name="token" type="hidden" value={token} />
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Nouveau mot de passe
              <PasswordField autoComplete="new-password" minLength={10} name="password" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Confirmer le mot de passe
              <PasswordField autoComplete="new-password" minLength={10} name="confirmPassword" required />
            </label>
            <PendingSubmitButton className="min-h-12 rounded-md bg-market text-on-market hover:bg-market-strong" pendingLabel="Enregistrement...">
              Enregistrer le nouveau mot de passe
            </PendingSubmitButton>
          </form>
        ) : null}
        <Link className="mt-5 inline-flex text-sm font-semibold text-market underline-offset-4 hover:underline" href="/admin/mot-de-passe-oublie">
          Demander un nouveau lien
        </Link>
      </div>
    </section>
  );
}
