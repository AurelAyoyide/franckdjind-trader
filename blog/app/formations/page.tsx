import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { PageHero } from "@/components/page-hero";
import { RichContent } from "@/components/rich-content";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/content";
import { getPublicServices } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services trading",
  description:
    "Services et accompagnements pour apprendre le trading avec méthode, routine et gestion du risque.",
  path: "/formations"
});

type ServicesPageProps = { searchParams: Promise<{ page?: string }> };
const pageSize = 3;

function pageHref(page: number) {
  return page > 1 ? `/formations?page=${page}` : "/formations";
}

export default async function FormationsPage({ searchParams }: ServicesPageProps) {
  const { page = "1" } = await searchParams;
  const services = await getPublicServices();
  const currentPage = Math.max(1, Number(page) || 1);
  const pageCount = Math.max(1, Math.ceil(services.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paginatedServices = services.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Des accompagnements lisibles, centrés sur la progression."
        description="Choisis un point de départ selon ton niveau : comprendre, pratiquer, relire ou retrouver de la régularité."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {paginatedServices.map((service, index) => (
            <article className="flex min-h-full flex-col rounded-lg border border-line bg-surface p-6" key={service.title}>
              <span className="font-mono text-xs font-black text-market">
                {String((safePage - 1) * pageSize + index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-6 text-2xl font-black leading-tight">{service.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{service.description}</p>
              <p className="mt-4 inline-flex rounded-md border border-line bg-foreground/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-muted">
                {service.priceLabel}
              </p>
              <ul className="mt-6 grid gap-3 text-sm text-muted">
                {["Cadre clair", "Risque explicite", "Suivi oriente action"].map((item) => (
                  <li className="flex items-center gap-2" key={item}>
                    <CheckCircle2 className="h-4 w-4 text-market" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {service.content ? (
                <div className="mt-6 border-t border-line pt-5">
                  <RichContent content={service.content} />
                </div>
              ) : null}
              <div className="mt-auto pt-7">
                <ButtonLink href={service.ctaUrl || "/contact"} className="w-full" showArrow>
                  {service.ctaLabel || "Demander une orientation"}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>

        <Pagination
          ariaLabel="Pagination des services"
          currentPage={safePage}
          hrefForPage={pageHref}
          pageCount={pageCount}
        />

        <div className="mt-8 rounded-lg border border-line bg-background-soft p-6 md:p-8">
          <h2 className="text-2xl font-black">Canaux directs</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Une question peut être posée par formulaire, WhatsApp ou Telegram selon le besoin.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ButtonLink className="w-full" href="/contact">Formulaire</ButtonLink>
            <ButtonLink className="w-full" href={siteConfig.whatsappPath} variant="secondary">
              WhatsApp
            </ButtonLink>
            <ButtonLink className="w-full" href={siteConfig.telegramPath} variant="secondary">
              Telegram
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
