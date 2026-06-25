"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale, useTranslate } from "@/components/locale-provider";
import { ButtonLink } from "@/components/ui/button-link";
import { localePath } from "@/lib/i18n";
import type { AppRole } from "@/lib/session-core";
import { roleHome } from "@/lib/session-core";

const navItems = [
  { href: "/certificates/verify", label: "Verifier certificat" },
  { href: "/legal-notice", label: "Mentions legales" },
  { href: "/privacy-policy", label: "Confidentialite" },
];

export function MobileMenu({
  currentPathname,
  currentSearch,
  session,
}: {
  currentPathname: string;
  currentSearch: string;
  session: { role: AppRole } | null;
}) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslate();

  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitch currentPathname={currentPathname} currentSearch={currentSearch} locale={locale} />
        <button
          type="button"
          aria-label={t(open ? "Fermer le menu" : "Ouvrir le menu")}
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
                href={localePath(locale, item.href)}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
          {session ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ButtonLink href={localePath(locale, roleHome[session.role])} variant="secondary" className="w-full">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {locale === "en" ? "Dashboard" : "Mon espace"}
              </ButtonLink>
              <form action={localePath(locale, "/logout")} method="post">
                <button
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-danger/35 bg-danger/10 px-3 text-sm font-black text-danger"
                  onClick={() => setOpen(false)}
                  type="submit"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t("Deconnexion")}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ButtonLink href={localePath(locale, "/login")} variant="secondary" className="w-full">
                {t("Connexion")}
              </ButtonLink>
              <ButtonLink href={localePath(locale, "/register")} className="w-full">
                {t("Creer un compte")}
              </ButtonLink>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
