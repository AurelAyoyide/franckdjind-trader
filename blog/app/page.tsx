import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { NewsletterForm } from "@/components/newsletter-form";
import { RatingStars } from "@/components/rating-stars";
import { Reveal } from "@/components/reveal";
import { HomeStructuredData } from "@/components/structured-data";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/content";
import { getPublicData } from "@/lib/data-store";

const metrics = [
  { value: "01", label: "méthode avant l’action" },
  { value: "02", label: "risque défini à l’avance" },
  { value: "03", label: "routine simple à suivre" },
  { value: "04", label: "revue pour progresser" }
];

const process = [
  "Comprendre le contexte du marche",
  "Preparer un plan avant le signal",
  "Limiter le risque avant le gain",
  "Relire chaque execution"
];

type HomePageProps = {
  searchParams: Promise<{
    newsletter?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { newsletter } = await searchParams;
  const { posts: articles, categories, services, testimonials } = await getPublicData();
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
                Éducation et accompagnement trading
              </div>
              <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
                Apprendre le trading avec méthode, pas avec du bruit.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 md:text-lg">
                Des repères concrets pour préparer une séance, gérer le risque et faire progresser
                sa discipline. Sans promesse de gain, avec une approche pensée pour durer.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/blog" className="w-full sm:w-auto" showArrow>
                  Lire les articles
                </ButtonLink>
                <ButtonLink
                  href="/formations"
                  className="w-full sm:w-auto"
                  variant="hero"
                >
                  Découvrir les services
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
              Article a la une
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
              Des repères utiles avant d&apos;être spectaculaires.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-base leading-8 text-muted">
              Chaque article part d&apos;une situation concrète : préparer un scénario, relire une
              perte, comprendre une session ou limiter le sur-trading. L&apos;objectif est de mieux
              décider, pas de multiplier les signaux.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <ArticleCard article={featuredArticle} priority />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-4">
              {articles.slice(1, 4).map((article) => (
                <Link
                  className="group rounded-lg border border-line bg-surface p-5 transition hover:border-line-strong hover:bg-surface-strong"
                  href={`/blog/${article.slug}`}
                  key={article.slug}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-market">
                    {article.category.title}
                  </p>
                  <h3 className="mt-3 text-lg font-black leading-snug text-balance group-hover:text-market">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{article.excerpt}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-background-soft py-16 md:py-24">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan">
              Methode
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
              Une méthode en quatre étapes pour garder le cap.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Le trading devient plus lisible quand les décisions suivent le même ordre :
              observer, préparer, risquer peu et apprendre de l&apos;exécution. C&apos;est ce cadre que
              les contenus et services aident à installer.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {process.map((item, index) => (
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
              Des services simples à comprendre, pas un catalogue confus.
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/formations" showArrow>
                Explorer
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Poser une question
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
                  Catégories
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
                  Les portes d&apos;entree du blog.
                </h2>
              </div>
              <ButtonLink href="/recherche" variant="secondary">
                Rechercher
              </ButtonLink>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <Reveal delay={index * 0.04} key={category.slug}>
                <Link
                  className="group block min-h-48 rounded-lg border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-line-strong"
                  href={`/categorie/${category.slug}`}
                >
                  <TrendingUp className="h-5 w-5 text-market" aria-hidden="true" />
                  <h3 className="mt-6 text-xl font-black group-hover:text-market">
                    {category.title}
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
                Témoignages
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
                Des retours précis, publiés avec transparence.
              </h2>
            </div>
            <ButtonLink href="/temoignages" variant="secondary" className="whitespace-nowrap shrink-0">
              Voir les avis
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
            <h3 className="mt-4 text-2xl font-black">Aucun avis public valide pour le moment.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Les témoignages sont publiés avec l&apos;accord de leur auteur et peuvent être désactivés depuis l&apos;administration si nécessaire.
            </p>
            <div className="mt-6">
              <ButtonLink href="/temoignages#donner-avis" variant="secondary">
                Proposer un avis
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
                Besoin d&apos;un cadre avant de commencer ?
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
                Décris ton niveau, ton objectif et ton principal blocage. Une demande claire permet
                de t&apos;orienter vers le bon contenu ou le bon service.
              </p>
            </div>
            <div className="flex flex-col justify-end gap-3 sm:flex-row md:flex-col">
              <ButtonLink href="/contact" className="w-full" showArrow>
                Me contacter
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
      <NewsletterForm status={newsletter} />
    </>
  );
}
