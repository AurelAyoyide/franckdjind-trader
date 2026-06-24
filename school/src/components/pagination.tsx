import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localePath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export async function Pagination({
  path,
  page,
  totalPages,
  query,
}: {
  path: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const locale = await getRequestLocale();
  const href = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", String(targetPage));
    return localePath(locale, `${path}?${params.toString()}`);
  };

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3">
      {page > 1 ? (
        <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-background px-3 text-sm font-black" href={href(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Precedent
        </Link>
      ) : <span />}
      <p className="text-sm font-semibold text-muted">Page {page} sur {totalPages}</p>
      {page < totalPages ? (
        <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-background px-3 text-sm font-black" href={href(page + 1)}>
          Suivant <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : <span />}
    </nav>
  );
}
