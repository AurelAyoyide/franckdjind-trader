import Link from "next/link";
import { GraduationCap, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { MarketTicker } from "@/components/market-ticker";
import { MobileMenu } from "@/components/mobile-menu";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button-link";
import { localePath, translate, type Locale } from "@/lib/i18n";
import { getRequestPathname, getRequestSearch } from "@/lib/i18n-server";
import { siteConfig } from "@/lib/platform-content";
import { getAuthorizedSession } from "@/lib/authorization";
import { roleHome } from "@/lib/session-core";

const navItems = [{ href: "/certificates/verify", label: "Verifier certificat" }];

export async function SiteHeader({ locale }: { locale: Locale }) {
  const [session, currentPathname, currentSearch] = await Promise.all([
    getAuthorizedSession(["student", "trainer", "admin"]),
    getRequestPathname(),
    getRequestSearch(),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/86 backdrop-blur-xl">
      <MarketTicker />
      <div className="site-shell relative flex min-h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href={localePath(locale, "/")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-market/12 text-market">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block text-sm font-black uppercase tracking-[0.18em] text-foreground">
              {siteConfig.name}
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">
              {translate(locale, siteConfig.tagline)}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
              href={localePath(locale, item.href)}
              key={item.href}
            >
              {translate(locale, item.label)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <LanguageSwitch currentPathname={currentPathname} currentSearch={currentSearch} locale={locale} />
          {session ? (
            <>
              <ButtonLink href={localePath(locale, roleHome[session.role])} variant="secondary">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {locale === "en" ? "Dashboard" : "Mon espace"}
              </ButtonLink>
              <form action={localePath(locale, "/logout")} method="post">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-danger/35 bg-danger/10 px-4 text-sm font-semibold text-danger transition hover:bg-danger/15"
                  type="submit"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {translate(locale, "Deconnexion")}
                </button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href={localePath(locale, "/login")} variant="secondary">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                {translate(locale, "Connexion")}
              </ButtonLink>
              <ButtonLink href={localePath(locale, "/register")} showArrow>
                {translate(locale, "Creer un compte")}
              </ButtonLink>
            </>
          )}
        </div>

        <MobileMenu currentPathname={currentPathname} currentSearch={currentSearch} session={session ? { role: session.role } : null} />
      </div>
    </header>
  );
}
