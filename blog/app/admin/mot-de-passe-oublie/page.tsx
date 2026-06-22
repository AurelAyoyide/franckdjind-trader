import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { requestPasswordResetAction } from "@/app/admin/mot-de-passe-oublie/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Mot de passe oublié",
  description: "Demande sécurisée de réinitialisation du mot de passe administrateur.",
  path: "/admin/mot-de-passe-oublie",
  noIndex: true
});

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;

  return (
    <section className="site-shell flex min-h-[70svh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-foreground/[0.05] text-market">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <ThemeToggle />
        </div>
        <h1 className="mt-6 text-3xl font-black">Réinitialiser le mot de passe</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Saisis ton email. Si un compte actif y correspond, un lien valable 30 minutes est envoyé.
        </p>
        {status === "sent" ? (
          <p className="mt-4 rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">
            Si le compte existe, un email vient d&apos;être envoyé. Vérifie aussi les dossiers Spam, Indésirables et Promotions si tu ne le vois pas dans les prochaines minutes.
          </p>
        ) : null}
        {status === "email-error" ? (
          <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger" role="alert">
            Le lien n&apos;a pas pu être envoyé. Vérifie la configuration Resend et réessaie dans quelques instants.
          </p>
        ) : null}
        <form action={requestPasswordResetAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-muted">
            Email du compte
            <input autoComplete="email" className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market" name="email" required type="email" />
          </label>
          <PendingSubmitButton className="min-h-12 rounded-md bg-market text-on-market hover:bg-market-strong" pendingLabel="Envoi...">
            Envoyer le lien
          </PendingSubmitButton>
        </form>
        <Link className="mt-5 inline-flex text-sm font-semibold text-market underline-offset-4 hover:underline" href="/admin/login">
          Retour à la connexion
        </Link>
      </div>
    </section>
  );
}
