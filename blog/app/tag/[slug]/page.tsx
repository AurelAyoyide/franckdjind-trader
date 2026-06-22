import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { PageHero } from "@/components/page-hero";
import { getPublicData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

const pageSize = 6;

function pageHref(slug: string, page: number) {
  return page > 1 ? `/tag/${slug}?page=${page}` : `/tag/${slug}`;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { tags, posts } = await getPublicData();
  const tag = tags.find((entry) => entry.slug === slug);

  if (!tag) {
    return buildMetadata({ title: "Tag introuvable", noIndex: true });
  }

  return buildMetadata({
    title: tag.seoTitle || `Articles ${tag.title}`,
    description: tag.seoDescription || `Tous les articles lies au sujet ${tag.title}.`,
    path: `/tag/${tag.slug}`,
    noIndex: !posts.some((article) => article.tags.some((entry) => entry.slug === tag.slug))
  });
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { tags, posts } = await getPublicData();
  const tag = tags.find((entry) => entry.slug === slug);

  if (!tag) {
    notFound();
  }

  const tagArticles = posts.filter((article) => article.tags.some((entry) => entry.slug === tag.slug));
  const pageCount = Math.max(1, Math.ceil(tagArticles.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paginated = tagArticles.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <PageHero
        eyebrow="Tag"
        title={tag.title}
        description={`Articles et ressources autour du sujet ${tag.title}.`}
      />
      <section className="site-shell py-12 md:py-16">
        <p className="text-sm font-semibold text-muted">
          {tagArticles.length} article{tagArticles.length > 1 ? "s" : ""} lie{tagArticles.length > 1 ? "s" : ""} a ce tag
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
        {pageCount > 1 ? (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination du tag">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                className={cn(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground",
                  pageNumber === safePage && "border-market bg-market text-on-market"
                )}
                href={pageHref(tag.slug, pageNumber)}
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
