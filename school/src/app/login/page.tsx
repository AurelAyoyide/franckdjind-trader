import { ShieldCheck, UserPlus } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { StatusBadge } from "@/components/status-badge";
import { LoginForm } from "@/components/login-form";

const errorMessages: Record<string, string> = {
  invalid: "Renseigne un email valide et ton mot de passe.",
  credentials: "Email ou mot de passe incorrect.",
  suspended: "Ce compte est suspendu. Contacte l'administrateur.",
  email: "Valide ton email avant de te connecter.",
  locked: "Trop de tentatives. Reessaie dans quelques minutes.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; reset?: string }>;
}) {
  const { error, next, reset } = await searchParams;
  const errorMessage = error ? errorMessages[error] ?? "Connexion impossible pour le moment." : null;

  return (
    <>
      <PageHero
        eyebrow="Connexion"
        title="Retrouver ton espace."
        description="Cours, demandes, certificats et suivi restent accessibles depuis un seul compte."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-line bg-surface p-6">
            <ShieldCheck className="h-6 w-6 text-market" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">Acces prive</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Les apprenants creent leur compte ici. Les comptes formateur et admin sont crees depuis l&apos;espace
              administrateur, ou fournis au demarrage du projet.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge tone="market">Apprenant</StatusBadge>
              <StatusBadge tone="cyan">Formateur</StatusBadge>
              <StatusBadge tone="amber">Admin</StatusBadge>
            </div>
            <div className="mt-6 rounded-lg border border-line bg-foreground/[0.04] p-4">
              <UserPlus className="h-5 w-5 text-cyan" aria-hidden="true" />
              <h3 className="mt-3 text-base font-black">Nouveau sur la plateforme ?</h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                Cree d&apos;abord un compte apprenant, valide ton email, puis demande l&apos;acces a une formation.
              </p>
            </div>
          </div>

          <LoginForm errorMessage={errorMessage} next={next} reset={reset} />
        </div>
      </section>
    </>
  );
}
