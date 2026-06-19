import { PageHero } from "@/components/page-hero";
import { AccessChoiceForm } from "@/components/access-choice-form";
import { requirePageSession } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function AccessChoicePage() {
  await requirePageSession(["student"], "/access-choice");

  return (
    <>
      <PageHero
        eyebrow="Demande d'acces"
        title="Choisir gratuit ou payant sans paiement en ligne."
        description="La plateforme prepare une demande propre. Le paiement reste hors plateforme et le formateur attribue l'acces apres verification."
      />
      <section className="site-shell py-12 md:py-16">
        <AccessChoiceForm />
      </section>
    </>
  );
}
