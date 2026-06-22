import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { PageHero } from "@/components/page-hero";
import { getPublicData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

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
  const { posts } = await getPublicData();
  const normalized = q.trim().toLowerCase();
  const results = normalized
    ? posts.filter((article) =>
        [article.title, article.excerpt, article.content, article.category.title, ...article.tags.map((tag) => tag.title)]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
    : posts;
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paginated = results.slice((safePage - 1) * pageSize, safePage * pageSize);

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
            {results.length} resultat{results.length > 1 ? "s" : ""}
          </p>
          {q ? (
            <Link className="font-semibold text-market underline-offset-4 hover:underline" href="/recherche">
              Reinitialiser la recherche
            </Link>
          ) : null}
        </div>

        {paginated.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((article) => (
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

        {pageCount > 1 ? (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination de la recherche">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                className={cn(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground",
                  pageNumber === safePage && "border-market bg-market text-on-market"
                )}
                href={pageHref(pageNumber, q)}
                key={pageNumber}
              >
                {pageNumber}
              </Link>
            ))}
          </nav>
        ) : null}
      </section>
    </>
  );
}
