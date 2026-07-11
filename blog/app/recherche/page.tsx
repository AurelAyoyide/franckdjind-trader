import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";
import { PageHero } from "@/components/page-hero";
import { getPublicSearchListing } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

const pageSize = 6;

function pageHref(page: number, q: string) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/recherche?${query}` : "/recherche";
}

export const metadata: Metadata = buildMetadata({
  title: "Recherche",
  description: "Rechercher un article de trading par theme, categorie ou mot-cle.",
  path: "/recherche",
  noIndex: true
});

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { posts, total, pageCount, safePage } = await getPublicSearchListing({
    q,
    page: currentPage,
    pageSize
  });

  return (
    <>
      <PageHero
        eyebrow="Recherche"
        title="Trouver rapidement le bon contenu."
        description="Une recherche simple pour retrouver les articles par sujet, categorie ou intention."
      />
      <section className="site-shell py-12 md:py-16">
        <form className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row" action="/recherche">
          <input
            className="min-h-12 flex-1 rounded-md border border-line bg-background px-4 text-base outline-none transition placeholder:text-muted-strong focus:border-market"
            defaultValue={q}
            name="q"
            placeholder="Risk management, routine, volatilite..."
            type="search"
          />
          <button className="min-h-12 rounded-md bg-market px-5 text-sm font-black text-on-market transition hover:bg-market-strong" type="submit">
            Rechercher
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">
            {total} resultat{total > 1 ? "s" : ""}
          </p>
          {q ? (
            <Link className="font-semibold text-market underline-offset-4 hover:underline" href="/recherche">
              Reinitialiser la recherche
            </Link>
          ) : null}
        </div>

        {posts.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-line bg-surface p-8 text-center">
            <h2 className="text-2xl font-black">Aucun resultat.</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Essaie un autre mot-cle ou consulte tous les articles.
            </p>
          </div>
        )}

        <Pagination
          ariaLabel="Pagination de la recherche"
          currentPage={safePage}
          hrefForPage={(pageNumber) => pageHref(pageNumber, q)}
          pageCount={pageCount}
        />
      </section>
    </>
  );
}
