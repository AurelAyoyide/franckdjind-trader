"use client";

import type { Locale } from "@/lib/i18n";
import { localeFromPath, localePath } from "@/lib/i18n";

function buildSearch(search: string) {
  const nextParams = new URLSearchParams(search.replace(/^\?/, ""));
  nextParams.delete("lang");
  const query = nextParams.toString();

  return query ? `?${query}` : "";
}

export function LanguageSwitch({
  currentPathname,
  currentSearch = "",
  locale,
}: {
  currentPathname: string;
  currentSearch?: string;
  locale: Locale;
}) {
  const current = localeFromPath(currentPathname || "/");
  const normalizedPath = current.pathname || "/";
  const targetLocale = locale === "en" ? "fr" : "en";
  const targetPath = targetLocale === "fr" ? normalizedPath : localePath("en", normalizedPath);
  const target = `${targetPath}${buildSearch(currentSearch)}`;
  const label = locale === "en" ? "FR" : "EN";
  const title = locale === "en" ? "Passer en francais" : "Switch to English";

  return (
    <a
      aria-label={title}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] px-2 text-xs font-black tracking-[0.08em] text-foreground transition hover:bg-foreground/[0.1]"
      href={target}
      title={title}
    >
      {label}
    </a>
  );
}
