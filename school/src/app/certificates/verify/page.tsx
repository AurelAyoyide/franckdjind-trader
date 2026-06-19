import { PageHero } from "@/components/page-hero";
import { CertificateLookupForm } from "@/components/certificate-lookup-form";

export default function CertificateLookupPage() {
  return (
    <>
      <PageHero
        eyebrow="Certificat"
        title="Verifier une preuve de fin de formation."
        description="La verification publique confirme le code du certificat sans ouvrir l'espace prive de l'apprenant."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <CertificateLookupForm />
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-2xl font-black">Ce que tu peux confirmer</h2>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-muted">
              <p className="rounded-lg border border-line bg-foreground/[0.04] p-3">Le code du certificat.</p>
              <p className="rounded-lg border border-line bg-foreground/[0.04] p-3">La formation associee.</p>
              <p className="rounded-lg border border-line bg-foreground/[0.04] p-3">La date d&apos;emission.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
