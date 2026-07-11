import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  ariaLabel: string;
  currentPage: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
  labels?: {
    previous?: string;
    next?: string;
    page?: string;
  };
  className?: string;
};

type PageItem = number | "ellipsis";

const linkClassName =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-black text-muted transition hover:border-line-strong hover:text-foreground";

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(1, page), pageCount);
}

function paginationItems(currentPage: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);

  if (currentPage <= 4) {
    [2, 3, 4, 5].forEach((page) => pages.add(page));
  }

  if (currentPage >= pageCount - 3) {
    [pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1].forEach((page) => pages.add(page));
  }

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);
  const items: PageItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

function shouldPrefetch(page: number, currentPage: number, pageCount: number) {
  return page === 1 || page === pageCount || Math.abs(page - currentPage) <= 1;
}

export function Pagination({
  ariaLabel,
  currentPage,
  pageCount,
  hrefForPage,
  labels,
  className
}: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const safePage = clampPage(currentPage, pageCount);
  const previousLabel = labels?.previous ?? "Page precedente";
  const nextLabel = labels?.next ?? "Page suivante";
  const pageLabel = labels?.page ?? "Page";
  const previousPage = safePage - 1;
  const nextPage = safePage + 1;

  return (
    <nav className={cn("mt-10 flex flex-wrap items-center justify-center gap-2", className)} aria-label={ariaLabel}>
      {previousPage >= 1 ? (
        <Link aria-label={previousLabel} className={linkClassName} href={hrefForPage(previousPage)} prefetch>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-disabled="true" aria-label={previousLabel} className={cn(linkClassName, "pointer-events-none opacity-45")}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </span>
      )}

      {paginationItems(safePage, pageCount).map((item, index) =>
        item === "ellipsis" ? (
          <span className="inline-flex h-10 min-w-8 items-center justify-center text-sm font-black text-muted" key={`ellipsis-${index}`} aria-hidden="true">
            ...
          </span>
        ) : (
          <Link
            aria-current={item === safePage ? "page" : undefined}
            aria-label={`${pageLabel} ${item}`}
            className={cn(linkClassName, item === safePage && "border-market bg-market text-on-market")}
            href={hrefForPage(item)}
            key={item}
            prefetch={shouldPrefetch(item, safePage, pageCount)}
          >
            {item}
          </Link>
        )
      )}

      {nextPage <= pageCount ? (
        <Link aria-label={nextLabel} className={linkClassName} href={hrefForPage(nextPage)} prefetch>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-disabled="true" aria-label={nextLabel} className={cn(linkClassName, "pointer-events-none opacity-45")}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
