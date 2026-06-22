import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Send,
  Sparkles,
  TrendingUp,
  Clock,
  Mail,
  Search,
  CheckCircle2
} from "lucide-react";
import { submitContactAction } from "@/app/contact/actions";
import { submitTestimonialAction } from "@/app/temoignages/actions";
import { AffiliateCarousel } from "@/components/affiliate-carousel";
import { ArticleCard } from "@/components/article-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { NewsletterForm } from "@/components/newsletter-form";
import { PageHero } from "@/components/page-hero";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { RatingSelector } from "@/components/rating-selector";
import { RatingStars } from "@/components/rating-stars";
import { Reveal } from "@/components/reveal";
import { RichContent } from "@/components/rich-content";
import { SafeImage } from "@/components/safe-image";
import { HomeStructuredData } from "@/components/structured-data";
import { TestimonialsGrid } from "@/components/testimonials-grid";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig, articleJsonLd } from "@/lib/content";
import { englishArticle } from "@/lib/english-content";
import { englishCategoryLabels } from "@/lib/localization";
import { getPublicData, readData } from "@/lib/data-store";
import { escapeJsonForHtml } from "@/lib/security";
import { buildMetadata } from "@/lib/seo";
import { formatDate, cn } from "@/lib/utils";
import { notFound } from "next/navigation";

type EnglishPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string; categorie?: string; tag?: string }>;
};

export async function generateMetadata({ params }: EnglishPageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const path = slug.length ? `/en/${slug.join("/")}` : "/en";
  return buildMetadata({
    title: slug[0] === "blog" ? "Trading education blog" : "Trading education",
    description: "Trading education, risk management and responsible training resources in English.",
    path,
    noIndex: slug[0] === "recherche"
  });
}

export default async function EnglishPage({ params, searchParams }: EnglishPageProps) {
  const { slug = [] } = await params;
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const path = slug.join("/");
  const data = await getPublicData();

  if (!path) {
    return <EnglishHome data={data} status={query.status} />;
  }

  if (path === "blog") {
    return <EnglishBlog page={page} posts={data.posts} categories={data.categories} tags={data.tags} q={query.q || ""} categorie={query.categorie || ""} tag={query.tag || ""} />;
  }

  if (slug[0] === "blog" && slug[1] && slug.length === 2) {
    const article = data.posts.find((post) => post.slug === slug[1]);
    if (!article) notFound();
    return <EnglishArticlePage article={article} actionLinks={data.actionLinks} />;
  }

  if (slug[0] === "categorie" && slug[1] && slug.length === 2) {
    const category = data.categories.find((item) => item.slug === slug[1]);
    if (!category) notFound();
    return <EnglishCategoryPage category={category} articles={data.posts.filter((post) => post.category.slug === category.slug)} page={page} />;
  }

  if (slug[0] === "tag" && slug[1] && slug.length === 2) {
    const tag = data.tags.find((item) => item.slug === slug[1]);
    if (!tag) notFound();
    return <EnglishTagPage tag={tag} articles={data.posts.filter((post) => post.tags.some((item) => item.slug === tag.slug))} page={page} />;
  }

  if (path === "recherche") {
    return <EnglishSearch initialQuery={query.q || ""} posts={data.posts} page={page} />;
  }

  if (path === "a-propos") {
    const pageData = (await readData()).pages.find((entry) => entry.slug === "a-propos" && entry.status === "PUBLISHED");
    return <EnglishAbout pageData={pageData} />;
  }
  if (path === "formations") return <EnglishTraining page={page} services={data.services} />;
  if (path === "temoignages") return <EnglishTestimonials page={page} testimonials={data.testimonials} status={query.status} />;
  if (path === "contact") return <EnglishContact status={query.status} />;
  if (path === "disclaimer") return <EnglishDisclaimer />;
  if (path === "politique-confidentialite") return <EnglishPrivacy />;
  if (path === "conditions-utilisation") return <EnglishTerms />;

  notFound();
}

type PublicData = Awaited<ReturnType<typeof getPublicData>>;

const metrics = [
  { value: "01", label: "method before action" },
  { value: "02", label: "risk defined ahead" },
  { value: "03", label: "simple routine to follow" },
  { value: "04", label: "review to improve" }
];

const processData = [
  "Understand market context",
  "Prepare a plan before the signal",
  "Limit risk before reward",
  "Review every execution"
];

function EnglishHome({ data, status }: { data: PublicData; status?: string }) {
  const { posts: articles, categories, services, testimonials } = data;
  const featuredArticle = articles.find((article) => article.featured) ?? articles[0];

  return (
    <>
      <HomeStructuredData />
      <section className="relative isolate min-h-[82svh] overflow-hidden border-b border-line">
        <Image
          src={siteConfig.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,6,0.98)_0%,rgba(5,7,6,0.86)_38%,rgba(5,7,6,0.34)_75%,rgba(5,7,6,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />

        <div className="site-shell relative flex min-h-[82svh] items-center py-16">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-3 rounded-lg border border-white/18 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
                <span className="h-2 w-2 rounded-full bg-market" />
                Trading education and mentorship
              </div>
              <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
                Learn trading with method, not with noise.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 md:text-lg">
                Concrete benchmarks to prepare a session, manage risk and improve your discipline. No false promises, just an approach built to last.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/en/blog" className="w-full sm:w-auto" showArrow>
                  Read articles
                </ButtonLink>
                <ButtonLink
                  href="/en/formations"
                  className="w-full sm:w-auto"
                  variant="hero"
                >
                  Discover services
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background-soft">
        <div className="site-shell grid grid-cols-2 gap-px overflow-hidden rounded-none md:grid-cols-4">
          {metrics.map((metric) => (
            <div className="border-x border-line px-4 py-6 md:px-7" key={metric.label}>
              <p className="font-mono text-2xl font-black text-market md:text-3xl">{metric.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-shell py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
              Featured article
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
              Useful guidelines before being spectacular.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-base leading-8 text-muted">
              Each article starts from a concrete situation: preparing a scenario, re-reading a loss, understanding a session, or limiting over-trading. The goal is to decide better, not to multiply signals.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <EnglishArticleCard article={featuredArticle} isHero />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-4">
              {articles.slice(1, 4).map((article) => {
                const copy = englishArticle(article);
                return (
                  <Link
                    className="group rounded-lg border border-line bg-surface p-5 transition hover:border-line-strong hover:bg-surface-strong"
                    href={`/en/blog/${article.slug}`}
                    key={article.slug}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-market">
                      {englishCategoryLabels[article.category.slug] || article.category.title}
                    </p>
                    <h3 className="mt-3 text-lg font-black leading-snug text-balance group-hover:text-market">
                      {copy.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{copy.excerpt}</p>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-background-soft py-16 md:py-24">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan">
              Method
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
              A four-step method to stay on track.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Trading becomes more readable when decisions follow the same order: observe, prepare, risk a little, and learn from execution. This is the framework that the content and services help to install.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {processData.map((item, index) => (
              <Reveal delay={index * 0.05} key={item}>
                <div className="min-h-36 rounded-lg border border-line bg-surface p-5">
                  <span className="font-mono text-xs font-black text-amber">
                    0{index + 1}
                  </span>
                  <p className="mt-4 text-lg font-black leading-snug">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="site-shell py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
              Services
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
              Simple to understand services, not a confusing catalogue.
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/en/formations" showArrow>
                Explore
              </ButtonLink>
              <ButtonLink href="/en/contact" variant="secondary">
                Ask a question
              </ButtonLink>
            </div>
          </Reveal>
          <div className="grid gap-4">
            {services.slice(0, 3).map((service, index) => (
              <Reveal delay={index * 0.05} key={service.title}>
                <article className="rounded-lg border border-line bg-surface p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-foreground/[0.05] text-market">
                      {index === 0 ? <BookOpen className="h-5 w-5" /> : null}
                      {index === 1 ? <LineChart className="h-5 w-5" /> : null}
                      {index === 2 ? <ShieldCheck className="h-5 w-5" /> : null}
                    </span>
                    <div>
                      <h3 className="text-lg font-black">{service.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted">{service.description}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-background-soft py-16 md:py-24">
        <div className="site-shell">
          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber">
                  Categories
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
                  Entry points to the blog.
                </h2>
              </div>
              <ButtonLink href="/en/recherche" variant="secondary">
                Search
              </ButtonLink>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <Reveal delay={index * 0.04} key={category.slug}>
                <Link
                  className="group block min-h-48 rounded-lg border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-line-strong"
                  href={`/en/categorie/${category.slug}`}
                >
                  <TrendingUp className="h-5 w-5 text-market" aria-hidden="true" />
                  <h3 className="mt-6 text-xl font-black group-hover:text-market">
                    {englishCategoryLabels[category.slug] || category.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{category.description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="site-shell py-16 md:py-24">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan">
                Testimonials
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
                Precise feedback, published transparently.
              </h2>
            </div>
            <ButtonLink href="/en/temoignages" variant="secondary" className="whitespace-nowrap shrink-0">
              See reviews
            </ButtonLink>
          </div>
        </Reveal>
        {testimonials.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <Reveal delay={index * 0.05} key={testimonial.name}>
                <figure className="flex h-full min-h-72 flex-col rounded-lg border border-line bg-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
                    <RatingStars compact rating={testimonial.rating} />
                  </div>
                  <blockquote className="mt-5 flex-1 text-base font-semibold leading-8 text-pretty">
                    &quot;{testimonial.quote}&quot;
                  </blockquote>
                  <figcaption className="mt-6 border-t border-line pt-4 text-sm text-muted">
                    <span className="font-black text-foreground">{testimonial.name}</span>
                    <span className="block">{testimonial.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
            <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h3 className="mt-4 text-2xl font-black">No valid public reviews at the moment.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Testimonials are published with their author consent and can be disabled from the administration if necessary.
            </p>
            <div className="mt-6">
              <ButtonLink href="/en/temoignages#donner-avis" variant="secondary">
                Submit a review
              </ButtonLink>
            </div>
          </div>
        )}
      </section>

      <section className="site-shell pb-16 md:pb-24">
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="scanline h-px w-full" />
          <div className="grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
                Contact
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
                Need a framework before starting?
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
                Describe your level, your objective and your main roadblock. A clear request helps direct you to the right content or service.
              </p>
            </div>
            <div className="flex flex-col justify-end gap-3 sm:flex-row md:flex-col">
              <ButtonLink href="/en/contact" className="w-full" showArrow>
                Contact me
              </ButtonLink>
              <ButtonLink href={siteConfig.whatsappPath} className="w-full" variant="secondary">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <DisclaimerBanner />
        </div>
      </section>
      <NewsletterForm status={status} />
    </>
  );
}

function EnglishArticleCard({ article, isHero }: { article: PublicData["posts"][number], isHero?: boolean }) {
  if (isHero) {
    const copy = englishArticle(article);
    return (
      <ArticleCard article={{ ...article, title: copy.title, excerpt: copy.excerpt }} priority />
    );
  }
  const copy = englishArticle(article);
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-surface p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-market">{englishCategoryLabels[article.category.slug] || article.category.title}</p>
      <h2 className="mt-4 text-xl font-black leading-snug"><Link className="hover:text-market" href={`/en/blog/${article.slug}`}>{copy.title}</Link></h2>
      <p className="mt-3 text-sm leading-7 text-muted">{copy.excerpt}</p>
      <div className="mt-5 flex items-center justify-between text-xs font-semibold text-muted-strong">
        <span>{article.readTime}</span>
        <Link className="text-market hover:underline" href={`/en/blog/${article.slug}`}>Read article</Link>
      </div>
    </article>
  );
}

function EnglishBlog({ posts, categories, tags, page, q, categorie, tag }: { posts: PublicData["posts"], categories: PublicData["categories"], tags: PublicData["tags"], page: number, q: string, categorie: string, tag: string }) {
  const normalized = q.trim().toLowerCase();
  const filtered = posts.filter((article) => {
    const matchesCategory = categorie ? article.category.slug === categorie : true;
    const matchesTag = tag ? article.tags.some((articleTag) => articleTag.slug === tag) : true;
    const copy = englishArticle(article);
    const matchesSearch = normalized ? [copy.title, copy.excerpt, copy.content, article.category.title, ...article.tags.map((t) => t.title)].join(" ").toLowerCase().includes(normalized) : true;
    return matchesCategory && matchesTag && matchesSearch;
  });
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categorie) params.set("categorie", categorie);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/en/blog?${qs}` : "/en/blog";
  };
  return (
    <>
      <PageHero eyebrow="Blog" title="Articles to progress without confusing speed and mastery." description="Each publication targets a clear action: understand better, filter better, manage risk better." />
      <section className="site-shell py-12 md:py-16">
        <form className="rounded-lg border border-line bg-surface p-4" action="/en/blog">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <label className="grid gap-1 text-xs font-bold text-muted">Search<span className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input className="min-h-12 w-full rounded-md border border-line bg-background py-2 pl-11 pr-4 text-foreground outline-none transition placeholder:text-muted-strong focus:border-market" defaultValue={q} name="q" placeholder="Search an article, a tag, an idea..." type="search" /></span></label>
            <label className="grid gap-1 text-xs font-bold text-muted">Category<select className="min-h-12 rounded-md border border-line bg-background px-3 text-sm text-foreground outline-none focus:border-market" defaultValue={categorie} name="categorie"><option value="">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{englishCategoryLabels[c.slug] || c.title}</option>)}</select></label>
            <label className="grid gap-1 text-xs font-bold text-muted">Tags<select className="min-h-12 rounded-md border border-line bg-background px-3 text-sm text-foreground outline-none focus:border-market" defaultValue={tag} name="tag"><option value="">All tags</option>{tags.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}</select></label>
            <div className="grid gap-1"><span className="text-xs font-bold text-transparent" aria-hidden="true">Action</span><button className="min-h-12 cursor-pointer rounded-md bg-market px-5 text-sm font-black text-on-market transition hover:bg-market-strong" type="submit">Search</button></div>
          </div>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted md:flex-row md:items-center md:justify-between"><p>{filtered.length} article{filtered.length > 1 ? "s" : ""} found</p>{(q || categorie || tag) ? <Link className="font-semibold text-market underline-offset-4 hover:underline" href="/en/blog">Reset filters</Link> : null}</div>
        {paginated.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((a, i) => <EnglishArticleCard article={a} key={a.slug} isHero={i === 0 && safePage === 1} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-line bg-surface p-8 text-center"><h2 className="text-2xl font-black">No article found.</h2><p className="mt-3 text-sm leading-7 text-muted">Try another keyword or go back to all articles.</p></div>
        )}
        {pageCount > 1 ? <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pagination">{Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => <Link className={cn("inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground", p === safePage && "border-market bg-market text-on-market")} href={pageHref(p)} key={p}>{p}</Link>)}</nav> : null}
      </section>
    </>
  );
}

function EnglishCategoryPage({ category, articles, page }: { category: PublicData["categories"][number], articles: PublicData["posts"], page: number }) {
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(articles.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const items = articles.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageHref = (p: number) => p > 1 ? `/en/categorie/${category.slug}?page=${p}` : `/en/categorie/${category.slug}`;
  return (
    <>
      <PageHero eyebrow="Category" title={englishCategoryLabels[category.slug] || category.title} description={category.description} />
      <section className="site-shell py-12 md:py-16">
        <p className="text-sm font-semibold text-muted">{articles.length} article{articles.length > 1 ? "s" : ""} in this category</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((a) => <EnglishArticleCard article={a} key={a.slug} />)}</div>
        {pageCount > 1 ? <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Category pagination">{Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => <Link className={cn("inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground", p === safePage && "border-market bg-market text-on-market")} href={pageHref(p)} key={p}>{p}</Link>)}</nav> : null}
      </section>
    </>
  );
}

function EnglishTagPage({ tag, articles, page }: { tag: PublicData["tags"][number], articles: PublicData["posts"], page: number }) {
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(articles.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const items = articles.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageHref = (p: number) => p > 1 ? `/en/tag/${tag.slug}?page=${p}` : `/en/tag/${tag.slug}`;
  return (
    <>
      <PageHero eyebrow="Tag" title={tag.title} description={`Articles and resources around the topic ${tag.title}.`} />
      <section className="site-shell py-12 md:py-16">
        <p className="text-sm font-semibold text-muted">{articles.length} article{articles.length > 1 ? "s" : ""} linked to this tag</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((a) => <EnglishArticleCard article={a} key={a.slug} />)}</div>
        {pageCount > 1 ? <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Tag pagination">{Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => <Link className={cn("inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground", p === safePage && "border-market bg-market text-on-market")} href={pageHref(p)} key={p}>{p}</Link>)}</nav> : null}
      </section>
    </>
  );
}

function EnglishArticlePage({ article, actionLinks }: { article: PublicData["posts"][number], actionLinks: PublicData["actionLinks"] }) {
  const copy = englishArticle(article);
  const affiliateLinks = actionLinks.filter((link) => link.type === "AFFILIATE");
  const topAffiliateLinks = affiliateLinks.filter((link) => link.placement !== "ARTICLE_BOTTOM");
  const bottomAffiliateLinks = affiliateLinks.filter((link) => link.placement !== "ARTICLE_TOP");
  return (
    <>
      <article>
        {topAffiliateLinks.length ? <div className="site-shell py-5"><AffiliateCarousel links={topAffiliateLinks} title="Partners to discover" variant="banner" /></div> : null}
        <header className="border-b border-line bg-background-soft">
          <div className="site-shell py-10 md:py-16">
            <Link className="text-sm font-semibold text-market underline-offset-4 hover:underline" href={`/en/categorie/${article.category.slug}`}>{englishCategoryLabels[article.category.slug] || article.category.title}</Link>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-balance md:text-6xl">{copy.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted md:text-lg">{copy.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-strong"><span>{formatDate(article.publishedAt)}</span><span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{article.readTime}</span><span>{article.author}</span></div>
          </div>
          <div className="site-shell pb-8 md:pb-12">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-surface">
              <SafeImage src={article.image} alt="" fill priority sizes="(min-width: 1180px) 1180px, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>
          </div>
        </header>

        <div className="site-shell grid gap-10 py-12 md:grid-cols-[minmax(0,760px)_280px] md:py-16">
          <div><DisclaimerBanner /><div className="mt-10"><RichContent content={copy.content} /></div></div>
          <aside className="md:sticky md:top-28 md:self-start">
            <div className="rounded-lg border border-line bg-surface p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-market">Explore</p><div className="mt-5 flex flex-wrap gap-2">{article.tags.map((tag) => <Link className="rounded-md bg-foreground/[0.06] px-3 py-2 text-xs font-bold text-muted hover:text-foreground" href={`/en/tag/${tag.slug}`} key={tag.slug}>{tag.title}</Link>)}</div><div className="mt-6 grid gap-3"><ButtonLink href="/en/contact" showArrow>Ask a question</ButtonLink><ButtonLink href="/en/formations" variant="secondary">View services</ButtonLink></div></div>
          </aside>
        </div>
        {bottomAffiliateLinks.length ? <div className="site-shell pb-12 md:pb-16"><AffiliateCarousel links={bottomAffiliateLinks} title="Partners to discover" variant="banner" /></div> : null}
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonForHtml(articleJsonLd({ ...article, title: copy.title, excerpt: copy.excerpt })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonForHtml({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "/en" }, { "@type": "ListItem", position: 2, name: "Blog", item: "/en/blog" }, { "@type": "ListItem", position: 3, name: englishCategoryLabels[article.category.slug] || article.category.title, item: `/en/categorie/${article.category.slug}` }, { "@type": "ListItem", position: 4, name: copy.title, item: `/en/blog/${article.slug}` }] }) }} />
    </>
  );
}

function EnglishSearch({ initialQuery, posts, page }: { initialQuery: string; posts: PublicData["posts"]; page: number }) {
  const normalized = initialQuery.trim().toLowerCase();
  const results = normalized
    ? posts.filter((article) => {
      const copy = englishArticle(article);
      return [copy.title, copy.excerpt, copy.content, article.category.title, ...article.tags.map((t) => t.title)].join(" ").toLowerCase().includes(normalized);
    })
    : posts;

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const items = results.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (initialQuery) params.set("q", initialQuery);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/en/recherche?${qs}` : "/en/recherche";
  };
  return <><PageHero eyebrow="Search" title="Find the right content quickly." description="A simple search to find articles by topic, category or intention." /><section className="site-shell py-12 md:py-16"><form className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row" action="/en/recherche"><input className="min-h-12 flex-1 rounded-md border border-line bg-background px-4 text-base outline-none transition placeholder:text-muted-strong focus:border-market" defaultValue={initialQuery} name="q" placeholder="Risk management, routine, volatility..." type="search" /><button className="min-h-12 rounded-md bg-market px-5 text-sm font-black text-on-market transition hover:bg-market-strong" type="submit">Search</button></form><div className="mt-6 flex flex-col gap-2 text-sm text-muted md:flex-row md:items-center md:justify-between"><p className="font-semibold">{results.length} result{results.length > 1 ? "s" : ""}</p>{initialQuery ? <Link className="font-semibold text-market underline-offset-4 hover:underline" href="/en/recherche">Reset search</Link> : null}</div>
    {items.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((post) => <EnglishArticleCard article={post} key={post.slug} />)}</div> : <div className="mt-8 rounded-lg border border-line bg-surface p-8 text-center"><h2 className="text-2xl font-black">No result.</h2><p className="mt-3 text-sm leading-7 text-muted">Try another keyword or view all articles.</p></div>}
    {pageCount > 1 ? <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Search pagination">{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <Link className={cn("inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground", pageNumber === safePage && "border-market bg-market text-on-market")} href={pageHref(pageNumber)} key={pageNumber}>{pageNumber}</Link>)}</nav> : null}
  </section></>;
}

function EnglishAbout({ pageData }: { pageData?: Awaited<ReturnType<typeof readData>>["pages"][number] }) {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Learn, practice, protect capital."
        description="Bono Trading privileges a clear methodology: understand the context, prepare your decisions, and progress without unrealistic promises."
      />
      <section className="site-shell grid gap-10 py-12 md:grid-cols-[0.9fr_1.1fr] md:py-16">
        <div className="rounded-lg border border-line bg-surface p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
            Principles
          </p>
          <ul className="mt-6 grid gap-4 text-base leading-8 text-muted">
            <li>Transmit a method before talking about results.</li>
            <li>Make risk visible before potential reward.</li>
            <li>Talk to beginners without oversimplifying the market.</li>
            <li>Build a community around repetition and feedback.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl font-black leading-tight md:text-5xl">
            An approach built to last.
          </h2>
          <p className="mt-6 text-base leading-8 text-muted md:text-lg">
            The content is aimed at those who want to learn to structure their trading decisions. The goal is to install good habits: prepare, execute carefully, log, and adjust. Each journey must remain adapted to the level, the time available, and the risk tolerance of each individual.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/en/blog" showArrow>
              Explore the blog
            </ButtonLink>
            <ButtonLink href="/en/contact" variant="secondary">
              Contact
            </ButtonLink>
          </div>
          {pageData?.content ? (
            <div className="mt-10 rounded-lg border border-line bg-surface p-6">
              <RichContent content={pageData.content} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

function EnglishTraining({ services, page }: { services: PublicData["services"]; page: number }) {
  const pageSize = 3;
  const pageCount = Math.max(1, Math.ceil(services.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const items = services.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Clear mentoring, focused on progression."
        description="Choose a starting point according to your level: understand, practice, review or regain consistency."
      />
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((service, index) => (
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
                {["Clear framework", "Explicit risk", "Action-oriented follow-up"].map((item) => (
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
                <ButtonLink href={`/en${service.ctaUrl || "/contact"}`} className="w-full" showArrow>
                  {service.ctaLabel ? service.ctaLabel : "Ask for orientation"}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>

        {pageCount > 1 ? (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Services pagination">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => {
              const href = pageNumber > 1 ? `/en/formations?page=${pageNumber}` : "/en/formations";
              return (
                <Link
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line px-3 text-sm font-black transition ${pageNumber === safePage ? "border-market bg-market text-on-market" : "bg-surface text-muted hover:border-line-strong hover:text-foreground"}`}
                  href={href}
                  key={pageNumber}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <div className="mt-8 rounded-lg border border-line bg-background-soft p-6 md:p-8">
          <h2 className="text-2xl font-black">Direct channels</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            A question can be asked via form, WhatsApp or Telegram depending on your need.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ButtonLink className="w-full" href="/en/contact">Form</ButtonLink>
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

function EnglishTestimonials({ testimonials, page, status }: { testimonials: PublicData["testimonials"]; page: number; status?: string }) {
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(testimonials.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const items = testimonials.slice((safePage - 1) * pageSize, safePage * pageSize);
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="Feedback focused on clarity, not spectacle."
        description="Credibility is built with sober, useful feedback consistent with an educational positioning."
      />
      <section className="site-shell py-12 md:py-16">
        {testimonials.length ? (
          <TestimonialsGrid testimonials={items} />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
            <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black">No valid public testimonials for the moment.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Submitted reviews remain invisible until they are approved in the administration.
            </p>
          </div>
        )}
        {pageCount > 1 ? (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Testimonials pagination">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => {
              const href = pageNumber > 1 ? `/en/temoignages?page=${pageNumber}` : "/en/temoignages";
              return (
                <Link
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line px-3 text-sm font-black transition ${pageNumber === safePage ? "border-market bg-market text-on-market" : "bg-surface text-muted hover:border-line-strong hover:text-foreground"}`}
                  href={href}
                  key={pageNumber}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </section>
      <section id="donner-avis" className="site-shell pb-16 md:pb-24">
        <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
            Give a review
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight text-balance">
            Propose a testimonial.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Your review is evaluated and verified. It remains identifiable in the administration and can be deactivated at any time if necessary.
          </p>
          {status === "sent" ? (
            <p className="mt-5 rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">
              Review received and published. Thank you for your feedback.
            </p>
          ) : null}
          {status === "invalid" ? (
            <p className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              Please fill the form correctly.
            </p>
          ) : null}
          <form action={submitTestimonialAction} className="mt-6 grid gap-4">
            <input aria-hidden="true" autoComplete="off" className="hidden" name="website" tabIndex={-1} type="text" />
            <input type="hidden" name="locale" value="en" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="name" placeholder="Name" required />
              <select className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" defaultValue="Learner" name="role">
                <option>Learner</option>
                <option>Community member</option>
                <option>Training client</option>
                <option>Mentoring client</option>
              </select>
            </div>
            <RatingSelector />
            <textarea className="min-h-36 rounded-md border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-market" name="quote" placeholder="Your experience..." required />
            <PendingSubmitButton className="min-h-12 rounded-md bg-market text-on-market hover:bg-market-strong" pendingLabel="Sending...">
              Send review
            </PendingSubmitButton>
          </form>
        </div>
      </section>
    </>
  );
}

function EnglishContact({ status }: { status?: string }) {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="A question, need for a framework, a training to clarify."
        description="The form is designed to go straight to the point: current level, objective, and main roadblock."
      />
      <section className="site-shell grid gap-8 py-12 md:grid-cols-[1fr_0.8fr] md:py-16">
        <form action={submitContactAction} className="rounded-lg border border-line bg-surface p-5 md:p-6">
          {status === "sent" ? (
            <p className="mb-5 rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">
              Message sent. A response will be provided via the given contact details.
            </p>
          ) : null}
          {status === "saved-email-error" ? (
            <p className="mb-5 rounded-md border border-amber/30 bg-amber/10 px-3 py-2 text-sm font-semibold text-amber" role="status">
              Your message was saved, but the email notification could not be sent. The team can see it in the administration area; please try again later or use WhatsApp.
            </p>
          ) : null}
          {status === "invalid" ? (
            <p className="mb-5 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              Please check the form fields.
            </p>
          ) : null}
          {status === "limited" ? (
            <p className="mb-5 rounded-md border border-amber/30 bg-amber/10 px-3 py-2 text-sm font-semibold text-amber">
              Too many messages sent recently. Please try again later.
            </p>
          ) : null}
          <input name="locale" type="hidden" value="en" />
          <input autoComplete="off" className="hidden" name="website" tabIndex={-1} type="text" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Name
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market" name="name" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Email
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market" name="email" required type="email" />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-muted">
            Subject
            <select className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market" name="subject" required>
              <option>Training</option>
              <option>Mentorship</option>
              <option>Partnership</option>
              <option>Other request</option>
            </select>
          </label>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-muted">
            Message
            <textarea className="min-h-40 rounded-md border border-line bg-background px-4 py-3 text-foreground outline-none transition focus:border-market" minLength={10} name="message" required />
          </label>
          <PendingSubmitButton className="mt-5 w-full rounded-md bg-market text-on-market hover:bg-market-strong" pendingLabel="Sending...">
            <Send className="mr-2 inline h-4 w-4" aria-hidden="true" />
            Send message
          </PendingSubmitButton>
        </form>

        <aside className="grid gap-4 self-start">
          <div className="rounded-lg border border-line bg-surface p-5">
            <MessageCircle className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">Quick channels</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              For a short question, WhatsApp or Telegram may be faster than the contact form.
            </p>
            <div className="mt-5 grid gap-3">
              <ButtonLink href={siteConfig.whatsappPath}>WhatsApp</ButtonLink>
              <ButtonLink href={siteConfig.telegramPath} variant="secondary">
                Telegram
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-line bg-background-soft p-5">
            <Mail className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">Email</h2>
            <a className="mt-3 block text-sm leading-7 text-muted underline-offset-4 hover:text-foreground hover:underline" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
          </div>
        </aside>
      </section>
    </>
  );
}

function StaticEnglishPage({ eyebrow, title, sections }: { eyebrow: string; title: string; sections: Array<[string, string]> }) { return <><PageHero eyebrow={eyebrow} title={title} description={sections[0]?.[1] || ""} /><section className="site-shell max-w-4xl space-y-8 py-12 text-base leading-8 text-muted md:py-16">{sections.map(([heading, text]) => <section key={heading}><h2 className="text-2xl font-black text-foreground">{heading}</h2><p className="mt-3">{text}</p></section>)}</section></>; }
function EnglishDisclaimer() { return <StaticEnglishPage eyebrow="Disclaimer" title="Trading involves a real risk of capital loss." sections={[["Educational content", "Articles, services and examples are educational. They are not personalised financial, legal or tax advice."], ["No promise of results", "Past, simulated or individual performance never guarantees future results. Outcomes depend on markets, capital, costs, experience and the ability to follow a plan."], ["Your decisions", "Assess your knowledge, financial situation and risk tolerance before acting. Never trade money you need for essential expenses."], ["Affiliate disclosure", "Some links may be affiliate links. Their terms, fees and availability belong to the relevant third party and should be checked before use."]]} />; }
function EnglishPrivacy() { return <StaticEnglishPage eyebrow="Privacy" title="Only useful data should be collected and protected." sections={[["Data collected", "The contact form may collect your name, email address, subject and message in order to respond to your request."], ["Purpose", "Data is used to answer requests, administer authorised accounts, prevent abuse and manage newsletter subscriptions when consent has been provided. It is never sold."], ["Retention and security", "Messages are retained for a reasonable period and technical logs may be kept to protect forms and investigate errors. Access is limited to authorised people and necessary technical providers."], ["Your rights", "You can ask to access, correct or delete your data through the contact form by identifying the email address concerned."]]} />; }
function EnglishTerms() { return <StaticEnglishPage eyebrow="Terms" title="A clear framework for using this site and its content." sections={[["Use of content", "Content is provided for information and education. Commercial reuse requires prior permission."], ["Responsible use", "Visitors must not interfere with the site, bypass protections, submit misleading information or use forms for spam. Administration access is reserved for authorised accounts."], ["Liability", "Visitors remain responsible for their trading decisions, risk management and the suitability of information for their own circumstances."], ["External links", "External destinations are provided for convenience. Users should review their terms and risks before acting."], ["Updates", "These terms may change to reflect changes to the service, security or applicable obligations. The version published on this page applies."]]} />; }


