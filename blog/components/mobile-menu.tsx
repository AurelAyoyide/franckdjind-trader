"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/content";
import { localeFromPathname, localizePath, uiCopy } from "@/lib/localization";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const copy = uiCopy[locale];
  const navItems = [
    { href: "/blog", label: copy.blog },
    { href: "/recherche", label: copy.search },
    { href: "/formations", label: copy.formations },
    { href: "/temoignages", label: copy.testimonials },
    { href: "/a-propos", label: copy.about },
    { href: "/contact", label: copy.contact }
  ];

  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          type="button"
          aria-label={open ? (locale === "en" ? "Close menu" : "Fermer le menu") : locale === "en" ? "Open menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] text-foreground"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-4 top-[calc(100%+12px)] rounded-lg border border-line bg-background/96 p-3 shadow-2xl backdrop-blur-xl">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-3 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
                href={localizePath(item.href, locale)}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ButtonLink href={localizePath("/contact", locale)} variant="secondary" className="w-full">
              {copy.contact}
            </ButtonLink>
            <ButtonLink href={siteConfig.telegramPath} className="w-full">
              Telegram
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}
