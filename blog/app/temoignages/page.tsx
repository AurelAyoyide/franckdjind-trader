import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { submitTestimonialAction } from "@/app/temoignages/actions";
import { PageHero } from "@/components/page-hero";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getPublicData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Temoignages",
  description: "Retours d'apprenants et membres de la communaute trading.",
  path: "/temoignages"
});

type TestimonialsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function TestimonialsPage({ searchParams }: TestimonialsPageProps) {
  const { status } = await searchParams;
  const { testimonials } = await getPublicData();

  return (
    <>
      <PageHero
        eyebrow="Temoignages"
        title="Des retours centres sur la clarte, pas sur le spectacle."
        description="La credibilite se construit avec des retours sobres, utiles et coherents avec le positionnement educatif."
      />
      <section className="site-shell py-12 md:py-16">
        {testimonials.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure className="flex min-h-72 flex-col rounded-lg border border-line bg-surface p-6" key={testimonial.name}>
                <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
                <blockquote className="mt-5 flex-1 text-base font-semibold leading-8 text-pretty">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4 text-sm text-muted">
                  <span className="font-black text-foreground">{testimonial.name}</span>
                  <span className="block">{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
            <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black">Aucun temoignage public valide pour le moment.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Les avis soumis apparaitront ici automatiquement et resteront moderables dans l&apos;admin.
            </p>
          </div>
        )}
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
            Les avis soumis ici sont publies automatiquement. L&apos;admin peut ensuite les modifier ou les retirer.
          </p>
          {status === "sent" ? (
            <p className="mt-5 rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">
              Avis recu et publie.
            </p>
          ) : null}
          {status === "invalid" ? (
            <p className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              Merci de completer correctement le formulaire.
            </p>
          ) : null}
          <form action={submitTestimonialAction} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="name" placeholder="Nom" required />
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="role" placeholder="Role ou formation suivie" />
            </div>
            <select className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" defaultValue="5" name="rating">
              <option value="5">5/5</option>
              <option value="4">4/5</option>
              <option value="3">3/5</option>
              <option value="2">2/5</option>
              <option value="1">1/5</option>
            </select>
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
