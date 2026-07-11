import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";
import { PageHero } from "@/components/page-hero";
import { getPublicTagListing, getPublicTagSummary } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

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
  const tag = await getPublicTagSummary(slug);

  if (!tag) {
    return buildMetadata({ title: "Tag introuvable", noIndex: true });
  }

  return buildMetadata({
    title: tag.seoTitle || `Articles ${tag.title}`,
    description: tag.seoDescription || `Tous les articles lies au sujet ${tag.title}.`,
    path: `/tag/${tag.slug}`,
    noIndex: tag.postCount === 0
  });
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { tag, posts, total, pageCount, safePage } = await getPublicTagListing({
    slug,
    page: currentPage,
    pageSize
  });

  if (!tag) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow="Tag"
        title={tag.title}
        description={`Articles et ressources autour du sujet ${tag.title}.`}
        />
      <section className="site-shell py-12 md:py-16">
        <p className="text-sm font-semibold text-muted">
          {total} article{total > 1 ? "s" : ""} lie{total > 1 ? "s" : ""} a ce tag
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
        <Pagination
          ariaLabel="Pagination du tag"
          currentPage={safePage}
          hrefForPage={(pageNumber) => pageHref(tag.slug, pageNumber)}
          pageCount={pageCount}
        />
      </section>
    </>
  );
}
