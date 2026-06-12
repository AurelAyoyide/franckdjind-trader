import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { PageHero } from "@/components/page-hero";
import { getPublicData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Blog trading",
  description:
    "Articles de trading pour debutants et traders particuliers : routine, risk management, indices synthetiques et psychologie.",
  path: "/blog"
});

type BlogPageProps = {
  searchParams: Promise<{
    q?: string;
    categorie?: string;
    page?: string;
  }>;
};

const pageSize = 6;

function pageHref(page: number, q: string, category: string) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (category) {
    params.set("categorie", category);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { q = "", categorie = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { posts: articles, categories } = await getPublicData();
  const normalized = q.trim().toLowerCase();
  const filtered = articles.filter((article) => {
    const matchesCategory = categorie ? article.category.slug === categorie : true;
    const matchesSearch = normalized
      ? [article.title, article.excerpt, article.content, article.category.title, ...article.tags.map((tag) => tag.title)]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      : true;

    return matchesCategory && matchesSearch;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Des articles pour progresser sans confondre vitesse et maitrise."
        description="Chaque publication vise une action claire : mieux comprendre, mieux filtrer, mieux gerer le risque."
      />

      <section className="site-shell py-12 md:py-16">
        <form className="rounded-lg border border-line bg-surface p-3" action="/blog">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="min-h-12 w-full rounded-md border border-line bg-background py-2 pl-11 pr-4 text-foreground outline-none transition placeholder:text-muted-strong focus:border-market"
                defaultValue={q}
                name="q"
                placeholder="Rechercher un article, un tag, une idee..."
                type="search"
              />
            </label>
            <button className="min-h-12 cursor-pointer rounded-md bg-market px-5 text-sm font-black text-on-market transition hover:bg-market-strong" type="submit">
              Rechercher
            </button>
          </div>
        </form>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-3">
          <Link
            className={cn(
              "whitespace-nowrap rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted transition hover:border-line-strong hover:text-foreground",
              !categorie && "border-market bg-market/10 text-market"
            )}
            href={pageHref(1, q, "")}
          >
            Tous
          </Link>
          {categories.map((category) => (
            <Link
              className={cn(
                "whitespace-nowrap rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted transition hover:border-line-strong hover:text-foreground",
                categorie === category.slug && "border-market bg-market/10 text-market"
              )}
              href={pageHref(1, q, category.slug)}
              key={category.slug}
            >
              {category.title}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            {filtered.length} article{filtered.length > 1 ? "s" : ""} trouve{filtered.length > 1 ? "s" : ""}
          </p>
          {(q || categorie) ? (
            <Link className="font-semibold text-market underline-offset-4 hover:underline" href="/blog">
              Reinitialiser les filtres
            </Link>
          ) : null}
        </div>

        {paginated.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((article, index) => (
              <ArticleCard article={article} key={article.slug} priority={index === 0} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-line bg-surface p-8 text-center">
            <h2 className="text-2xl font-black">Aucun article trouve.</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Essaie un autre mot-cle ou reviens a tous les articles.
            </p>
          </div>
        )}

        {pageCount > 1 ? (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination du blog">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                className={cn(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground",
                  pageNumber === safePage && "border-market bg-market text-on-market"
                )}
                href={pageHref(pageNumber, q, categorie)}
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
