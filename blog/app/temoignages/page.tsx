import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { submitTestimonialAction } from "@/app/temoignages/actions";
import { Pagination } from "@/components/pagination";
import { PageHero } from "@/components/page-hero";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { RatingSelector } from "@/components/rating-selector";
import { TestimonialsGrid } from "@/components/testimonials-grid";
import { getPublicTestimonials } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Temoignages",
  description: "Retours d'apprenants et membres de la communaute trading.",
  path: "/temoignages"
});

type TestimonialsPageProps = {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
};

const pageSize = 6;

function pageHref(page: number) {
  return page > 1 ? `/temoignages?page=${page}` : "/temoignages";
}

export default async function TestimonialsPage({ searchParams }: TestimonialsPageProps) {
  const { status, page = "1" } = await searchParams;
  const testimonials = await getPublicTestimonials();
  const currentPage = Math.max(1, Number(page) || 1);
  const pageCount = Math.max(1, Math.ceil(testimonials.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paginatedTestimonials = testimonials.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <PageHero
        eyebrow="Temoignages"
        title="Des retours centres sur la clarte, pas sur le spectacle."
        description="La credibilite se construit avec des retours sobres, utiles et coherents avec le positionnement educatif."
      />
      <section className="site-shell py-12 md:py-16">
        {testimonials.length ? (
          <TestimonialsGrid testimonials={paginatedTestimonials} />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
            <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black">Aucun temoignage public valide pour le moment.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Les avis soumis restent invisibles jusqu&apos;à leur approbation dans l&apos;administration.
            </p>
          </div>
        )}
        <Pagination
          ariaLabel="Pagination des temoignages"
          currentPage={safePage}
          hrefForPage={pageHref}
          pageCount={pageCount}
        />
      </section>
      <section id="donner-avis" className="site-shell pb-16 md:pb-24">
        <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
            Donner un avis
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight text-balance">
            Proposer un temoignage.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Ton avis est publié immédiatement. Il reste identifiable dans l&apos;administration et peut être désactivé à tout moment si nécessaire.
          </p>
          {status === "sent" ? (
            <p className="mt-5 rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">
              Avis reçu et publié. Merci pour ton retour.
            </p>
          ) : null}
          {status === "invalid" ? (
            <p className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              Merci de completer correctement le formulaire.
            </p>
          ) : null}
          <form action={submitTestimonialAction} className="mt-6 grid gap-4">
            <input aria-hidden="true" autoComplete="off" className="hidden" name="website" tabIndex={-1} type="text" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="name" placeholder="Nom" required />
              <select className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" defaultValue="Apprenant" name="role">
                <option>Apprenant</option>
                <option>Membre de la communaute</option>
                <option>Client formation</option>
                <option>Client accompagnement</option>
              </select>
            </div>
            <RatingSelector />
            <textarea className="min-h-36 rounded-md border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-market" name="quote" placeholder="Ton retour d'experience..." required />
            <PendingSubmitButton className="min-h-12 rounded-md bg-market text-on-market hover:bg-market-strong" pendingLabel="Envoi...">
              Envoyer l&apos;avis
            </PendingSubmitButton>
          </form>
        </div>
      </section>
    </>
  );
}
