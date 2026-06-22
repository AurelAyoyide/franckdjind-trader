import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, Search } from "lucide-react";
import { submitContactAction } from "@/app/contact/actions";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { PageHero } from "@/components/page-hero";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { RatingStars } from "@/components/rating-stars";
import { RichContent } from "@/components/rich-content";
import { ButtonLink } from "@/components/ui/button-link";
import { englishArticle } from "@/lib/english-content";
import { englishCategoryLabels } from "@/lib/localization";
import { getPublicData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

type EnglishPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
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
    return <EnglishHome data={data} />;
  }

  if (path === "blog") {
    return <EnglishBlog page={page} posts={data.posts} />;
  }

  if (slug[0] === "blog" && slug[1] && slug.length === 2) {
    const article = data.posts.find((post) => post.slug === slug[1]);
    if (!article) notFound();
    return <EnglishArticlePage article={article} />;
  }

  if (slug[0] === "categorie" && slug[1] && slug.length === 2) {
    const category = data.categories.find((item) => item.slug === slug[1]);
    if (!category) notFound();
    const posts = data.posts.filter((post) => post.category.slug === category.slug);
    return <EnglishListing basePath={`/en/categorie/${category.slug}`} description={category.description} page={page} posts={posts} title={englishCategoryLabels[category.slug] || category.title} />;
  }

  if (slug[0] === "tag" && slug[1] && slug.length === 2) {
    const tag = data.tags.find((item) => item.slug === slug[1]);
    if (!tag) notFound();
    const posts = data.posts.filter((post) => post.tags.some((item) => item.slug === tag.slug));
    return <EnglishListing basePath={`/en/tag/${tag.slug}`} description={`Articles and resources related to ${tag.title}.`} page={page} posts={posts} title={tag.title} />;
  }

  if (path === "recherche") {
    const term = (query.q || "").trim().toLowerCase();
    const posts = term
      ? data.posts.filter((post) => {
          const copy = englishArticle(post);
          return [copy.title, copy.excerpt, copy.content, post.category.title, ...post.tags.map((tag) => tag.title)]
            .join(" ")
            .toLowerCase()
            .includes(term);
        })
      : data.posts;
    return <EnglishSearch initialQuery={query.q || ""} page={page} posts={posts} />;
  }

  if (path === "a-propos") return <EnglishAbout />;
  if (path === "formations") return <EnglishTraining page={page} services={data.services} />;
  if (path === "temoignages") return <EnglishTestimonials page={page} testimonials={data.testimonials} />;
  if (path === "contact") return <EnglishContact status={query.status} />;
  if (path === "disclaimer") return <EnglishDisclaimer />;
  if (path === "politique-confidentialite") return <EnglishPrivacy />;
  if (path === "conditions-utilisation") return <EnglishTerms />;

  notFound();
}

type PublicData = Awaited<ReturnType<typeof getPublicData>>;

function EnglishHome({ data }: { data: PublicData }) {
  return (
    <>
      <PageHero eyebrow="Trading education" title="Learn trading with a method, not with noise." description="Articles, routines, risk management and services designed for steady, responsible progress." />
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <ValueCard title="Understand first" text="Read market context before looking for an entry." />
          <ValueCard title="Protect capital" text="Risk is visible before any potential reward." />
          <ValueCard title="Improve through routine" text="Review decisions and build habits that can be repeated." />
        </div>
        <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-3xl font-black">Latest articles</h2><p className="mt-2 text-muted">Clear resources for a more disciplined practice.</p></div>
          <ButtonLink href="/en/blog" showArrow>Read the blog</ButtonLink>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.slice(0, 3).map((post) => <EnglishArticleCard article={post} key={post.slug} />)}
        </div>
      </section>
    </>
  );
}

function EnglishBlog({ posts, page }: { posts: PublicData["posts"]; page: number }) {
  return <EnglishListing basePath="/en/blog" title="Trading education blog" description="Practical articles on trading routines, risk management and decision-making." page={page} posts={posts} />;
}

function EnglishListing({ title, description, posts, page, basePath }: { title: string; description: string; posts: PublicData["posts"]; page: number; basePath: string }) {
  const { items, pageCount, safePage } = paginate(posts, page);
  return (
    <>
      <PageHero eyebrow="Blog" title={title} description={description} />
      <section className="site-shell py-12 md:py-16"><p className="text-sm font-semibold text-muted">{posts.length} article{posts.length === 1 ? "" : "s"}</p><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((post) => <EnglishArticleCard article={post} key={post.slug} />)}</div><EnglishPagination basePath={basePath} pageCount={pageCount} safePage={safePage} /></section>
    </>
  );
}

function EnglishArticlePage({ article }: { article: PublicData["posts"][number] }) {
  const copy = englishArticle(article);
  return (
    <article>
      <header className="border-b border-line bg-background-soft"><div className="site-shell py-10 md:py-16"><Link className="text-sm font-semibold text-market underline-offset-4 hover:underline" href={`/en/categorie/${article.category.slug}`}>{englishCategoryLabels[article.category.slug] || article.category.title}</Link><h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-balance md:text-6xl">{copy.title}</h1><p className="mt-6 max-w-3xl text-base leading-8 text-muted md:text-lg">{copy.excerpt}</p><div className="mt-7 flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-strong"><span>{formatDate(article.publishedAt)}</span><span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{article.readTime}</span><span>{article.author}</span></div></div></header>
      <div className="site-shell grid gap-10 py-12 md:grid-cols-[minmax(0,760px)_280px] md:py-16"><div><DisclaimerBanner /><div className="mt-10"><RichContent content={copy.content} /></div></div><aside className="md:sticky md:top-28 md:self-start"><div className="rounded-lg border border-line bg-surface p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-market">Explore</p><div className="mt-5 flex flex-wrap gap-2">{article.tags.map((tag) => <Link className="rounded-md bg-foreground/[0.06] px-3 py-2 text-xs font-bold text-muted hover:text-foreground" href={`/en/tag/${tag.slug}`} key={tag.slug}>{tag.title}</Link>)}</div><div className="mt-6 grid gap-3"><ButtonLink href="/en/contact" showArrow>Ask a question</ButtonLink><ButtonLink href="/en/formations" variant="secondary">View services</ButtonLink></div></div></aside></div>
    </article>
  );
}

function EnglishSearch({ initialQuery, posts, page }: { initialQuery: string; posts: PublicData["posts"]; page: number }) {
  const { items, pageCount, safePage } = paginate(posts, page);
  const basePath = initialQuery ? `/en/recherche?q=${encodeURIComponent(initialQuery)}` : "/en/recherche";
  return <><PageHero eyebrow="Search" title="Find the right resource." description="Search the blog by topic, category or keyword." /><section className="site-shell py-12 md:py-16"><form className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row" action="/en/recherche"><input className="min-h-12 flex-1 rounded-md border border-line bg-background px-4 text-base outline-none focus:border-market" defaultValue={initialQuery} name="q" placeholder="Risk management, routine, volatility..." type="search" /><button className="min-h-12 rounded-md bg-market px-5 text-sm font-black text-on-market" type="submit"><Search className="mr-2 inline h-4 w-4" />Search</button></form><p className="mt-6 text-sm font-semibold text-muted">{posts.length} result{posts.length === 1 ? "" : "s"}</p><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((post) => <EnglishArticleCard article={post} key={post.slug} />)}</div><EnglishPagination basePath={basePath} pageCount={pageCount} safePage={safePage} /></section></>;
}

function EnglishAbout() { return <StaticEnglishPage eyebrow="About" title="Learn, practise, protect capital." sections={[["A measured approach", "This project is built around method, discipline and risk management rather than unrealistic promises."], ["Why teach beginners", "Clear explanations, repeatable routines and honest risk discussions help new traders make more thoughtful decisions."], ["Next step", "Read an article, explore the training paths or get in touch for practical orientation."]]} />; }
function EnglishDisclaimer() { return <StaticEnglishPage eyebrow="Disclaimer" title="Trading involves a real risk of capital loss." sections={[["Educational content", "Articles, services and examples are educational. They are not personalised financial, legal or tax advice."], ["No promise of results", "Past, simulated or individual performance never guarantees future results. Outcomes depend on markets, capital, costs, experience and the ability to follow a plan."], ["Your decisions", "Assess your knowledge, financial situation and risk tolerance before acting. Never trade money you need for essential expenses."], ["Affiliate disclosure", "Some links may be affiliate links. Their terms, fees and availability belong to the relevant third party and should be checked before use."]]} />; }
function EnglishPrivacy() { return <StaticEnglishPage eyebrow="Privacy" title="Only useful data should be collected and protected." sections={[["Data collected", "The contact form may collect your name, email address, subject and message in order to respond to your request."], ["Purpose", "Data is used to answer requests, administer authorised accounts, prevent abuse and manage newsletter subscriptions when consent has been provided. It is never sold."], ["Retention and security", "Messages are retained for a reasonable period and technical logs may be kept to protect forms and investigate errors. Access is limited to authorised people and necessary technical providers."], ["Your rights", "You can ask to access, correct or delete your data through the contact form by identifying the email address concerned."]]} />; }
function EnglishTerms() { return <StaticEnglishPage eyebrow="Terms" title="A clear framework for using this site and its content." sections={[["Use of content", "Content is provided for information and education. Commercial reuse requires prior permission."], ["Responsible use", "Visitors must not interfere with the site, bypass protections, submit misleading information or use forms for spam. Administration access is reserved for authorised accounts."], ["Liability", "Visitors remain responsible for their trading decisions, risk management and the suitability of information for their own circumstances."], ["External links", "External destinations are provided for convenience. Users should review their terms and risks before acting."], ["Updates", "These terms may change to reflect changes to the service, security or applicable obligations. The version published on this page applies."]]} />; }

function EnglishTraining({ services, page }: { services: PublicData["services"]; page: number }) { const { items, pageCount, safePage } = paginate(services, page); return <><PageHero eyebrow="Services" title="Clear learning paths for steady progress." description="Choose an approach that matches your level: understand, practise, review." /><section className="site-shell py-12 md:py-16"><div className="grid gap-5 lg:grid-cols-3">{items.map((service, index) => <article className="flex min-h-full flex-col rounded-lg border border-line bg-surface p-6" key={service.id}><span className="font-mono text-xs font-black text-market">{String((safePage - 1) * 3 + index + 1).padStart(2, "0")}</span><h2 className="mt-6 text-2xl font-black">{service.title}</h2><p className="mt-4 flex-1 text-sm leading-7 text-muted">{service.description}</p><div className="mt-7"><ButtonLink href="/en/contact" className="w-full" showArrow>Ask for information</ButtonLink></div></article>)}</div><EnglishPagination basePath="/en/formations" pageCount={pageCount} safePage={safePage} /></section></>; }

function EnglishTestimonials({ testimonials, page }: { testimonials: PublicData["testimonials"]; page: number }) { const { items, pageCount, safePage } = paginate(testimonials, page); return <><PageHero eyebrow="Testimonials" title="Feedback focused on clarity, not spectacle." description="Testimonials submitted through the site are published immediately and can be disabled from the admin area when needed." /><section className="site-shell py-12 md:py-16">{testimonials.length ? <><div className="grid gap-5 md:grid-cols-3">{items.map((testimonial) => <figure className="flex min-h-72 flex-col rounded-lg border border-line bg-surface p-6" key={testimonial.id}><RatingStars compact rating={testimonial.rating} /><blockquote className="mt-5 flex-1 text-base font-semibold leading-8">&quot;{testimonial.quote}&quot;</blockquote><figcaption className="mt-6 border-t border-line pt-4 text-sm text-muted"><span className="font-black text-foreground">{testimonial.name}</span><span className="block">{testimonial.role}</span></figcaption></figure>)}</div><EnglishPagination basePath="/en/temoignages" pageCount={pageCount} safePage={safePage} /></> : <p className="rounded-lg border border-line bg-surface p-6 text-muted">No approved testimonial is available yet.</p>}</section></>; }

function EnglishContact({ status }: { status?: string }) { return <><PageHero eyebrow="Contact" title="Start with a clear question." description="Share your situation and we will point you towards the most relevant next step." /><section className="site-shell max-w-3xl py-12 md:py-16">{status === "sent" ? <p className="mb-6 rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">Your message has been received.</p> : null}<form action={submitContactAction} className="grid gap-4 rounded-lg border border-line bg-surface p-6"><input name="locale" type="hidden" value="en" /><input aria-hidden="true" className="hidden" name="website" tabIndex={-1} type="text" /><label className="grid gap-2 text-sm font-semibold text-muted">Name<input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="name" required /></label><label className="grid gap-2 text-sm font-semibold text-muted">Email<input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="email" required type="email" /></label><label className="grid gap-2 text-sm font-semibold text-muted">Subject<input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="subject" required /></label><label className="grid gap-2 text-sm font-semibold text-muted">Message<textarea className="min-h-36 rounded-md border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-market" name="message" required /></label><PendingSubmitButton className="min-h-12 rounded-md bg-market text-on-market hover:bg-market-strong" pendingLabel="Sending..."><Mail className="h-4 w-4" />Send message</PendingSubmitButton></form></section></>; }

function StaticEnglishPage({ eyebrow, title, sections }: { eyebrow: string; title: string; sections: Array<[string, string]> }) { return <><PageHero eyebrow={eyebrow} title={title} description={sections[0]?.[1] || ""} /><section className="site-shell max-w-4xl space-y-8 py-12 text-base leading-8 text-muted md:py-16">{sections.map(([heading, text]) => <section key={heading}><h2 className="text-2xl font-black text-foreground">{heading}</h2><p className="mt-3">{text}</p></section>)}</section></>; }
function EnglishArticleCard({ article }: { article: PublicData["posts"][number] }) { const copy = englishArticle(article); return <article className="overflow-hidden rounded-lg border border-line bg-surface p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-market">{englishCategoryLabels[article.category.slug] || article.category.title}</p><h2 className="mt-4 text-xl font-black leading-snug"><Link className="hover:text-market" href={`/en/blog/${article.slug}`}>{copy.title}</Link></h2><p className="mt-3 text-sm leading-7 text-muted">{copy.excerpt}</p><div className="mt-5 flex items-center justify-between text-xs font-semibold text-muted-strong"><span>{article.readTime}</span><Link className="text-market hover:underline" href={`/en/blog/${article.slug}`}>Read article</Link></div></article>; }
function ValueCard({ title, text }: { title: string; text: string }) { return <article className="rounded-lg border border-line bg-surface p-6"><h2 className="text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-7 text-muted">{text}</p></article>; }

function paginate<T>(items: T[], page: number, pageSize = 3) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return { items: items.slice((safePage - 1) * pageSize, safePage * pageSize), pageCount, safePage };
}

function EnglishPagination({ basePath, pageCount, safePage }: { basePath: string; pageCount: number; safePage: number }) {
  if (pageCount <= 1) return null;
  const href = (page: number) => {
    const separator = basePath.includes("?") ? "&" : "?";
    return page > 1 ? `${basePath}${separator}page=${page}` : basePath;
  };
  return <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <Link className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line px-3 text-sm font-black ${page === safePage ? "border-market bg-market text-on-market" : "bg-surface text-muted hover:text-foreground"}`} href={href(page)} key={page}>{page}</Link>)}</nav>;
}
