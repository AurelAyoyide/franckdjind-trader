import { PageHero } from "@/components/page-hero";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHero
        eyebrow="Mot de passe oublie"
        title="Retrouver l'acces a ton compte."
        description="Un lien temporaire permet de choisir un nouveau mot de passe sans exposer ton ancien acces."
      />
      <section className="site-shell py-12 md:py-16">
        <ForgotPasswordForm />
      </section>
    </>
  );
}
