import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import type { StoredActionLink } from "@/lib/data-store";
import { normalizeHexColor } from "@/lib/security";

type AffiliateCarouselProps = {
  links: StoredActionLink[];
  title?: string;
};

export function AffiliateCarousel({
  links,
  title = "Opportunites partenaires"
}: AffiliateCarouselProps) {
  if (!links.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-4 md:p-5" aria-label={title}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-market">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Partenaires
          </p>
          <h2 className="mt-2 text-xl font-black">{title}</h2>
        </div>
      </div>
      <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
        {links.map((link) => {
          const color = normalizeHexColor(link.brandColor);

          return (
            <Link
              className="group min-w-[250px] max-w-[280px] snap-start rounded-lg border border-line bg-background p-4 transition hover:-translate-y-0.5 hover:border-line-strong"
              href={`/go/${link.slug}`}
              key={link.id}
              style={{ borderTop: `4px solid ${color}` }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-strong">
                {link.placement === "ARTICLE_BOTTOM" ? "Apres lecture" : "Broker"}
              </p>
              <h3 className="mt-3 text-lg font-black group-hover:text-market">{link.label}</h3>
              <p className="mt-2 min-h-14 text-sm leading-6 text-muted">
                {link.description || "Ouvre un compte via le lien partenaire et suis les conditions de l'offre."}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-market">
                {link.ctaLabel || "Voir l'offre"}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
