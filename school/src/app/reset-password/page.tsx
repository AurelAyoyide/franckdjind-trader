import { PageHero } from "@/components/page-hero";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { ButtonLink } from "@/components/ui/button-link";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Nouveau mot de passe"
        title="Definir un nouveau mot de passe."
        description="Choisis un mot de passe solide, puis reconnecte-toi a ton espace."
      />
      <section className="site-shell py-12 md:py-16">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="max-w-2xl rounded-lg border border-line bg-surface p-6">
            <h2 className="text-2xl font-black">Lien manquant</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Demande un nouveau lien de reinitialisation.</p>
            <div className="mt-6">
              <ButtonLink href="/forgot-password" showArrow>
                Demander un lien
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
