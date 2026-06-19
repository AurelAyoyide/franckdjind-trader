import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import { AffiliateCarousel } from "@/components/affiliate-carousel";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { RichContent } from "@/components/rich-content";
import { SafeImage } from "@/components/safe-image";
import { ButtonLink } from "@/components/ui/button-link";
import { articleJsonLd } from "@/lib/content";
import { getPublicData } from "@/lib/data-store";
import { escapeJsonForHtml } from "@/lib/security";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const { posts } = await getPublicData();

  return posts.map((article) => ({
    slug: article.slug
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { posts } = await getPublicData();
  const article = posts.find((entry) => entry.slug === slug);

  if (!article) {
    return buildMetadata({
      title: "Article introuvable",
      path: `/blog/${slug}`,
      noIndex: true
    });
  }

  return buildMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    path: `/blog/${article.slug}`,
    image: article.image,
    noIndex: !article.robotsIndex
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { posts, actionLinks } = await getPublicData();
  const article = posts.find((entry) => entry.slug === slug);

  if (!article) {
    notFound();
  }

  const affiliateLinks = actionLinks.filter((link) => link.type === "AFFILIATE");
  const topAffiliateLinks = affiliateLinks.filter((link) => link.placement !== "ARTICLE_BOTTOM");
  const bottomAffiliateLinks = affiliateLinks.filter((link) => link.placement !== "ARTICLE_TOP");

  return (
    <>
      <article>
        <header className="border-b border-line bg-background-soft">
          <div className="site-shell py-10 md:py-16">
            <Link
              className="text-sm font-semibold text-market underline-offset-4 hover:underline"
              href={`/categorie/${article.category.slug}`}
            >
              {article.category.title}
            </Link>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-balance md:text-6xl">
              {article.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted md:text-lg">
              {article.excerpt}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-strong">
              <span>{formatDate(article.publishedAt)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {article.readTime}
              </span>
              <span>{article.author}</span>
            </div>
          </div>
          <div className="site-shell pb-8 md:pb-12">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-surface">
              <SafeImage
                src={article.image}
                alt=""
                fill
                priority
                sizes="(min-width: 1180px) 1180px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/55 to-transparent" />
            </div>
          </div>
        </header>

        <div className="site-shell grid gap-10 py-12 md:grid-cols-[minmax(0,760px)_280px] md:py-16">
          <div>
            <DisclaimerBanner />
            <div className="mt-6">
              <AffiliateCarousel links={topAffiliateLinks} title="Brokers partenaires a comparer" />
            </div>
            <div className="mt-10">
              <RichContent content={article.content} />
            </div>
            <div className="mt-10">
              <AffiliateCarousel links={bottomAffiliateLinks} title="Passer a l'action avec un partenaire" />
            </div>
          </div>

          <aside className="md:sticky md:top-28 md:self-start">
            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-market">
                Explorer
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    className="rounded-md bg-foreground/[0.06] px-3 py-2 text-xs font-bold text-muted hover:text-foreground"
                    href={`/tag/${tag.slug}`}
                    key={tag.slug}
                  >
                    {tag.title}
                  </Link>
                ))}
              </div>
              <div className="mt-6 grid gap-3">
                <ButtonLink href="/contact" showArrow>
                  Poser une question
                </ButtonLink>
                <ButtonLink href="/formations" variant="secondary">
                  Voir les formations
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonForHtml(articleJsonLd(article))
        }}
      />
    </>
  );
}
