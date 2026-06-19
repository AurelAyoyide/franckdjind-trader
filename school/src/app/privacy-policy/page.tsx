import { PageHero } from "@/components/page-hero";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Confidentialite"
        title="Donnees limitees a l'exploitation de la formation."
        description="Compte, progression, demandes, notifications, logs et certificats servent au suivi pedagogique et a la securite."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="rounded-lg border border-line bg-surface p-6 text-sm leading-8 text-muted">
          <p>
            Les donnees personnelles ne doivent pas etre vendues. Les exports Excel sont reserves aux roles autorises.
            Les actions sensibles sont journalisees dans l&apos;audit.
          </p>
        </div>
      </section>
    </>
  );
}
