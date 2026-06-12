import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <section className="site-shell flex min-h-[60svh] flex-col items-start justify-center py-16">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-market">404</p>
      <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight md:text-6xl">
        Cette page n&apos;est pas dans le plan de trading.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-muted">
        Le lien est peut-etre incorrect ou le contenu a ete deplace.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Retour accueil</ButtonLink>
        <ButtonLink href="/blog" variant="secondary">
          Lire le blog
        </ButtonLink>
      </div>
    </section>
  );
}
