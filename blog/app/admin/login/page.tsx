import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/admin/login/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { PasswordField } from "@/components/password-field";
import { ThemeToggle } from "@/components/theme-toggle";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Connexion admin",
  description: "Connexion a l'administration.",
  path: "/admin/login",
  noIndex: true
});

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    reset?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error, next, reset } = await searchParams;
  const errorMessage =
    error === "limited"
      ? "Trop de tentatives. Reessaie dans quelques minutes."
      : "Identifiants invalides.";

  return (
    <section className="site-shell flex min-h-[70svh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-foreground/[0.05] text-market">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
          <ThemeToggle />
        </div>
        <h1 className="mt-6 text-3xl font-black">Connexion admin</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Acces reserve. Les routes admin sont bloquees sans session signee.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
            {errorMessage}
          </p>
        ) : null}
        {reset === "success" ? (
          <p className="mt-4 rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">
            Mot de passe mis à jour. Tu peux maintenant te connecter.
          </p>
        ) : null}
        <form action={loginAction} className="mt-6 grid gap-4">
          <input name="next" type="hidden" value={next ?? ""} />
          <label className="grid gap-2 text-sm font-semibold text-muted">
            Email
            <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market" name="email" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-muted">
            Mot de passe
            <PasswordField autoComplete="current-password" name="password" required />
          </label>
          <PendingSubmitButton className="min-h-12 rounded-md bg-market text-on-market hover:bg-market-strong" pendingLabel="Connexion...">
            Se connecter
          </PendingSubmitButton>
        </form>
        <Link className="mt-5 inline-flex text-sm font-semibold text-market underline-offset-4 hover:underline" href="/admin/mot-de-passe-oublie">
          Mot de passe oublié ?
        </Link>
      </div>
    </section>
  );
}
