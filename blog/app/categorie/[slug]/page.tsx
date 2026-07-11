import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";
import { PageHero } from "@/components/page-hero";
import { getPublicCategoryListing, getPublicCategorySummary } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

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
  const category = await getPublicCategorySummary(slug);

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
  const { category, posts, total, pageCount, safePage } = await getPublicCategoryListing({
    slug,
    page: currentPage,
    pageSize
  });

  if (!category) {
    notFound();
  }

  return (
    <>
      <PageHero eyebrow="Categorie" title={category.title} description={category.description} />
      <section className="site-shell py-12 md:py-16">
        <p className="text-sm font-semibold text-muted">
          {total} article{total > 1 ? "s" : ""} dans cette categorie
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
        <Pagination
          ariaLabel="Pagination de la categorie"
          currentPage={safePage}
          hrefForPage={(pageNumber) => pageHref(category.slug, pageNumber)}
          pageCount={pageCount}
        />
      </section>
    </>
  );
}
