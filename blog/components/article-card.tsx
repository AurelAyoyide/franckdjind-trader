import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/content";
import { formatDate } from "@/lib/utils";

type ArticleCardProps = {
  article: Article;
  priority?: boolean;
};

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-surface transition hover:-translate-y-1 hover:border-line-strong">
      <Link className="block" href={`/blog/${article.slug}`} aria-label={`Lire ${article.title}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-background-soft">
          <Image
            src={article.image}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-95 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/12 to-transparent" />
          <span className="absolute left-4 top-4 rounded-md border border-white/18 bg-black/62 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            {article.category.title}
          </span>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-strong">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {article.readTime}
          </span>
        </div>
        <Link className="block" href={`/blog/${article.slug}`}>
          <h2 className="mt-4 text-xl font-black leading-snug text-balance transition group-hover:text-market">
            {article.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {article.excerpt}
          </p>
        </Link>
        <div className="mt-5 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              className="rounded-md bg-foreground/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted transition hover:bg-market/10 hover:text-market"
              href={`/tag/${tag.slug}`}
              key={tag.slug}
            >
              {tag.title}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
