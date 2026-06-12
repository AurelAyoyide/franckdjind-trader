import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { PageHero } from "@/components/page-hero";
import { getPublicData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

const pageSize = 6;

function pageHref(slug: string, page: number) {
  return page > 1 ? `/categorie/${slug}?page=${page}` : `/categorie/${slug}`;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getPublicData();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) {
    return buildMetadata({ title: "Categorie introuvable", noIndex: true });
  }

  return buildMetadata({
    title: category.seoTitle || category.title,
    description: category.seoDescription || category.description,
    path: `/categorie/${category.slug}`
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { categories, posts } = await getPublicData();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryArticles = posts.filter((article) => article.category.slug === category.slug);
  const pageCount = Math.max(1, Math.ceil(categoryArticles.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paginated = categoryArticles.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <PageHero eyebrow="Categorie" title={category.title} description={category.description} />
      <section className="site-shell py-12 md:py-16">
        <p className="text-sm font-semibold text-muted">
          {categoryArticles.length} article{categoryArticles.length > 1 ? "s" : ""} dans cette categorie
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
        {pageCount > 1 ? (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination de la categorie">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                className={cn(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground",
                  pageNumber === safePage && "border-market bg-market text-on-market"
                )}
                href={pageHref(category.slug, pageNumber)}
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
