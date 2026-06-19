import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404"
        title="Page introuvable."
        description="Le parcours demande n'existe pas ou n'est pas encore disponible."
      />
      <section className="site-shell py-12">
        <ButtonLink href="/" variant="secondary">Retour accueil</ButtonLink>
      </section>
    </>
  );
}
