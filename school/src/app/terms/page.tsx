import { PageHero } from "@/components/page-hero";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Conditions"
        title="Plateforme privee, acces attribue manuellement."
        description="Les paiements sont traites hors plateforme. L'acces aux formations reste controle par le formateur."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="rounded-lg border border-line bg-surface p-6 text-sm leading-8 text-muted">
          <p>
            Les contenus de formation sont destines aux utilisateurs autorises. Les videos ne sont pas exposees via URL publique
            et les certificats peuvent etre verifies avec leur code public.
          </p>
        </div>
      </section>
    </>
  );
}
