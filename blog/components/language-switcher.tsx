"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { localeFromPathname, localizePath, uiCopy } from "@/lib/localization";
import { usePathname } from "next/navigation";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const nextLocale = locale === "fr" ? "en" : "fr";
  const href = localizePath(pathname || "/", nextLocale);
  const copy = uiCopy[locale];

  return (
    <Link
      aria-label={copy.languageLabel}
      className="inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg border border-line bg-foreground/[0.06] px-2 text-xs font-black text-foreground transition hover:bg-foreground/[0.1]"
      href={href}
      title={copy.languageLabel}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {copy.languageShort}
    </Link>
  );
}
