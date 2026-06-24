import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const target = locale === "en" ? "/?lang=fr" : localePath("en", "/");
  const label = locale === "en" ? "FR" : "EN";
  const title = locale === "en" ? "Passer en francais" : "Switch to English";

  return (
    <Link
      aria-label={title}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] px-2 text-xs font-black tracking-[0.08em] text-foreground transition hover:bg-foreground/[0.1]"
      href={target}
      title={title}
    >
      {label}
    </Link>
  );
}
